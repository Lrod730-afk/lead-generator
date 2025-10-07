# Lead Generator - Elevate Your Leads

A professional lead generation and management system built for **Elevate Your Leads** business. This application helps identify businesses that need digital marketing, website development, AI automation, and review management services.

## 🚀 Features

### Lead Scoring System
- **HOT Leads (Red)**: Businesses with no website, low reviews, poor online presence
- **WARM Leads (Yellow)**: Businesses with basic online presence needing improvements
- **COLD Leads (Green)**: Businesses doing well but could benefit from advanced services

### Core Capabilities
- ✅ Smart lead scoring based on digital presence
- ✅ Advanced filtering and sorting
- ✅ CSV export functionality
- ✅ Bulk contact information copying
- ✅ Contact tracking system
- ✅ Multiple data import methods (CSV, JSON, Manual, API)
- ✅ Real-time statistics dashboard
- ✅ Mobile-responsive design

### Data Sources
The application supports multiple data ingestion methods:
- **CSV Import**: Upload spreadsheets with business data
- **JSON Import**: Bulk import from JSON files
- **Manual Entry**: Add businesses one at a time
- **API Integration**: Programmatic data import via REST API

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (already configured)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone or download the project**
   ```bash
   cd lead-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   The `.env.local` file is already configured with MongoDB connection:
   ```
   MONGODB_URI=mongodb+srv://leadgen:aI2JNQDyKqrDVrnu@cluster0.z3vjtvo.mongodb.net/leadgen?retryWrites=true&w=majority
   ```

4. **Seed the database with sample data**
   ```bash
   npm run seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
lead-generator/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── businesses/    # Business CRUD endpoints
│   │   ├── export/        # CSV export
│   │   └── stats/         # Dashboard statistics
│   ├── dashboard/         # Lead management dashboard
│   ├── import/            # Data import page
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── Header.tsx
│   ├── BusinessTable.tsx
│   ├── LeadScoreBadge.tsx
│   └── StatsCard.tsx
├── lib/                   # Utility libraries
│   ├── mongodb.ts         # Database connection
│   ├── scoring.ts         # Lead scoring engine
│   ├── enrichment.ts      # Data enrichment module
│   └── utils.ts           # Helper functions
├── scripts/
│   └── seed.ts            # Database seeding script
├── types/
│   └── index.ts           # TypeScript definitions
└── public/                # Static assets
```

## 🎯 Usage Guide

### 1. Search for Leads (Landing Page)
- Enter location (city, state, or ZIP)
- Select business type/industry
- Choose search radius
- Click "Find Leads"

### 2. Manage Leads (Dashboard)
- Filter by lead score (HOT/WARM/COLD)
- Filter by website status
- Filter by contact status
- Search by name, city, or state
- Sort by various fields
- Export to CSV
- Copy emails/phones in bulk
- Mark leads as contacted

### 3. Import Data
Three methods available:

**CSV Upload:**
- Download sample template
- Fill in business data
- Upload CSV file
- System automatically scores leads

**Manual Entry:**
- Fill in business form
- Required: Business name
- Optional: Contact info, ratings, etc.
- Submit to add to database

**API Integration:**
```bash
curl -X POST http://localhost:3000/api/businesses/import \
  -H "Content-Type: application/json" \
  -d '{
    "businesses": [
      {
        "name": "Joe's Pizza",
        "phone": "(555) 123-4567",
        "email": "info@joespizza.com",
        "website": "https://joespizza.com",
        "address": "123 Main St",
        "city": "Miami",
        "state": "FL",
        "zip": "33101",
        "rating": 4.2,
        "reviewCount": 45,
        "industry": "Restaurants"
      }
    ]
  }'
