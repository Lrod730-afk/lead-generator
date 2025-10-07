# Deployment Guide

## Deploy to Vercel (Recommended)

Vercel is the fastest and easiest way to deploy Next.js applications.

### Method 1: Vercel CLI (5 minutes)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from project directory**
   ```bash
   cd lead-generator
   vercel
   ```

4. **Follow prompts:**
   - Set up and deploy? **Yes**
   - Which scope? **Your account**
   - Link to existing project? **No**
   - Project name? **lead-generator** (or custom name)
   - Directory? **./** (current directory)
   - Override settings? **No**

5. **Add Environment Variables**

   After first deployment, add environment variable:
   ```bash
   vercel env add MONGODB_URI
   ```

   Paste your MongoDB connection string:
   ```
   mongodb+srv://leadgen:aI2JNQDyKqrDVrnu@cluster0.z3vjtvo.mongodb.net/leadgen?retryWrites=true&w=majority
   ```

   Select: **Production, Preview, Development**

6. **Redeploy with environment variables**
   ```bash
   vercel --prod
   ```

7. **Done!** 🎉
   - Your app is live at: `https://lead-generator.vercel.app`
   - Or your custom domain

### Method 2: Vercel Dashboard (10 minutes)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository

3. **Configure Project**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** ./
   - **Build Command:** `next build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)

4. **Add Environment Variables**

   Click "Environment Variables" and add:

   | Name | Value |
   |------|-------|
   | MONGODB_URI | `mongodb+srv://leadgen:aI2JNQDyKqrDVrnu@cluster0.z3vjtvo.mongodb.net/leadgen?retryWrites=true&w=majority` |

   Select all environments: Production, Preview, Development

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live!

6. **Automatic Deployments**
   - Every push to `main` branch auto-deploys
   - Pull requests get preview deployments

---

## Custom Domain Setup

### Add Custom Domain in Vercel

1. **Go to Project Settings**
   - Select your project
   - Go to "Settings" → "Domains"

2. **Add Domain**
   - Enter your domain: `elevateyourleads.com`
   - Click "Add"

3. **Configure DNS**

   **If using Vercel nameservers:**
   - Point your domain nameservers to Vercel

   **If using external DNS:**
   - Add A record: `76.76.21.21`
   - Add CNAME: `cname.vercel-dns.com`

4. **SSL Certificate**
   - Automatically provisioned
   - Ready in 1-2 minutes

---

## Alternative Deployment Options

### Deploy to Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build the app**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

4. **Add environment variables in Netlify dashboard**

### Deploy to Railway

1. **Go to [railway.app](https://railway.app)**
2. **New Project** → **Deploy from GitHub repo**
3. **Add environment variables**
4. **Deploy**

### Deploy to DigitalOcean App Platform

1. **Create account at [digitalocean.com](https://digitalocean.com)**
2. **Apps** → **Create App**
3. **Connect GitHub repo**
4. **Add environment variables**
5. **Deploy**

---

## Environment Variables

### Required Variables

```bash
MONGODB_URI=mongodb+srv://leadgen:aI2JNQDyKqrDVrnu@cluster0.z3vjtvo.mongodb.net/leadgen?retryWrites=true&w=majority
```

### Optional Variables (for future integrations)

```bash
# Google Places API (if you add this integration)
GOOGLE_PLACES_API_KEY=your_key_here

# Yelp Fusion API (if you add this integration)
YELP_API_KEY=your_key_here

# Email finder services (if you add this integration)
HUNTER_API_KEY=your_key_here
CLEARBIT_API_KEY=your_key_here

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

---

## Post-Deployment Checklist

### 1. Verify Deployment

- [ ] Visit your deployed URL
- [ ] Homepage loads correctly
- [ ] Dashboard shows data
- [ ] Import page works
- [ ] CSV export works

### 2. Test Core Features

- [ ] Statistics display correctly
- [ ] Lead filtering works
- [ ] Search functionality
- [ ] CSV export downloads
- [ ] Copy emails/phones to clipboard
- [ ] Mark as contacted updates database

### 3. Database Connection

- [ ] MongoDB Atlas allows connections from Vercel IPs
- [ ] Data loads on dashboard
- [ ] Can add new businesses
- [ ] Import CSV works

### 4. Performance

- [ ] Lighthouse score > 90
- [ ] First load < 3 seconds
- [ ] API responses < 500ms

### 5. Security

- [ ] Environment variables are set correctly
- [ ] MongoDB credentials not exposed in client
- [ ] HTTPS enabled (automatic with Vercel)

### 6. MongoDB Atlas Configuration

- [ ] Network Access: Allow all IPs (0.0.0.0/0) or Vercel IPs
- [ ] Database user has read/write permissions
- [ ] Connection string includes database name

---

## Monitoring & Analytics

### Vercel Analytics (Built-in)

1. **Enable in dashboard**
   - Project → Analytics → Enable

2. **View metrics:**
   - Page views
   - Performance
   - User sessions

### Google Analytics (Optional)

1. **Add to environment variables:**
   ```bash
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

2. **Add to `app/layout.tsx`:**
   ```typescript
   import Script from 'next/script'

   // In <head>:
   {process.env.NEXT_PUBLIC_GA_ID && (
     <>
       <Script
         src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
       />
       <Script id="google-analytics">
         {`
           window.dataLayer = window.dataLayer || [];
           function gtag(){dataLayer.push(arguments);}
           gtag('js', new Date());
           gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
         `}
       </Script>
     </>
   )}
   ```

---

## Troubleshooting Deployment

### Build Fails

**Error: Module not found**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**TypeScript errors**
- Check `tsconfig.json` is correct
- Run `npm run lint` locally first

### MongoDB Connection Fails

**Error: MongoServerError**

1. **Check network access in MongoDB Atlas:**
   - Go to "Network Access"
   - Add IP: `0.0.0.0/0` (allow all)
   - Or add Vercel IPs

2. **Verify connection string:**
   - Check environment variable is set
   - Ensure password is URL-encoded
   - Database name is included

3. **Test locally:**
   ```bash
   npm run dev
   ```

### Environment Variables Not Working

1. **Redeploy after adding variables**
   ```bash
   vercel --prod
   ```

2. **Check variable names match exactly**
   - `MONGODB_URI` not `MONGODB_URL`

3. **Verify in Vercel dashboard**
   - Settings → Environment Variables
   - Should show for all environments

### 404 Errors

- Check file names match route structure
- Ensure `app/` directory is deployed
- Clear `.next` folder and rebuild

### Slow Performance

1. **Enable caching:**
   - Vercel automatically caches static assets

2. **Optimize images:**
   - Use Next.js Image component
   - Enable image optimization in Vercel

3. **Database indexing:**
   ```javascript
   // In MongoDB, create indexes:
   db.businesses.createIndex({ city: 1, state: 1 })
   db.businesses.createIndex({ leadScore: 1 })
   ```

---

## Scaling Considerations

### Database

- **Current:** MongoDB Atlas M0 (Free tier)
- **Scale to:** M10 for production (512MB RAM, $57/month)
- **Backup:** Enable automatic backups in Atlas

### Vercel

- **Current:** Hobby plan (Free)
- **Scale to:** Pro plan ($20/month) for:
  - Custom domains
  - More bandwidth
  - Longer function timeouts

### API Rate Limits

If using external APIs, consider:
- Implementing request caching
- Rate limiting on your endpoints
- Queue systems for bulk imports

---

## Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## Success! 🎉

Your lead generation application is now live and accessible worldwide!

**Next steps:**
1. Share URL with your uncle
2. Add custom domain (optional)
3. Set up analytics (optional)
4. Add more data sources (see DATA_SOURCES.md)
5. Monitor usage and performance

**Your deployed app:**
- Fast global CDN
- Automatic HTTPS
- Auto-scaling
- 99.9% uptime
- Free hosting (Hobby plan)

Enjoy your deployed application!
