import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { location, businessType, radius } = await request.json();

    if (!location || !businessType) {
      return NextResponse.json(
        { error: 'Location and business type are required' },
        { status: 400 }
      );
    }

    // Check if we're in production and have a scraper service URL
    const scraperServiceUrl = process.env.SCRAPER_SERVICE_URL;

    if (!scraperServiceUrl) {
      // If no Railway URL is set, try to run locally (for development)
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          {
            error: 'Scraper service not configured',
            details: 'Please set SCRAPER_SERVICE_URL environment variable to your Railway scraper URL'
          },
          { status: 503 }
        );
      }

      // In development, use local scraper
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const path = require('path');
      const execAsync = promisify(exec);

      const scraperPath = path.join(process.cwd(), 'scraper.js');
      const command = `node "${scraperPath}" "${location}" "${businessType}" ${radius || 10}`;

      console.log('Starting local scraper:', command);

      const { stdout, stderr } = await execAsync(command, {
        timeout: 300000, // 5 minute timeout
      });

      if (stderr && !stderr.includes('DeprecationWarning')) {
        console.error('Scraper stderr:', stderr);
      }

      console.log('Scraper output:', stdout);

      return NextResponse.json({
        success: true,
        message: 'Scraping completed successfully',
        output: stdout,
      });
    }

    // Call Railway scraper service
    console.log('Calling Railway scraper service:', scraperServiceUrl);

    const response = await fetch(`${scraperServiceUrl}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location,
        businessType,
        radius: radius || 10,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Scraper service failed');
    }

    return NextResponse.json({
      success: true,
      message: 'Scraping started successfully',
      ...data,
    });
  } catch (error: any) {
    console.error('Error running scraper:', error);
    return NextResponse.json(
      {
        error: 'Failed to run scraper',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Scrape API endpoint. Use POST with location, businessType, and optional radius.',
  });
}
