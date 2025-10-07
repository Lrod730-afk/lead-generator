# Quick Setup Guide

## Step 1: Install Dependencies
```bash
cd lead-generator
npm install
```

## Step 2: Verify Environment Variables
The `.env.local` file is already configured with MongoDB connection.

## Step 3: Seed Database with Sample Data
```bash
npm run seed
```

This will create 150 sample businesses with varied lead scores.

## Step 4: Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Step 5: Explore the Application

### Landing Page
- View statistics
- Search for leads (note: actual search requires data sources)
- Navigate to Dashboard

### Dashboard
- View all leads
- Filter by score, website status, contact status
- Sort by different fields
- Export to CSV
- Copy emails/phones
- Mark leads as contacted

### Import Page
- Upload CSV files
- Add businesses manually
- View API integration docs

## What's Included?

✅ 150 sample businesses across 10+ industries
✅ Automatic lead scoring (HOT/WARM/COLD)
✅ Full CRUD operations
✅ CSV export
✅ Responsive design
✅ MongoDB integration

## Next Steps

1. **Customize branding**: Edit colors in `tailwind.config.ts`
2. **Add data sources**: Implement in `lib/enrichment.ts`
3. **Deploy to Vercel**: Run `vercel` command
4. **Add more features**: Authentication, email campaigns, etc.

## Troubleshooting

**MongoDB Connection Error?**
- Check network settings in MongoDB Atlas
- Ensure IP address is whitelisted (or use 0.0.0.0/0 for all)

**Build Errors?**
```bash
rm -rf .next node_modules
npm install
npm run build
```

**No sample data?**
```bash
npm run seed
```

## Production Checklist

Before deploying to production:

- [ ] Update MongoDB connection string (use production database)
- [ ] Add authentication/authorization
- [ ] Configure CORS if needed
- [ ] Set up monitoring (Vercel Analytics)
- [ ] Add error tracking (Sentry)
- [ ] Review and update API rate limits
- [ ] Test CSV imports with real data
- [ ] Configure custom domain in Vercel
- [ ] Set up automated backups for MongoDB
- [ ] Review security settings

## Support

Questions? Check:
1. README.md for detailed documentation
2. Code comments in source files
3. MongoDB Atlas dashboard for database issues
4. Vercel dashboard for deployment issues
