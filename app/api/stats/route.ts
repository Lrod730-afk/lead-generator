import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { Business, SearchRecord, DashboardStats } from '@/types';

export async function GET() {
  try {
    const db = await getDatabase();
    const businessCollection = db.collection<Business>('businesses');
    const searchCollection = db.collection<SearchRecord>('searches');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalLeads,
      hotLeads,
      warmLeads,
      coldLeads,
      contactedLeads,
      searchesToday,
    ] = await Promise.all([
      businessCollection.countDocuments(),
      businessCollection.countDocuments({ leadScore: 'HOT' }),
      businessCollection.countDocuments({ leadScore: 'WARM' }),
      businessCollection.countDocuments({ leadScore: 'COLD' }),
      businessCollection.countDocuments({ contacted: true }),
      searchCollection.countDocuments({ searchedAt: { $gte: today } }),
    ]);

    const stats: DashboardStats = {
      totalLeads,
      hotLeads,
      warmLeads,
      coldLeads,
      contactedLeads,
      searchesToday,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
