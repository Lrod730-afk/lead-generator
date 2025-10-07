import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Business } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ids = searchParams.get('ids')?.split(',');

    const db = await getDatabase();
    const collection = db.collection<Business>('businesses');

    let businesses: Business[];

    if (ids && ids.length > 0) {
      // Export specific businesses by ID
      const { ObjectId } = require('mongodb');
      businesses = await collection
        .find({ _id: { $in: ids.map(id => new ObjectId(id)) } })
        .toArray();
    } else {
      // Export all businesses
      businesses = await collection.find({}).toArray();
    }

    // Convert to CSV
    const csv = convertToCSV(businesses);

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return NextResponse.json(
      { error: 'Failed to export CSV' },
      { status: 500 }
    );
  }
}

function convertToCSV(businesses: Business[]): string {
  if (businesses.length === 0) {
    return '';
  }

  // CSV headers
  const headers = [
    'Name',
    'Phone',
    'Email',
    'Website',
    'Address',
    'City',
    'State',
    'ZIP',
    'Rating',
    'Review Count',
    'Lead Score',
    'Needs Help',
    'Contacted',
    'Date Added',
  ];

  // Create CSV rows
  const rows = businesses.map(business => [
    escapeCsvValue(business.name),
    escapeCsvValue(business.phone || ''),
    escapeCsvValue(business.email || ''),
    escapeCsvValue(business.website || ''),
    escapeCsvValue(business.address),
    escapeCsvValue(business.city),
    escapeCsvValue(business.state),
    escapeCsvValue(business.zip),
    business.rating || '',
    business.reviewCount || '',
    business.leadScore,
    escapeCsvValue(business.needsHelp.join('; ')),
    business.contacted ? 'Yes' : 'No',
    new Date(business.dateAdded).toLocaleDateString(),
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  return csvContent;
}

function escapeCsvValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
