/**
 * lib/wordpairs.js
 * Generates memorable two-word passcodes — e.g. "brave otter", "swift cedar"
 */

const ADJECTIVES = [
  'brave', 'swift', 'calm', 'bright', 'bold', 'clear', 'cool', 'warm',
  'soft', 'sharp', 'quiet', 'wild', 'free', 'proud', 'kind', 'wise',
  'fair', 'true', 'deep', 'fresh', 'glad', 'keen', 'neat', 'pure',
  'sure', 'trim', 'vast', 'zeal', 'agile', 'crisp',
];

const NOUNS = [
  'otter', 'maple', 'cedar', 'river', 'stone', 'crane', 'robin', 'ember',
  'frost', 'haven', 'ridge', 'grove', 'brook', 'falcon', 'amber', 'linden',
  'heath', 'wren', 'cliff', 'birch', 'coral', 'delta', 'finch', 'glade',
  'heron', 'inlet', 'junco', 'kelp', 'larch', 'moss',
];

export function generateWordPair() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj} ${noun}`;
}
