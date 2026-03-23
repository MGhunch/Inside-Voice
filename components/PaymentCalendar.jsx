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

// ─── Date Helpers ───────────────────────────────────────────────────────────

/**
 * Map a month key + fiscal year string to { year, month } (month 0-indexed)
 * FY26 = Jul 2025 – Jun 2026
 */
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

/**
 * Returns the month key for today within the given fiscal year, or null
 */
function getCurrentMonthKey(fiscalYear) {
  const now = new Date();
  for (const m of MONTHS) {
    const { year, month } = getFYMonthDate(m.key, fiscalYear);
    if (year === now.getFullYear() && month === now.getMonth()) return m.key;
  }
  return null;
}

/**
 * Check if a month is in the future (forecast)
 */
function isMonthForecast(monthKey, fiscalYear) {
  const { year, month } = getFYMonthDate(monthKey, fiscalYear);
  const now = new Date();
  return new Date(year, month, 1) > new Date(now.getFullYear(), now.getMonth(), 1);
}

/**
 * Parse a date string from Airtable (handles multiple formats)
 */
function parseDate(str) {
  if (!str) return null;
  
  // Fix known bad years
  let fixed = str
    .replace(/0205$/, '2025')
    .replace(/0325$/, '2025')
    .replace(/2002$/, '2026');
  
  // Try ISO format first: "2025-07-14" or "2025-07-14T00:00:00.000Z"
  const isoMatch = fixed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
  }
  
  // Try human format: "14 July 2025"
  const humanMatch = fixed.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
  if (humanMatch) {
    const months = {
      january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
      july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
    };
    const m = months[humanMatch[2].toLowerCase()];
    if (m !== undefined) {
      return new Date(parseInt(humanMatch[3]), m, parseInt(humanMatch[1]));
    }
  }
  
  return null;
}

// ─── Billing Calculations ───────────────────────────────────────────────────

/**
 * Get monthly billable for a person — uses Airtable's pre-calculated Billable field
 */
function getMonthlyBillable(person) {
  return person.billable || 0;
}

/**
 * Calculate monthly cost (what you pay out) — for margin display only
 */
function getMonthlyCost(person) {
  const ratio = person.hours / 40;
  const monthly = Math.round((person.salary / 12) * ratio);
  const ks = person.kiwiSaver ? Math.round(monthly * 0.035) : 0; // 3.5% KiwiSaver
  return monthly + ks + (person.allowances || 0);
}

/**
 * Calculate billing for a specific month from the team roster
 */
