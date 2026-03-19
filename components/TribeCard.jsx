'use client';

/**
 * TribeCard - Displays a tribe summary with hover effect
 * 
 * @param {string} tribe - Tribe name
 * @param {string} color - Tribe color hex
 * @param {number} value - Total billable amount
 * @param {number} count - Number of people
 * @param {function} onClick - Optional click handler
 */
export default function TribeCard({ tribe, color, value, count, onClick, isActive }) {
  return (
    <div 
      onClick={onClick}
      style={{
        background: isActive ? `${color}10` : '#fafafa',
        borderRadius: 16,
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: onClick ? 'pointer' : 'default',
        outline: isActive ? `1.5px solid ${color}40` : 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateX(4px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Color dot */}
      <div style={{ 
        width: 14, 
        height: 14, 
        borderRadius: '50%', 
        background: color,
        boxShadow: `0 2px 8px ${color}40`
      }}/>
      
      {/* Tribe info */}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, color: '#888', margin: 0 }}>{tribe}</p>
        <p style={{ fontSize: 24, fontWeight: 600, margin: 0, color: '#1a1a1a' }}>
          ${value.toLocaleString()}
        </p>
      </div>
      
      {/* People count — icon + number */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <span style={{ fontSize: 22, fontWeight: 500, color, lineHeight: 1 }}>
          {count}
        </span>
      </div>
    </div>
  );
}
