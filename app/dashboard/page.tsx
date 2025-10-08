'use client';

import { useState, useEffect } from 'react';
import BusinessTable from '@/components/BusinessTable';
import { Business, LeadScore } from '@/types';

export const dynamic = 'force-dynamic';
import {
  Download,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Copy,
  CheckCircle,
  Trash2,
} from 'lucide-react';

export default function Dashboard() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [leadScoreFilter, setLeadScoreFilter] = useState<LeadScore[]>([]);
  const [hasWebsiteFilter, setHasWebsiteFilter] = useState<string>('all');
  const [contactedFilter, setContactedFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('dateAdded');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (searchTerm) params.append('search', searchTerm);
      if (leadScoreFilter.length > 0)
        params.append('leadScore', leadScoreFilter.join(','));
      if (hasWebsiteFilter !== 'all')
        params.append('hasWebsite', hasWebsiteFilter);
      if (contactedFilter !== 'all')
        params.append('contacted', contactedFilter);
      params.append('sortField', sortField);
      params.append('sortDirection', sortDirection);

      const response = await fetch(`/api/businesses?${params.toString()}`);
      const data = await response.json();
      setBusinesses(data.businesses);
    } catch (error) {
      console.error('Error fetching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchTerm,
    leadScoreFilter,
    hasWebsiteFilter,
    contactedFilter,
    sortField,
    sortDirection,
  ]);

  // Auto-refresh dashboard every 10 seconds to show new leads
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBusinesses();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval); // Cleanup on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, leadScoreFilter, hasWebsiteFilter, contactedFilter, sortField, sortDirection]);

  const handleContactToggle = async (id: string, contacted: boolean) => {
    try {
      await fetch(`/api/businesses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacted }),
      });
      fetchBusinesses();
    } catch (error) {
      console.error('Error updating business:', error);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export/csv');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const copyEmails = () => {
    const emails = businesses
      .filter((b) => b.email)
      .map((b) => b.email)
      .join(', ');
    navigator.clipboard.writeText(emails);
    setCopySuccess('emails');
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const copyPhones = () => {
    const phones = businesses
      .filter((b) => b.phone)
      .map((b) => b.phone)
      .join(', ');
    navigator.clipboard.writeText(phones);
    setCopySuccess('phones');
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const toggleLeadScore = (score: LeadScore) => {
    setLeadScoreFilter((prev) =>
      prev.includes(score) ? prev.filter((s) => s !== score) : [...prev, score]
    );
  };

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleClearAllLeads = async () => {
    try {
      const response = await fetch('/api/businesses/clear', {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchBusinesses();
        setShowClearConfirm(false);
      } else {
        console.error('Failed to clear leads');
      }
    } catch (error) {
      console.error('Error clearing leads:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lead Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Manage and filter your business leads
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Auto-refreshing every 10s</span>
        </div>
      </div>

      {/* Progress bar removed - now shown on /scraping page */}

      {/* Filters and Actions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-100 p-8 mb-8 shadow-lg">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search businesses by name, city, or state..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Lead Score Filter */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-3">
              🎯 Lead Score
            </label>
            <div className="flex space-x-2">
              {(['HOT', 'WARM', 'COLD'] as LeadScore[]).map((score) => (
                <button
                  key={score}
                  onClick={() => toggleLeadScore(score)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                    leadScoreFilter.includes(score)
                      ? score === 'HOT'
                        ? 'bg-gradient-to-br from-red-400 to-pink-500 text-white'
                        : score === 'WARM'
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white'
                        : 'bg-gradient-to-br from-green-400 to-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {score === 'HOT' ? '🔥' : score === 'WARM' ? '⚡' : '❄️'} {score}
                </button>
              ))}
            </div>
          </div>

          {/* Website Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <select
              value={hasWebsiteFilter}
              onChange={(e) => setHasWebsiteFilter(e.target.value)}
              className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All</option>
              <option value="true">Has Website</option>
              <option value="false">No Website</option>
            </select>
          </div>

          {/* Contacted Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Status
            </label>
            <select
              value={contactedFilter}
              onChange={(e) => setContactedFilter(e.target.value)}
              className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All</option>
              <option value="true">Contacted</option>
              <option value="false">Not Contacted</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <div className="flex space-x-2">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="flex-1 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="dateAdded">Date Added</option>
                <option value="name">Name</option>
                <option value="rating">Rating</option>
                <option value="reviewCount">Reviews</option>
              </select>
              <button
                onClick={() =>
                  setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                }
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {sortDirection === 'asc' ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={copyEmails}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            {copySuccess === 'emails' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span>Copy Emails</span>
          </button>

          <button
            onClick={copyPhones}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            {copySuccess === 'phones' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span>Copy Phones</span>
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All Leads</span>
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Clear All Leads?
            </h3>
            <p className="text-gray-600 mb-6">
              This will permanently delete all {businesses.length} lead(s) from your database. This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleClearAllLeads}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Yes, Clear All
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {businesses.length} lead{businesses.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading leads...</p>
          </div>
        ) : (
          <BusinessTable
            businesses={businesses}
            onContactToggle={handleContactToggle}
          />
        )}
      </div>
    </div>
  );
}
