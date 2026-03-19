'use client';

import { TRIBE_CONFIG } from '../lib/utils';

/**
 * Avatar - Displays initials in a ring with tribe color
 * 
 * @param {string} name - Full name to extract initials from
 * @param {string} tribe - Tribe name for color
 * @param {number} size - Size in pixels (default: 40)
 */
export default function Avatar({ name, tribe, size = 40 }) {
  // Extract initials from name
  const initials = name
    ?.split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';

  const config = TRIBE_CONFIG[tribe] || { color: '#888' };
  
  // Use darker color for text on yellow/gold
  const textColor = tribe === 'Business' ? '#BA7517' : config.color;

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'white',
      border: `3px solid ${config.color}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      fontSize: size * 0.325,
      color: textColor,
      boxShadow: `0 2px 8px ${config.color}40`,
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}
