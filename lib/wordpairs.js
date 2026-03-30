/**
 * lib/wordpairs.js
 * Generates memorable two-word passcodes — e.g. "brave otter", "swift falcon"
 */

import { randomInt } from 'crypto';

const ADJECTIVES = [
  'brave', 'swift', 'calm', 'bright', 'bold',
  'clear', 'cool', 'warm', 'soft', 'sharp',
  'quiet', 'wild', 'free', 'proud', 'kind',
  'wise', 'fair', 'true', 'deep', 'fresh',
  'glad', 'keen', 'neat', 'pure', 'sure',
  'quick', 'gentle', 'clever', 'steady', 'loyal',
  'noble', 'merry', 'lively', 'humble', 'eager',
  'golden', 'silver', 'rusty', 'dusty', 'misty',
  'sunny', 'stormy', 'frosty', 'lucky', 'plucky',
  'snappy', 'zippy', 'peppy', 'jolly', 'happy',
];

const ANIMALS = [
  'otter', 'falcon', 'robin', 'crane', 'heron',
  'finch', 'wren', 'hawk', 'owl', 'eagle',
  'fox', 'wolf', 'bear', 'deer', 'moose',
  'badger', 'beaver', 'rabbit', 'squirrel', 'hedgehog',
  'dolphin', 'whale', 'seal', 'penguin', 'puffin',
  'tiger', 'lion', 'panther', 'jaguar', 'leopard',
  'koala', 'panda', 'lemur', 'orca', 'manta',
  'salmon', 'trout', 'marlin', 'turtle', 'tortoise',
  'parrot', 'toucan', 'condor', 'osprey', 'kiwi',
  'bison', 'zebra', 'giraffe', 'hippo', 'rhino',
];

export function generateWordPair() {
  const adj = ADJECTIVES[randomInt(ADJECTIVES.length)];
  const animal = ANIMALS[randomInt(ANIMALS.length)];
  return `${adj} ${animal}`;
}
