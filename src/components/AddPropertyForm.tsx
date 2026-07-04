'use client';

import { useState, useEffect, useRef } from 'react';
import type { Property } from '@/lib/db/schema';

interface AddPropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onPropertyAdded: (property: Property) => void;
}

const VALID_DOMAINS = ['realestate.com.au', 'domain.com.au'];

function isValidPropertyUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return VALID_DOMAINS.some(
      (domain) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="h-6 w-6"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg
      className="h-5 w-5 text-green-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      className="h-5 w-5 text-red-600 flex-shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
      />
    </svg>
  );
}

export default function AddPropertyForm({ isOpen, onClose, onPropertyAdded }: AddPropertyFormProps) {
  const [url, setUrl] = useState('');
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectionTime, setInspectionTime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [animateIn, setAnimateIn] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);

  // Focus trap and animation
  useEffect(() => {
    if (isOpen) {
      // Small delay to trigger CSS transition
      requestAnimationFrame(() => {
        setAnimateIn(true);
        urlInputRef.current?.focus();
      });
    } else {
      setAnimateIn(false);
    }
  }, [isOpen]);

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      const timeout = setTimeout(() => {
        setUrl('');
        setInspectionDate('');
        setInspectionTime('');
        setNotes('');
        setError(null);
        setSuccess(false);
        setUrlError('');
        setLoading(false);
      }, 300); // Match animation duration
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const validateUrl = (value: string): boolean => {
    if (!value.trim()) {
      setUrlError('URL is required');
      return false;
    }
    if (!isValidPropertyUrl(value)) {
      setUrlError('Please enter a valid realestate.com.au or domain.com.au URL');
      return false;
    }
    setUrlError('');
    return true;
  };

  const handleUrlBlur = () => {
    if (url.trim()) {
      validateUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateUrl(url)) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          url: url.trim(),
          inspectionDate: inspectionDate || null,
          inspectionTime: inspectionTime || null,
          notes: notes.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add property');
      }

      setSuccess(true);
      onPropertyAdded(data.property);

      // Close modal after brief success display
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-300 ${
        animateIn ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none'
      }`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-property-title"
    >
      <div
        ref={modalRef}
        className={`
          relative bg-white w-full sm:max-w-lg
          sm:rounded-xl rounded-t-xl
          shadow-2xl
          max-h-[90vh] overflow-y-auto
          transition-all duration-300 ease-out
          ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-full sm:translate-y-4 opacity-0'}
        `}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <h2 id="add-property-title" className="text-lg font-semibold text-gray-900 font-[family-name:var(--font-geist-sans)]">
            Add Property
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {/* Success State */}
          {success && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              <CheckCircleIcon />
              <span>Property added successfully!</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
              <div className="flex items-start gap-3">
                <AlertIcon />
                <div className="flex-1">
                  <p className="font-medium">Failed to add property</p>
                  <p className="mt-1 text-red-600">{error}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  handleSubmit(new Event('submit') as any);
                }}
                className="mt-3 w-full text-center bg-red-100 hover:bg-red-200 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors min-h-[44px] text-sm"
              >
                Retry
              </button>
            </div>
          )}

          {/* URL Field */}
          <div>
            <label htmlFor="property-url" className="block text-sm font-medium text-gray-700 mb-1.5">
              Property URL <span className="text-red-500">*</span>
            </label>
            <input
              ref={urlInputRef}
              id="property-url"
              type="text"
              inputMode="url"
              value={url}
              onChange={(e) => {
                let value = e.target.value;
                if (value && !value.startsWith('http://') && !value.startsWith('https://') && (value.includes('realestate.com.au') || value.includes('domain.com.au'))) {
                  value = 'https://' + value;
                }
                setUrl(value);
                if (urlError) setUrlError('');
                if (error) setError(null);
              }}
              onBlur={handleUrlBlur}
              placeholder="https://www.realestate.com.au/..."
              disabled={loading}
              autoComplete="url"
              className={`
                w-full px-4 py-3 border rounded-lg
                text-base
                placeholder:text-gray-400
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                outline-none transition-colors
                disabled:bg-gray-50 disabled:cursor-not-allowed
                min-h-[44px]
                ${urlError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
              `}
              aria-describedby={urlError ? 'url-error' : undefined}
              aria-invalid={!!urlError}
            />
            {urlError && (
              <p id="url-error" className="mt-1.5 text-sm text-red-600" role="alert">
                {urlError}
              </p>
            )}
            <p className="mt-1.5 text-xs text-gray-500">
              Supports realestate.com.au and domain.com.au
            </p>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Inspection Date */}
            <div>
              <label htmlFor="inspection-date" className="block text-sm font-medium text-gray-700 mb-1.5">
                Inspection Date
              </label>
              <input
                id="inspection-date"
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                disabled={loading}
                min={new Date().toISOString().split('T')[0]}
                className="
                  w-full px-4 py-3 border border-gray-300 rounded-lg
                  text-base
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  outline-none transition-colors
                  disabled:bg-gray-50 disabled:cursor-not-allowed
                  min-h-[44px]
                "
              />
            </div>

            {/* Inspection Time */}
            <div>
              <label htmlFor="inspection-time" className="block text-sm font-medium text-gray-700 mb-1.5">
                Inspection Time
              </label>
              <input
                id="inspection-time"
                type="time"
                value={inspectionTime}
                onChange={(e) => setInspectionTime(e.target.value)}
                disabled={loading}
                className="
                  w-full px-4 py-3 border border-gray-300 rounded-lg
                  text-base
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  outline-none transition-colors
                  disabled:bg-gray-50 disabled:cursor-not-allowed
                  min-h-[44px]
                "
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="property-notes" className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes
            </label>
            <textarea
              id="property-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              rows={3}
              placeholder="Any additional notes about this property..."
              className="
                w-full px-4 py-3 border border-gray-300 rounded-lg
                text-base resize-none
                placeholder:text-gray-400
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                outline-none transition-colors
                disabled:bg-gray-50 disabled:cursor-not-allowed
                min-h-[44px]
              "
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                w-full sm:w-auto px-6 py-3
                border border-gray-300 rounded-lg
                text-gray-700 font-medium
                hover:bg-gray-50 active:bg-gray-100
                transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                min-h-[44px]
              "
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success || !url.trim()}
              className="
                w-full sm:w-auto px-6 py-3
                bg-blue-600 text-white rounded-lg
                font-medium
                hover:bg-blue-700 active:bg-blue-800
                focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
                min-h-[44px]
              "
            >
              {loading ? (
                <>
                  <Spinner />
                  <span>Adding Property...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircleIcon />
                  <span>Added!</span>
                </>
              ) : (
                'Add Property'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
