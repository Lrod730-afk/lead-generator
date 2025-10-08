import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { name, phone } = await request.json();

    const db = await getDatabase();
    const collection = db.collection('businesses');

    // Check if business exists by name or phone
    const query: any = {};

    if (name) {
      query.$or = query.$or || [];
      query.$or.push({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    }

    if (phone) {
      query.$or = query.$or || [];
      query.$or.push({ phone });
    }

    const existing = await collection.findOne(query);

    return NextResponse.json({
      exists: !!existing,
      business: existing ? { name: existing.name, phone: existing.phone } : null
    });
  } catch (error) {
    console.error('Error checking business:', error);
    return NextResponse.json(
      { exists: false },
      { status: 200 } // Return false on error, don't block scraping
    );
  }
}
