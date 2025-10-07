import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Business } from '@/types';

export async function DELETE() {
  try {
    const db = await getDatabase();
    const collection = db.collection<Business>('businesses');

    // Delete all businesses
    const result = await collection.deleteMany({});

    return NextResponse.json({
      success: true,
      deleted: result.deletedCount,
      message: `Successfully deleted ${result.deletedCount} business(es)`,
    });
  } catch (error) {
    console.error('Error clearing businesses:', error);
    return NextResponse.json(
      { error: 'Failed to clear businesses' },
      { status: 500 }
    );
  }
}
