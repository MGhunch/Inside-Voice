'use client';

import { TRIBE_CONFIG, calcBillable, calcMonthlySalary } from '../lib/utils';
import Avatar from './Avatar';

/**
 * PeopleTable - Displays a table of people with click to edit
 * 
 * @param {Array} people - Array of person objects
 * @param {function} onPersonClick - Called when a row is clicked
 */
export default function PeopleTable({ people, onPersonClick, activeTribe, onTribeChange, view = 'spark' }) {
  const tribes = ['All', ...Object.keys(TRIBE_CONFIG)];
  const filtered = activeTribe === 'All' ? people : people.filter(p => p.tribe === activeTribe);

  return (
    <div style={{
      background: 'white',
      borderRadius: 24,
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
    }}>
      {/* Tribe filter pills */}
      <div style={{ padding: '20px 32px', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: 8 }}>
        {tribes.map(tribe => {
          const isActive = activeTribe === tribe;
          const color = TRIBE_CONFIG[tribe]?.color;
          const textColor = tribe === 'Business' && isActive ? '#BA7517' : isActive ? color : '#888';
          return (
            <button
              key={tribe}
              onClick={() => onTribeChange(tribe)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: isActive
                  ? tribe === 'All' ? '#EBEBEB' : `${color}18`
                  : 'transparent',
                color: isActive
                  ? tribe === 'All' ? '#1a1a1a' : textColor
                  : '#888',
              }}
            >
              {tribe}
            </button>
          );
        })}
      </div>
      
      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
            <th style={headerStyle}>Name</th>
            <th style={headerStyle}>Role</th>
            <th style={headerStyle}>Tribe</th>
            <th style={headerStyle}>Status</th>
            <th style={{ ...headerStyle, textAlign: 'center' }}>Hours</th>
            <th style={{ ...headerStyle, textAlign: 'right' }}>Salary</th>
            <th style={{ ...headerStyle, textAlign: 'right' }}>Billable</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((person, i) => (
            <tr 
              key={person.id}
              onClick={() => onPersonClick?.(person)}
              style={{ 
                borderBottom: i < filtered.length - 1 ? '1px solid #f8f8f8' : 'none',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Name with Avatar */}
              <td style={{ padding: '16px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Avatar name={person.name} tribe={person.tribe} size={40} />
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#1a1a1a' }}>
                    {person.name}
                  </span>
                </div>
              </td>
              
              {/* Role */}
              <td style={{ padding: '16px 24px', fontSize: 14, color: '#666' }}>
                {person.jobTitle}
              </td>
              
              {/* Tribe badge */}
              <td style={{ padding: '16px 24px' }}>
                <TribeBadge tribe={person.tribe} />
              </td>
              
              {/* Status badge */}
              <td style={{ padding: '16px 24px' }}>
                <StatusBadge status={person.status} />
              </td>
              
              {/* Hours */}
              <td style={{ padding: '16px 24px', fontSize: 14, color: '#666', textAlign: 'center' }}>
                {person.hours}
              </td>

              {/* Salary — annual, rounded */}
              <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                <span style={{ fontSize: 15, fontWeight: 500, color: '#1a1a1a' }}>
                  ${Math.round(person.salary / 1000)}k
                </span>
              </td>
              
              {/* Billable */}
              <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#00CEB4' }}>
                  ${calcBillable(person).toLocaleString()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Tribe badge sub-component
function TribeBadge({ tribe }) {
  const config = TRIBE_CONFIG[tribe];
  if (!config) return null;
  
  // Use darker text for gold/yellow
  const textColor = tribe === 'Business' ? '#BA7517' : config.color;
  
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 12,
      fontWeight: 500,
      color: textColor,
      background: `${config.color}15`,
      padding: '5px 10px',
      borderRadius: 16,
    }}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: config.color,
      }}/>
      {tribe}
    </span>
  );
}

// Status badge sub-component
function StatusBadge({ status }) {
  const isFinishing = status === 'Finishing';
  
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: 12,
      fontWeight: 500,
      color: isFinishing ? '#BA7517' : '#666',
      background: isFinishing ? '#FEC51420' : '#E8E8EC',
      padding: '5px 10px',
      borderRadius: 16,
    }}>
      {status}
    </span>
  );
}

// Shared header style
const headerStyle = {
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 500,
  color: '#888',
  padding: '16px 24px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};
