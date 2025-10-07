import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Business, FilterOptions, SortOptions } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse filter options
    const filters: FilterOptions = {
      searchTerm: searchParams.get('search') || undefined,
      leadScore: searchParams.get('leadScore')?.split(',') as any,
      hasWebsite: searchParams.get('hasWebsite') === 'true' ? true :
                   searchParams.get('hasWebsite') === 'false' ? false : undefined,
      minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
      contacted: searchParams.get('contacted') === 'true' ? true :
                 searchParams.get('contacted') === 'false' ? false : undefined,
      industry: searchParams.get('industry') || undefined,
    };

    // Parse sort options
    const sortField = (searchParams.get('sortField') || 'dateAdded') as SortOptions['field'];
    const sortDirection = (searchParams.get('sortDirection') || 'desc') as SortOptions['direction'];

    // Parse pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const db = await getDatabase();
    const collection = db.collection<Business>('businesses');

    // Build MongoDB query
    const query: any = {};

    if (filters.searchTerm) {
      query.$or = [
        { name: { $regex: filters.searchTerm, $options: 'i' } },
        { city: { $regex: filters.searchTerm, $options: 'i' } },
        { state: { $regex: filters.searchTerm, $options: 'i' } },
      ];
    }

    if (filters.leadScore && filters.leadScore.length > 0) {
      query.leadScore = { $in: filters.leadScore };
    }

    if (filters.hasWebsite !== undefined) {
      query.website = filters.hasWebsite ? { $exists: true, $ne: null } : { $exists: false };
    }

    if (filters.minRating !== undefined) {
      query.rating = { $gte: filters.minRating };
    }

    if (filters.contacted !== undefined) {
      query.contacted = filters.contacted;
    }

    if (filters.industry) {
      query.industry = filters.industry;
    }

    // Build sort
    const sort: any = {};
    sort[sortField] = sortDirection === 'asc' ? 1 : -1;

    // Execute query
    const [businesses, total] = await Promise.all([
      collection.find(query).sort(sort).skip(skip).limit(limit).toArray(),
      collection.countDocuments(query),
    ]);

    return NextResponse.json({
      businesses,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const business: Business = await request.json();

    const db = await getDatabase();
    const collection = db.collection<Business>('businesses');

    const result = await collection.insertOne({
      ...business,
      dateAdded: new Date(),
    });

    return NextResponse.json({
      success: true,
      id: result.insertedId,
    });
  } catch (error) {
    console.error('Error creating business:', error);
    return NextResponse.json(
      { error: 'Failed to create business' },
      { status: 500 }
    );
  }
}
