'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { type Property } from '@/lib/db/schema';

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */

function formatPrice(cents: number | null): string {
  if (cents == null) return '—';
  const dollars = cents / 100;
  return `$${dollars.toLocaleString('en-AU')}/wk`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}


function propertyTypeLabel(type: string | null): string {
  if (!type) return '—';
  return type.charAt(0).toUpperCase() + type.slice(1);
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  interested: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  inspection_scheduled: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  applied: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  approved: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  archived: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
};

function statusLabel(status: string): string {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/* ──────────────────────────────────────────────
   Image Gallery
   ────────────────────────────────────────────── */

function ImageGallery({ images }: { images: string[] | null }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const scrollToImage = useCallback(
    (index: number) => {
      const container = scrollRef.current;
      if (!container) return;
      const child = container.children[index] as HTMLElement;
      if (child) {
        container.scrollTo({ left: child.offsetLeft, behavior: 'smooth' });
        setActiveIndex(index);
      }
    },
    []
  );

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Array.from(container.children).indexOf(entry.target);
            if (idx !== -1) setActiveIndex(idx);
          }
        });
      },
      { root: container, threshold: 0.6 }
    );

    Array.from(container.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [images]);

  // Scroll thumbnails to keep active in view
  useEffect(() => {
    const thumbContainer = thumbnailsRef.current;
    if (!thumbContainer) return;
    const activeThumb = thumbContainer.children[activeIndex] as HTMLElement;
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeIndex]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[4/3] lg:aspect-[16/10] bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-3">
        <svg className="w-16 h-16 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008V7.5z" />
        </svg>
        <span className="text-sm font-medium">No images available</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image - scroll snap container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory rounded-xl bg-gray-100 aspect-[4/3] lg:aspect-[16/10] scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="flex-none w-full snap-center relative bg-gray-100"
          >
            <Image
              src={src}
              alt={`Property image ${i + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
              priority={i === 0}
              unoptimized
            />
          </div>
        ))}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div
          ref={thumbnailsRef}
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => scrollToImage(i)}
              className={`flex-none w-16 h-12 lg:w-20 lg:h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                i === activeIndex
                  ? 'border-blue-500 ring-1 ring-blue-200 opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-90'
              }`}
            >
              <Image
                src={src}
                alt={`Thumbnail ${i + 1}`}
                width={80}
                height={56}
                className="w-full h-full object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}

      {/* Image counter */}
      {images.length > 1 && (
        <div className="flex justify-center">
          <span className="text-xs text-gray-400 font-medium tabular-nums">
            {activeIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Delete Confirmation Dialog
   ────────────────────────────────────────────── */

function DeleteDialog({
  open,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!loading ? onCancel : undefined}
      />
      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-sm p-6 space-y-4 animate-in">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Delete Property</h3>
            <p className="text-sm text-gray-500">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Are you sure you want to permanently delete this property? All data including
          notes and inspection details will be lost.
        </p>
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Deleting...
              </span>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Loading Skeleton
   ────────────────────────────────────────────── */

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="max-w-6xl mx-auto px-4 py-6 lg:px-8 lg:py-8">
        {/* Back bar */}
        <div className="h-10 w-32 bg-gray-200 rounded-lg mb-6" />

        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Left column - gallery */}
          <div className="lg:col-span-3 space-y-4">
            <div className="w-full aspect-[4/3] lg:aspect-[16/10] bg-gray-200 rounded-xl" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-16 h-12 bg-gray-200 rounded-lg" />
              ))}
            </div>
            <div className="h-32 bg-gray-200 rounded-xl" />
          </div>

          {/* Right column - details */}
          <div className="lg:col-span-2 space-y-4">
            <div className="h-12 bg-gray-200 rounded-xl" />
            <div className="h-48 bg-gray-200 rounded-xl" />
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="h-40 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main Page Component
   ────────────────────────────────────────────── */

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  // Data
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectionTime, setInspectionTime] = useState('');
  const [notes, setNotes] = useState('');

  // UI state
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Track if dirty
  const [isDirty, setIsDirty] = useState(false);

  // Fetch property
  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function fetchProperty() {
      try {
        const res = await fetch(`/api/properties/${id}`);
        if (!res.ok) {
          if (!cancelled) setError('Property not found');
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setProperty(data.property);
          setInspectionDate(data.property.inspectionDate || '');
          setInspectionTime(data.property.inspectionTime || '');
          setNotes(data.property.notes || '');
        }
      } catch {
        if (!cancelled) setError('Failed to load property');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProperty();
    return () => { cancelled = true; };
  }, [id]);

  // Track dirty state
  useEffect(() => {
    if (!property) return;
    const dirty =
      inspectionDate !== (property.inspectionDate || '') ||
      inspectionTime !== (property.inspectionTime || '') ||
      notes !== (property.notes || '');
    setIsDirty(dirty);
  }, [inspectionDate, inspectionTime, notes, property]);

  // Save handler
  async function handleSave() {
    if (!isDirty || saving) return;
    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspectionDate, inspectionTime, notes }),
      });

      if (!res.ok) throw new Error('Failed to save');

      const data = await res.json();
      setProperty(data.property);
      setIsDirty(false);
      setSaveMessage({ type: 'success', text: 'Changes saved' });
    } catch {
      setSaveMessage({ type: 'error', text: 'Failed to save changes' });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  }

  // Delete handler
  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      router.push('/');
    } catch {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setSaveMessage({ type: 'error', text: 'Failed to delete property' });
    }
  }

  // Loading state
  if (loading) return <PageSkeleton />;

  // Error state
  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">{error || 'Property not found'}</h2>
          <button
            onClick={() => router.push('/')}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const statusStyle = STATUS_STYLES[property.status || 'interested'] || STATUS_STYLES.interested;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6 lg:px-8 lg:py-8">
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <button
            onClick={() => {
              if (isDirty && !window.confirm('You have unsaved changes. Leave anyway?')) return;
              router.push('/');
            }}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <svg
              className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Dashboard
          </button>

          {/* Status badge */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
            {statusLabel(property.status || 'interested')}
          </span>
        </div>

        {/* ── Main layout ── */}
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
          {/* ═══ LEFT COLUMN ═══ */}
          <div className="lg:col-span-3 space-y-6">
            {/* Image Gallery */}
            <ImageGallery images={property.images as string[] | null} />

            {/* Description */}
            {property.description && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 lg:p-6">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Description</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{property.description}</p>
              </div>
            )}
          </div>

          {/* ═══ RIGHT COLUMN ═══ */}
          <div className="lg:col-span-2 space-y-4">
            {/* Property Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 lg:p-6">
              {/* Address + Price */}
              <div className="mb-5">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 leading-tight mb-1">
                  {property.address}
                </h1>
                <p className="text-2xl lg:text-3xl font-bold text-blue-600 tabular-nums">
                  {formatPrice(property.price)}
                </p>
              </div>

              {/* Features grid */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  {
                    label: 'Beds',
                    value: property.bedrooms,
                    icon: (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                    ),
                  },
                  {
                    label: 'Baths',
                    value: property.bathrooms,
                    icon: (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                  },
                  {
                    label: 'Parking',
                    value: property.parking,
                    icon: (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5-3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    ),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-gray-400">{item.icon}</span>
                    <span className="text-lg font-bold text-gray-900 tabular-nums">
                      {item.value != null ? item.value : '—'}
                    </span>
                    <span className="text-xs font-medium text-gray-500">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Meta rows */}
              <div className="space-y-3 divide-y divide-gray-100">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">Type</span>
                  <span className="text-sm font-medium text-gray-900">{propertyTypeLabel(property.propertyType)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">Available</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(property.availableDate)}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500">Added</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(property.createdAt?.toString() || null)}</span>
                </div>
              </div>

              {/* Source link */}
              {property.url && (
                <a
                  href={property.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  View Original Listing
                </a>
              )}
            </div>

            {/* ── Editable Fields Card ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 lg:p-6">
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Inspection Details</h2>

              <div className="space-y-4">
                {/* Inspection Date */}
                <div>
                  <label htmlFor="inspectionDate" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Inspection Date
                  </label>
                  <input
                    id="inspectionDate"
                    type="date"
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  />
                </div>

                {/* Inspection Time */}
                <div>
                  <label htmlFor="inspectionTime" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Inspection Time
                  </label>
                  <input
                    id="inspectionTime"
                    type="time"
                    value={inspectionTime}
                    onChange={(e) => setInspectionTime(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Add notes about this property..."
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Save row */}
              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={!isDirty || saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>

                {/* Inline save message */}
                {saveMessage && (
                  <span
                    className={`text-sm font-medium whitespace-nowrap ${
                      saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {saveMessage.type === 'success' ? (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Saved
                      </span>
                    ) : (
                      saveMessage.text
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* ── Delete Card ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">Danger Zone</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Permanently remove this property</p>
                </div>
                <button
                  onClick={() => setDeleteDialogOpen(true)}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
        loading={deleting}
      />

      {/* Subtle entrance animation */}
      <style jsx global>{`
        .animate-in {
          animation: dialogIn 0.2s ease-out;
        }
        @keyframes dialogIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
