'use client';

import { useState, useRef, useEffect } from 'react';
import { COLORS } from '../lib/utils';

/**
 * ActionMenu - Dropdown menu triggered by the plus button
 * Shows different options based on user role
 * 
 * @param {string} userRole - Current user's role (iv_admin, spark_admin, chapter_lead, employee)
 * @param {function} onAddPerson - Called when "Add someone" is clicked
 * @param {function} onPreviewAs - Called with role when preview option is selected
 * @param {string} previewMode - Current preview mode (null if not previewing)
 */
export default function ActionMenu({ userRole, onAddPerson, onPreviewAs, previewMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const isAdmin = userRole === 'iv_admin' || userRole === 'spark_admin';
  const canPreview = userRole === 'iv_admin' || userRole === 'spark_admin' || userRole === 'chapter_lead';

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* Plus button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: previewMode ? COLORS.purple : COLORS.teal,
          border: 'none',
          color: previewMode ? '#fff' : COLORS.tealDark,
          fontSize: 24,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 500,
          boxShadow: previewMode 
            ? '0 4px 12px rgba(88, 78, 159, 0.3)'
            : '0 4px 12px rgba(0, 206, 180, 0.3)',
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
      >
        {isOpen ? '×' : '+'}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            background: 'white',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            minWidth: 200,
            overflow: 'hidden',
            zIndex: 100,
          }}
        >
          {/* Add someone — admin only */}
          {isAdmin && (
            <MenuItem
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" y1="8" x2="20" y2="14" />
                  <line x1="23" y1="11" x2="17" y2="11" />
                </svg>
              }
              label="Add someone"
              onClick={() => {
                setIsOpen(false);
                onAddPerson?.();
              }}
            />
          )}

          {/* Team FAQs — everyone */}
          <MenuItem
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            }
            label="Team FAQs"
            href="/faqs"
            onClick={() => setIsOpen(false)}
          />

          {/* Preview as — admin/chapter lead only */}
          {canPreview && (
            <>
              <div style={{ height: 1, background: '#f0f0f0', margin: '4px 0' }} />
              <div style={{ padding: '8px 16px' }}>
                <p style={{ 
                  fontSize: 11, 
                  fontWeight: 500, 
                  color: '#888', 
                  margin: 0,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Preview as
                </p>
              </div>
              
              <PreviewOption
                label="Employee"
                isActive={previewMode === 'employee'}
                onClick={() => {
                  setIsOpen(false);
                  onPreviewAs?.(previewMode === 'employee' ? null : 'employee');
                }}
              />
              
              {(userRole === 'iv_admin' || userRole === 'spark_admin') && (
                <PreviewOption
                  label="Chapter lead"
                  isActive={previewMode === 'chapter_lead'}
                  onClick={() => {
                    setIsOpen(false);
                    onPreviewAs?.(previewMode === 'chapter_lead' ? null : 'chapter_lead');
                  }}
                />
              )}

              {previewMode && (
                <PreviewOption
                  label="Exit preview"
                  isExit
                  onClick={() => {
                    setIsOpen(false);
                    onPreviewAs?.(null);
                  }}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Menu item component
function MenuItem({ icon, label, onClick, href }) {
  const content = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        cursor: 'pointer',
        transition: 'background 0.15s',
        color: '#1a1a1a',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      onClick={onClick}
    >
      <span style={{ color: '#888' }}>{icon}</span>
      <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
    </div>
  );

  if (href) {
    return <a href={href} style={{ textDecoration: 'none', color: 'inherit' }}>{content}</a>;
  }
  return content;
}

// Preview option component
function PreviewOption({ label, isActive, isExit, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 16px',
        cursor: 'pointer',
        transition: 'background 0.15s',
        background: isActive ? `${COLORS.purple}10` : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = '#fafafa';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isActive ? `${COLORS.purple}10` : 'transparent';
      }}
    >
      {!isExit && (
        <div style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          border: `2px solid ${isActive ? COLORS.purple : '#d0d0d0'}`,
          background: isActive ? COLORS.purple : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {isActive && (
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1 4L3 6L7 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      )}
      <span style={{ 
        fontSize: 13, 
        fontWeight: 500, 
        color: isExit ? COLORS.red : isActive ? COLORS.purple : '#666',
      }}>
        {label}
      </span>
    </div>
  );
}
