import { OpponentSkillLevel, SparringType } from '../types/sparring';

export const OPPONENT_SKILL_LEVELS: OpponentSkillLevel[] = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Professional',
];

export const SKILL_LEVEL_COLORS: Record<OpponentSkillLevel, string> = {
  Beginner: 'bg-success/20',
  Intermediate: 'bg-accent-blue/20',
  Advanced: 'bg-warning/20',
  Professional: 'bg-accent/20',
};

export const SKILL_LEVEL_TEXT_COLORS: Record<OpponentSkillLevel, string> = {
  Beginner: 'text-success',
  Intermediate: 'text-accent-blue',
  Advanced: 'text-warning',
  Professional: 'text-accent',
};

// Sparring type options
export const SPARRING_TYPES: Array<{ value: SparringType; label: string }> = [
  { value: 'mma', label: 'MMA / Mixed' },
  { value: 'striking', label: 'Striking (Boxing/MT/KB)' },
  { value: 'grappling', label: 'Grappling (BJJ/Wrestling)' },
];

// Dynamic rating categories per sparring type
export interface RatingCategory {
  key: string;
  label: string;
  shortLabel: string;
  color: string;
}

export const SPARRING_TYPE_CATEGORIES: Record<SparringType, RatingCategory[]> = {
  mma: [
    { key: 'striking', label: 'Striking', shortLabel: 'STR', color: '#ef4444' },
    { key: 'wrestling', label: 'Wrestling/Takedowns', shortLabel: 'WRS', color: '#f59e0b' },
    { key: 'grappling', label: 'Grappling/Ground Game', shortLabel: 'GRP', color: '#22c55e' },
    { key: 'defense', label: 'Defense', shortLabel: 'DEF', color: '#3b82f6' },
  ],
  striking: [
    { key: 'offense', label: 'Offense', shortLabel: 'OFF', color: '#ef4444' },
    { key: 'defense', label: 'Defense', shortLabel: 'DEF', color: '#3b82f6' },
    { key: 'footwork', label: 'Footwork/Movement', shortLabel: 'FTW', color: '#f59e0b' },
    { key: 'combinations', label: 'Combinations/Timing', shortLabel: 'CMB', color: '#22c55e' },
  ],
  grappling: [
    { key: 'takedowns_sweeps', label: 'Takedowns/Sweeps', shortLabel: 'TDS', color: '#f59e0b' },
    { key: 'top_control', label: 'Top Control/Passing', shortLabel: 'TOP', color: '#ef4444' },
    { key: 'submissions', label: 'Submissions', shortLabel: 'SUB', color: '#22c55e' },
    { key: 'escapes', label: 'Escapes/Defense', shortLabel: 'ESC', color: '#3b82f6' },
  ],
};

// Legacy constant kept for backward compat (used by old data display)
export const RATING_CATEGORIES = [
  { key: 'striking_offense', label: 'Striking Offense' },
  { key: 'striking_defense', label: 'Striking Defense' },
  { key: 'takedowns', label: 'Takedowns' },
  { key: 'ground_game', label: 'Ground Game' },
] as const;

export const RATING_COLORS: Record<string, string> = {
  // Legacy keys
  striking_offense: '#ef4444',
  striking_defense: '#3b82f6',
  takedowns: '#f59e0b',
  ground_game: '#22c55e',
  // MMA type keys
  striking: '#ef4444',
  wrestling: '#f59e0b',
  grappling: '#22c55e',
  defense: '#3b82f6',
  // Striking type keys
  offense: '#ef4444',
  footwork: '#f59e0b',
  combinations: '#22c55e',
  // Grappling type keys
  takedowns_sweeps: '#f59e0b',
  top_control: '#ef4444',
  submissions: '#22c55e',
  escapes: '#3b82f6',
};

export function getRatingColor(rating: number): string {
  if (rating >= 8) return '#22c55e'; // green - excellent
  if (rating >= 6) return '#3b82f6'; // blue - good
  if (rating >= 4) return '#f59e0b'; // orange - needs work
  return '#ef4444'; // red - focus area
}

/** Get the categories for a given sparring type */
export function getCategoriesForType(sparringType: SparringType): RatingCategory[] {
  return SPARRING_TYPE_CATEGORIES[sparringType];
}

/** Get category label from key and sparring type */
export function getCategoryLabel(key: string, sparringType: SparringType): string {
  const cats = SPARRING_TYPE_CATEGORIES[sparringType];
  const found = cats.find((c) => c.key === key);
  return found ? found.label : key;
}