```

## 📊 Lead Scoring Algorithm

The system automatically scores businesses based on:

| Factor | Points | Description |
|--------|--------|-------------|
| No website | +40 | Major opportunity for web development |
| Low reviews (<10) | +30 | Needs review generation |
| Poor rating (<3.5) | +20 | Reputation management needed |
| No social media | +15 | Social media marketing opportunity |
| No email | +10 | Limited contact options |

**Score Ranges:**
- **HOT**: 70-100 points (Highest potential)
- **WARM**: 40-69 points (Medium potential)
- **COLD**: 0-39 points (Already doing well)

## 🔌 API Endpoints

### Get Businesses
```
GET /api/businesses
Query params: search, leadScore, hasWebsite, contacted, sortField, sortDirection
```

### Get Single Business
```
GET /api/businesses/[id]
```

### Create Business
```
POST /api/businesses
Body: Business object
```

### Update Business
```
PATCH /api/businesses/[id]
Body: Partial business object
```

### Import Businesses
```
POST /api/businesses/import
Body: { businesses: Business[] }
```

### Export CSV
```
GET /api/export/csv
Query params: ids (optional, comma-separated)
```

### Get Statistics
```
GET /api/stats
Returns: Dashboard statistics
```

## 🚀 Deployment

### Deploy to Vercel

1. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Add Environment Variables**

   In Vercel dashboard, add:
   ```
   MONGODB_URI=mongodb+srv://leadgen:aI2JNQDyKqrDVrnu@cluster0.z3vjtvo.mongodb.net/leadgen?retryWrites=true&w=majority
   ```

4. **Done!** Your app is live.

### Alternative: GitHub Integration

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy automatically on push

## 🔧 Configuration

### Adding New Business Types

Edit [app/page.tsx](app/page.tsx):
```typescript
const businessTypes = [
  'Restaurants',
  'Dentists',
  // Add more...
];
```

### Customizing Lead Scoring

Edit [lib/scoring.ts](lib/scoring.ts):
```typescript
function computeScore(metrics: LeadScoreMetrics): number {
  // Adjust scoring logic
}
```

### Adding Data Sources

Edit [lib/enrichment.ts](lib/enrichment.ts):
```typescript
export async function fetchBusinessData(
  location: string,
  businessType: string,
  radius?: number
): Promise<Partial<Business>[]> {
  // Implement your data source
  // Examples:
  // - Google Places API
  // - Yelp Fusion API
  // - Custom database
}
```

## 📝 CSV Import Format

Required columns:
- `name` (required)

Optional columns:
- `phone`, `email`, `website`
- `address`, `city`, `state`, `zip`
- `rating`, `reviewCount`
- `industry`

Example CSV:
```csv
name,phone,email,website,city,state,rating,reviewCount
Joe's Pizza,(555) 123-4567,info@joespizza.com,https://joespizza.com,Miami,FL,4.2,45
```

## 🎨 Customization

### Brand Colors

Edit [tailwind.config.ts](tailwind.config.ts):
```typescript
colors: {
  primary: {
    500: '#3b82f6',  // Main blue
    600: '#2563eb',  // Darker blue
    // Customize...
  },
}
```

### Business Name

Update in:
- [components/Header.tsx](components/Header.tsx)
- [app/layout.tsx](app/layout.tsx) (metadata)

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify connection string in `.env.local`
- Check MongoDB Atlas network access (allow all IPs: 0.0.0.0/0)
- Ensure database user has read/write permissions

### Build Errors
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build
```

### Import Errors
- Verify CSV format matches template
- Check for special characters in data
- Ensure required fields are present

## 📚 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB Atlas
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **CSV Parsing**: PapaParse
- **Deployment**: Vercel

## 🔒 Security Notes

- MongoDB credentials are in `.env.local` (not committed to git)
- API routes validate input data
- File uploads are validated for type
- No authentication implemented (add if needed for production)

## 📈 Future Enhancements

Potential features to add:

1. **Data Sources**
   - Google Places API integration
   - Yelp Fusion API integration
   - Email finder service (Hunter.io)

2. **Features**
   - Email campaign integration
   - CRM integration (HubSpot, Salesforce)
   - Automated outreach sequences
   - User authentication
   - Team collaboration
   - Notes and comments per lead
   - Custom fields

3. **Analytics**
   - Conversion tracking
   - Revenue per lead
   - Industry performance metrics

## 🤝 Support

For issues or questions:
1. Check this README
2. Review code comments
3. Check MongoDB Atlas dashboard
4. Review Vercel deployment logs

## 📄 License

Proprietary - Elevate Your Leads

---

**Built for Elevate Your Leads** - Professional lead generation for digital marketing services.
