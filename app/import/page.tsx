'use client';

import { useState } from 'react';
import { Upload, FileJson, FileSpreadsheet, CheckCircle, XCircle } from 'lucide-react';
import Papa from 'papaparse';

export default function ImportPage() {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    imported: number;
    failed: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError(null);
    setResult(null);

    try {
      const fileType = file.name.split('.').pop()?.toLowerCase();

      let businesses: any[] = [];

      if (fileType === 'csv') {
        // Parse CSV
        Papa.parse(file, {
          header: true,
          complete: async (results) => {
            businesses = results.data.filter((row: any) => row.name);
            await importBusinesses(businesses);
          },
          error: (error) => {
            setError(`CSV parsing error: ${error.message}`);
            setImporting(false);
          },
        });
      } else if (fileType === 'json') {
        // Parse JSON
        const text = await file.text();
        businesses = JSON.parse(text);
        await importBusinesses(businesses);
      } else {
        setError('Unsupported file type. Please upload CSV or JSON.');
        setImporting(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to import file');
      setImporting(false);
    }
  };

  const importBusinesses = async (businesses: any[]) => {
    try {
      const response = await fetch('/api/businesses/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businesses }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Import failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to import businesses');
    } finally {
      setImporting(false);
    }
  };

  const handleManualAdd = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const business = {
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      website: formData.get('website') as string,
      address: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zip: formData.get('zip') as string,
      rating: formData.get('rating')
        ? parseFloat(formData.get('rating') as string)
        : undefined,
      reviewCount: formData.get('reviewCount')
        ? parseInt(formData.get('reviewCount') as string)
        : undefined,
      industry: formData.get('industry') as string,
    };

    setImporting(true);
    try {
      await importBusinesses([business]);
      event.currentTarget.reset();
    } catch (err) {
      // Error handled in importBusinesses
    }
  };

  const sampleCSV = `name,phone,email,website,address,city,state,zip,rating,reviewCount,industry
Joe's Pizza,(555) 123-4567,info@joespizza.com,https://joespizza.com,123 Main St,Miami,FL,33101,4.2,45,Restaurants
Smith Dental,(555) 987-6543,,https://smithdental.com,456 Oak Ave,Tampa,FL,33602,4.8,120,Dentists
ABC Plumbing,(555) 555-1234,contact@abcplumbing.com,,789 Elm St,Orlando,FL,32801,3.5,8,Plumbers`;

  const downloadSample = () => {
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-leads.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Import Leads</h1>
        <p className="mt-2 text-gray-600">
          Upload business data from CSV or JSON files, or add manually
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* File Upload */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Upload File
          </h2>

          <div className="mb-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleFileUpload}
                disabled={importing}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <div className="bg-primary-50 p-3 rounded-full mb-4">
                  <FileSpreadsheet className="h-8 w-8 text-primary-600" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Click to upload CSV or JSON
                </p>
                <p className="text-xs text-gray-500">or drag and drop</p>
              </label>
            </div>
          </div>

          <button
            onClick={downloadSample}
            className="w-full text-sm text-primary-600 hover:text-primary-800 underline"
          >
            Download sample CSV template
          </button>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              CSV Format:
            </h3>
            <p className="text-xs text-gray-600 mb-2">
              Include these columns (all optional except name):
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• name (required)</li>
              <li>• phone, email, website</li>
              <li>• address, city, state, zip</li>
              <li>• rating, reviewCount</li>
              <li>• industry</li>
            </ul>
          </div>

          {/* Import Status */}
          {importing && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg flex items-center">
              <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-primary-600 border-r-transparent mr-3"></div>
              <span className="text-sm text-blue-800">Importing...</span>
            </div>
          )}

          {result && (
            <div
              className={`mt-6 p-4 rounded-lg flex items-start ${
                result.success ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
              )}
              <div>
                <p
                  className={`text-sm font-medium ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {result.success ? 'Import Successful!' : 'Import Failed'}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    result.success ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  Imported: {result.imported} | Failed: {result.failed}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 rounded-lg flex items-start">
              <XCircle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Error</p>
                <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Manual Entry */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Add Manually
          </h2>

          <form onSubmit={handleManualAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                name="website"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  maxLength={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP
                </label>
                <input
                  type="text"
                  name="zip"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <input
                  type="number"
                  name="rating"
                  step="0.1"
                  min="0"
                  max="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reviews
                </label>
                <input
                  type="number"
                  name="reviewCount"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  name="industry"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={importing}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
            >
              Add Business
            </button>
          </form>
        </div>
      </div>

      {/* API Endpoint Info */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          API Integration
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          You can also import data programmatically using our API endpoint:
        </p>
        <div className="bg-gray-50 rounded-lg p-4">
          <code className="text-xs text-gray-800">
            POST /api/businesses/import
            <br />
            <br />
            {JSON.stringify(
              {
                businesses: [
                  {
                    name: 'Business Name',
                    phone: '(555) 123-4567',
                    email: 'info@business.com',
                    website: 'https://business.com',
                    address: '123 Main St',
                    city: 'Miami',
                    state: 'FL',
                    zip: '33101',
                    rating: 4.5,
                    reviewCount: 50,
                    industry: 'Restaurants',
                  },
                ],
              },
              null,
              2
            )}
          </code>
        </div>
      </div>
    </div>
  );
}
