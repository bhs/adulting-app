# Render.com Deployment Guide

This guide walks you through deploying the adulting-app to Render.com using their free tier with managed PostgreSQL database.

## Overview

The deployment includes:
- **Web Service**: Next.js 14 application running in a Docker container
- **PostgreSQL Database**: Render-managed PostgreSQL database (free tier)
- **Automatic TLS**: HTTPS enabled automatically with custom or render.app domain
- **Auto-deploy**: Automatic deployments on git push to main branch

## Prerequisites

- A [Render.com](https://render.com) account (free signup)
- Git repository with this code pushed to GitHub, GitLab, or Bitbucket
- Basic familiarity with environment variables and databases

## Deployment Steps

### Option 1: Deploy Using render.yaml Blueprint (Recommended)

This method uses Infrastructure as Code to deploy everything with one click.

1. **Push code to your Git repository**
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your Git repository
   - Select the repository containing this app

3. **Review and Deploy**
   - Render will detect `render.yaml` and show the resources to be created:
     - Web Service: `adulting-app`
     - PostgreSQL Database: `adulting-app-db`
   - Click "Apply" to create all resources
   - Render will automatically:
     - Provision the PostgreSQL database
     - Build the Docker image
     - Deploy the web service
     - Connect the database to the app

4. **Wait for Deployment**
   - First deployment takes 5-10 minutes
   - Watch the build logs in the Render dashboard
   - Database migrations run automatically on startup

5. **Access Your App**
   - Once deployed, you'll get a URL like: `https://adulting-app.onrender.com`
   - Test the API: `https://adulting-app.onrender.com/api/users`

### Option 2: Manual Deployment

If you prefer to set up resources manually:

#### Step 1: Create PostgreSQL Database

1. In Render Dashboard, click "New +" → "PostgreSQL"
2. Configure:
   - **Name**: `adulting-app-db`
   - **Database**: `adulting_app`
   - **User**: `adulting_app_user` (auto-generated)
   - **Region**: Oregon (or closest to you)
   - **Plan**: Free
3. Click "Create Database"
4. Copy the "Internal Database URL" (starts with `postgresql://`)

#### Step 2: Create Web Service

1. In Render Dashboard, click "New +" → "Web Service"
2. Connect your Git repository
3. Configure:
   - **Name**: `adulting-app`
   - **Region**: Oregon (same as database)
   - **Branch**: `main`
   - **Runtime**: Docker
   - **Plan**: Free
4. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = (paste Internal Database URL from Step 1)
5. Click "Create Web Service"

## Configuration Details

### Environment Variables

The application requires these environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NODE_ENV` | Node environment | `production` |

These are automatically configured when using the Blueprint deployment.

### Database Migrations

Database migrations run automatically on every deployment via the Dockerfile CMD:
```bash
npx prisma migrate deploy && node server.js
```

This ensures your database schema is always up to date.

## Custom Domain Setup

To use a custom domain instead of `*.onrender.com`:

1. Go to your web service in Render Dashboard
2. Click "Settings" → "Custom Domains"
3. Click "Add Custom Domain"
4. Enter your domain (e.g., `app.yourdomain.com`)
5. Add the provided CNAME record to your DNS provider:
   - **Type**: CNAME
   - **Name**: app (or your subdomain)
   - **Value**: (provided by Render)
6. Wait for DNS propagation (5-60 minutes)
7. Render automatically provisions TLS certificate

## Free Tier Limitations

Render's free tier includes:

**Web Service:**
- 750 hours/month (enough for 24/7 operation)
- Spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds (cold start)
- 512 MB RAM
- Shared CPU

**PostgreSQL Database:**
- 1 GB storage
- Auto-expires after 90 days (data is not deleted, but DB stops)
- Can be extended for another 90 days with one click

**Note**: For production use, consider upgrading to paid plans for:
- No cold starts
- More resources
- No 90-day expiration
- Better performance

## Monitoring and Logs

### View Application Logs
1. Go to your web service in Render Dashboard
2. Click "Logs" tab
3. See real-time application logs
4. Filter by date/time or search for specific messages

### Database Access
1. Go to your database in Render Dashboard
2. Click "Connect" → "External Connection"
3. Use provided credentials with tools like:
   - psql command line
   - pgAdmin
   - DBeaver
   - Prisma Studio: `npx prisma studio`

### Health Checks
Render automatically monitors your app's health at `/` endpoint.
If the app becomes unresponsive, Render will restart it.

## Troubleshooting

### Build Failures

**Issue**: Docker build fails
- Check Dockerfile syntax
- Ensure all dependencies are in package.json
- Review build logs for specific errors

**Issue**: Prisma errors during build
- Verify `DATABASE_URL` is set correctly
- Check Prisma schema syntax
- Ensure `prisma generate` runs before build

### Runtime Issues

**Issue**: App crashes on startup
- Check environment variables are set
- Review startup logs for errors
- Verify database migrations ran successfully

**Issue**: Database connection errors
- Confirm `DATABASE_URL` uses Internal Database URL (not External)
- Check database is in same region as web service
- Verify database is active (not expired on free tier)

**Issue**: Slow cold starts
- This is normal on free tier after 15 min inactivity
- Consider upgrading to paid plan for always-on service
- Or implement a ping service to keep app warm

### Database Issues

**Issue**: "too many connections"
- Prisma creates connection pool
- Adjust pool size in schema.prisma:
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
    directUrl = env("DIRECT_URL")
  }
  ```

**Issue**: Database expired (90 days)
- Go to database in dashboard
- Click "Extend for another 90 days"
- Or upgrade to paid plan

## Updating Your App

### Automatic Deployments

With `autoDeploy: true` in render.yaml, every push to main triggers deployment:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Render automatically:
1. Builds new Docker image
2. Runs database migrations
3. Deploys new version
4. Zero-downtime rolling update

### Manual Deployments

To deploy manually:
1. Go to web service in Render Dashboard
2. Click "Manual Deploy" → "Deploy latest commit"
3. Or "Clear build cache & deploy" for fresh build

## Rollback

To rollback to a previous version:
1. Go to web service in Render Dashboard
2. Click "Events" tab
3. Find the previous successful deployment
4. Click "Rollback to this version"

## Cost Optimization

To stay within free tier:
- Use free PostgreSQL (1 GB storage)
- Monitor storage usage in dashboard
- Clean up old data if needed
- Use free web service (512 MB RAM)
- Accept cold starts (15 min inactivity)

## Migration from Vercel

If migrating from Vercel:

1. **Database**: Already using PostgreSQL (compatible)
2. **Environment Variables**: Copy from Vercel to Render
3. **Build Settings**: Handled by Dockerfile (no config needed)
4. **Domain**: Update DNS from Vercel to Render CNAME
5. **Deployment**: Works the same (git push = deploy)

## Support and Resources

- [Render Documentation](https://render.com/docs)
- [Render Community Forum](https://community.render.com)
- [Render Status Page](https://status.render.com)
- [Prisma on Render Guide](https://render.com/docs/deploy-prisma)

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Database**: Always use Internal URL for web service connection
3. **Secrets**: Use Render's environment variable encryption
4. **HTTPS**: Enabled by default (TLS 1.2+)
5. **Database Backups**: Free tier has limited backups; consider paid plan for production

## Next Steps

After successful deployment:

1. Test all API endpoints
2. Verify database connectivity
3. Set up custom domain (optional)
4. Configure monitoring/alerting
5. Plan for scaling (if needed)
6. Consider upgrading for production workloads

## Example Deployment Timeline

- **T+0**: Push code to GitHub
- **T+1 min**: Render detects changes, starts build
- **T+5 min**: Docker build completes
- **T+6 min**: Database migrations run
- **T+7 min**: App deployed and healthy
- **T+8 min**: App accessible at public URL

First deployment may take longer due to database provisioning.

---

**Your app will be live at**: `https://adulting-app.onrender.com`

Enjoy your deployed app on Render! 🚀
