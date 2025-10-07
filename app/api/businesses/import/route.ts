import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Business } from '@/types';
import { processBusinessData } from '@/lib/scoring';

export async function POST(request: NextRequest) {
  try {
    const { businesses } = await request.json();

    if (!Array.isArray(businesses)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected array of businesses.' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const collection = db.collection<Business>('businesses');

    // Process and score each business
    const processedBusinesses = businesses.map(business => {
      // Ensure required fields have defaults
      const businessData = {
        name: business.name || 'Unknown Business',
        address: business.address || 'Not provided',
        city: business.city || 'Unknown',
        state: business.state || 'Unknown',
        zip: business.zip || 'Unknown',
        phone: business.phone,
        email: business.email,
        website: business.website,
        rating: business.rating,
        reviewCount: business.reviewCount || 0,
        industry: business.industry,
        socialMedia: business.socialMedia,
        dateAdded: new Date(),
      };

      return processBusinessData(businessData);
    });

    // Filter out any invalid businesses
    const validBusinesses = processedBusinesses.filter(b => b.name && b.name !== 'Unknown Business');

    if (validBusinesses.length === 0) {
      return NextResponse.json(
        { error: 'No valid businesses to import' },
        { status: 400 }
      );
    }

    // Bulk insert
    const result = await collection.insertMany(validBusinesses);

    return NextResponse.json({
      success: true,
      imported: result.insertedCount,
      failed: businesses.length - result.insertedCount,
    });
  } catch (error) {
    console.error('Error importing businesses:', error);
    return NextResponse.json(
      { error: 'Failed to import businesses' },
      { status: 500 }
    );
  }
}
