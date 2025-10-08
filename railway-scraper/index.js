// Railway Scraper Service - Standalone Express server
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');

puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3333;

// Your MongoDB API endpoint (Vercel deployment)
const API_ENDPOINT = process.env.API_ENDPOINT || 'https://your-vercel-url.vercel.app/api/businesses/import';

// Proxy configuration (optional)
const USE_PROXY = process.env.USE_PROXY === 'true' || false;
const PROXY = {
  server: process.env.PROXY_SERVER || 'http://brd.superproxy.io:33335',
  username: process.env.PROXY_USERNAME || '',
  password: process.env.PROXY_PASSWORD || ''
};

app.use(cors());
app.use(express.json());

// Helper function to parse addresses
function parseAddress(addressString) {
  const states = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ];

  if (!addressString || addressString === 'Not found') {
    return {
      address: addressString,
      city: 'Unknown',
      state: 'Unknown',
      zip: 'Unknown',
    };
  }

  const zipMatch = addressString.match(/\b(\d{5}(?:-\d{4})?)\b/);
  const zip = zipMatch ? zipMatch[1] : 'Unknown';

  const statePattern = new RegExp(`\\b(${states.join('|')})\\b`, 'i');
  const stateMatch = addressString.match(statePattern);
  const state = stateMatch ? stateMatch[1].toUpperCase() : 'Unknown';

  let city = 'Unknown';
  if (state !== 'Unknown') {
    const cityMatch = addressString.match(new RegExp(`([^,]+),?\\s+${state}`, 'i'));
    if (cityMatch) {
      city = cityMatch[1].replace(/^\d+\s+/, '').trim();
    }
  }

  const address = addressString.split(',')[0].trim();

  return { address, city, state, zip };
}

// Report progress to Vercel API
async function reportProgress(data) {
  try {
    await axios.post(`${API_ENDPOINT.replace('/businesses/import', '/scrape/progress')}`, data);
  } catch (error) {
    console.error('Failed to report progress:', error.message);
  }
}

// Check if business already exists in database
async function checkBusinessExists(name, phone) {
  try {
    const checkUrl = API_ENDPOINT.replace('/businesses/import', '/businesses/check');
    const response = await axios.post(checkUrl, { name, phone });
    return response.data.exists;
  } catch (error) {
    console.error('Failed to check business exists:', error.message);
    return false; // If check fails, proceed with scraping
  }
}

