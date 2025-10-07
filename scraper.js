// scraper.js - Enhanced version with real website extraction
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const axios = require('axios');

puppeteer.use(StealthPlugin());

const API_ENDPOINT = process.env.API_ENDPOINT || 'http://localhost:3001/api/businesses/import';

// Proxy configuration - Set USE_PROXY to true and add valid credentials if you have them
const USE_PROXY = false;
const PROXY = {
  server: 'http://brd.superproxy.io:33335',
  username: 'brd-customer-hl_36e84bcb-zone-datacenter_proxy1',
  password: 'ej91p73gyhum'
};

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseAddress(addressString) {
  // Common US state abbreviations
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

  // Try to extract zip code (5 digits, optionally followed by -4 digits)
  const zipMatch = addressString.match(/\b(\d{5}(?:-\d{4})?)\b/);
  const zip = zipMatch ? zipMatch[1] : 'Unknown';

  // Try to extract state (2-letter code)
  const statePattern = new RegExp(`\\b(${states.join('|')})\\b`, 'i');
  const stateMatch = addressString.match(statePattern);
  const state = stateMatch ? stateMatch[1].toUpperCase() : 'Unknown';

  // Extract city (word(s) before state)
  let city = 'Unknown';
  if (state !== 'Unknown') {
    const cityMatch = addressString.match(new RegExp(`([^,]+),?\\s+${state}`, 'i'));
    if (cityMatch) {
      city = cityMatch[1].replace(/^\d+\s+/, '').trim();
    }
  }

  // Clean up the full address
  const address = addressString.split(',')[0].trim();

  return {
    address,
    city,
    state,
    zip,
  };
}

