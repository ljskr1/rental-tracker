'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Property } from '@/lib/db/schema';

function formatPrice(price: number | null): string {
  if (!price) return 'Price TBD';
  return `$${(price / 100).toLocaleString()}/week`;
}

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return dateStr;
  }
}

function getStatusStyles(status: Property['status'] | null) {
  const styles: Record<string, string> = {
    interested: 'bg-gray-100 text-gray-700 border-gray-200',
    inspection_scheduled: 'bg-amber-50 text-amber-700 border-amber-200',
    applied: 'bg-blue-50 text-blue-700 border-blue-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    archived: 'bg-gray-50 text-gray-500 border-gray-200',
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

export default function PropertyCard({ property }: { property: Property }) {
  const hasImages = property.images && property.images.length > 0;
  const inspectionDate = formatDate(property.inspectionDate);

  return (
    <Link
      href={`/property/${property.id}`}
      className="block group"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Image Section */}
        <div className="relative aspect-[16/10] bg-gray-100">
          {hasImages ? (
            <Image
              src={property.images![0]}
              alt={property.address}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg
                className="w-12 h-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21"
                />
              </svg>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyles(
                property.status
              )}`}
            >
              {getStatusLabel(property.status)}
            </span>
          </div>

          {/* Inspection Badge */}
          {inspectionDate && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500 text-white shadow-sm">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                {inspectionDate}
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Price */}
          <p className="text-lg font-bold text-blue-600">
            {formatPrice(property.price)}
          </p>

          {/* Address */}
          <p className="mt-1 text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {property.address}
          </p>

          {/* Property Details */}
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <span className="font-medium text-gray-700">{property.bedrooms ?? '–'}</span>
              <span>bed</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-gray-700">{property.bathrooms ?? '–'}</span>
              <span>bath</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5-12H11.25m0 0H9.75m1.5 0v3m0-3V6.375c0-.621.504-1.125 1.125-1.125H16.5c.621 0 1.125.504 1.125 1.125V9" />
              </svg>
              <span className="font-medium text-gray-700">{property.parking ?? '–'}</span>
              <span>parking</span>
            </span>
          </div>

          {/* Property Type */}
          {property.propertyType && (
            <p className="mt-2 text-xs text-gray-400 capitalize">
              {property.propertyType}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
