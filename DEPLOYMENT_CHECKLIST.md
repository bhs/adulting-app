# GCP Cloud Run Deployment Checklist

Use this checklist to verify your deployment is ready and to track deployment progress.

## Pre-Deployment Checklist

### 1. GCP Account Setup
- [ ] GCP account created with billing enabled
- [ ] gcloud CLI installed ([Install](https://cloud.google.com/sdk/docs/install))
- [ ] Authenticated to GCP: `gcloud auth login`
- [ ] Project ID set in .env: `GCP_PROJECT_ID="your-project-id"`

### 2. Local Environment
- [ ] Node.js 20+ installed
- [ ] npm dependencies installed: `npm install`
- [ ] Local development works: `npm run dev`
- [ ] Code committed to git (optional but recommended)

### 3. Configuration Files
- [x] Dockerfile created
- [x] .dockerignore created
- [x] .gcloudignore created
- [x] deploy-gcp.sh created and executable
- [x] migrate-db.sh created and executable
- [x] Prisma schema updated to PostgreSQL
- [x] next.config.js has standalone output
- [x] Health check endpoint created

## Deployment Checklist

### Step 1: Initial Deployment
```bash
export GCP_PROJECT_ID="your-project-id"
./deploy-gcp.sh
```

- [ ] GCP APIs enabled successfully
- [ ] Container image built successfully
- [ ] Cloud SQL instance created
- [ ] Database and user created
- [ ] Secrets stored in Secret Manager
- [ ] Cloud Run service deployed
- [ ] Deployment script outputs HTTPS URL

### Step 2: Database Migration
```bash
./migrate-db.sh
```

- [ ] Cloud SQL Proxy connected
- [ ] Prisma migrations executed
- [ ] Prisma Client generated
- [ ] Migration completed without errors

### Step 3: Verification
```bash
# Get your service URL
SERVICE_URL=$(gcloud run services describe adulting-app \
  --region=us-central1 \
  --format="value(status.url)")

# Test health endpoint
curl $SERVICE_URL/api/health

# Test API endpoints
curl $SERVICE_URL/api/users
```

- [ ] Health endpoint returns 200 OK
- [ ] Database connection confirmed
- [ ] API endpoints respond correctly
- [ ] HTTPS certificate active (URL starts with https://)

### Step 4: Monitoring Setup
```bash
# View logs
gcloud run services logs tail adulting-app --region=us-central1
```

- [ ] Logs accessible and readable
- [ ] No error messages in startup logs
- [ ] Application metrics visible in Cloud Console

## Post-Deployment Checklist

### Documentation
- [ ] Team has access to README-GCP.md
- [ ] Deployment documentation reviewed
- [ ] Secrets documented (where to find them)
- [ ] Runbook created for common operations

### Security
- [ ] Secrets stored only in Secret Manager (not in env files)
- [ ] Service account permissions reviewed
- [ ] Authentication requirements confirmed
- [ ] HTTPS enforced (automatic with Cloud Run)
- [ ] Cloud SQL backup schedule confirmed

### Cost Management
- [ ] Billing alerts configured
- [ ] Budget set in GCP Console
- [ ] Auto-scaling limits appropriate (0-10 instances)
- [ ] Resource limits reviewed (512Mi memory, 1 CPU)

### Monitoring & Alerts
- [ ] Log viewer bookmarked
- [ ] Cloud Monitoring dashboard created (optional)
- [ ] Error alerts configured (optional)
- [ ] Uptime checks configured (optional)

## Optional Enhancements

### Custom Domain
```bash
gcloud run domain-mappings create \
  --service=adulting-app \
  --domain=yourdomain.com \
  --region=us-central1
```

- [ ] Domain verified in GCP
- [ ] DNS records configured
- [ ] Custom domain mapped
- [ ] SSL certificate provisioned

### CI/CD
- [ ] GitHub Actions workflow enabled
- [ ] GCP service account key added to GitHub secrets
- [ ] Auto-deployment tested on push to main

### Enhanced Security
- [ ] Authentication enabled (remove --allow-unauthenticated)
- [ ] VPC Serverless Connector configured (optional)
- [ ] Cloud Armor enabled (optional)
- [ ] Identity-Aware Proxy configured (optional)

### Performance
- [ ] Cloud CDN enabled for static assets (optional)
- [ ] Redis cache added (optional)
- [ ] Database connection pooling verified
- [ ] Load testing completed

## Ongoing Maintenance Checklist

### Weekly
- [ ] Review logs for errors
- [ ] Check cost dashboard
- [ ] Verify backups are running

### Monthly
- [ ] Review and optimize resource usage
- [ ] Update dependencies if needed
- [ ] Review security patches
- [ ] Test disaster recovery procedure

### As Needed
- [ ] Update application code
- [ ] Run database migrations
- [ ] Scale resources up/down
- [ ] Add new secrets

## Common Commands Quick Reference

### Deployment
```bash
./deploy-gcp.sh              # Full deployment
npm run gcp:deploy           # Same as above
npm run gcp:migrate          # Database migrations
```

### Monitoring
```bash
# View logs
gcloud run services logs tail adulting-app --region=us-central1

# Get service URL
gcloud run services describe adulting-app \
  --region=us-central1 \
  --format="value(status.url)"

# Get service status
gcloud run services describe adulting-app --region=us-central1
```

### Database
```bash
# Connect to Cloud SQL
./dev-cloud-sql.sh

# Prisma Studio
npm run db:studio

# Run migrations
npm run db:migrate
```

### Scaling
```bash
# Update resources
gcloud run services update adulting-app \
  --min-instances=1 \
  --max-instances=20 \
  --memory=1Gi \
  --region=us-central1
```

### Secrets
```bash
# View secret
gcloud secrets versions access latest --secret=database-url

# Update secret
echo -n "new-value" | gcloud secrets versions add database-url --data-file=-
```

## Troubleshooting Checklist

### Deployment Fails
- [ ] Check gcloud CLI is authenticated
- [ ] Verify project ID is correct
- [ ] Review Cloud Build logs
- [ ] Check API enablement status
- [ ] Verify billing is enabled

### Container Won't Start
- [ ] Check Cloud Run logs
- [ ] Verify DATABASE_URL secret exists
- [ ] Confirm Cloud SQL instance is running
- [ ] Check Dockerfile syntax
- [ ] Verify port configuration (8080)

### Database Connection Fails
- [ ] Verify Cloud SQL instance exists
- [ ] Check database and user created
- [ ] Confirm DATABASE_URL format is correct
- [ ] Verify Cloud Run has SQL instance attached
- [ ] Check service account permissions

### Application Errors
- [ ] Review application logs
- [ ] Test health endpoint
- [ ] Verify environment variables
- [ ] Check Prisma Client generation
- [ ] Test locally with Cloud SQL Proxy

## Success Criteria

Your deployment is successful when ALL of these are true:

- [x] Deployment script completes without errors
- [ ] HTTPS URL is accessible
- [ ] Health endpoint returns healthy status
- [ ] API endpoints work correctly
- [ ] Database queries succeed
- [ ] Logs show no critical errors
- [ ] Auto-scaling functions properly
- [ ] Costs are within budget
- [ ] Team can deploy updates
- [ ] Documentation is accessible

## Notes

**GCP Project ID:** ___________________

**Service URL:** ___________________

**Cloud SQL Instance:** ___________________

**Deployment Date:** ___________________

**Deployed By:** ___________________

**Next Review Date:** ___________________
