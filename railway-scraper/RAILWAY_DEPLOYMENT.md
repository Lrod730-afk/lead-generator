# Deploy Scraper to Railway (FREE)

This guide will help you deploy the scraper service to Railway so it can run from your Vercel website!

## Step 1: Prepare the Code

The railway-scraper folder is already set up and ready to deploy!

## Step 2: Create Railway Account

1. Go to https://railway.app
2. Click "Login" → Sign up with GitHub
3. **Free tier includes:**
   - $5 credit/month
   - 500 hours execution time
   - More than enough for scraping!

## Step 3: Deploy to Railway

### Option A: Deploy from GitHub (Recommended)

1. **Push the railway-scraper folder to GitHub:**
   ```bash
   cd railway-scraper
   git init
   git add .
   git commit -m "Railway scraper service"
   git remote add origin https://github.com/YOUR_USERNAME/railway-scraper.git
   git push -u origin main
   ```

2. **In Railway Dashboard:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `railway-scraper` repository
   - Railway will auto-detect it's a Node.js app

3. **Add Environment Variables:**
   Click on your service → Variables → Add these:

   | Variable | Value |
   |----------|-------|
   | `API_ENDPOINT` | `https://your-vercel-url.vercel.app/api/businesses/import` |
   | `PORT` | `3333` |
   | `USE_PROXY` | `false` (or `true` if using proxy) |

   Optional (if using Bright Data proxy):
   | Variable | Value |
   |----------|-------|
   | `PROXY_SERVER` | `http://brd.superproxy.io:33335` |
   | `PROXY_USERNAME` | `brd-customer-hl_36e84bcb-zone-datacenter_proxy1` |
   | `PROXY_PASSWORD` | `ej91p73gyhum` |

4. **Deploy:**
   - Railway will automatically deploy
   - Wait 2-3 minutes
   - You'll get a URL like: `https://railway-scraper-production.up.railway.app`

### Option B: Deploy with Railway CLI (Faster)

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login:**
   ```bash
   railway login
   ```

3. **Deploy:**
   ```bash
   cd railway-scraper
   railway init
   railway up
   ```

4. **Add environment variables:**
   ```bash
   railway variables set API_ENDPOINT=https://your-vercel-url.vercel.app/api/businesses/import
   ```

## Step 4: Get Your Railway URL

After deployment:
1. Go to Railway dashboard
2. Click on your service
3. Go to "Settings" → "Networking"
4. Click "Generate Domain"
5. Copy the URL (e.g., `https://railway-scraper-production-abc123.up.railway.app`)

## Step 5: Update Your Vercel Site

Now update your Vercel deployment to call the Railway scraper:

1. **Add Railway URL as environment variable in Vercel:**
   ```bash
   vercel env add SCRAPER_SERVICE_URL production
   ```

   Paste your Railway URL when prompted (e.g., `https://railway-scraper-production-abc123.up.railway.app`)

2. **Redeploy Vercel:**
   ```bash
   vercel --prod
   ```

## Step 6: Test It!

1. Go to your Vercel site
2. Enter a location and business type
3. Click "Scrape Real Businesses"
4. The scraper will run on Railway and data will appear in your dashboard!

## How It Works

```
User → Vercel Website → Railway Scraper → MongoDB ← Vercel Website
         (Frontend)      (Puppeteer)       (Database)   (Shows Data)
```

1. User clicks "Scrape" on your Vercel site
2. Vercel makes API call to Railway
3. Railway runs Puppeteer and scrapes Google Maps
4. Railway sends data to MongoDB
5. Data appears on Vercel site instantly

## Troubleshooting

### Build Fails
- Make sure `package.json` is in the `railway-scraper` folder
- Check Railway logs for errors

### Scraper Times Out
- Railway free tier has no timeout!
- Check logs to see what's happening

### Data Not Appearing
- Verify `API_ENDPOINT` is set correctly
- Check it points to your Vercel URL
- Make sure MongoDB connection works

### Proxy Errors
- Set `USE_PROXY=false` if you don't need it
- Proxy slows down scraping but helps avoid blocks

## Monitoring

- **View Logs:** Railway Dashboard → Your Service → Deployments → View Logs
- **Check Usage:** Dashboard → Usage (monitor your $5/month credit)
- **Restart Service:** Settings → Restart

## Cost

**Railway Free Tier:**
- $5 credit/month (resets monthly)
- 500 execution hours
- **Cost per scrape:** ~$0.02 (about 2-3 minutes)
- **~250 scrapes/month for FREE!**

If you exceed $5/month, Railway will charge your credit card OR you can set a limit.

## Next Steps

After deployment, I'll update the Vercel code to call your Railway scraper automatically! The scraper button will work from the website! 🚀

---

**Your scraper will now work from the website, hosted for free on Railway!** ✅
