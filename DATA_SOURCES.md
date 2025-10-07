# Data Sources Integration Guide

This application is built with a **modular architecture** that allows you to connect various data sources for lead generation. Here's how to integrate different data sources:

## Current Implementation

The app currently supports:
- ✅ CSV file imports
- ✅ JSON file imports
- ✅ Manual entry via web form
- ✅ API endpoint for programmatic imports
- ✅ Sample data generator (150 businesses)

## Adding External Data Sources

### Option 1: Google Places API

**Recommended for:** Accurate business data with contact information

1. **Get API Key**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Enable Places API
   - Create API key

2. **Install SDK**
   ```bash
   npm install @googlemaps/google-maps-services-js
   ```

3. **Update `lib/enrichment.ts`**
   ```typescript
   import { Client } from '@googlemaps/google-maps-services-js';

   const client = new Client({});

   export async function fetchBusinessData(
     location: string,
     businessType: string,
     radius?: number
   ): Promise<Partial<Business>[]> {
     const response = await client.placesNearby({
       params: {
         location: { lat: 0, lng: 0 }, // Convert location to coords
         radius: (radius || 10) * 1609, // miles to meters
         keyword: businessType,
         key: process.env.GOOGLE_PLACES_API_KEY!,
       },
     });

     return response.data.results.map(place => ({
       name: place.name,
       address: place.vicinity,
       rating: place.rating,
       // Map other fields...
     }));
   }
   ```

4. **Add to `.env.local`**
   ```
   GOOGLE_PLACES_API_KEY=your_api_key_here
   ```

### Option 2: Yelp Fusion API

**Recommended for:** Reviews and ratings data

1. **Get API Key**
   - Go to [Yelp Fusion](https://www.yelp.com/fusion)
   - Create app
   - Get API key

2. **Update `lib/enrichment.ts`**
   ```typescript
   export async function fetchBusinessData(
     location: string,
     businessType: string,
     radius?: number
   ): Promise<Partial<Business>[]> {
     const response = await fetch(
       `https://api.yelp.com/v3/businesses/search?location=${location}&term=${businessType}&radius=${(radius || 10) * 1609}`,
       {
         headers: {
           Authorization: `Bearer ${process.env.YELP_API_KEY}`,
         },
       }
     );

     const data = await response.json();

     return data.businesses.map((business: any) => ({
       name: business.name,
       phone: business.phone,
       address: business.location.address1,
       city: business.location.city,
       state: business.location.state,
       zip: business.location.zip_code,
       rating: business.rating,
       reviewCount: business.review_count,
     }));
   }
   ```

### Option 3: Custom Database/CRM

**Recommended for:** Existing business data

```typescript
// lib/enrichment.ts
export async function fetchBusinessData(
  location: string,
  businessType: string,
  radius?: number
): Promise<Partial<Business>[]> {
  // Connect to your existing database
  const businesses = await yourDatabase.query({
    location,
    type: businessType,
    radius,
  });

  return businesses.map(b => ({
    name: b.company_name,
    phone: b.contact_phone,
    email: b.contact_email,
    // Map your fields to Business type
  }));
}
```

### Option 4: Email Finder Services

**Services:** Hunter.io, Clearbit, Snov.io

1. **Hunter.io Example**
   ```typescript
   export async function findEmailAddress(
     business: Partial<Business>
   ): Promise<string | undefined> {
     if (!business.website) return undefined;

     const domain = extractDomain(business.website);

     const response = await fetch(
       `https://api.hunter.io/v2/domain-search?domain=${domain}&api_key=${process.env.HUNTER_API_KEY}`
     );

     const data = await response.json();
     return data.data.emails[0]?.value;
   }
   ```

2. **Add to `.env.local`**
   ```
   HUNTER_API_KEY=your_api_key_here
   ```

### Option 5: Web Scraping (Use with Caution)

**Note:** Only scrape with permission and respect robots.txt

1. **Install Puppeteer**
   ```bash
   npm install puppeteer
   ```

2. **Example Implementation**
   ```typescript
   import puppeteer from 'puppeteer';

   export async function scrapeBusinessData(url: string) {
     const browser = await puppeteer.launch();
     const page = await browser.newPage();

     await page.goto(url);

     // Extract data
     const data = await page.evaluate(() => {
       // Your scraping logic
     });

     await browser.close();
     return data;
   }
   ```

## Using the Search Form

Once you've implemented a data source in `lib/enrichment.ts`, the search form on the landing page will work:

1. User enters location, business type, radius
2. Form submits to your implementation
3. Data is fetched and scored
4. Results saved to MongoDB
5. User redirected to dashboard with results

## CSV Import (No Code Required)

The easiest way to add data without coding:

1. Collect business data in Excel/Google Sheets
2. Export as CSV with these columns:
   ```
   name,phone,email,website,address,city,state,zip,rating,reviewCount,industry
   ```
3. Go to `/import` page
4. Upload CSV
5. Businesses automatically scored and saved

## API Import (For Developers)

Send POST request to import data programmatically:

```bash
curl -X POST http://localhost:3000/api/businesses/import \
  -H "Content-Type: application/json" \
  -d '{
    "businesses": [
      {
        "name": "Business Name",
        "phone": "(555) 123-4567",
        "email": "info@business.com",
        "city": "Miami",
        "state": "FL",
        "rating": 4.5,
        "reviewCount": 50
      }
    ]
  }'
