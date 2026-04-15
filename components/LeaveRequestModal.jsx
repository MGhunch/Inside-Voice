'use client';

import { useState, useEffect } from 'react';
import { COLORS } from '../lib/utils';

/**
 * Calculate working days between two dates (excludes weekends)
 */
function getWorkingDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (end < start) return 0;
  
  let count = 0;
  const current = new Date(start);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

/**
 * Format date for display
 */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short' });
}

/**
 * LeaveRequestModal - Employee leave request form
 * Pre-populates user info, calculates working days, sends email to Angela
 */
export default function LeaveRequestModal({ person, isOpen, onClose }) {
  const [leaveType, setLeaveType] = useState('Annual leave');
  const [fromDate, setFromDate] = useState('');
  const [untilDate, setUntilDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setLeaveType('Annual leave');
      setFromDate('');
      setUntilDate('');
      setNotes('');
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  // Auto-set untilDate to fromDate if empty and fromDate is set
  useEffect(() => {
    if (fromDate && !untilDate) {
      setUntilDate(fromDate);
    }
  }, [fromDate]);

  if (!isOpen) return null;

  const workingDays = getWorkingDays(fromDate, untilDate);
  const canSubmit = fromDate && untilDate && workingDays > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/leave-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: person?.name,
          email: person?.email,
          chapterLead: person?.chapterLead,
          leaveType,
          fromDate,
          untilDate,
          workingDays,
          notes,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to send request');
      }

      setSuccess(true);
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl w-full max-w-[420px] overflow-hidden shadow-2xl"
        >
          <div className="p-10 text-center">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
              style={{ background: COLORS.teal }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 className="font-heading text-[24px] font-semibold text-gray-900 mb-2">
              Request sent
            </h2>
            <p className="text-[15px] text-gray-500">
              Angela will be in touch if she has any questions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-[420px] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div 
          className="px-6 py-5 flex items-center gap-3"
          style={{ background: COLORS.purple }}
        >
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h2 className="flex-1 font-heading text-[18px] font-semibold text-white">
            Book leave
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          
          {/* Name - pre-populated, readonly */}
          <div>
            <label className="label text-gray-500">Name</label>
            <input
              type="text"
              value={person?.name || ''}
              readOnly
              className="input bg-gray-50 cursor-default"
            />
          </div>

          {/* Chapter lead - pre-populated, readonly */}
          <div>
            <label className="label text-gray-500">Chapter lead</label>
            <input
              type="text"
              value={person?.chapterLead || ''}
              readOnly
              className="input bg-gray-50 cursor-default"
            />
          </div>

          {/* Leave type */}
          <div>
            <label className="label text-gray-500">Type of leave</label>
            <div className="relative">
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="input appearance-none pr-10 cursor-pointer"
              >
                <option>Annual leave</option>
                <option>Sick leave</option>
                <option>Bereavement</option>
                <option>Other</option>
              </select>
              <svg 
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Date pickers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-gray-500">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label text-gray-500">Until</label>
              <input
                type="date"
                value={untilDate}
                min={fromDate}
                onChange={(e) => setUntilDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Working days calculation */}
          {fromDate && untilDate && (
            <div 
              className="rounded-xl px-4 py-3.5 flex items-center justify-between"
              style={{ background: `${COLORS.teal}15` }}
            >
              <div>
                <span className="text-[13px] text-teal-dark/70">
                  {formatDate(fromDate)} → {formatDate(untilDate)}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span 
                  className="text-[22px] font-heading font-semibold"
                  style={{ color: COLORS.teal }}
                >
                  {workingDays}
                </span>
                <span className="text-[13px] text-teal-dark/70">
                  {workingDays === 1 ? 'day' : 'days'}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="label text-gray-500">
              Notes <span className="text-gray-400 normal-case">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any details Angela should know..."
              rows={3}
              className="input resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="w-full py-3.5 rounded-xl font-heading font-medium text-[15px] text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: COLORS.purple }}
          >
            {loading ? (
              'Sending…'
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Send
              </>
            )}
          </button>
          <p className="text-[12px] text-gray-400 text-center mt-3">
            Angela will get an email with your request
          </p>
        </div>
      </div>
    </div>
  );
}
