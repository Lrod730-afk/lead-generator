'use client';

import { useState, useEffect } from 'react';
import { Search, TrendingUp, Target, Users, Database } from 'lucide-react';
import StatsCard from '@/components/StatsCard';
import { DashboardStats } from '@/types';

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [location, setLocation] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [radius, setRadius] = useState('10');
  const [maxResults, setMaxResults] = useState('10');
  const [scrapeSpeed, setScrapeSpeed] = useState('normal');
  const [isScraing, setIsScraing] = useState(false);
  const [scrapeStatus, setScrapeStatus] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScraing(true);
    setScrapeStatus('Starting scraper...');

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location,
          businessType,
          radius: parseInt(radius),
          maxResults: parseInt(maxResults),
          scrapeSpeed,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setScrapeStatus('Scraping completed! Redirecting to dashboard...');
        // Refresh stats
        await fetchStats();
        // Navigate to dashboard after a short delay
        setTimeout(() => {
          window.location.href = `/dashboard`;
        }, 2000);
      } else {
        setScrapeStatus(`Error: ${data.error || 'Failed to scrape businesses'}`);
        setIsScraing(false);
      }
    } catch (error) {
      console.error('Error scraping:', error);
      setScrapeStatus('Error: Failed to connect to scraper');
      setIsScraing(false);
    }
  };

  const businessTypes = [
    'Restaurants',
    'Dentists',
    'Real Estate Agents',
    'Contractors',
    'Plumbers',
    'Electricians',
    'Roofing Companies',
    'Hair Salons',
    'Auto Repair',
    'Lawyers',
    'Accountants',
    'Chiropractors',
    'Fitness Centers',
    'Pet Services',
    'Landscaping',
    'Cleaning Services',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Find Your Perfect Leads
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Scrape real businesses from Google Maps and discover which ones need your digital marketing, website
          development, and AI automation services.
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatsCard
            title="Total Leads"
            value={stats.totalLeads}
            icon={Database}
            color="blue"
          />
          <StatsCard
            title="Hot Leads"
            value={stats.hotLeads}
            icon={TrendingUp}
            color="red"
          />
          <StatsCard
            title="Warm Leads"
            value={stats.warmLeads}
            icon={Target}
            color="yellow"
          />
          <StatsCard
            title="Cold Leads"
            value={stats.coldLeads}
            icon={Users}
            color="green"
          />
        </div>
      )}

      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>How it works:</strong> Enter a location and business type below. The scraper will visit Google Maps,
            extract real business data (including websites, ratings, contact info), and automatically add them to your dashboard.
            This process takes 2-5 minutes depending on results found.
          </p>
        </div>
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, State, or ZIP"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                e.g., &quot;Miami, FL&quot; or &quot;33101&quot;
              </p>
            </div>

            {/* Business Type */}
            <div>
              <label
                htmlFor="businessType"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Business Type
              </label>
              <select
                id="businessType"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Select industry...</option>
                {businessTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Radius */}
            <div>
              <label
                htmlFor="radius"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Search Radius
              </label>
              <select
                id="radius"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="5">5 miles</option>
                <option value="10">10 miles</option>
                <option value="25">25 miles</option>
                <option value="50">50 miles</option>
              </select>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            {/* Max Results */}
            <div>
              <label
                htmlFor="maxResults"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Number of Businesses
              </label>
              <select
                id="maxResults"
                value={maxResults}
                onChange={(e) => setMaxResults(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="5">5 businesses</option>
                <option value="10">10 businesses</option>
                <option value="20">20 businesses</option>
                <option value="50">50 businesses</option>
                <option value="100">100 businesses</option>
              </select>
            </div>

            {/* Scrape Speed */}
            <div>
              <label
                htmlFor="scrapeSpeed"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Scraping Speed
              </label>
              <select
                id="scrapeSpeed"
                value={scrapeSpeed}
                onChange={(e) => setScrapeSpeed(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="slow">Slow (safer, 4-6s/business)</option>
                <option value="normal">Normal (3-5s/business)</option>
                <option value="fast">Fast (1-2s/business)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Faster = higher risk of being blocked by Google
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isScraing}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
          >
            {isScraing ? (
              <>
                <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                <span>Scraping Google Maps...</span>
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                <span>Scrape Real Businesses</span>
              </>
            )}
          </button>

          {scrapeStatus && (
            <div
              className={`mt-4 p-4 rounded-lg ${
                scrapeStatus.startsWith('Error')
                  ? 'bg-red-100 text-red-800'
                  : scrapeStatus.includes('completed')
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {scrapeStatus}
            </div>
          )}
        </form>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Hot Leads
          </h3>
          <p className="text-gray-600">
            Businesses with no website, low reviews, or poor online presence.
            Perfect opportunities for your services.
          </p>
        </div>

        <div className="text-center">
          <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Smart Scoring
          </h3>
          <p className="text-gray-600">
            Automatically identifies businesses that need website development,
            review management, or digital marketing.
          </p>
        </div>

        <div className="text-center">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Easy Export
          </h3>
          <p className="text-gray-600">
            Export leads to CSV, copy contact information, and track which
            businesses you&apos;ve contacted.
          </p>
        </div>
      </div>
    </div>
  );
}
