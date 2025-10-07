import { MongoClient } from 'mongodb';
import { processBusinessData } from '../lib/scoring';

const MONGODB_URI = 'mongodb+srv://leadgen:aI2JNQDyKqrDVrnu@cluster0.z3vjtvo.mongodb.net/leadgen?retryWrites=true&w=majority';

const businessNames = {
  Restaurants: [
    "Joe's Pizza", "Sunset Grill", "Main Street Diner", "The Taco Spot",
    "Luigi's Italian", "Ocean View Seafood", "BBQ King", "Tokyo Sushi",
    "Mama's Kitchen", "The Burger Joint", "Pho House", "Greek Taverna",
  ],
  Dentists: [
    "Bright Smile Dental", "Family Dental Care", "Modern Dentistry",
    "Smile Makers", "Elite Dental", "Comfort Dental", "Pearl White Dental",
    "Happy Teeth", "Advanced Dental", "Prime Dental Care",
  ],
  'Real Estate Agents': [
    "Premier Realty", "Hometown Properties", "Dream Home Realty",
    "Coastal Properties", "Urban Living Real Estate", "Prime Estates",
    "Gateway Realty", "Skyline Properties", "Cornerstone Realty",
  ],
  Contractors: [
    "Build Right Construction", "Ace Contractors", "Quality Builders",
    "Master Build", "Pro Construction", "Summit Contractors",
    "Elite Building", "Precision Construction", "Reliable Builders",
  ],
  Plumbers: [
    "Quick Fix Plumbing", "ABC Plumbing", "Water Works", "Pro Plumber",
    "Pipe Masters", "Flow Right Plumbing", "Expert Plumbing",
    "24/7 Plumbing", "Dependable Plumbing", "Fix-It Plumbing",
  ],
  Electricians: [
    "Bright Electric", "Power Pro", "Circuit Masters", "Amp Electric",
    "Wire Works", "Spark Electric", "Voltage Experts", "Current Electric",
  ],
  'Hair Salons': [
    "Style Studio", "Hair Haven", "The Cut Above", "Glamour Salon",
    "Shear Perfection", "Scissors & Style", "Beauty Bar", "Tress Lounge",
  ],
  'Auto Repair': [
    "Auto Masters", "Quick Fix Auto", "Precision Auto Repair",
    "The Car Doctor", "Elite Auto Service", "Pro Auto Care",
  ],
  Lawyers: [
    "Smith & Associates", "Justice Law Firm", "Legal Eagles",
    "Thompson Law", "Premier Legal", "Advocate Law Group",
  ],
  Accountants: [
    "Numbers Plus", "Tax Pros", "Financial Solutions", "Bean Counters",
    "Accurate Accounting", "Trusted CPA", "Premier Tax Service",
  ],
};

const cities = [
  { name: 'Miami', state: 'FL', zips: ['33101', '33125', '33130', '33145'] },
  { name: 'Tampa', state: 'FL', zips: ['33602', '33610', '33612', '33614'] },
  { name: 'Orlando', state: 'FL', zips: ['32801', '32803', '32805', '32807'] },
  { name: 'Jacksonville', state: 'FL', zips: ['32202', '32204', '32206', '32208'] },
  { name: 'Atlanta', state: 'GA', zips: ['30303', '30305', '30309', '30318'] },
  { name: 'Charlotte', state: 'NC', zips: ['28202', '28204', '28205', '28209'] },
  { name: 'Nashville', state: 'TN', zips: ['37201', '37203', '37206', '37211'] },
  { name: 'Dallas', state: 'TX', zips: ['75201', '75204', '75206', '75219'] },
  { name: 'Houston', state: 'TX', zips: ['77002', '77004', '77007', '77019'] },
  { name: 'Austin', state: 'TX', zips: ['78701', '78704', '78705', '78723'] },
];

const streets = [
  'Main St', 'Oak Ave', 'Elm St', 'Maple Dr', 'Park Blvd',
  'First Ave', 'Second St', 'Market St', 'Church St', 'Lake Dr',
  'Washington St', 'Lincoln Ave', 'Cedar Ln', 'Pine St', 'River Rd',
];

function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhone(): string {
  const area = randomNumber(200, 999);
  const prefix = randomNumber(200, 999);
  const line = randomNumber(1000, 9999);
  return `(${area}) ${prefix}-${line}`;
}

function generateEmail(businessName: string, hasEmail: boolean): string | undefined {
  if (!hasEmail) return undefined;
  const domain = businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const prefixes = ['info', 'contact', 'hello', 'support'];
  return `${randomFrom(prefixes)}@${domain}.com`;
}

function generateWebsite(businessName: string, hasWebsite: boolean): string | undefined {
  if (!hasWebsite) return undefined;
  const domain = businessName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `https://${domain}.com`;
}

async function seedDatabase() {
  console.log('🌱 Seeding database...');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('leadgen');
    const collection = db.collection('businesses');

    // Clear existing data
    await collection.deleteMany({});
    console.log('📝 Cleared existing businesses');

    const businesses = [];
    const industries = Object.keys(businessNames);

    // Generate 150 businesses
    for (let i = 0; i < 150; i++) {
      const industry = randomFrom(industries);
      const businessName = randomFrom(businessNames[industry as keyof typeof businessNames]);
      const city = randomFrom(cities);
      const zip = randomFrom(city.zips);

      // Randomly determine what data is available (to create variety in lead scores)
      const hasWebsite = Math.random() > 0.3; // 70% have websites
      const hasEmail = Math.random() > 0.4; // 60% have emails
      const hasPhone = Math.random() > 0.1; // 90% have phones
      const hasRating = Math.random() > 0.2; // 80% have ratings
      const hasSocialMedia = Math.random() > 0.5; // 50% have social media

      const rating = hasRating ? randomNumber(25, 50) / 10 : undefined; // 2.5 to 5.0
      const reviewCount = hasRating ? randomNumber(0, 200) : undefined;

      const business = {
        name: `${businessName} - ${city.name}`,
        phone: hasPhone ? generatePhone() : undefined,
        email: generateEmail(businessName, hasEmail),
        website: generateWebsite(businessName, hasWebsite),
        address: `${randomNumber(100, 9999)} ${randomFrom(streets)}`,
        city: city.name,
        state: city.state,
        zip: zip,
        rating,
        reviewCount,
        industry,
        socialMedia: hasSocialMedia ? {
          facebook: Math.random() > 0.5 ? `https://facebook.com/${businessName.toLowerCase().replace(/\s/g, '')}` : undefined,
          instagram: Math.random() > 0.5 ? `https://instagram.com/${businessName.toLowerCase().replace(/\s/g, '')}` : undefined,
        } : undefined,
      };

      businesses.push(processBusinessData(business));
    }

    // Insert businesses
    await collection.insertMany(businesses as any);
    console.log(`✅ Inserted ${businesses.length} businesses`);

    // Show statistics
    const hotCount = businesses.filter(b => b.leadScore === 'HOT').length;
    const warmCount = businesses.filter(b => b.leadScore === 'WARM').length;
    const coldCount = businesses.filter(b => b.leadScore === 'COLD').length;

    console.log('\n📊 Lead Score Distribution:');
    console.log(`   🔥 HOT: ${hotCount}`);
    console.log(`   🌤️  WARM: ${warmCount}`);
    console.log(`   ❄️  COLD: ${coldCount}`);

    console.log('\n🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seedDatabase();
