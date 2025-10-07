# Quick Deploy Steps - TL;DR

Follow these steps in order to get your scraper working on the deployed site.

## 1️⃣ Deploy Railway Scraper (5 minutes)

1. Go to https://railway.app and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `lead-generator` repository
4. **Set root directory to:** `railway-scraper`
5. Add environment variables:
   ```
   API_ENDPOINT=https://YOUR-VERCEL-URL.vercel.app/api/businesses/import
   USE_PROXY=false
   ```
6. Go to Settings → Generate Domain
7. **Copy your Railway URL** (e.g., `https://web-production-abc123.up.railway.app`)

## 2️⃣ Update Vercel (2 minutes)

1. Go to your Vercel project → Settings → Environment Variables
2. Add new variable:
   ```
   SCRAPER_SERVICE_URL=https://YOUR-RAILWAY-URL.up.railway.app
   ```
3. Select all environments and save
4. Go to Deployments → Redeploy latest deployment

## 3️⃣ Test It (1 minute)

1. Go to your Vercel website
2. Enter location + business type
3. Click "Search for Leads"
4. Wait 30-60 seconds
5. Check Dashboard - businesses should appear!

---

## Environment Variables Cheat Sheet

### Railway
- `API_ENDPOINT` = Your Vercel URL + `/api/businesses/import`
- `USE_PROXY` = `false`

### Vercel
- `MONGODB_URI` = Your MongoDB connection string (already set ✅)
- `SCRAPER_SERVICE_URL` = Your Railway URL (NEW!)

---

## Troubleshooting

**Scraper not working?**
1. Check Railway logs (Railway dashboard → Deployments → Logs)
2. Verify `SCRAPER_SERVICE_URL` is set in Vercel
3. Make sure you redeployed Vercel after adding the variable

**No data appearing?**
1. Check `API_ENDPOINT` in Railway points to correct Vercel URL
2. View Railway logs to see if scraping succeeded
3. Check MongoDB connection in Vercel

---

**That's it! Your scraper will now work on the deployed site. 🚀**