async function scrapeGoogleMaps(location, businessType) {
  console.log(`🔍 Starting search for ${businessType} in ${location}...`);

  const launchOptions = {
    headless: false, // Keep false to watch it work
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  };

  // Add proxy if enabled
  if (USE_PROXY) {
    launchOptions.args.push(`--proxy-server=${PROXY.server}`);
  }

  const browser = await puppeteer.launch(launchOptions);

  try {
    const page = await browser.newPage();

    // Authenticate with proxy if enabled
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

    await delay(5000);

    // Get list of businesses first
    console.log(`📋 Getting business list...`);

    const businessLinks = await page.evaluate(() => {
      const links = [];
      const items = document.querySelectorAll('a[href*="/maps/place/"]');

      items.forEach(item => {
        const href = item.getAttribute('href');
        if (href && href.includes('/maps/place/')) {
          // Get the name from the aria-label or text content
          const name = item.getAttribute('aria-label') ||
                      item.querySelector('div[class*="fontHeadlineSmall"]')?.textContent ||
                      item.textContent;

          // Clean href - make sure it's a relative path
          let cleanHref = href;
          if (href.startsWith('http')) {
            // Extract just the path if it's a full URL
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

      return links.slice(0, 10); // Limit to first 10 to avoid taking too long
    });

    console.log(`Found ${businessLinks.length} businesses to check`);

    const businesses = [];

    // Visit each business page to get details
    for (let i = 0; i < businessLinks.length; i++) {
      const bizLink = businessLinks[i];
      console.log(`\n${i + 1}/${businessLinks.length}: Checking ${bizLink.name}...`);

      try {
        // Navigate to business page
        const targetUrl = bizLink.href.startsWith('http') ? bizLink.href : `https://www.google.com${bizLink.href}`;
        console.log(`   Navigating to: ${targetUrl}`);

        await page.goto(targetUrl, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });

        await delay(3000);

        // Extract business details
        const businessData = await page.evaluate(() => {
          // Debug: log what we're looking at
          console.log('Extracting data from page:', window.location.href);

          // Get name
          const name = document.querySelector('h1')?.textContent ||
                       document.querySelector('[class*="fontHeadlineLarge"]')?.textContent ||
                       'Unknown Business';

          console.log('Found name:', name);

          // Get rating
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

          // Get phone - look for phone icon or tel: links
          let phone = '';
          const phoneEl = document.querySelector('[data-tooltip*="Copy phone"], [aria-label*="Phone"], [href^="tel:"]');
          if (phoneEl) {
            phone = phoneEl.textContent?.trim() ||
                   phoneEl.getAttribute('aria-label')?.replace(/[^0-9-().\s]/g, '').trim() ||
                   phoneEl.getAttribute('href')?.replace('tel:', '') || '';
          }

          // Get website - THIS IS THE KEY PART
          let website = '';
          const websiteEl = document.querySelector('[data-tooltip*="Open website"], [aria-label*="Website"], a[href*="url?q="]');
          if (websiteEl) {
            const href = websiteEl.getAttribute('href') || '';
            if (href.includes('url?q=')) {
              // Extract actual URL from Google's redirect
              const match = href.match(/url\?q=([^&]+)/);
              if (match) {
                website = decodeURIComponent(match[1]);
              }
            } else if (href && !href.startsWith('/')) {
              website = href;
            }
          }

          // Clean up website URL
          if (website) {
            website = website.replace(/^https?:\/\//, '').replace(/\/$/, '');
          }

          // Get address
          let address = '';
          const addressEl = document.querySelector('[data-tooltip*="Copy address"], [aria-label*="Address"]');
          if (addressEl) {
            address = addressEl.textContent?.trim() ||
                     addressEl.getAttribute('aria-label')?.replace('Address: ', '').trim() || '';
          }

          // Get business type/category
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

        // Parse address into components
        const parsedAddress = parseAddress(businessData.address);

        // Determine lead score based on real data
        let leadScore = 'COLD';
        const needsHelp = [];

        // Website check
        if (!businessData.website) {
          leadScore = 'HOT';
          needsHelp.push('No website');
        } else if (businessData.website) {
          // Check if it's just a Facebook page or basic site
          if (businessData.website.includes('facebook.com') ||
              businessData.website.includes('instagram.com')) {
            leadScore = 'WARM';
            needsHelp.push('Only social media presence');
          }
        }

        // Review check
        if (businessData.reviewCount < 10) {
          if (leadScore !== 'HOT') leadScore = 'WARM';
          needsHelp.push(`Only ${businessData.reviewCount} reviews`);
        }

        // Rating check
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
        console.log(`   📍 ${parsedAddress.address}, ${parsedAddress.city}, ${parsedAddress.state} ${parsedAddress.zip}`);
        console.log(`   📞 ${businessData.phone || 'No phone'}`);
        console.log(`   🌐 ${businessData.website || 'NO WEBSITE'}`);
        console.log(`   ⭐ ${businessData.rating || 'No rating'} (${businessData.reviewCount} reviews)`);
        console.log(`   🎯 Lead Score: ${leadScore}`);

        // Small delay between businesses
        await delay(2000 + Math.random() * 2000);

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

async function findEmailOnWebsite(browser, website) {
  if (!website) return null;

  try {
    const page = await browser.newPage();
    const fullUrl = website.startsWith('http') ? website : `https://${website}`;

    console.log(`   🔍 Checking ${fullUrl} for email...`);

    await page.goto(fullUrl, {
      waitUntil: 'networkidle2',
      timeout: 15000
    });

    // Look for email on main page
    let email = await page.evaluate(() => {
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const text = document.body.innerText || document.body.textContent || '';
      const matches = text.match(emailRegex);

      if (matches) {
        // Filter out fake emails
        return matches.find(e =>
          !e.includes('example.com') &&
          !e.includes('yoursite.com') &&
          !e.includes('domain.com') &&
          !e.includes('@2x') &&
          !e.includes('.png') &&
          !e.includes('.jpg')
        ) || null;
      }
      return null;
    });

    // If no email found, try contact page
    if (!email) {
      const contactLink = await page.$('a[href*="contact"], a[href*="Contact"]');
      if (contactLink) {
        await contactLink.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(() => {});

        email = await page.evaluate(() => {
          const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
          const text = document.body.innerText || '';
          const matches = text.match(emailRegex);
          return matches ? matches[0] : null;
        });
      }
    }

    await page.close();
    return email;

  } catch (err) {
    console.log(`   ⚠️ Could not check website: ${err.message}`);
    return null;
  }
}

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
    console.log('🌐 View at: http://localhost:3001');
    return response.data;

  } catch (error) {
    console.error('❌ Failed to send to API:', error.message);

    const fs = require('fs');
    const filename = `leads-${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(businesses, null, 2));
    console.log(`💾 Data saved locally to ${filename}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const location = args[0] || 'Fairfield, CT';
  const businessType = args[1] || 'restaurants';

  console.log('\n========================================');
  console.log('🚀 LEAD GENERATOR - REAL DATA SCRAPER');
  console.log('========================================');
  console.log(`📍 Location: ${location}`);
  console.log(`🏢 Business Type: ${businessType}`);
  console.log('========================================\n');

  try {
    const businesses = await scrapeGoogleMaps(location, businessType);

    if (businesses.length > 0) {
      console.log('\n========================================');
      console.log('📊 FINAL RESULTS:');
      console.log('========================================');
      console.log(`Total scraped: ${businesses.length}`);
      console.log(`🔥 HOT leads (need website): ${businesses.filter(b => b.leadScore === 'HOT').length}`);
      console.log(`🌡️  WARM leads (need improvement): ${businesses.filter(b => b.leadScore === 'WARM').length}`);
      console.log(`❄️  COLD leads (doing well): ${businesses.filter(b => b.leadScore === 'COLD').length}`);
      console.log('========================================\n');

      await sendToAPI(businesses);
    } else {
      console.log('❌ No businesses found.');
      console.log('💡 TIP: The scraper may have failed to extract data from Google Maps.');
      console.log('   Check if Google Maps loaded correctly in the browser window.');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = { scrapeGoogleMaps, findEmailOnWebsite };
