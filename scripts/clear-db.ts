import { MongoClient } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://leadgen:aI2JNQDyKqrDVrnu@cluster0.z3vjtvo.mongodb.net/leadgen?retryWrites=true&w=majority';

async function clearDatabase() {
  console.log('🗑️  Clearing database...');

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('leadgen');
    const collection = db.collection('businesses');

    // Clear all businesses
    const result = await collection.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} businesses from database`);
    console.log('📝 Database is now empty and ready for scraped data');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

clearDatabase();
