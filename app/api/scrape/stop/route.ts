import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check if we have a scraper service URL
    const scraperServiceUrl = process.env.SCRAPER_SERVICE_URL;

    if (!scraperServiceUrl) {
      return NextResponse.json(
        {
          error: 'Scraper service not configured',
          details: 'Cannot stop scraper - no scraper service URL configured'
        },
        { status: 503 }
      );
    }

    // Call Railway scraper service stop endpoint
    console.log('Sending stop signal to scraper service:', scraperServiceUrl);

    const response = await fetch(`${scraperServiceUrl}/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to stop scraper');
    }

    return NextResponse.json({
      success: true,
      message: 'Scraper stop signal sent successfully',
      ...data,
    });
  } catch (error: any) {
    console.error('Error stopping scraper:', error);
    return NextResponse.json(
      {
        error: 'Failed to stop scraper',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Stop scrape API endpoint. Use POST to stop current scraping.',
  });
}
