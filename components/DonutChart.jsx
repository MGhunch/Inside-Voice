'use client';

/**
 * DonutChart - Displays a donut chart with multiple segments
 * 
 * @param {Array} data - Array of { color, value } objects
 * @param {number} total - Total value for calculating percentages
 * @param {number} size - Width/height in pixels (default: 220)
 */
export default function DonutChart({ data, total, centerTotal, size = 220 }) {
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  
  let currentOffset = 0;
  const segments = data.map(item => {
    const percentage = item.value / total;
    const dashArray = percentage * circumference;
    const segment = {
      ...item,
      dashArray,
      dashOffset: -currentOffset,
    };
    currentOffset += dashArray;
    return segment;
  });

  const displayValue = centerTotal ?? total;
  const displayTotal = displayValue >= 1000
    ? `$${Math.round(displayValue / 1000)}k`
    : `$${displayValue}`;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="100" cy="100" r={radius} fill="none" stroke="#e8e8ec" strokeWidth="22" />
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="22"
            strokeDasharray={`${seg.dashArray} ${circumference}`}
            strokeDashoffset={seg.dashOffset}
            strokeLinecap="round"
            style={{ transition: 'all 0.5s ease' }}
          />
        ))}
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <p style={{ fontSize: 36, fontWeight: 600, margin: 0, color: '#1a1a1a' }}>
          {displayTotal}
        </p>
        <p style={{ fontSize: 12, color: '#aaa', margin: '4px 0 0', letterSpacing: '0.02em' }}>March 2026</p>
      </div>
    </div>
  );
}