// Main scraping function
async function scrapeGoogleMaps(location, businessType, maxResults = 10, scrapeSpeed = 'normal') {
  console.log(`🔍 Starting search for ${businessType} in ${location}...`);
  console.log(`📊 Max results: ${maxResults}, Speed: ${scrapeSpeed}`);
  const startTime = Date.now();

  // Calculate delays based on speed - heavily optimized for backend scraping
  const delays = {
    slow: { initial: 1500, perBusiness: 800, random: 300 },
    normal: { initial: 800, perBusiness: 400, random: 200 },
    fast: { initial: 300, perBusiness: 200, random: 100 }
  };
  const delay = delays[scrapeSpeed] || delays.normal;

  const launchOptions = {
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  };

  if (USE_PROXY) {
    launchOptions.args.push(`--proxy-server=${PROXY.server}`);
  }

  const browser = await puppeteer.launch(launchOptions);

  try {
    const page = await browser.newPage();

    if (USE_PROXY) {
      await page.authenticate({
        username: PROXY.username,
        password: PROXY.password
      });
    }

    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    const searchQuery = `${businessType} near ${location}`;
    const url = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;

    console.log(`📍 Navigating to Google Maps...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    await new Promise(resolve => setTimeout(resolve, delay.initial));

    console.log(`📋 Getting business list (need ${maxResults})...`);

    // Aggressively scroll to load all results
    let businessLinks = [];
    let previousCount = 0;
    let noNewResultsCount = 0;
    const maxNoNewResults = 5; // Stop after 5 scroll attempts with no new results

    while (businessLinks.length < maxResults && noNewResultsCount < maxNoNewResults) {
      // Scroll aggressively - do 5 fast scrolls
      for (let s = 0; s < 5; s++) {
        await page.evaluate(() => {
          // Try multiple scroll strategies
          const panels = [
            document.querySelector('[role="feed"]'),
            document.querySelector('[role="main"]'),
            document.querySelector('div[class*="scrollable"]'),
            document.querySelector('.m6QErb'),
            document.querySelector('div[aria-label*="Results"]')
          ];

          const panel = panels.find(p => p);
          if (panel) {
            // Scroll to bottom
            panel.scrollTop = panel.scrollHeight;

            // Also try scrolling by a large amount
            panel.scrollBy(0, 1000);
          }
        });
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Wait for content to load (heavily optimized for backend)
      await new Promise(resolve => setTimeout(resolve, 400));

      // Now check what we have - DON'T slice yet, collect everything
      businessLinks = await page.evaluate(() => {
        const links = [];
        const items = document.querySelectorAll('a[href*="/maps/place/"]');

        items.forEach(item => {
          const href = item.getAttribute('href');
          if (href && href.includes('/maps/place/')) {
            const name = item.getAttribute('aria-label') ||
                        item.querySelector('div[class*="fontHeadlineSmall"]')?.textContent ||
                        item.textContent;

            let cleanHref = href;
            if (href.startsWith('http')) {
              const url = new URL(href);
              cleanHref = url.pathname + url.search;
            } else if (!href.startsWith('/')) {
              cleanHref = '/' + href;
            }

            if (name && !links.find(l => l.href === cleanHref)) {
              links.push({
                name: name.trim(),
                href: cleanHref
              });
            }
          }
        });

        // Return ALL links, we'll slice later
        return links;
      });

      console.log(`   Found ${businessLinks.length}/${maxResults} businesses (scrolling...)`);

      // Check if we got new results
      if (businessLinks.length === previousCount) {
        noNewResultsCount++;
        console.log(`   ⚠️  No new results (attempt ${noNewResultsCount}/${maxNoNewResults})`);
      } else {
        noNewResultsCount = 0;
      }

      previousCount = businessLinks.length;

      // If we have enough, stop
      if (businessLinks.length >= maxResults) {
        console.log(`   ✅ Collected enough businesses!`);
        break;
      }
    }

    // Now slice to get exactly what we need
    businessLinks = businessLinks.slice(0, maxResults);

    console.log(`✅ Got ${businessLinks.length} businesses to scrape (requested ${maxResults})`);

    // Report initial progress - use maxResults as total so progress bar is correct
    await reportProgress({
      isScraing: true,
      location,
      businessType,
      total: maxResults,
      current: 0,
      startTime
    });

    const businesses = [];

    for (let i = 0; i < businessLinks.length; i++) {
      const bizLink = businessLinks[i];
      console.log(`\n${i + 1}/${businessLinks.length}: Scraping ${bizLink.name}...`);

      try {
        const targetUrl = bizLink.href.startsWith('http') ? bizLink.href : `https://www.google.com${bizLink.href}`;

        await page.goto(targetUrl, {
          waitUntil: 'domcontentloaded', // Faster than networkidle2
          timeout: 20000
        });

        await new Promise(resolve => setTimeout(resolve, delay.perBusiness));

        // Get full business data
        const fullData = await page.evaluate(() => {
          const name = document.querySelector('h1')?.textContent ||
                       document.querySelector('[class*="fontHeadlineLarge"]')?.textContent ||
                       'Unknown Business';

          let rating = 0;
          let reviewCount = 0;
          const ratingEl = document.querySelector('[jsaction*="pane.rating.moreReviews"]') ||
                          document.querySelector('[aria-label*="stars"]');
          if (ratingEl) {
            const text = ratingEl.textContent || ratingEl.getAttribute('aria-label') || '';
            const ratingMatch = text.match(/([0-9.]+)/);
            if (ratingMatch) rating = parseFloat(ratingMatch[1]);
            const reviewMatch = text.match(/\(([0-9,]+)\)/) || text.match(/([0-9,]+)\s*review/);
            if (reviewMatch) reviewCount = parseInt(reviewMatch[1].replace(/,/g, ''));
          }

          let phone = '';
          const phoneEl = document.querySelector('[data-tooltip*="Copy phone"], [aria-label*="Phone"], [href^="tel:"]');
          if (phoneEl) {
            phone = phoneEl.textContent?.trim() ||
                   phoneEl.getAttribute('aria-label')?.replace(/[^0-9-().\s]/g, '').trim() ||
                   phoneEl.getAttribute('href')?.replace('tel:', '') || '';
          }

          let website = '';
          const websiteEl = document.querySelector('[data-tooltip*="Open website"], [aria-label*="Website"], a[href*="url?q="]');
          if (websiteEl) {
            const href = websiteEl.getAttribute('href') || '';
            if (href.includes('url?q=')) {
              const match = href.match(/url\?q=([^&]+)/);
              if (match) {
                website = decodeURIComponent(match[1]);
              }
            } else if (href && !href.startsWith('/')) {
              website = href;
            }
          }

          if (website) {
            website = website.replace(/^https?:\/\//, '').replace(/\/$/, '');
          }

          let address = '';
          const addressEl = document.querySelector('[data-tooltip*="Copy address"], [aria-label*="Address"]');
          if (addressEl) {
            address = addressEl.textContent?.trim() ||
                     addressEl.getAttribute('aria-label')?.replace('Address: ', '').trim() || '';
          }

          let category = '';
          const categoryEl = document.querySelector('button[jsaction="pane.rating.category"]');
          if (categoryEl) {
            category = categoryEl.textContent?.trim() || '';
          }

          return {
            name: name.trim(),
            phone: phone || undefined,
            website: website || undefined,
            address: address || 'Not found',
            rating: rating || undefined,
            reviewCount: reviewCount || 0,
            category: category,
            hasWebsite: !!website
          };
        });

        const parsedAddress = parseAddress(fullData.address);

        let leadScore = 'COLD';
        const needsHelp = [];

        if (!fullData.website) {
          leadScore = 'HOT';
          needsHelp.push('No website');
        } else if (fullData.website) {
          if (fullData.website.includes('facebook.com') ||
              fullData.website.includes('instagram.com')) {
            leadScore = 'WARM';
            needsHelp.push('Only social media presence');
          }
        }

        if (fullData.reviewCount < 10) {
          if (leadScore !== 'HOT') leadScore = 'WARM';
          needsHelp.push(`Only ${fullData.reviewCount} reviews`);
        }

        if (fullData.rating && fullData.rating < 4.0 && fullData.rating > 0) {
          leadScore = 'HOT';
          needsHelp.push(`Low rating: ${fullData.rating}`);
        }

        if (needsHelp.length === 0) {
          needsHelp.push('Well-established online presence');
        }

        const fullBusinessData = {
          name: fullData.name,
          phone: fullData.phone,
          website: fullData.website,
          address: parsedAddress.address,
          city: parsedAddress.city,
          state: parsedAddress.state,
          zip: parsedAddress.zip,
          rating: fullData.rating,
          reviewCount: fullData.reviewCount,
          industry: fullData.category || businessType,
          leadScore,
          needsHelp,
          source: 'Google Maps',
          scrapedAt: new Date().toISOString()
        };

        businesses.push(fullBusinessData);

        console.log(`   ✅ ${fullData.name}`);
        console.log(`   📍 ${parsedAddress.city}, ${parsedAddress.state}`);
        console.log(`   🎯 Lead Score: ${leadScore}`);

        // Report progress update - use maxResults as total (NO API CALL to save, just progress)
        await reportProgress({
          isScraing: true,
          location,
          businessType,
          total: maxResults,
          current: i + 1,
          currentBusiness: fullData.name,
          startTime
        });

        // Small delay between page loads
        await new Promise(resolve => setTimeout(resolve, delay.perBusiness + Math.random() * delay.random));

      } catch (err) {
        console.error(`   ❌ Error getting details for ${bizLink.name}:`, err.message);
      }
    }

    await browser.close();

    // Send ALL businesses in one batch at the end (much faster)
    console.log(`\n📤 Sending ${businesses.length} businesses to database in one batch...`);
    if (businesses.length > 0) {
      try {
        await sendToAPI(businesses);
        console.log(`✅ Successfully saved ${businesses.length} businesses to database`);
      } catch (apiError) {
        console.error(`❌ Failed to save businesses to database:`, apiError.message);
      }
    }

    // Mark scraping as complete
    await reportProgress({
      isScraing: false,
      total: maxResults,
      current: maxResults
    });

    return businesses;

  } catch (error) {
    console.error('❌ Scraping error:', error.message);
    await browser.close();

    // Mark scraping as failed/complete
    await reportProgress({
      isScraing: false,
      total: 0,
      current: 0
    });

    throw error;
  }
}

