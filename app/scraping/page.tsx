'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function ScrapingPage() {
  const router = useRouter();
  const [scrapeProgress, setScrapeProgress] = useState<any>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);

  const handleStopScraping = async () => {
    if (isStopping) return;

    setIsStopping(true);
    setShowStopConfirm(false);

    try {
      const response = await fetch('/api/scrape/stop', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        // Stopped successfully - wait a moment then redirect
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        alert('Failed to stop scraper: ' + (data.error || 'Unknown error'));
        setIsStopping(false);
      }
    } catch (error: any) {
      console.error('Error stopping scraper:', error);
      alert('Failed to stop scraper: ' + error.message);
      setIsStopping(false);
    }
  };

  const fetchProgress = useCallback(async () => {
    try {
      const response = await fetch('/api/scrape/progress');
      const data = await response.json();

      if (data.isScraing) {
        setScrapeProgress(data);
      } else if (scrapeProgress && !data.isScraing) {
        // Scraping just completed
        setIsComplete(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000); // Show completion message for 2 seconds
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  }, [scrapeProgress, router]);

  useEffect(() => {
    // Fetch immediately
    fetchProgress();

    // Poll every 500ms for high precision updates
    const interval = setInterval(() => {
      fetchProgress();
    }, 500);

    return () => clearInterval(interval);
  }, [fetchProgress]);

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="max-w-2xl w-full mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-green-200 p-12 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              ✅ Scraping Complete!
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Successfully scraped <span className="font-bold text-green-600">{scrapeProgress?.scrapedBusinesses || 0}</span> businesses
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!scrapeProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Initializing scraper...</p>
        </div>
      </div>
    );
  }

  const percentage = (scrapeProgress.scrapedBusinesses / scrapeProgress.totalBusinesses) * 100;
  const elapsedTime = scrapeProgress.startTime ? Math.floor((Date.now() - scrapeProgress.startTime) / 1000) : 0;
  const avgTimePerBusiness = scrapeProgress.scrapedBusinesses > 0 ? elapsedTime / scrapeProgress.scrapedBusinesses : 0;
  const remainingBusinesses = scrapeProgress.totalBusinesses - scrapeProgress.scrapedBusinesses;
  const estimatedSecondsRemaining = Math.ceil(remainingBusinesses * avgTimePerBusiness);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        {/* Main Progress Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-blue-200 p-10 mb-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="animate-pulse bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4">
                <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
              🔍 Scraping in Progress
            </h1>
            <p className="text-lg text-gray-600">
              Searching for <span className="font-bold text-blue-600">{scrapeProgress.businessType}</span> in <span className="font-bold text-purple-600">{scrapeProgress.location}</span>
            </p>
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 text-center border-2 border-blue-100">
              <p className="text-sm text-gray-600 font-semibold mb-2">Businesses Found</p>
              <p className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {scrapeProgress.scrapedBusinesses}
              </p>
              <p className="text-sm text-gray-500 mt-1">of {scrapeProgress.totalBusinesses}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 text-center border-2 border-purple-100">
              <p className="text-sm text-gray-600 font-semibold mb-2">Progress</p>
              <p className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {percentage.toFixed(0)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">{remainingBusinesses} remaining</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="relative w-full bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
              <div
                className="absolute top-0 left-0 h-6 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 rounded-full transition-all duration-300 shadow-lg"
                style={{ width: `${percentage}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-700">{percentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Current Business */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border-2 border-blue-100 mb-6">
            <p className="text-sm text-gray-600 font-semibold mb-2">🎯 Currently Scraping:</p>
            <p className="text-lg font-bold text-gray-900 truncate">
              {scrapeProgress.currentBusiness || 'Loading next business...'}
            </p>
          </div>

          {/* Time Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-xs text-gray-500 font-semibold mb-1">Elapsed</p>
              <p className="text-lg font-bold text-gray-700">{elapsedTime}s</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 font-semibold mb-1">Avg/Business</p>
              <p className="text-lg font-bold text-gray-700">{avgTimePerBusiness.toFixed(1)}s</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 font-semibold mb-1">Est. Remaining</p>
              <p className="text-lg font-bold text-purple-600">~{estimatedSecondsRemaining}s</p>
            </div>
          </div>

          {/* Stop Button */}
          {!isStopping && !showStopConfirm && (
            <button
              onClick={() => setShowStopConfirm(true)}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              🛑 Stop Scraping
            </button>
          )}

          {/* Stop Confirmation */}
          {showStopConfirm && !isStopping && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <p className="text-center font-bold text-gray-900 mb-4">
                ⚠️ Stop scraping now?
              </p>
              <p className="text-center text-sm text-gray-600 mb-4">
                {scrapeProgress.scrapedBusinesses} businesses collected so far will be saved.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowStopConfirm(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStopScraping}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Yes, Stop
                </button>
              </div>
            </div>
          )}

          {/* Stopping Message */}
          {isStopping && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-yellow-600 border-r-transparent mb-3"></div>
              <p className="font-bold text-gray-900 mb-2">
                🛑 Stopping scraper...
              </p>
              <p className="text-sm text-gray-600">
                Finishing current business and saving collected data ({scrapeProgress.scrapedBusinesses} leads)
              </p>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-600">
            💡 <strong>Tip:</strong> Leads will appear in your dashboard as soon as scraping completes. You&apos;ll be automatically redirected.
          </p>
        </div>
      </div>
    </div>
  );
}
