# GCP Cloud Run Deployment Guide

This guide walks you through deploying the adulting-app to Google Cloud Run with Cloud SQL PostgreSQL using the simplest possible approach.

## Architecture Overview

- **Compute**: Cloud Run (serverless containers)
- **Database**: Cloud SQL PostgreSQL 15
- **Secrets**: Google Secret Manager
- **Container Registry**: Google Container Registry (GCR)
- **TLS**: Automatic HTTPS on `*.run.app` domain

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **gcloud CLI** installed ([Installation Guide](https://cloud.google.com/sdk/docs/install))
3. **Docker** installed (optional, Cloud Build handles this)
4. **Node.js 20+** for local development

## Quick Start (Automated Deployment)

The fastest way to deploy is using the provided script:

```bash
# 1. Set your GCP project ID
export GCP_PROJECT_ID="your-project-id"

# 2. Run the deployment script
./deploy-gcp.sh
```

This script will:
- Enable required GCP APIs
- Build and push the Docker container
- Create Cloud SQL PostgreSQL instance
- Set up database and user
- Store secrets in Secret Manager
- Deploy to Cloud Run with automatic HTTPS

The deployment will output your live HTTPS URL when complete.

## Manual Deployment (Step-by-Step)

If you prefer to understand each step or customize the deployment:

### Step 1: Configure GCP Project

```bash
# Login to GCP
gcloud auth login

# Set your project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Set default region
export REGION="us-central1"
gcloud config set run/region $REGION
```

### Step 2: Enable Required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  sql-component.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com
```

### Step 3: Create Cloud SQL Instance

```bash
# Create PostgreSQL instance (free tier db-f1-micro)
gcloud sql instances create adulting-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=$REGION

# Create database
gcloud sql databases create adulting \
  --instance=adulting-db

# Create database user
gcloud sql users create appuser \
  --instance=adulting-db \
  --password=$(openssl rand -base64 32)

# Get the connection name
gcloud sql instances describe adulting-db \
  --format="value(connectionName)"
# Output: PROJECT_ID:REGION:adulting-db
```

### Step 4: Store Secrets in Secret Manager

```bash
# Create DATABASE_URL secret
# Format: postgresql://USER:PASSWORD@localhost/DATABASE?host=/cloudsql/CONNECTION_NAME
echo -n "postgresql://appuser:YOUR_PASSWORD@localhost/adulting?host=/cloudsql/PROJECT_ID:REGION:adulting-db" | \
  gcloud secrets create database-url \
  --data-file=- \
  --replication-policy="automatic"
```

### Step 5: Build and Deploy Container

```bash
# Build container image with Cloud Build
gcloud builds submit \
  --tag gcr.io/$PROJECT_ID/adulting-app

# Deploy to Cloud Run
gcloud run deploy adulting-app \
  --image gcr.io/$PROJECT_ID/adulting-app \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --add-cloudsql-instances=PROJECT_ID:REGION:adulting-db \
  --set-secrets=DATABASE_URL=database-url:latest \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=0 \
  --max-instances=10
```

### Step 6: Run Database Migrations

After deployment, you need to run Prisma migrations:

#### Option A: Using Cloud SQL Proxy (Recommended)

```bash
# Install Cloud SQL Proxy
curl -o cloud_sql_proxy https://dl.google.com/cloudsql/cloud_sql_proxy.darwin.amd64
chmod +x cloud_sql_proxy

# Start proxy
./cloud_sql_proxy -instances=PROJECT_ID:REGION:adulting-db=tcp:5432 &

# Get DATABASE_URL from Secret Manager
export DATABASE_URL=$(gcloud secrets versions access latest --secret=database-url)

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Stop proxy
pkill cloud_sql_proxy
```

#### Option B: Using the Migration Script

```bash
# Run the provided migration script
./migrate-db.sh
```

#### Option C: Using Cloud Run Jobs (Production-Ready)

```bash
# Create a migration job
gcloud run jobs create adulting-migrate \
  --image gcr.io/$PROJECT_ID/adulting-app \
  --command=npx \
  --args="prisma,migrate,deploy" \
  --add-cloudsql-instances=PROJECT_ID:REGION:adulting-db \
  --set-secrets=DATABASE_URL=database-url:latest \
  --region=$REGION

# Execute the job
gcloud run jobs execute adulting-migrate --region=$REGION
```

### Step 7: Access Your Application

Get your Cloud Run service URL:

```bash
gcloud run services describe adulting-app \
  --platform managed \
  --region $REGION \
  --format="value(status.url)"
```

Your app is now live with automatic HTTPS!

Example URL: `https://adulting-app-xxxxx-uc.a.run.app`

## Configuration Details

### Environment Variables

Cloud Run automatically provides:
- `PORT`: 8080 (configured in Dockerfile)
- `DATABASE_URL`: From Secret Manager (Cloud SQL connection)

### Cloud SQL Connection

The app connects to Cloud SQL using Unix socket:
```
postgresql://appuser:password@localhost/adulting?host=/cloudsql/PROJECT_ID:REGION:adulting-db
```

Cloud Run's built-in Cloud SQL proxy handles the connection automatically.

### Container Specifications

- **Base Image**: node:20-alpine
- **Memory**: 512 MiB
- **CPU**: 1
- **Port**: 8080
- **Min Instances**: 0 (scales to zero)
- **Max Instances**: 10

### Pricing Estimate

With the free tier:
- **Cloud Run**: 2 million requests/month free, then $0.40 per million
- **Cloud SQL**: db-f1-micro is ~$7-10/month (no free tier)
- **Cloud Build**: 120 build-minutes/day free
- **Secret Manager**: 6 active secret versions free

## Custom Domain (Optional)

Map a custom domain to your Cloud Run service:

```bash
# Verify domain ownership first (follow prompts)
gcloud domains verify yourdomain.com

# Map domain to service
gcloud run domain-mappings create \
  --service=adulting-app \
  --domain=yourdomain.com \
  --region=$REGION

# Get DNS records to configure
gcloud run domain-mappings describe \
  --domain=yourdomain.com \
  --region=$REGION
```

Add the provided DNS records (A and AAAA) to your domain registrar.

## Monitoring and Logs

### View Logs

```bash
# Stream logs in real-time
gcloud run services logs tail adulting-app --region=$REGION

# View recent logs
gcloud run services logs read adulting-app --region=$REGION --limit=50
```

### Cloud Console

Access detailed metrics in the Cloud Console:
```
https://console.cloud.google.com/run/detail/$REGION/adulting-app
```

## Updating Your Application

### Redeploy After Code Changes

```bash
# Build new image
gcloud builds submit --tag gcr.io/$PROJECT_ID/adulting-app

# Deploy update (Cloud Run handles zero-downtime rolling deployment)
gcloud run deploy adulting-app \
  --image gcr.io/$PROJECT_ID/adulting-app \
  --region=$REGION
```

Or simply run:
```bash
./deploy-gcp.sh
```

### Update Secrets

```bash
# Update DATABASE_URL
echo -n "new-database-url" | \
  gcloud secrets versions add database-url --data-file=-

# Cloud Run automatically picks up the latest version
```

## Database Management

### Connect to Cloud SQL

```bash
# Using Cloud SQL Proxy
./cloud_sql_proxy -instances=PROJECT_ID:REGION:adulting-db=tcp:5432

# In another terminal
psql "postgresql://appuser:PASSWORD@localhost:5432/adulting"
```

### Run Prisma Studio

```bash
# Start Cloud SQL Proxy first
./cloud_sql_proxy -instances=PROJECT_ID:REGION:adulting-db=tcp:5432 &

# Set DATABASE_URL
export DATABASE_URL=$(gcloud secrets versions access latest --secret=database-url)

# Launch Prisma Studio
npx prisma studio
```

### Backup Database

```bash
# Create on-demand backup
gcloud sql backups create \
  --instance=adulting-db \
  --description="Manual backup"

# List backups
gcloud sql backups list --instance=adulting-db
```

## Security Best Practices

1. **Restrict Access**: Remove `--allow-unauthenticated` if you need authentication
   ```bash
   gcloud run services update adulting-app \
     --no-allow-unauthenticated \
     --region=$REGION
   ```

2. **IAM Policies**: Use service accounts with minimal permissions

3. **VPC Connector**: For enhanced security, use VPC Serverless Connector:
   ```bash
   gcloud compute networks vpc-access connectors create adulting-connector \
     --region=$REGION \
     --range=10.8.0.0/28

   gcloud run services update adulting-app \
     --vpc-connector=adulting-connector \
     --region=$REGION
   ```

4. **Enable Cloud Armor**: For DDoS protection on custom domains

## Troubleshooting

### Container Won't Start

Check logs:
```bash
gcloud run services logs read adulting-app --region=$REGION --limit=100
```

Common issues:
- Missing `PORT=8080` environment variable
- Database connection failures
- Missing Prisma Client generation

### Database Connection Errors

Verify Cloud SQL instance is running:
```bash
gcloud sql instances describe adulting-db
```

Check Cloud Run service has the SQL instance attached:
```bash
gcloud run services describe adulting-app --region=$REGION \
  --format="value(spec.template.spec.containers[0].resources.cloudSqlInstances)"
```

### Build Failures

Check Cloud Build logs:
```bash
gcloud builds list --limit=5
gcloud builds log BUILD_ID
```

## Clean Up

To delete all resources and avoid charges:

```bash
# Delete Cloud Run service
gcloud run services delete adulting-app --region=$REGION

# Delete Cloud SQL instance
gcloud sql instances delete adulting-db

# Delete secrets
gcloud secrets delete database-url
gcloud secrets delete db-password

# Delete container images
gcloud container images delete gcr.io/$PROJECT_ID/adulting-app
```

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [Prisma with PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## Support

For issues specific to this deployment setup, check:
- Cloud Run logs: `gcloud run services logs read adulting-app`
- Cloud SQL logs: Cloud Console → SQL → adulting-db → Logs
- Build logs: Cloud Console → Cloud Build → History
