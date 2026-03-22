'use client';

import { useState, useRef, useEffect } from 'react';
import { calcBillable, calcMonthlySalary } from '@/lib/utils';

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

const ADMIN_FEE = 2000;
const SETUP_FEE = 1500;

const TOKENS = {
  accent: '#00CEB4',
  accentDark: '#04342C',
  purple: '#584E9F',
  late: '#EF9F27',
  lateDark: '#7A5000',
  gray: '#E8E8EC',
  textMuted: '#888',
  textLight: '#bbb',
  radius: 24,
  font: "'DM Sans', system-ui, sans-serif",
};

const TRIBE_COLORS = {
  business: { bg: '#FEC514', text: '#412402' },
  brand: { bg: '#00CEB4', text: '#04342C' },
  customer: { bg: '#584E9F', text: '#ffffff' },
};

// Map a month key + fiscal year string to { year, month } (month 0-indexed)
// FY26 = Jul 2025 – Jun 2026
function getFYMonthDate(monthKey, fiscalYear) {
  const fyEnd = parseInt(fiscalYear.replace('FY', ''), 10) + 2000;
  const fyStart = fyEnd - 1;
  const FIRST_HALF = ['jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const MONTH_NUM = { jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11, jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5 };
  return {
    year: FIRST_HALF.includes(monthKey) ? fyStart : fyEnd,
    month: MONTH_NUM[monthKey],
  };
}

// Returns the month key for today within the given fiscal year, or null
function getCurrentMonthKey(fiscalYear) {
  const now = new Date();
  for (const m of MONTHS) {
    const { year, month } = getFYMonthDate(m.key, fiscalYear);
    if (year === now.getFullYear() && month === now.getMonth()) return m.key;
  }
  return null;
}

// A month is a forecast if its first day is today or in the future
function isMonthForecast(monthKey, fiscalYear) {
  const { year, month } = getFYMonthDate(monthKey, fiscalYear);
  const now = new Date();
  return new Date(year, month, 1) >= new Date(now.getFullYear(), now.getMonth(), 1);
}

// Calculate forecast figures for a month from the full team roster.
// Prorates people who start or end mid-month.
function calcForecastForMonth(team, monthKey, fiscalYear) {
  if (!team || team.length === 0) return null;

  const { year, month } = getFYMonthDate(monthKey, fiscalYear);
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  let business = 0, brand = 0, customer = 0, marginTotal = 0, newStarters = 0;

  for (const person of team) {
    const start = person.startDate ? new Date(person.startDate) : null;
    const end = person.endDate ? new Date(person.endDate) : null;

    if (start && start > lastDay) continue;
    if (end && end < firstDay) continue;

    const activeStart = (!start || start < firstDay) ? firstDay : start;
    const activeEnd = (!end || end > lastDay) ? lastDay : end;
    const activeDays = Math.round((activeEnd - activeStart) / (1000 * 60 * 60 * 24)) + 1;
    const proration = activeDays / daysInMonth;

    const monthlyBillable = Math.round(calcBillable(person) * proration);
    const monthlyCost = Math.round(calcMonthlySalary(person) * proration);
    marginTotal += monthlyBillable - monthlyCost;

    const tribe = (person.tribe || '').toLowerCase();
    if (tribe === 'business') business += monthlyBillable;
    else if (tribe === 'brand') brand += monthlyBillable;
    else if (tribe === 'customer') customer += monthlyBillable;

    if (start && start >= firstDay && start <= lastDay) newStarters++;
  }

  const fees = ADMIN_FEE + newStarters * SETUP_FEE;
  const total = business + brand + customer + fees;

  return { business, brand, customer, fees, margin: marginTotal, total, isForecast: true };
}

export default function PaymentCalendar({ fiscalYear = 'FY26', onPaymentChange }) {
  const [airtablePayments, setAirtablePayments] = useState({});
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [pointerX, setPointerX] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const monthRefs = useRef({});
  const ytdRef = useRef(null);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch payments + team on mount
  useEffect(() => {
    async function load() {
      try {
        const [paymentsRes, teamRes] = await Promise.all([
          fetch(`/api/payments?fiscalYear=${fiscalYear}`),
          fetch('/api/team'),
        ]);
        if (paymentsRes.ok) setAirtablePayments(await paymentsRes.json());
        if (teamRes.ok) setTeam(await teamRes.json());
      } catch (err) {
        console.error('Failed to load calendar data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fiscalYear]);

  // Auto-select current month once loaded
  useEffect(() => {
    if (!loading && !selected) {
      setSelected(getCurrentMonthKey(fiscalYear));
    }
  }, [loading]);

  // Merge: Airtable record wins if present, otherwise calculate forecast
  const mergedPayments = {};
  for (const m of MONTHS) {
    if (airtablePayments[m.key]) {
      mergedPayments[m.key] = { ...airtablePayments[m.key], isForecast: false };
    } else {
      const forecast = calcForecastForMonth(team, m.key, fiscalYear);
      if (forecast) mergedPayments[m.key] = forecast;
    }
  }

  // YTD: only real (non-forecast) months
  const ytdData = MONTHS.reduce(
    (acc, m) => {
      const p = mergedPayments[m.key];
      if (!p || p.isForecast) return acc;
      acc.business += p.business;
      acc.brand += p.brand;
      acc.customer += p.customer;
      acc.fees += p.fees;
      acc.margin += p.margin;
      acc.total += p.total;
      acc.count++;
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
    setPointerX(targetRect.left + targetRect.width / 2 - containerRect.left);
  }, [selected]);

  // Close dropdown on outside click — delay to avoid same-click closing it
  useEffect(() => {
    if (!showDropdown) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    const timer = setTimeout(() => document.addEventListener('click', handleClick), 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClick);
    };
  }, [showDropdown]);

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
    const base = airtablePayments[selected] || mergedPayments[selected] || {};
    const updated = { ...airtablePayments, [selected]: { ...base, status, isForecast: false } };
    setAirtablePayments(updated);
    setShowDropdown(false);
    if (onPaymentChange) onPaymentChange(selected, status, updated);
  };

  const activeData = selected === 'ytd' ? ytdData : (selected ? mergedPayments[selected] : null);
  const activeMonth = selected && selected !== 'ytd' ? MONTHS.find(m => m.key === selected) : null;
  const activeIsForecast = selected && selected !== 'ytd' && activeData?.isForecast;

  const renderIndicator = (status, isForecast) => {
    if (isForecast || status === 'pending') {
      return <div style={{ width: 10, height: 10, borderRadius: '50%', background: TOKENS.gray }} />;
    }
    const color = status === 'ontime' ? TOKENS.accent : TOKENS.late;
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3.5 8.5L6.5 11.5L12.5 5.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', fontFamily: TOKENS.font }}>
      {/* Calendar row */}
      <div style={{
        background: 'white',
        borderRadius: selected ? `${TOKENS.radius}px ${TOKENS.radius}px 0 0` : TOKENS.radius,
        padding: '24px 32px',
        boxShadow: selected ? 'none' : '0 4px 24px rgba(0,0,0,0.04)',
        display: 'flex', alignItems: 'center', gap: 24,
        transition: 'border-radius 0.2s',
      }}>
        {/* FY badge */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          background: loading ? TOKENS.gray : TOKENS.accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: TOKENS.accentDark, fontSize: 12, fontWeight: 600,
          flexShrink: 0, letterSpacing: '0.5px', transition: 'background 0.3s',
        }}>
          {fiscalYear}
        </div>

        {/* Month buttons */}
        <div style={{ display: 'flex', flex: 1, justifyContent: 'space-between' }}>
          {MONTHS.map((month) => {
            const data = mergedPayments[month.key];
            const status = data?.status || 'pending';
            const isForecast = data?.isForecast ?? true;
            const isSelected = selected === month.key;

            return (
              <button
                key={month.key}
                ref={el => monthRefs.current[month.key] = el}
                onClick={() => handleMonthClick(month.key)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '8px 10px', borderRadius: 10, border: 'none',
                  // Selected pill is teal; dot is purple
                  background: isSelected ? TOKENS.accent : 'transparent',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: isSelected ? 'white' : (isForecast ? TOKENS.textLight : TOKENS.textMuted),
                  transition: 'color 0.15s',
                }}>
                  {month.label}
                </span>
                {isSelected
                  ? <div style={{ width: 10, height: 10, borderRadius: '50%', background: TOKENS.purple }} />
                  : renderIndicator(status, isForecast)
                }
              </button>
            );
          })}
        </div>

        {/* YTD pill */}
        <button
          ref={ytdRef}
          onClick={handleYtdClick}
          style={{
            padding: '10px 18px', borderRadius: 20, border: 'none',
            background: selected === 'ytd' ? TOKENS.accent : TOKENS.gray,
            color: selected === 'ytd' ? 'white' : TOKENS.textMuted,
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.15s', flexShrink: 0,
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
          overflow: 'hidden', position: 'relative',
        }}>
          {/* Arrow — teal to match pill */}
          <div style={{
            position: 'absolute', top: 0, left: pointerX,
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderTop: `10px solid ${TOKENS.accent}`,
            transition: 'left 0.2s ease-out',
          }} />

          <div style={{ height: 1, background: TOKENS.gray, margin: '0 32px' }} />

          <div style={{ padding: '28px 32px' }}>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: TOKENS.accentDark }}>
                  {selected === 'ytd' ? `Year to date (${ytdData.count} months)` : activeMonth?.full}
                </h3>
                {activeIsForecast && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.6px',
                    textTransform: 'uppercase', color: TOKENS.textLight,
                    border: `1px solid ${TOKENS.gray}`, borderRadius: 4,
                    padding: '2px 6px',
                  }}>
                    Forecast
                  </span>
                )}
              </div>

              {/* Mark as paid — only on real (non-forecast) months */}
              {selected !== 'ytd' && !activeIsForecast && (
                <div style={{ position: 'relative' }} ref={dropdownRef}>
                  {(!activeData.status || activeData.status === 'pending') ? (
                    <button
                      onClick={() => setShowDropdown(s => !s)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '8px 14px', borderRadius: 8,
                        border: `1px solid ${TOKENS.gray}`, background: 'white',
                        fontSize: 13, fontWeight: 500, color: TOKENS.textMuted,
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      Mark as paid
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowDropdown(s => !s)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '6px 12px', borderRadius: 20, border: 'none',
                        background: activeData.status === 'ontime' ? `${TOKENS.accent}20` : `${TOKENS.late}20`,
                        fontSize: 12, fontWeight: 600,
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

                  {showDropdown && (
                    <div style={{
                      position: 'absolute', top: '100%', right: 0, marginTop: 6,
                      background: 'white', borderRadius: 12,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      padding: '6px 0', minWidth: 150, zIndex: 100,
                    }}>
                      <DropdownItem onClick={() => handleMarkAs('ontime')} color={TOKENS.accent}>Paid on time</DropdownItem>
                      <DropdownItem onClick={() => handleMarkAs('late')} color={TOKENS.late}>Paid late</DropdownItem>
                      <div style={{ height: 1, background: '#f0f0f0', margin: '4px 0' }} />
                      <DropdownItem onClick={() => handleMarkAs('pending')} muted>Clear</DropdownItem>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tribe cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
              <TribeTotal label="Business" value={activeData.business} colors={TRIBE_COLORS.business} />
              <TribeTotal label="Brand" value={activeData.brand} colors={TRIBE_COLORS.brand} />
              <TribeTotal label="Customer" value={activeData.customer} colors={TRIBE_COLORS.customer} />
            </div>

            {/* Summary row */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
              padding: '20px 0 0', borderTop: `1px solid ${TOKENS.gray}`,
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
      background: `${colors.bg}15`, borderRadius: 12,
      padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ width: 8, height: 32, borderRadius: 4, background: colors.bg }} />
      <div>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
          {label}
        </p>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1a1a1a' }}>
          ${value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function SummaryItem({ label, value, highlight }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: 22, fontWeight: 600, color: highlight ? '#00CEB4' : '#1a1a1a' }}>
        ${value.toLocaleString()}
        {highlight && <span style={{ fontSize: 13, fontWeight: 500, color: '#00CEB4', marginLeft: 4 }}>+GST</span>}
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
        display: 'flex', alignItems: 'center', gap: 8,
        width: '100%', padding: '10px 16px', border: 'none',
        background: hovered ? '#f8f9fa' : 'transparent',
        textAlign: 'left', fontSize: 13, fontWeight: 500,
        color: muted ? '#888' : '#1a1a1a',
        cursor: 'pointer', fontFamily: 'inherit',
      }}
    >
      {color && (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M3.5 8.5L6.5 11.5L12.5 5.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {children}
    </button>
  );
}
