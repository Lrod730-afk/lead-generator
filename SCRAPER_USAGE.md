# Scraper Usage Guide

## What Was Fixed

The scraper was getting stuck at 8-9 results because:
1. **No scrolling** - Google Maps only shows ~20 results initially
2. **Hard limit** - Code was limited to only 10 results
3. **No pagination** - Wasn't loading more businesses

## New Features

✅ **Automatic Scrolling** - Scrolls up to 10 times to load more results
✅ **Up to 50 Results** - Now gets up to 50 businesses (configurable)
✅ **Smart Loading** - Stops scrolling when no more results load
✅ **Configurable Limit** - You can specify how many results you want
✅ **Graceful Termination** - Press Ctrl+C to stop and save collected data
✅ **Auto-Save on Exit** - Never lose your scraped data

## 🛑 Stop Scraper Anytime (NEW!)

**Press Ctrl+C to stop the scraper and save all collected data!**

When you press Ctrl+C:
1. ⏸️  Scraper stops immediately
2. 🌐 Browser closes automatically
3. 💾 All collected data is saved
4. 📊 Shows partial results summary
5. 🔄 Ready to restart anytime

**Example:**
```
Started scraping 100 restaurants...
Scraped 23 businesses so far...

[Press Ctrl+C]

⚠️  TERMINATION SIGNAL RECEIVED (Ctrl+C)
🛑 Stopping scraper gracefully...
🌐 Closing browser...

💾 Saving 23 collected businesses...
✅ Data successfully sent to dashboard!

📊 PARTIAL RESULTS:
Total scraped: 23
🔥 HOT leads: 8
🌡️  WARM leads: 10
❄️  COLD leads: 5

👋 Scraper stopped. You can restart anytime!
```

## How to Use

### Basic Usage (Default: 50 results)
```bash
node scraper.js "Fairfield, CT" "restaurants"
```

### Custom Number of Results
```bash
# Get 100 results
node scraper.js "Fairfield, CT" "restaurants" 100

# Get 20 results (faster)
node scraper.js "Fairfield, CT" "restaurants" 20
```

### Examples

**Get 30 plumbers in New York:**
```bash
node scraper.js "New York, NY" "plumbers" 30
```

**Get 75 dentists in Los Angeles:**
```bash
node scraper.js "Los Angeles, CA" "dentists" 75
```

**Get 100 gyms in Chicago:**
```bash
node scraper.js "Chicago, IL" "gyms" 100
```

## What Happens

1. **Opens Google Maps** in browser (you can watch it work)
2. **Searches** for your business type in the location
3. **Scrolls** the results list 10 times to load more businesses
4. **Visits** each business page to get details
5. **Extracts** data (name, phone, website, address, rating, reviews)
6. **Scores** leads as HOT/WARM/COLD
7. **Sends** to your dashboard automatically

## Expected Results

With the fix:
- ✅ **20-50 results** typically (depends on how many exist in the area)
- ✅ **100+ results** possible with higher maxResults setting
- ✅ **No more stopping at 8-9** results

## Performance Notes

### Time Estimates
- **20 results**: ~2-3 minutes
- **50 results**: ~5-7 minutes
- **100 results**: ~10-15 minutes

Each business takes about 5-8 seconds to scrape (delays to avoid detection).

### Google Maps Limits

Google Maps typically shows:
- **Urban areas**: 100-200+ businesses
- **Suburban areas**: 50-100 businesses
- **Rural areas**: 10-50 businesses

The scraper will get as many as available, up to your maxResults.

## Troubleshooting

### Still Getting Few Results?

**Check if there are more businesses:**
1. Manually search on Google Maps
2. See how many results appear
3. If Google only shows 10-15, that's all that exist

**Try different search terms:**
```bash
# Instead of "restaurants"
node scraper.js "Fairfield, CT" "italian restaurants" 50
node scraper.js "Fairfield, CT" "pizza places" 50
node scraper.js "Fairfield, CT" "cafes" 50
```

### Scraper Crashes

**If it crashes during scrolling:**
- Reduce maxResults: `node scraper.js "location" "type" 20`
- Check internet connection
- Try again (sometimes Google blocks temporarily)

### No Data Extracted

**If businesses found but no details:**
- Google Maps changed their HTML structure
- Need to update the selectors in the code
- Contact for support

## Advanced Usage

### Run Multiple Searches

Create a script to run multiple searches:

```bash
#!/bin/bash
# search_all.sh

node scraper.js "Fairfield, CT" "restaurants" 50
sleep 60  # Wait 1 minute between searches

node scraper.js "Fairfield, CT" "plumbers" 50
sleep 60

node scraper.js "Fairfield, CT" "dentists" 50
```

Make it executable:
```bash
chmod +x search_all.sh
./search_all.sh
```

### Different Cities

```bash
# Connecticut cities
node scraper.js "Bridgeport, CT" "restaurants" 50
node scraper.js "New Haven, CT" "restaurants" 50
node scraper.js "Stamford, CT" "restaurants" 50
node scraper.js "Hartford, CT" "restaurants" 50
```

## Tips for Best Results

1. **Be Specific** with business types:
   - ❌ "restaurants" (too broad)
   - ✅ "italian restaurants", "sushi restaurants", "fast food"

2. **Use Proper Location Format**:
   - ✅ "City, State" - "Fairfield, CT"
   - ✅ "City, State Zip" - "Fairfield, CT 06824"
   - ✅ "Neighborhood, City" - "Downtown, Chicago"

3. **Start Small** to test:
   - Try 20 results first
   - If it works, increase to 50 or 100

4. **Avoid Detection**:
   - Don't run too many searches in a row
   - Wait 1-2 minutes between searches
   - Don't scrape 24/7

5. **Peak Times**:
   - Best: Late night (less Google traffic)
   - Avoid: Business hours (more detection risk)

## Output

The scraper will show:
```
🚀 LEAD GENERATOR - REAL DATA SCRAPER
📍 Location: Fairfield, CT
🏢 Business Type: restaurants
🎯 Max Results: 50

📜 Scrolling to load more results...
   Scroll 1/10...
   Scroll 2/10...
   ...
   Loaded results after 8 scrolls

📋 Getting business list...
Found 47 businesses to check

1/47: Checking Restaurant Name...
   ✅ Restaurant Name
   📍 123 Main St, Fairfield, CT 06824
   📞 (203) 555-1234
   🌐 restaurantwebsite.com
   ⭐ 4.5 (127 reviews)
   🎯 Lead Score: COLD

...

📊 FINAL RESULTS:
Total scraped: 47
🔥 HOT leads: 12
🌡️ WARM leads: 18
❄️ COLD leads: 17

📤 Sending 47 businesses to dashboard...
✅ Data successfully sent to dashboard!
🌐 View at: http://localhost:3001
```

## Summary

**Before Fix:**
- 🔴 Only 8-10 results
- 🔴 Hard-coded limit
- 🔴 No scrolling

**After Fix:**
- ✅ 20-100+ results
- ✅ Configurable limit
- ✅ Smart scrolling
- ✅ Better data collection

**Usage:**
```bash
node scraper.js "Location" "BusinessType" [MaxResults]
```

**Default:** 50 results if not specified

Enjoy the improved scraper! 🚀
