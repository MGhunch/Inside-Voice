'use client';

import { useState, useRef, useEffect } from 'react';

const MONTHS = [
  { key: 'jul', label: 'J', full: 'July' },
  { key: 'aug', label: 'A', full: 'August' },
  { key: 'sep', label: 'S', full: 'September' },
  { key: 'oct', label: 'O', full: 'October' },
  { key: 'nov', label: 'N', full: 'November' },
  { key: 'dec', label: 'D', full: 'December' },
  { key: 'jan', label: 'J', full: 'January' },
  { key: 'feb', label: 'F', full: 'February' },
  { key: 'mar', label: 'M', full: 'March' },
  { key: 'apr', label: 'A', full: 'April' },
  { key: 'may', label: 'M', full: 'May' },
  { key: 'jun', label: 'J', full: 'June' },
];

// Mock payment data per month
const MOCK_PAYMENTS = {
  jul: { status: 'ontime', business: 41200, brand: 36800, customer: 28100, fees: 3500, margin: 17400, total: 110100 },
  aug: { status: 'ontime', business: 42100, brand: 37200, customer: 28800, fees: 3500, margin: 17800, total: 112100 },
  sep: { status: 'ontime', business: 41800, brand: 37600, customer: 29200, fees: 3500, margin: 17900, total: 112600 },
  oct: { status: 'late', business: 42380, brand: 38210, customer: 29450, fees: 3500, margin: 18200, total: 113540 },
  nov: { status: 'pending', business: 42380, brand: 38210, customer: 29450, fees: 3500, margin: 18200, total: 113540 },
  dec: { status: 'pending', business: 42380, brand: 38210, customer: 29450, fees: 3500, margin: 18200, total: 113540 },
  jan: { status: 'pending', business: 42380, brand: 38210, customer: 29450, fees: 3500, margin: 18200, total: 113540 },
  feb: { status: 'pending', business: 42380, brand: 38210, customer: 29450, fees: 3500, margin: 18200, total: 113540 },
  mar: { status: 'pending', business: 42380, brand: 38210, customer: 29450, fees: 3500, margin: 18200, total: 113540 },
  apr: { status: 'pending', business: 42380, brand: 38210, customer: 29450, fees: 3500, margin: 18200, total: 113540 },
  may: { status: 'pending', business: 42380, brand: 38210, customer: 29450, fees: 3500, margin: 18200, total: 113540 },
  jun: { status: 'pending', business: 42380, brand: 38210, customer: 29450, fees: 3500, margin: 18200, total: 113540 },
};

// Design tokens
const TOKENS = {
  accent: '#00CEB4',
  accentDark: '#04342C',
  late: '#EF9F27',
  lateDark: '#7A5000',
  gray: '#E8E8EC',
  textMuted: '#888',
  textLight: '#bbb',
  radius: 24,
  font: "'DM Sans', system-ui, sans-serif",
};

// Tribe colors
const TRIBE_COLORS = {
  business: { bg: '#FEC514', text: '#412402' },
  brand: { bg: '#00CEB4', text: '#04342C' },
  customer: { bg: '#584E9F', text: '#ffffff' },
};

