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
        setScrapeStatus('Scraping started! Redirecting to progress page...');
        // Navigate to scraping progress page immediately
        setTimeout(() => {
          window.location.href = `/scraping`;
        }, 1000);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-6">
            <span className="text-blue-800 font-semibold text-sm">✨ AI-Powered Lead Generation</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
            Find Your Perfect <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Leads</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover high-quality business leads from Google Maps instantly. Identify businesses that need your
            <span className="font-semibold text-gray-800"> digital marketing</span>,
            <span className="font-semibold text-gray-800"> web development</span>, and
            <span className="font-semibold text-gray-800"> AI automation</span> services.
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
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
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 p-10 mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Generate Leads</h2>
          </div>

          <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl">
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong className="text-blue-800">💡 How it works:</strong> Enter a location and business type below. Our AI-powered scraper will visit Google Maps,
              extract real business data (websites, ratings, contact info), and add them to your dashboard with intelligent lead scoring.
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
                <option value="slow">🐢 Slow (safer, ~2s/business)</option>
                <option value="normal">⚡ Normal (~1s/business)</option>
                <option value="fast">🚀 Fast (~0.5s/business)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Faster = higher risk of being blocked by Google
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isScraing}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isScraing ? (
              <>
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-white border-r-transparent"></div>
                <span className="text-lg">Scraping Google Maps...</span>
              </>
            ) : (
              <>
                <Search className="h-6 w-6" />
                <span className="text-lg">🚀 Generate Leads Now</span>
              </>
            )}
          </button>

          {scrapeStatus && (
            <div
              className={`mt-6 p-5 rounded-xl border-2 font-medium ${
                scrapeStatus.startsWith('Error')
                  ? 'bg-red-50 text-red-800 border-red-200'
                  : scrapeStatus.includes('completed')
                  ? 'bg-green-50 text-green-800 border-green-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}
            >
              {scrapeStatus}
            </div>
          )}
        </form>
      </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-white/60 backdrop-blur rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-gradient-to-br from-red-400 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              🔥 Hot Leads
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Businesses with no website, low reviews, or poor online presence.
              Perfect opportunities for your services.
            </p>
          </div>

          <div className="text-center p-6 bg-white/60 backdrop-blur rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              🎯 Smart Scoring
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Automatically identifies businesses that need website development,
              review management, or digital marketing.
            </p>
          </div>

          <div className="text-center p-6 bg-white/60 backdrop-blur rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Database className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              📊 Easy Export
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Export leads to CSV, copy contact information, and track which
              businesses you&apos;ve contacted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
