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

// Main scraping function
async function scrapeGoogleMaps(location, businessType) {
  console.log(`🔍 Starting search for ${businessType} in ${location}...`);

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

    await page.waitForTimeout(5000);

    console.log(`📋 Getting business list...`);

    const businessLinks = await page.evaluate(() => {
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

      return links.slice(0, 10);
    });

    console.log(`Found ${businessLinks.length} businesses to check`);

    const businesses = [];

    for (let i = 0; i < businessLinks.length; i++) {
      const bizLink = businessLinks[i];
      console.log(`\n${i + 1}/${businessLinks.length}: Checking ${bizLink.name}...`);

      try {
        const targetUrl = bizLink.href.startsWith('http') ? bizLink.href : `https://www.google.com${bizLink.href}`;

        await page.goto(targetUrl, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });

        await page.waitForTimeout(3000);

        const businessData = await page.evaluate(() => {
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

        const parsedAddress = parseAddress(businessData.address);

        let leadScore = 'COLD';
        const needsHelp = [];

        if (!businessData.website) {
          leadScore = 'HOT';
          needsHelp.push('No website');
        } else if (businessData.website) {
          if (businessData.website.includes('facebook.com') ||
              businessData.website.includes('instagram.com')) {
            leadScore = 'WARM';
            needsHelp.push('Only social media presence');
          }
        }

        if (businessData.reviewCount < 10) {
          if (leadScore !== 'HOT') leadScore = 'WARM';
          needsHelp.push(`Only ${businessData.reviewCount} reviews`);
        }

        if (businessData.rating && businessData.rating < 4.0 && businessData.rating > 0) {
          leadScore = 'HOT';
          needsHelp.push(`Low rating: ${businessData.rating}`);
        }

        if (needsHelp.length === 0) {
          needsHelp.push('Well-established online presence');
        }

        const fullBusinessData = {
          name: businessData.name,
          phone: businessData.phone,
          website: businessData.website,
          address: parsedAddress.address,
          city: parsedAddress.city,
          state: parsedAddress.state,
          zip: parsedAddress.zip,
          rating: businessData.rating,
          reviewCount: businessData.reviewCount,
          industry: businessData.category || businessType,
          leadScore,
          needsHelp,
          source: 'Google Maps',
          scrapedAt: new Date().toISOString()
        };

        businesses.push(fullBusinessData);

        console.log(`   ✅ ${businessData.name}`);
        console.log(`   📍 ${parsedAddress.city}, ${parsedAddress.state}`);
        console.log(`   🎯 Lead Score: ${leadScore}`);

        await page.waitForTimeout(2000 + Math.random() * 2000);

      } catch (err) {
        console.error(`   ❌ Error getting details for ${bizLink.name}:`, err.message);
      }
    }

    await browser.close();
    return businesses;

  } catch (error) {
    console.error('❌ Scraping error:', error.message);
    await browser.close();
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
  const { location, businessType, radius } = req.body;

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
  console.log(`========================================\n`);

  // Start scraping (don't wait for it)
  res.status(202).json({
    message: 'Scraping started',
    status: 'processing',
    location,
    businessType,
    radius: radius || 10
  });

  // Run scraper asynchronously
  try {
    const businesses = await scrapeGoogleMaps(location, businessType);

    if (businesses.length > 0) {
      await sendToAPI(businesses);
      console.log(`\n✅ Successfully scraped and saved ${businesses.length} businesses!`);
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