```

## Best Practices

### 1. Rate Limiting
```typescript
// lib/enrichment.ts
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchBusinessDataBatch(queries: string[]) {
  const results = [];

  for (const query of queries) {
    const data = await fetchBusinessData(query);
    results.push(...data);

    // Wait 1 second between requests
    await delay(1000);
  }

  return results;
}
```

### 2. Caching
```typescript
const cache = new Map<string, any>();

export async function fetchBusinessData(location: string, type: string) {
  const cacheKey = `${location}-${type}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const data = await fetchFromAPI(location, type);
  cache.set(cacheKey, data);

  return data;
}
```

### 3. Error Handling
```typescript
export async function fetchBusinessData(location: string, type: string) {
  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    return []; // Return empty array on error
  }
}
```

### 4. Data Validation
```typescript
import { z } from 'zod';

const BusinessSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  // ... other fields
});

export async function validateAndImport(data: any[]) {
  const validated = data
    .map(item => {
      try {
        return BusinessSchema.parse(item);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return validated;
}
```

## Recommended Data Sources

### For Lead Generation:
1. **Google Places API** - Most comprehensive
2. **Yelp Fusion API** - Great for reviews/ratings
3. **Yellow Pages API** - Business directories
4. **Hunter.io** - Email finding
5. **Clearbit** - Company enrichment

### For Email Finding:
1. **Hunter.io** - Domain search
2. **Snov.io** - Email finder
3. **Clearbit** - Email verification
4. **RocketReach** - Contact database

### For Website Analysis:
1. **BuiltWith API** - Technology detection
2. **Wappalyzer API** - Tech stack analysis
3. **PageSpeed Insights API** - Performance metrics

## Cost Considerations

Most APIs have free tiers:
- **Google Places**: $0 for first $200/month
- **Yelp Fusion**: Free with rate limits
- **Hunter.io**: 50 free searches/month
- **Clearbit**: Free tier available

## Legal & Compliance

⚠️ **Important Considerations:**

1. **Terms of Service**: Always comply with API ToS
2. **Data Privacy**: Follow GDPR, CCPA regulations
3. **Rate Limits**: Respect API rate limits
4. **Attribution**: Credit data sources if required
5. **Commercial Use**: Ensure your license permits it

## Testing Data Sources

Create a test endpoint to verify your integration:

```typescript
// app/api/test-source/route.ts
export async function GET() {
  const testResults = await fetchBusinessData('Miami, FL', 'Restaurants', 10);
  return Response.json(testResults);
}
```

Visit `/api/test-source` to see results.

## Summary

The application is designed to work with **any data source**. The key is implementing the functions in `lib/enrichment.ts`:

- `fetchBusinessData()` - Main data fetching function
- `findEmailAddress()` - Email discovery
- `enrichBusinessData()` - Additional data enrichment

Choose the data source that best fits your needs, budget, and compliance requirements.
