'use client';

import { useState, useRef, useEffect } from 'react';

const MONTHS = [
  { key: 'jul', label: 'J' },
  { key: 'aug', label: 'A' },
  { key: 'sep', label: 'S' },
  { key: 'oct', label: 'O' },
  { key: 'nov', label: 'N' },
  { key: 'dec', label: 'D' },
  { key: 'jan', label: 'J' },
  { key: 'feb', label: 'F' },
  { key: 'mar', label: 'M' },
  { key: 'apr', label: 'A' },
  { key: 'may', label: 'M' },
  { key: 'jun', label: 'J' },
];

// Status: 'pending' | 'ontime' | 'late'
const DEFAULT_PAYMENTS = {
  jul: 'pending',
  aug: 'pending',
  sep: 'pending',
  oct: 'pending',
  nov: 'pending',
  dec: 'pending',
  jan: 'pending',
  feb: 'pending',
  mar: 'pending',
  apr: 'pending',
  may: 'pending',
  jun: 'pending',
};

export default function PaymentCalendar({ 
  view = 'spark', 
  fiscalYear = 'FY26',
  payments: initialPayments = DEFAULT_PAYMENTS,
  onPaymentChange,
}) {
  const [payments, setPayments] = useState(initialPayments);
  const [activeMonth, setActiveMonth] = useState(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);

  const isEditable = view === 'angela';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveMonth(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleMonthClick = (e, monthKey) => {
    if (!isEditable) return;
    
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 8,
      left: rect.left + rect.width / 2 - 70,
    });
    setActiveMonth(monthKey);
  };

  const handleMark = (status) => {
    if (!activeMonth) return;
    
    const newPayments = { ...payments, [activeMonth]: status };
    setPayments(newPayments);
    setActiveMonth(null);
    
    if (onPaymentChange) {
      onPaymentChange(activeMonth, status, newPayments);
    }
  };

  const renderIndicator = (status) => {
    if (status === 'pending') {
      return (
        <div style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: '#e0e0e0',
          margin: '4px 0',
        }} />
      );
    }
    
    const color = status === 'ontime' ? '#00CEB4' : '#EF9F27';
    return (
      <span style={{ fontSize: 20, color, lineHeight: 1 }}>✓</span>
    );
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Card */}
      <div style={{
        background: 'white',
        borderRadius: 24,
        padding: '28px 36px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
        display: 'flex',
        alignItems: 'center',
        gap: 32,
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}>
        
        {/* FY circle */}
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#00CEB4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#04342C',
          fontSize: 13,
          fontWeight: 600,
          flexShrink: 0,
        }}>
          {fiscalYear}
        </div>
        
        {/* Months */}
        <div style={{
          display: 'flex',
          flex: 1,
          justifyContent: 'space-between',
        }}>
          {MONTHS.map((month) => {
            const status = payments[month.key] || 'pending';
            const isPending = status === 'pending';
            
            return (
              <div
                key={month.key}
                onClick={(e) => handleMonthClick(e, month.key)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 12px',
                  borderRadius: 8,
                  cursor: isEditable ? 'pointer' : 'default',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (isEditable) e.currentTarget.style.background = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{
                  fontSize: 12,
                  color: isPending ? '#bbb' : '#888',
                  fontWeight: 500,
                }}>
                  {month.label}
                </span>
                {renderIndicator(status)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Dropdown (Angela view only) */}
      {activeMonth && isEditable && (
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: dropdownPos.top,
            left: dropdownPos.left,
            background: 'white',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            padding: '6px 0',
            minWidth: 140,
            zIndex: 1000,
            fontFamily: "'DM Sans', system-ui, sans-serif",
          }}
        >
          <DropdownItem onClick={() => handleMark('ontime')}>
            <span style={{ color: '#00CEB4' }}>✓</span> Paid on time
          </DropdownItem>
          <DropdownItem onClick={() => handleMark('late')}>
            <span style={{ color: '#EF9F27' }}>✓</span> Paid late
          </DropdownItem>
          <div style={{ height: 1, background: '#f0f0f0', margin: '4px 0' }} />
          <DropdownItem onClick={() => handleMark('pending')} muted>
            Clear
          </DropdownItem>
        </div>
      )}
    </div>
  );
}

function DropdownItem({ children, onClick, muted }) {
  const [hovered, setHovered] = useState(false);
  
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        padding: '10px 16px',
        border: 'none',
        background: hovered ? '#f8f9fa' : 'none',
        textAlign: 'left',
        fontSize: 13,
        color: muted ? '#888' : '#1a1a1a',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  );
}
