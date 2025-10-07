// Railway Scraper Service - Standalone server for running the scraper
const express = require('express');
const cors = require('cors');
const { scrapeGoogleMaps } = require('../scraper');

const app = express();
const PORT = process.env.PORT || 3333;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'Scraper Service Running',
    message: 'POST to /scrape to start scraping'
  });
});

// Scraping endpoint
app.post('/scrape', async (req, res) => {
  const { location, businessType, radius } = req.body;

  if (!location || !businessType) {
    return res.status(400).json({
      error: 'Location and business type are required'
    });
  }

  console.log(`📍 Scraping request: ${businessType} in ${location}`);

  // Start scraping in background
  res.status(202).json({
    message: 'Scraping started',
    status: 'processing',
    location,
    businessType,
    radius: radius || 10
  });

  // Run scraper asynchronously
  try {
    const businesses = await scrapeGoogleMaps(location, businessType, radius || 10);
    console.log(`✅ Scraped ${businesses.length} businesses`);
  } catch (error) {
    console.error('❌ Scraping error:', error);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Scraper service running on port ${PORT}`);
});
