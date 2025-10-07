# Lead Generator - User Guide

Welcome! This is your Lead Generator dashboard for finding and managing business leads.

## 🌐 Accessing the Site

Your site is available at: **[Your Vercel URL will go here]**

You can access it from any device - computer, tablet, or phone!

## 📊 What You Can Do

### ✅ Available Features:

1. **View All Leads** - See all scraped businesses in one place
2. **Filter Leads** - Filter by:
   - Lead Score (HOT/WARM/COLD)
   - Has Website / No Website
   - Contacted / Not Contacted
   - Search by name, city, or state

3. **Sort Leads** - Sort by:
   - Date Added
   - Business Name
   - Rating
   - Number of Reviews

4. **Export to CSV** - Download all leads to import into your CRM

5. **Copy Contact Info** - Quick copy of all emails or phone numbers

6. **Mark as Contacted** - Track which businesses you've reached out to

7. **Clear All Leads** - Remove all leads to start fresh

8. **Import CSV** - Upload business data from CSV files

### ❌ Not Available on the Website:

- **Live Google Maps Scraping** - This must be done locally (see below)

## 🔥 Understanding Lead Scores

- **🔥 HOT** - No website OR low rating (< 4.0) - **Best opportunities!**
- **🌤️ WARM** - Only social media OR few reviews (< 10) - **Good prospects**
- **❄️ COLD** - Well-established online presence - **Harder to convert**

## 💡 How to Add New Leads

Since the scraper doesn't work on the deployed site, here are your options:

### Option 1: Ask Lucas to Run the Scraper
Lucas can run the scraper on his computer, and the leads will appear on your site automatically!

### Option 2: Import a CSV File
1. Click "Import" in the navigation
2. Upload a CSV file with business data
3. System will automatically score them

### Option 3: Wait for Pre-Scraped Data
Lucas can scrape leads for you regularly and they'll show up automatically!

## 📱 Using the Dashboard

### Viewing Leads
1. Go to the "Dashboard" page
2. You'll see all leads in a table format
3. Each lead shows:
   - Business name and location
   - Contact info (phone, email, website)
   - Rating and review count
   - Why they need help
   - Contact status

### Filtering Leads
Use the filter section at the top to:
- Click HOT/WARM/COLD badges to filter by lead score
- Select "Has Website" or "No Website"
- Choose "Contacted" or "Not Contacted"
- Search by name or location

### Exporting Leads
1. Click "Export CSV" button
2. File downloads automatically
3. Open in Excel or Google Sheets
4. Import into your CRM

### Copying Contact Info
1. Click "Copy Emails" - copies all email addresses
2. Click "Copy Phones" - copies all phone numbers
3. Paste into your email or phone app

### Marking as Contacted
1. Find the business in the table
2. Click "Mark Contacted" button
3. Button turns green to show it's been contacted
4. Click again to unmark if needed

## 🎯 Best Practices

1. **Focus on HOT Leads First** - They need websites the most!
2. **Check the "Why They Need Help" column** - Shows exactly what to pitch
3. **Mark leads as contacted** - Avoid calling the same business twice
4. **Export regularly** - Keep a backup of your leads
5. **Clear old leads** - When you're done with a campaign, clear and start fresh

## 📞 Common Questions

**Q: Why can't I scrape on the website?**
A: The scraper requires browser automation (Puppeteer) which doesn't work on Vercel's servers. Lucas can run it locally for you!

**Q: How often is data updated?**
A: Whenever Lucas runs the scraper or you import new data.

**Q: Can I add my own notes to leads?**
A: Not yet, but you can export to CSV and add notes there!

**Q: What does "Review Count: 0" mean?**
A: The business is new or hasn't received Google reviews yet - prime opportunity!

**Q: Can I delete individual leads?**
A: Currently you can only clear all leads, but you can filter them out by marking as contacted.

## 🆘 Need Help?

Contact Lucas if you:
- Need new leads scraped
- Have questions about the data
- Want to import a specific list
- Need help with any features

---

**Enjoy finding your perfect leads!** 🚀

Remember: HOT leads = businesses without websites = your best opportunities!
