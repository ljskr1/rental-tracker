'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Property } from '@/lib/db/schema';

function formatPrice(price: number | null): string {
  if (!price) return 'TBD';
  return `$${(price / 100).toLocaleString()}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '–';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function getStatusStyles(status: Property['status'] | null) {
  const styles: Record<string, string> = {
    interested: 'bg-gray-100 text-gray-700',
    inspection_scheduled: 'bg-amber-100 text-amber-700',
    applied: 'bg-blue-100 text-blue-700',
    rejected: 'bg-red-100 text-red-700',
    approved: 'bg-emerald-100 text-emerald-700',
    archived: 'bg-gray-50 text-gray-500',
  };
  return styles[status ?? ''] || styles.interested;
}

function getStatusLabel(status: Property['status'] | null) {
  const labels: Record<string, string> = {
    interested: 'Interested',
    inspection_scheduled: 'Inspection',
    applied: 'Applied',
    rejected: 'Rejected',
    approved: 'Approved',
    archived: 'Archived',
  };
  return labels[status ?? ''] || 'Unknown';
}

export default function PropertyTable({ properties }: { properties: Property[] }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                Property
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                Price
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                Details
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                Status
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                Inspection
              </th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                Type
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {properties.map((property) => {
              const hasImages = property.images && property.images.length > 0;

              return (
                <tr
                  key={property.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* Property */}
                  <td className="px-6 py-4">
                    <Link
                      href={`/property/${property.id}`}
                      className="flex items-center gap-4 group"
                    >
                      <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {hasImages ? (
                          <Image
                            src={property.images![0]}
                            alt={property.address}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="64px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate max-w-[280px]">
                          {property.address}
                        </p>
                      </div>
                    </Link>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPrice(property.price)}
                    </p>
                    <p className="text-xs text-gray-500">/week</p>
                  </td>

                  {/* Details */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium">{property.bedrooms ?? '–'}</span>
                        <span className="text-gray-400">bed</span>
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium">{property.bathrooms ?? '–'}</span>
                        <span className="text-gray-400">bath</span>
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium">{property.parking ?? '–'}</span>
                        <span className="text-gray-400">parking</span>
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyles(
                        property.status
                      )}`}
                    >
                      {getStatusLabel(property.status)}
                    </span>
                  </td>

                  {/* Inspection */}
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">
                      {formatDate(property.inspectionDate)}
                    </p>
                    {property.inspectionTime && (
                      <p className="text-xs text-gray-400">{property.inspectionTime}</p>
                    )}
                  </td>

                  {/* Type */}
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 capitalize">
                      {property.propertyType ?? '–'}
                    </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
