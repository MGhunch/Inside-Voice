/**
 * Shared utilities and constants for Inside Voice Admin
 */

// Design system colors
export const COLORS = {
  teal: '#00CEB4',
  tealDark: '#04342C',
  gold: '#FEC514',
  goldDark: '#412402',
  purple: '#584E9F',
  red: '#E24B4A',
  redLight: '#FCEBEB',
  redDark: '#791F1F',
};

// Tribe configuration
export const TRIBE_CONFIG = {
  Brand: { color: '#00CEB4', darkColor: '#04342C' },
  Customer: { color: '#584E9F', darkColor: '#ffffff' },
  Business: { color: '#FEC514', darkColor: '#412402' },
};

/**
 * Calculate monthly billable amount for a person
 * @param {Object} person - Person object with salary, hours, kiwiSaver, allowances, marginPercent
 * @returns {number} Monthly billable amount
 */
export function calcBillable(person) {
  const ratio = person.hours / 40;
  const monthly = Math.round((person.salary / 12) * ratio);
  const base = monthly + (person.allowances || 0); // Allowances in base
  const ks = person.kiwiSaver ? Math.round(base * 0.035) : 0; // KS on base
  const margin = Math.round(base * (person.marginPercent / 100)); // Margin on base
  return base + ks + margin;
}

/**
 * Calculate monthly salary (cost to company, not billable)
 * @param {Object} person - Person object
 * @returns {number} Monthly salary cost
 */
export function calcMonthlySalary(person) {
  const ratio = person.hours / 40;
  const monthly = Math.round((person.salary / 12) * ratio);
  const base = monthly + (person.allowances || 0); // Allowances in base
  const ks = person.kiwiSaver ? Math.round(base * 0.035) : 0; // KS on base
  return base + ks;
}

/**
 * Calculate tribe totals from people array
 * @param {Array} people - Array of person objects
 * @returns {Array} Array of { tribe, color, value, count } objects
 */
export function calcTribeTotals(people) {
  return Object.keys(TRIBE_CONFIG).map(tribe => {
    const tribePeople = people.filter(p => p.tribe === tribe);
    const total = tribePeople.reduce((sum, p) => sum + calcBillable(p), 0);
    return {
      tribe,
      color: TRIBE_CONFIG[tribe].color,
      value: total,
      count: tribePeople.length,
    };
  }).filter(t => t.count > 0);
}

/**
 * Format currency for display
 * @param {number} amount - Amount in dollars
 * @param {boolean} short - Use short format ($27k vs $27,000)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, short = false) {
  if (short && amount >= 1000) {
    return `$${Math.round(amount / 1000)}k`;
  }
  return `$${amount.toLocaleString()}`;
}
