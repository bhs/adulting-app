# Quick Start: Deploy to Render in 5 Minutes

This is the fastest way to get your app running on Render.com's free tier.

## Prerequisites
- GitHub/GitLab/Bitbucket account
- Render.com account (free signup at https://render.com)

## Steps

### 1. Push Code to Git (if not already done)
```bash
git add .
git commit -m "Add Render deployment config"
git push origin main
```

### 2. Deploy on Render
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Click **"Connect account"** (GitHub/GitLab/Bitbucket)
4. Authorize Render to access your repositories
5. Find and select your repository
6. Render detects `render.yaml` automatically
7. Review the resources:
   - ✅ Web Service: `adulting-app`
   - ✅ PostgreSQL DB: `adulting-app-db`
8. Click **"Apply"**

### 3. Wait for Deployment
- First build: ~5-10 minutes
- Watch live logs in dashboard
- Database provisions automatically
- Migrations run on startup

### 4. Access Your App
Once deployed, you'll see:
- **App URL**: `https://adulting-app.onrender.com`
- **API Endpoint**: `https://adulting-app.onrender.com/api/users`

### 5. Test It Works
```bash
# Test the API
curl https://adulting-app.onrender.com/api/users

# Create a user
curl -X POST https://adulting-app.onrender.com/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User"}'
```

## That's It! 🎉

Your app is now:
- ✅ Live on the internet
- ✅ Running on HTTPS (automatic TLS)
- ✅ Connected to PostgreSQL database
- ✅ Auto-deploying on git push

## What Happens on Free Tier

**Good:**
- 750 hours/month web service (enough for 24/7)
- 1 GB PostgreSQL storage
- Automatic HTTPS
- Auto-deploy on git push
- Free forever (with limitations)

**Limitations:**
- App spins down after 15 min of inactivity
- First request after spin-down takes ~30 seconds
- Database expires after 90 days (easily extended)
- 512 MB RAM
- Shared CPU

## Next Steps

- **Custom Domain**: Settings → Custom Domains → Add your domain
- **Monitor Logs**: Click "Logs" tab to see real-time output
- **Database Access**: Click database → "Connect" for connection details
- **Scale Up**: Upgrade to paid plan for no cold starts ($7/month)

## Troubleshooting

**Build failed?**
- Check logs in Render dashboard
- Verify `Dockerfile` and `render.yaml` are committed
- Ensure dependencies are in `package.json`

**App not responding?**
- First request after 15 min takes ~30 seconds (cold start)
- Check logs for errors
- Verify `DATABASE_URL` is set automatically

**Need help?**
- See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed guide
- Visit [Render Community](https://community.render.com)

---

**Your app is live!** Share the URL: `https://adulting-app.onrender.com` 🚀
