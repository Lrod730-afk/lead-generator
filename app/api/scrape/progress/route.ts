import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

// Store progress in memory (for simplicity)
// In production, you might want to use Redis or similar
let scrapeProgress: {
  isScraing: boolean;
  location?: string;
  businessType?: string;
  total: number;
  current: number;
  currentBusiness?: string;
  startTime?: number;
  estimatedTimeRemaining?: number;
} = {
  isScraing: false,
  total: 0,
  current: 0,
};

export async function GET() {
  return NextResponse.json(scrapeProgress);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Update progress
    scrapeProgress = {
      ...scrapeProgress,
      ...data,
    };

    // Calculate estimated time remaining if we have the data
    if (data.current && data.total && data.startTime) {
      const elapsed = Date.now() - data.startTime;
      const avgTimePerBusiness = elapsed / data.current;
      const remaining = data.total - data.current;
      scrapeProgress.estimatedTimeRemaining = Math.round((avgTimePerBusiness * remaining) / 1000); // in seconds
    }

    return NextResponse.json({ success: true, progress: scrapeProgress });
  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  // Reset progress
  scrapeProgress = {
    isScraing: false,
    total: 0,
    current: 0,
  };
  return NextResponse.json({ success: true });
}
