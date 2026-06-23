# Quick Start - GCP Cloud Run Deployment

Get your Next.js app running on GCP Cloud Run in 5 minutes.

## Prerequisites

- GCP account with billing enabled
- gcloud CLI installed
- Project ID ready

## Deploy in 3 Steps

### 1. Set Project ID
```bash
export GCP_PROJECT_ID="your-project-id"
```

### 2. Deploy
```bash
./deploy-gcp.sh
```

This script will:
- Enable GCP APIs
- Build container image
- Create PostgreSQL database
- Deploy to Cloud Run
- Output your HTTPS URL

**Time:** ~5-10 minutes

### 3. Run Migrations
```bash
./migrate-db.sh
```

**Done!** Your app is live with automatic HTTPS.

## What You Get

- **URL:** `https://adulting-app-xxxxx-uc.a.run.app`
- **HTTPS:** Automatic TLS certificate
- **Database:** PostgreSQL 15 on Cloud SQL
- **Auto-scaling:** 0 to 10 instances
- **Cost:** ~$7-15/month

## Test Your Deployment

```bash
# Get your URL
SERVICE_URL=$(gcloud run services describe adulting-app \
  --region=us-central1 --format="value(status.url)")

# Test health check
curl $SERVICE_URL/api/health

# Test API
curl $SERVICE_URL/api/users
```

## Update Your App

```bash
# Make changes to your code
# Then redeploy
./deploy-gcp.sh
```

Zero-downtime rolling update!

## View Logs

```bash
gcloud run services logs tail adulting-app --region=us-central1
```

## Local Development

### Option 1: SQLite (default)
```bash
npm install
npm run dev
```

### Option 2: Cloud SQL (production database)
```bash
./dev-cloud-sql.sh  # Terminal 1 (leave running)
npm run dev         # Terminal 2
```

## Common Commands

| Task | Command |
|------|---------|
| Deploy | `./deploy-gcp.sh` |
| Migrate DB | `./migrate-db.sh` |
| View logs | `gcloud run services logs tail adulting-app` |
| Get URL | `gcloud run services describe adulting-app --format="value(status.url)"` |
| Local dev | `npm run dev` |
| Prisma Studio | `npm run db:studio` |

## Project Structure

```
Key Files for GCP:
├── Dockerfile              # Container definition
├── deploy-gcp.sh          # Deployment automation
├── migrate-db.sh          # Database migrations
├── app/api/health/        # Health checks
└── GCP_DEPLOYMENT.md      # Full documentation
```

## Troubleshooting

**Deploy fails?**
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

**Container won't start?**
```bash
gcloud run services logs read adulting-app --limit=50
```

**Need help?**
- See [GCP_DEPLOYMENT.md](./GCP_DEPLOYMENT.md) for detailed guide
- Check [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for step-by-step verification

## Next Steps

1. ✅ Deploy successfully
2. ✅ Test endpoints
3. 📝 Review [GCP_DEPLOYMENT.md](./GCP_DEPLOYMENT.md)
4. 🔒 Configure authentication (optional)
5. 🌐 Map custom domain (optional)
6. 📊 Set up monitoring (optional)

## Support

- **Logs:** `gcloud run services logs tail adulting-app`
- **Console:** https://console.cloud.google.com/run
- **Docs:** [GCP_DEPLOYMENT.md](./GCP_DEPLOYMENT.md)

---

**That's it!** Your app is now running on Google Cloud Run with PostgreSQL, automatic HTTPS, and auto-scaling. 🚀
