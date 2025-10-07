'use client';

import { Business } from '@/types';
import LeadScoreBadge from './LeadScoreBadge';
import { ExternalLink, Phone, Mail, MapPin, Star, MessageSquare } from 'lucide-react';
import { formatPhoneNumber } from '@/lib/enrichment';

interface BusinessTableProps {
  businesses: Business[];
  onContactToggle?: (id: string, contacted: boolean) => void;
}

export default function BusinessTable({
  businesses,
  onContactToggle,
}: BusinessTableProps) {
  if (businesses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No businesses found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Business
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rating
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Why They Need Help
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {businesses.map((business) => (
            <tr key={business._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <LeadScoreBadge score={business.leadScore} />
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-gray-900">
                    {business.name}
                  </div>
                  <div className="text-sm text-gray-500 flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {business.city}, {business.state}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col space-y-1">
                  {business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      {formatPhoneNumber(business.phone)}
                    </a>
                  )}
                  {business.email && (
                    <a
                      href={`mailto:${business.email}`}
                      className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                    >
                      <Mail className="h-3 w-3 mr-1" />
                      {business.email}
                    </a>
                  )}
                  {business.website && (
                    <a
                      href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Website
                    </a>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {business.rating && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm text-gray-900">
                      {business.rating.toFixed(1)}
                    </span>
                    <span className="ml-1 text-sm text-gray-500">
                      ({business.reviewCount || 0})
                    </span>
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900 max-w-xs">
                  {business.needsHelp.slice(0, 2).map((need, index) => (
                    <div key={index} className="flex items-start mb-1">
                      <span className="text-red-500 mr-1">•</span>
                      <span>{need}</span>
                    </div>
                  ))}
                  {business.needsHelp.length > 2 && (
                    <div className="text-gray-500 text-xs">
                      +{business.needsHelp.length - 2} more
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() =>
                    onContactToggle?.(
                      business._id!,
                      !business.contacted
                    )
                  }
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    business.contacted
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {business.contacted ? 'Contacted' : 'Mark Contacted'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
