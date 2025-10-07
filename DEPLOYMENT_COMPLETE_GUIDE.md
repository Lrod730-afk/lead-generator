# Complete Deployment Guide - Lead Generator

This guide will help you deploy your lead generator with working Google Maps scraping functionality.

## Architecture Overview

```
User Browser
    ↓
Vercel (Frontend + Dashboard + MongoDB API)
    ↓
Railway (Scraper Service with Puppeteer)
    ↓
MongoDB Atlas (Shared Database)
    ↑
Vercel (Reads scraped data)
```

## Prerequisites

1. Vercel account (already set up ✅)
2. Railway account (free tier) - Sign up at https://railway.app
3. MongoDB Atlas URI
4. GitHub repository

---

## Step 1: Deploy to Railway (Scraper Service)

### 1.1 Create Railway Account
1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign in with GitHub

### 1.2 Deploy the Scraper
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your `lead-generator` repository
4. Railway will ask for the root directory
   - **IMPORTANT**: Set root directory to `railway-scraper`
5. Railway will auto-detect Node.js and deploy

### 1.3 Configure Environment Variables in Railway
Go to your Railway project → Variables tab → Add these:

```bash
API_ENDPOINT=https://your-vercel-url.vercel.app/api/businesses/import
USE_PROXY=false
NODE_ENV=production
```

**Replace `your-vercel-url.vercel.app` with your actual Vercel URL!**

### 1.4 Get Your Railway URL
1. Go to Settings tab in Railway
2. Click "Generate Domain" under Networking
3. Copy the URL (e.g., `https://railway-scraper-production.up.railway.app`)
4. **Save this URL - you'll need it for Vercel!**

---

## Step 2: Update Vercel with Railway URL

### 2.1 Add Environment Variable to Vercel
1. Go to your Vercel project dashboard
2. Go to Settings → Environment Variables
3. Add a new variable:
   ```
   Name: SCRAPER_SERVICE_URL
   Value: https://your-railway-url.up.railway.app
   ```
   (Replace with your actual Railway URL from Step 1.4)
4. Select all environments (Production, Preview, Development)
5. Click "Save"

### 2.2 Redeploy Vercel
After adding the environment variable, trigger a new deployment:

```bash
# Option 1: Push a new commit
git add .
git commit -m "Add Railway scraper integration"
git push

# Option 2: Redeploy from Vercel dashboard
# Go to Deployments → Click ⋯ on latest → Redeploy
```

---

## Step 3: Verify Everything Works

### 3.1 Test Railway Scraper Directly
```bash
curl -X POST https://your-railway-url.up.railway.app/scrape \
  -H "Content-Type: application/json" \
  -d '{"location": "Miami, FL", "businessType": "plumber", "radius": 10}'
```

You should get:
```json
{
  "message": "Scraping started",
  "status": "processing"
}
```

### 3.2 Check Railway Logs
1. Go to Railway dashboard
2. Click on your deployment
3. Go to "Deployments" tab → View logs
4. You should see scraping progress in real-time

### 3.3 Test from Your Website
1. Go to your Vercel URL (e.g., `https://your-site.vercel.app`)
2. Enter a location and business type
3. Click "Search for Leads"
4. Wait 30-60 seconds, then check the Dashboard
5. You should see the scraped businesses appear!

---

## Environment Variables Summary

### Railway Environment Variables
```bash
API_ENDPOINT=https://your-vercel-url.vercel.app/api/businesses/import
USE_PROXY=false
NODE_ENV=production
```

### Vercel Environment Variables
```bash
MONGODB_URI=mongodb+srv://your-connection-string
SCRAPER_SERVICE_URL=https://your-railway-url.up.railway.app
```

---

## Troubleshooting

### Problem: "Scraper service not configured" error
**Solution**: Make sure `SCRAPER_SERVICE_URL` is set in Vercel and you've redeployed

### Problem: Scraper starts but no data appears
**Solution**:
1. Check Railway logs for errors
2. Verify `API_ENDPOINT` in Railway points to your Vercel URL
3. Make sure MongoDB URI is correct in Vercel

### Problem: Railway deployment fails
**Solution**:
1. Make sure root directory is set to `railway-scraper`
2. Check that `railway-scraper/package.json` exists
3. View build logs in Railway for specific errors

### Problem: "Failed to send to API" in Railway logs
**Solution**:
1. Check that `API_ENDPOINT` variable is correct
2. Make sure Vercel site is deployed and accessible
3. Test the import endpoint directly:
   ```bash
   curl -X POST https://your-vercel-url.vercel.app/api/businesses/import \
     -H "Content-Type: application/json" \
     -d '{"businesses": []}'
   ```

---

## Cost Breakdown

### Free Tier Limits
- **Vercel**: Free for personal projects, unlimited deployments
- **Railway**:
  - $5 free credit per month
  - Approximately 500 hours of runtime
  - More than enough for occasional scraping
- **MongoDB Atlas**: Free tier (512MB storage, plenty for thousands of leads)

**Total monthly cost: $0** (within free tiers)

---

## Monitoring

### Railway Metrics
- View in Railway dashboard → Metrics tab
- Shows CPU, memory, network usage
- Monitor to ensure you stay within free tier

### Vercel Analytics
- View in Vercel dashboard → Analytics tab
- Shows visitor count, page views
- Free tier includes basic analytics

---

## Optional: Add Proxy Support

If you get rate-limited by Google, you can add proxy support:

1. Sign up for Bright Data or similar proxy service
2. Add these variables to Railway:
   ```bash
   USE_PROXY=true
   PROXY_SERVER=http://brd.superproxy.io:33335
   PROXY_USERNAME=your-username
   PROXY_PASSWORD=your-password
   ```
3. Redeploy Railway

---

## Next Steps

1. ✅ Deploy Railway scraper service
2. ✅ Add SCRAPER_SERVICE_URL to Vercel
3. ✅ Test the complete flow
4. 📧 Send the Vercel URL to your uncle!

Your lead generator is now fully functional with real Google Maps scraping! 🎉