export default function PaymentCalendar({
  fiscalYear = 'FY26',
  payments: initialPayments = MOCK_PAYMENTS,
  onPaymentChange,
}) {
  const [payments, setPayments] = useState(initialPayments);
  const [selected, setSelected] = useState(null); // 'jul' | 'ytd' | null
  const [pointerX, setPointerX] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const monthRefs = useRef({});
  const ytdRef = useRef(null);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Calculate YTD totals
  const ytdData = MONTHS.reduce(
    (acc, m) => {
      const p = payments[m.key];
      if (p.status !== 'pending') {
        acc.business += p.business;
        acc.brand += p.brand;
        acc.customer += p.customer;
        acc.fees += p.fees;
        acc.margin += p.margin;
        acc.total += p.total;
        acc.count++;
      }
      return acc;
    },
    { business: 0, brand: 0, customer: 0, fees: 0, margin: 0, total: 0, count: 0 }
  );

  // Update pointer position when selection changes
  useEffect(() => {
    if (!selected || !containerRef.current) return;

    const ref = selected === 'ytd' ? ytdRef.current : monthRefs.current[selected];
    if (!ref) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const targetRect = ref.getBoundingClientRect();
    const x = targetRect.left + targetRect.width / 2 - containerRect.left;
    setPointerX(x);
  }, [selected]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleMonthClick = (monthKey) => {
    setSelected(prev => prev === monthKey ? null : monthKey);
    setShowDropdown(false);
  };

  const handleYtdClick = () => {
    setSelected(prev => prev === 'ytd' ? null : 'ytd');
    setShowDropdown(false);
  };

  const handleMarkAs = (status) => {
    if (!selected || selected === 'ytd') return;
    
    const newPayments = {
      ...payments,
      [selected]: { ...payments[selected], status },
    };
    setPayments(newPayments);
    setShowDropdown(false);
    
    if (onPaymentChange) {
      onPaymentChange(selected, status, newPayments);
    }
  };

  const renderIndicator = (status) => {
    if (status === 'pending') {
      return (
        <div style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: TOKENS.gray,
        }} />
      );
    }
    
    const color = status === 'ontime' ? TOKENS.accent : TOKENS.late;
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M3.5 8.5L6.5 11.5L12.5 5.5"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const activeData = selected === 'ytd' ? ytdData : (selected ? payments[selected] : null);
  const activeMonth = selected && selected !== 'ytd' ? MONTHS.find(m => m.key === selected) : null;

  return (
    <div ref={containerRef} style={{ position: 'relative', fontFamily: TOKENS.font }}>
      {/* Calendar row */}
      <div style={{
        background: 'white',
        borderRadius: selected ? `${TOKENS.radius}px ${TOKENS.radius}px 0 0` : TOKENS.radius,
        padding: '24px 32px',
        boxShadow: selected ? 'none' : '0 4px 24px rgba(0,0,0,0.04)',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        transition: 'border-radius 0.2s',
      }}>
        {/* FY circle */}
        <div style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: TOKENS.accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: TOKENS.accentDark,
          fontSize: 12,
          fontWeight: 600,
          flexShrink: 0,
          letterSpacing: '0.5px',
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
            const status = payments[month.key]?.status || 'pending';
            const isSelected = selected === month.key;
            const isPending = status === 'pending';

            return (
              <button
                key={month.key}
                ref={el => monthRefs.current[month.key] = el}
                onClick={() => handleMonthClick(month.key)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 10px',
                  borderRadius: 10,
                  border: 'none',
                  background: isSelected ? TOKENS.accentDark : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: isSelected ? 'white' : (isPending ? TOKENS.textLight : TOKENS.textMuted),
                  transition: 'color 0.15s',
                }}>
                  {month.label}
                </span>
                {isSelected ? (
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: TOKENS.accent }} />
                ) : (
                  renderIndicator(status)
                )}
              </button>
            );
          })}
        </div>

        {/* YTD pill */}
        <button
          ref={ytdRef}
          onClick={handleYtdClick}
          style={{
            padding: '10px 18px',
            borderRadius: 20,
            border: 'none',
            background: selected === 'ytd' ? TOKENS.accentDark : TOKENS.gray,
            color: selected === 'ytd' ? 'white' : TOKENS.textMuted,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
        >
          YTD
        </button>
      </div>

      {/* Breakdown panel */}
      {selected && activeData && (
        <div style={{
          background: 'white',
          borderRadius: `0 0 ${TOKENS.radius}px ${TOKENS.radius}px`,
          boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Triangle pointer */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: pointerX,
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: `10px solid ${TOKENS.accentDark}`,
            transition: 'left 0.2s ease-out',
          }} />

          {/* Divider line */}
          <div style={{
            height: 1,
            background: TOKENS.gray,
            margin: '0 32px',
          }} />

          {/* Panel content */}
          <div style={{ padding: '28px 32px' }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}>
              <h3 style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 600,
                color: TOKENS.accentDark,
              }}>
                {selected === 'ytd' ? `Year to date (${ytdData.count} months)` : activeMonth?.full}
              </h3>

              {/* Status badge or Mark as paid button */}
              {selected !== 'ytd' && (
                <div style={{ position: 'relative' }}>
                  {activeData.status === 'pending' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDropdown(!showDropdown);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 14px',
                        borderRadius: 8,
                        border: `1px solid ${TOKENS.gray}`,
                        background: 'white',
                        fontSize: 13,
                        fontWeight: 500,
                        color: TOKENS.textMuted,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      Mark as paid
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDropdown(!showDropdown);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '6px 12px',
                        borderRadius: 20,
                        border: 'none',
                        background: activeData.status === 'ontime' ? `${TOKENS.accent}20` : `${TOKENS.late}20`,
                        fontSize: 12,
                        fontWeight: 600,
                        color: activeData.status === 'ontime' ? TOKENS.accentDark : TOKENS.lateDark,
                        cursor: 'pointer',
                      }}
                    >
                      {activeData.status === 'ontime' ? '✓ Paid on time' : '✓ Paid late'}
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}

                  {/* Dropdown */}
                  {showDropdown && (
                    <div
                      ref={dropdownRef}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: 6,
                        background: 'white',
                        borderRadius: 12,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        padding: '6px 0',
                        minWidth: 150,
                        zIndex: 100,
                      }}
                    >
                      <DropdownItem onClick={() => handleMarkAs('ontime')} color={TOKENS.accent}>
                        Paid on time
                      </DropdownItem>
                      <DropdownItem onClick={() => handleMarkAs('late')} color={TOKENS.late}>
                        Paid late
                      </DropdownItem>
                      <div style={{ height: 1, background: '#f0f0f0', margin: '4px 0' }} />
                      <DropdownItem onClick={() => handleMarkAs('pending')} muted>
                        Clear
                      </DropdownItem>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tribe totals row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
              marginBottom: 24,
            }}>
              <TribeTotal label="Business" value={activeData.business} colors={TRIBE_COLORS.business} />
              <TribeTotal label="Brand" value={activeData.brand} colors={TRIBE_COLORS.brand} />
              <TribeTotal label="Customer" value={activeData.customer} colors={TRIBE_COLORS.customer} />
            </div>

            {/* Fees / Margin / Total row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
              padding: '20px 0 0',
              borderTop: `1px solid ${TOKENS.gray}`,
            }}>
              <SummaryItem label="Fees" value={activeData.fees} />
              <SummaryItem label="Margin" value={activeData.margin} />
              <SummaryItem label="Total" value={activeData.total} highlight />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TribeTotal({ label, value, colors }) {
  return (
    <div style={{
      background: `${colors.bg}15`,
      borderRadius: 12,
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
    }}>
      <div style={{
        width: 8,
        height: 32,
        borderRadius: 4,
        background: colors.bg,
      }} />
      <div>
        <p style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 500,
          color: TOKENS.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: 4,
        }}>
          {label}
        </p>
        <p style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 600,
          color: '#1a1a1a',
        }}>
          ${value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function SummaryItem({ label, value, highlight }) {
  return (
    <div>
      <p style={{
        margin: 0,
        fontSize: 11,
        fontWeight: 500,
        color: TOKENS.textMuted,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: 6,
      }}>
        {label}
      </p>
      <p style={{
        margin: 0,
        fontSize: 22,
        fontWeight: 600,
        color: highlight ? TOKENS.accent : '#1a1a1a',
      }}>
        ${value.toLocaleString()}
        {highlight && (
          <span style={{
            fontSize: 13,
            fontWeight: 500,
            color: TOKENS.accent,
            marginLeft: 4,
          }}>
            +GST
          </span>
        )}
      </p>
    </div>
  );
}

function DropdownItem({ children, onClick, color, muted }) {
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
        background: hovered ? '#f8f9fa' : 'transparent',
        textAlign: 'left',
        fontSize: 13,
        fontWeight: 500,
        color: muted ? TOKENS.textMuted : '#1a1a1a',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      {color && (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path
            d="M3.5 8.5L6.5 11.5L12.5 5.5"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