function calcMonthFromRoster(team, monthKey, fiscalYear) {
  if (!team || team.length === 0) return null;

  const { year, month } = getFYMonthDate(monthKey, fiscalYear);
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  let business = 0, brand = 0, customer = 0, marginTotal = 0, newStarters = 0;

  for (const person of team) {
    // Skip if status is Finished
    if (person.status === 'Finished') continue;
    
    const start = parseDate(person.startDate);
    const end = parseDate(person.endDate);

    // Skip if not yet started
    if (start && start > lastDay) continue;
    
    // Skip if already finished before this month
    if (end && end < firstDay) continue;

    // Calculate proration for partial months
    const activeStart = (!start || start < firstDay) ? firstDay : start;
    const activeEnd = (!end || end > lastDay) ? lastDay : end;
    
    // Skip if dates are backwards (data error)
    if (activeEnd < activeStart) continue;
    
    const activeDays = Math.round((activeEnd - activeStart) / (1000 * 60 * 60 * 24)) + 1;
    const proration = activeDays / daysInMonth;

    const monthlyBillable = Math.round(getMonthlyBillable(person) * proration);
    const monthlyCost = Math.round(getMonthlyCost(person) * proration);
    marginTotal += monthlyBillable - monthlyCost;

    const tribe = (person.tribe || '').toLowerCase();
    if (tribe === 'business') business += monthlyBillable;
    else if (tribe === 'brand') brand += monthlyBillable;
    else if (tribe === 'customer') customer += monthlyBillable;

    // Count new starters for setup fees
    if (start && start >= firstDay && start <= lastDay) newStarters++;
  }

  const fees = ADMIN_FEE + newStarters * SETUP_FEE;
  const total = business + brand + customer + fees;

  return { business, brand, customer, fees, margin: marginTotal, total };
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function PaymentCalendar({ fiscalYear = 'FY26', onPaymentChange }) {
  const [paymentStatuses, setPaymentStatuses] = useState({}); // month -> { id, status }
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [pointerX, setPointerX] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const monthRefs = useRef({});
  const ytdRef = useRef(null);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch payment statuses + ALL team members on mount
  useEffect(() => {
    async function load() {
      try {
        const [paymentsRes, teamRes] = await Promise.all([
          fetch(`/api/payments?fiscalYear=${fiscalYear}`),
          fetch('/api/team?all=true'), // Get ALL including Finished
        ]);
        
        if (paymentsRes.ok) {
          const payments = await paymentsRes.json();
          // Convert to lookup by month
          const statusMap = {};
          for (const p of payments) {
            statusMap[p.month] = { id: p.id, status: p.status };
          }
          setPaymentStatuses(statusMap);
        }
        
        if (teamRes.ok) {
          setTeam(await teamRes.json());
        }
      } catch (err) {
        console.error('Failed to load calendar data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fiscalYear]);

  // Calculate ALL months from roster
  const calculatedPayments = {};
  for (const m of MONTHS) {
    const amounts = calcMonthFromRoster(team, m.key, fiscalYear);
    if (amounts) {
      const status = paymentStatuses[m.key]?.status || 'pending';
      const isForecast = isMonthForecast(m.key, fiscalYear);
      calculatedPayments[m.key] = { ...amounts, status, isForecast };
    }
  }

  // YTD: sum of months up to and including current month
  const currentMonthKey = getCurrentMonthKey(fiscalYear);
  const currentMonthIndex = MONTHS.findIndex(m => m.key === currentMonthKey);
  
  const ytdData = MONTHS.reduce(
    (acc, m, index) => {
      const p = calculatedPayments[m.key];
      if (!p) return acc;
      
      // Only include months up to current month
      if (currentMonthIndex >= 0 && index > currentMonthIndex) return acc;
      
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

  // Close dropdown on outside click
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

  const handleMarkAs = async (newStatus) => {
    if (!selected || selected === 'ytd') return;
    
    const existing = paymentStatuses[selected];
    
    try {
      const res = await fetch('/api/payments', {
        method: existing?.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: existing?.id,
          month: selected,
          fiscalYear,
          status: newStatus,
        }),
      });
      
      if (res.ok) {
        const updated = await res.json();
        setPaymentStatuses(prev => ({
          ...prev,
          [selected]: { id: updated.id, status: updated.status },
        }));
        if (onPaymentChange) onPaymentChange();
      }
    } catch (err) {
      console.error('Failed to update payment status:', err);
    }
    
    setShowDropdown(false);
  };

  // Render helpers
  const renderIndicator = (status, isForecast) => {
    if (isForecast) {
      // Future months: small gray dot
      return <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ccc' }} />;
    }
    if (status === 'ontime') {
      // Paid: teal checkmark
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 7L6 10L11 4" stroke={TOKENS.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    if (status === 'late') {
      // Late: gold checkmark
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 7L6 10L11 4" stroke={TOKENS.late} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    // Pending: small gray dot
    return <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ccc' }} />;
  };

  const activeData = selected === 'ytd' ? ytdData : calculatedPayments[selected];
  const activeMonth = MONTHS.find(m => m.key === selected);
  const activeIsForecast = selected !== 'ytd' && activeData?.isForecast;

  if (loading) {
    return (
      <div style={{ background: TOKENS.gray, borderRadius: TOKENS.radius, padding: 20, textAlign: 'center' }}>
        <span style={{ color: TOKENS.textMuted, fontSize: 14 }}>Loading...</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ 
      fontFamily: TOKENS.font,
      background: 'white',
      borderRadius: TOKENS.radius,
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    }}>
      {/* Month selector row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: '#F4F4F6',
        padding: '16px 20px',
        borderRadius: selected ? `${TOKENS.radius}px ${TOKENS.radius}px 0 0` : TOKENS.radius,
        transition: 'border-radius 0.2s',
      }}>
        {/* FY pill on left */}
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: TOKENS.accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{fiscalYear}</span>
        </div>

        {/* Months spread across */}
        <div style={{ display: 'flex', flex: 1, justifyContent: 'space-between', padding: '0 24px' }}>
          {MONTHS.map((month) => {
            const data = calculatedPayments[month.key];
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
                  padding: isSelected ? '10px 14px' : '10px 8px', 
                  borderRadius: 12, 
                  border: 'none',
                  background: isSelected ? TOKENS.accent : 'transparent',
                  cursor: 'pointer', 
                  transition: 'all 0.15s',
                  minWidth: isSelected ? 44 : 'auto',
                }}
              >
                <span style={{
                  fontSize: 13, 
                  fontWeight: 600,
                  color: isSelected ? 'white' : (isForecast ? '#999' : '#333'),
                  transition: 'color 0.15s',
                }}>
                  {month.label}
                </span>
                {isSelected
                  ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />
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
            padding: '12px 20px', 
            borderRadius: 20, 
            border: 'none',
            background: selected === 'ytd' ? TOKENS.accent : '#E8E8EC',
            color: selected === 'ytd' ? 'white' : '#888',
            fontSize: 13, 
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
        <>
          {/* Dark arrow pointing down */}
          <div style={{
            position: 'relative',
            height: 12,
            background: '#F4F4F6',
          }}>
            <div style={{
              position: 'absolute',
              left: pointerX,
              transform: 'translateX(-50%)',
              width: 0, 
              height: 0,
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: `12px solid ${TOKENS.accent}`,
              transition: 'left 0.2s ease-out',
            }} />
          </div>
          
          <div style={{
            background: 'white',
            borderRadius: `0 0 ${TOKENS.radius}px ${TOKENS.radius}px`,
            overflow: 'hidden', 
            position: 'relative',
          }}>

            <div style={{ height: 1, background: TOKENS.gray, margin: '0 32px' }} />

          <div style={{ padding: '28px 32px', display: 'flex', justifyContent: 'center' }}>
            {/* Vertical breakdown card */}
            <div style={{ background: '#F8F8FA', borderRadius: 12, padding: '20px 28px', maxWidth: 500, width: '100%' }}>
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ 
                  fontSize: 20, 
                  fontWeight: 600, 
                  fontFamily: "'Outfit', sans-serif", 
                  color: TOKENS.accent 
                }}>
                  {selected === 'ytd' 
                    ? `Year to date` 
                    : `${activeMonth?.full} ${getFYMonthDate(selected, fiscalYear).year}`
                  }
                </span>

                {/* Status dropdown pill */}
                {selected !== 'ytd' && (
                  <div style={{ position: 'relative' }} ref={dropdownRef}>
                    <button
                      onClick={() => setShowDropdown(s => !s)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '6px 14px', borderRadius: 20, border: 'none',
                        background: activeIsForecast ? TOKENS.gray : (activeData.status === 'late' ? TOKENS.late : TOKENS.accent),
                        fontSize: 13, fontWeight: 500, 
                        color: activeIsForecast ? TOKENS.textMuted : 'white',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {activeIsForecast 
                        ? 'Forecast' 
                        : activeData.status === 'ontime' 
                          ? 'Paid' 
                          : activeData.status === 'late' 
                            ? 'Late' 
                            : 'Pending'
                      }
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M3 5L6 8L9 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    {showDropdown && (
                      <div style={{
                        position: 'absolute', top: '100%', right: 0, marginTop: 6,
                        background: 'white', borderRadius: 12,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        padding: '6px 0', minWidth: 150, zIndex: 100,
                      }}>
                        <DropdownItem onClick={() => handleMarkAs('ontime')} color={TOKENS.accent}>Paid</DropdownItem>
                        <DropdownItem onClick={() => handleMarkAs('late')} color={TOKENS.late}>Late</DropdownItem>
                        <div style={{ height: 1, background: '#f0f0f0', margin: '4px 0' }} />
                        <DropdownItem onClick={() => handleMarkAs('pending')} muted>Clear</DropdownItem>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Vertical breakdown rows */}
              <BreakdownRow label="Customer" value={activeData.customer} color={TOKENS.purple} />
              <BreakdownRow label="Brand" value={activeData.brand} color={TOKENS.accent} />
              <BreakdownRow label="Business" value={activeData.business} color={TRIBE_COLORS.business.bg} />
              <BreakdownRow label="Fees" value={activeData.fees} color="#B4B2A9" />
              <BreakdownRow label="Margin" value={activeData.margin} color="#B4B2A9" />
              
              {/* Total row */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '16px 0 4px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 4, height: 20, background: 'transparent', borderRadius: 2 }} />
                  <span style={{ fontSize: 16, fontWeight: 500, color: TOKENS.accent }}>Total</span>
                </div>
                <span style={{ fontSize: 24, fontWeight: 500, color: TOKENS.accent }}>
                  ${activeData.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}

function BreakdownRow({ label, value, color }) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '12px 0', 
      borderBottom: '0.5px solid #E8E8EC' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 4, height: 20, background: color, borderRadius: 2 }} />
        <span style={{ fontSize: 14, color: '#888' }}>{label}</span>
      </div>
      <span style={{ fontSize: 17, fontWeight: 500, color: '#1a1a1a' }}>
        ${value.toLocaleString()}
      </span>
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
