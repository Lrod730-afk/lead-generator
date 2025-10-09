import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

const SCRAPER_SERVICE_URL = process.env.SCRAPER_SERVICE_URL || 'http://localhost:3333';

export async function GET() {
  try {
    // Fetch progress from Railway scraper
    const response = await fetch(`${SCRAPER_SERVICE_URL}/progress`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch progress: ${response.statusText}`);
    }

    const progress = await response.json();

    // Calculate estimated time remaining if we have the data
    if (progress.scrapedBusinesses && progress.totalBusinesses && progress.startTime) {
      const elapsed = Date.now() - progress.startTime;
      const avgTimePerBusiness = elapsed / progress.scrapedBusinesses;
      const remaining = progress.totalBusinesses - progress.scrapedBusinesses;
      progress.estimatedTimeRemaining = Math.round((avgTimePerBusiness * remaining) / 1000); // in seconds
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching progress from Railway:', error);
    // Return default state if Railway is unreachable
    return NextResponse.json({
      isScraing: false,
      totalBusinesses: 0,
      scrapedBusinesses: 0,
      currentBusiness: '',
      startTime: null,
      businesses: []
    });
  }
}