// Send data to your Vercel API
async function sendToAPI(businesses) {
  try {
    console.log(`\n📤 Sending ${businesses.length} businesses to dashboard...`);

    const response = await axios.post(API_ENDPOINT, {
      businesses: businesses
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Data successfully sent to dashboard!');
    return response.data;

  } catch (error) {
    console.error('❌ Failed to send to API:', error.message);
    throw error;
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({
    status: 'Scraper Service Running ✅',
    message: 'POST to /scrape to start scraping',
    endpoint: '/scrape',
    method: 'POST',
    body: {
      location: 'string (required)',
      businessType: 'string (required)',
      radius: 'number (optional, default: 10)'
    }
  });
});

app.post('/scrape', async (req, res) => {
  const { location, businessType, radius, maxResults, scrapeSpeed } = req.body;

  if (!location || !businessType) {
    return res.status(400).json({
      error: 'Location and business type are required'
    });
  }

  console.log(`\n========================================`);
  console.log(`🚀 SCRAPING REQUEST`);
  console.log(`========================================`);
  console.log(`📍 Location: ${location}`);
  console.log(`🏢 Business Type: ${businessType}`);
  console.log(`📏 Radius: ${radius || 10} miles`);
  console.log(`📊 Max Results: ${maxResults || 10}`);
  console.log(`⚡ Speed: ${scrapeSpeed || 'normal'}`);
  console.log(`========================================\n`);

  // Start scraping (don't wait for it)
  res.status(202).json({
    message: 'Scraping started',
    status: 'processing',
    location,
    businessType,
    radius: radius || 10,
    maxResults: maxResults || 10,
    scrapeSpeed: scrapeSpeed || 'normal'
  });

  // Run scraper asynchronously
  try {
    const businesses = await scrapeGoogleMaps(location, businessType, maxResults || 10, scrapeSpeed || 'normal');

    if (businesses.length > 0) {
      // No need to send here - already sent individually during scraping
      console.log(`\n✅ Successfully scraped ${businesses.length} businesses!`);
      console.log(`📊 All businesses sent to dashboard in real-time`);
    } else {
      console.log('\n❌ No businesses found.');
    }
  } catch (error) {
    console.error('\n❌ Scraping failed:', error.message);
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n========================================`);
  console.log(`🚀 SCRAPER SERVICE STARTED`);
  console.log(`========================================`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 API Endpoint: ${API_ENDPOINT}`);
  console.log(`🔐 Proxy Enabled: ${USE_PROXY}`);
  console.log(`========================================\n`);
});
