# Graceful Termination Feature

## Overview

The scraper now supports **graceful termination** - you can stop it anytime with Ctrl+C and all collected data will be automatically saved!

## How It Works

### Press Ctrl+C Anytime

Simply press `Ctrl+C` (or `Cmd+C` on Mac) while the scraper is running.

### What Happens

1. **Immediate Response**: Scraper detects termination signal
2. **Closes Browser**: Chrome/browser window closes automatically
3. **Saves Data**: All businesses scraped so far are saved
4. **Sends to Dashboard**: Tries to send data to your dashboard API
5. **Local Backup**: If API is unavailable, saves to a JSON file
6. **Shows Summary**: Displays what was collected

## Example Usage

### Scenario: You Started Too Many Results

```bash
# You start with 100 results
node scraper.js "Fairfield, CT" "restaurants" 100

# After seeing 25 businesses scraped, you realize it's taking too long
# Press Ctrl+C

⚠️  TERMINATION SIGNAL RECEIVED (Ctrl+C)
🛑 Stopping scraper gracefully...
🌐 Closing browser...

💾 Saving 25 collected businesses...
✅ Data successfully sent to dashboard!

📊 PARTIAL RESULTS:
Total scraped: 25
🔥 HOT leads: 9
🌡️  WARM leads: 11
❄️  COLD leads: 5

👋 Scraper stopped. You can restart anytime!
```

### Scenario: You Want to Change Location

```bash
# Started scraping New York
node scraper.js "New York, NY" "plumbers"

# After 15 businesses, you realize you meant Los Angeles
# Press Ctrl+C to stop

# Data is saved, then restart with correct location
node scraper.js "Los Angeles, CA" "plumbers"
```

### Scenario: Emergency Stop

```bash
# Something went wrong, browser acting weird
# Press Ctrl+C

# Everything stops and cleans up automatically
# No orphaned browser processes
# No lost data
```

## Data Saving Behavior

### Primary: Send to Dashboard

First, tries to send data to your dashboard API:
- URL: `http://localhost:3001/api/businesses/import`
- If successful: Data appears in your dashboard immediately
- Shows: "✅ Data successfully sent to dashboard!"

### Fallback: Local JSON File

If API is unavailable or fails:
- Saves to: `leads-interrupted-[timestamp].json`
- Location: Same folder as scraper.js
- Format: Clean, readable JSON
- Shows: "✅ Data saved to leads-interrupted-1697123456789.json"

### Example File

```json
[
  {
    "name": "Joe's Pizza",
    "phone": "(203) 555-1234",
    "website": "joespizza.com",
    "address": "123 Main St",
    "city": "Fairfield",
    "state": "CT",
    "zip": "06824",
    "rating": 4.5,
    "reviewCount": 127,
    "industry": "restaurants",
    "leadScore": "COLD",
    "needsHelp": ["Well-established online presence"],
    "source": "Google Maps",
    "scrapedAt": "2025-10-13T19:30:00.000Z"
  },
  ...
]
```

## Technical Details

### Signal Handling

The scraper listens for:
- `SIGINT` - Ctrl+C in terminal
- `SIGTERM` - Kill commands

### Prevents Multiple Calls

If you press Ctrl+C multiple times, it only processes once:
```javascript
if (isTerminating) return; // Already stopping
isTerminating = true;
```

### Global State Management

Tracks three things:
- `globalBrowser` - Browser instance for cleanup
- `collectedBusinesses` - Array of scraped data
- `isTerminating` - Flag to stop gracefully

### Loop Breaking

When termination is detected, the scraping loop breaks:
```javascript
if (isTerminating) {
  console.log('\n⚠️  Stopping as requested...');
  break;
}
```

## Benefits

### 1. No Lost Data
- Never lose scraped businesses
- All collected data is preserved
- Automatic save on exit

### 2. Fast Restart
- Stop and restart anytime
- Change parameters mid-run
- Test different settings quickly

### 3. Resource Cleanup
- Browser closes properly
- No zombie processes
- Clean terminal state

### 4. Flexible Workflow
- Don't know how many results you want? Start high, stop early
- Made a mistake? Stop and fix it
- Taking too long? Stop and reduce count

### 5. Emergency Safety
- Something goes wrong? Stop safely
- Computer needs restart? Save first
- Need to leave? Stop and resume later

## Use Cases

### Testing Search Terms

```bash
# Test if "italian restaurants" gives good results
node scraper.js "Fairfield, CT" "italian restaurants" 100

# After 10 results, you see they're all pizza places
# Ctrl+C to stop

# Try more specific term
node scraper.js "Fairfield, CT" "fine dining italian" 50
```

### Budget Your Time

```bash
# Start with high target
node scraper.js "Boston, MA" "dentists" 100

# After 30 results (about 3 minutes), you have enough
# Ctrl+C to stop and use what you have
```

### Split Scraping Sessions

```bash
# Monday morning: Scrape 30 businesses
node scraper.js "Miami, FL" "gyms" 30
# Data saved

# Monday afternoon: Scrape 30 more
node scraper.js "Miami, FL" "personal trainers" 30
# Data saved

# Both datasets in your dashboard
```

## Troubleshooting

### Data Not Showing in Dashboard

**If you see "Data saved locally" instead of "sent to dashboard":**

1. Check if your dashboard is running:
   ```bash
   cd /Users/lucasrodriguez/Desktop/scraper/lead-generator
   npm run dev
   ```

2. Visit: http://localhost:3001

3. Check the JSON file saved locally

4. Import manually using the dashboard's import feature

### Browser Doesn't Close

If browser stays open after Ctrl+C:
1. The scraper tried to close it
2. Manually close the browser window
3. Restart the scraper - it will open a fresh one

### Pressed Ctrl+C Too Many Times

Don't worry! The handler prevents multiple executions:
- Only processes first Ctrl+C
- Ignores subsequent ones
- Data saved only once

### No Data Saved

If nothing was saved:
- You stopped before any business was fully scraped
- First business takes ~8 seconds
- Wait for at least one "✅ Business Name" message
- Then Ctrl+C will save it

## Tips for Best Results

1. **Let First Business Complete**
   - Wait ~10 seconds before stopping
   - Ensures at least one business is saved

2. **Watch the Console**
   - Look for "✅ Business Name" lines
   - Each ✅ means data is saved
   - Stop after desired number of ✅

3. **Use Appropriate Timeouts**
   - 10 businesses = ~1 minute
   - 50 businesses = ~5 minutes
   - Stop early if you have enough

4. **Save Frequently**
   - Better to scrape in batches
   - 20-30 businesses per run
   - Multiple small runs vs. one huge run

5. **Have Dashboard Running**
   - Data goes directly to dashboard
   - No need to import JSON files
   - Immediate visibility

## Summary

### Before This Feature
- ❌ Had to wait for scraper to finish
- ❌ Stopping meant losing all data
- ❌ No way to cancel mid-run
- ❌ Browser stayed open

### After This Feature
- ✅ Stop anytime with Ctrl+C
- ✅ All collected data is saved
- ✅ Browser closes automatically
- ✅ Clean, graceful shutdown
- ✅ Partial results available immediately

### How to Use
```bash
# Start scraping
node scraper.js "Location" "BusinessType" [MaxResults]

# Press Ctrl+C when you want to stop

# Data is automatically saved!
```

**You're in control!** 🎮
