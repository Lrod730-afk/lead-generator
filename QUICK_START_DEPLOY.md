# Quick Start: Deploy to Vercel (5 Minutes)

Follow these simple steps to deploy your Lead Generator so your uncle can access it from anywhere!

## Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

## Step 2: Login to Vercel

```bash
vercel login
```

This will open your browser - sign in with GitHub, GitLab, or email.

## Step 3: Deploy

Navigate to your project and run:

```bash
cd "/Users/lucasrodriguez/Desktop/lurod claude/lead-generator"
vercel
```

Answer the prompts:
- **Set up and deploy?** → Press Enter (Yes)
- **Which scope?** → Select your account
- **Link to existing project?** → `N` (No)
- **What's your project's name?** → `lead-generator` (or choose your own)
- **In which directory is your code located?** → Press Enter (current directory)
- **Want to override settings?** → `N` (No)

## Step 4: Add Environment Variable

After deployment, add your MongoDB connection:

```bash
vercel env add MONGODB_URI production
```

When prompted, paste:
```
mongodb+srv://leadgen:aI2JNQDyKqrDVrnu@cluster0.z3vjtvo.mongodb.net/leadgen?retryWrites=true&w=majority
```

## Step 5: Redeploy with Environment Variable

```bash
vercel --prod
```

## Done! 🎉

Your site is now live! The URL will be shown in the terminal, something like:

```
https://lead-generator-abc123.vercel.app
```

**Share this URL with your uncle!**

---

## ⚠️ Important: About the Scraper

The Google Maps scraper **will NOT work** on the deployed site because:
- Vercel has a 10-second timeout for functions
- Puppeteer (browser automation) doesn't work in serverless environments

### How to Use the Scraper:

**Option 1: Run locally, view online** (Recommended)
1. Run the scraper on your computer:
   ```bash
   node scraper.js "Miami, FL" "restaurants"
   ```
2. Data goes to MongoDB
3. Your uncle views it on the deployed site

**Option 2: Manual CSV Import**
- Use the Import page on the deployed site
- Upload CSV files with business data

---

## What Your Uncle CAN Do on the Deployed Site:

✅ View all scraped leads
✅ Filter and sort businesses
✅ Export to CSV
✅ Copy emails and phone numbers
✅ Mark businesses as contacted
✅ Clear all leads
✅ Import CSV files

❌ Cannot run the scraper (must be done locally)

---

## Updating the Site

Whenever you make changes:

```bash
git add .
git commit -m "Update feature"
git push
vercel --prod
```

Or if you connected to GitHub, just push and it auto-deploys!

---

## Custom Domain (Optional)

Want a custom URL like `leads.yoursite.com`?

1. Buy a domain (Namecheap, GoDaddy, etc.)
2. In Vercel dashboard:
   - Go to your project → Settings → Domains
   - Add your domain
   - Follow the DNS setup instructions

---

## Need Help?

Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide for:
- Troubleshooting
- Alternative deployment options
- MongoDB Atlas configuration
- Analytics setup

---

**That's it!** Your lead generator is now live and your uncle can access it from anywhere! 🚀
