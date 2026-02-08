import { OpponentSkillLevel } from '../types/sparring';

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

export const RATING_CATEGORIES = [
  { key: 'striking_offense', label: 'Striking Offense' },
  { key: 'striking_defense', label: 'Striking Defense' },
  { key: 'takedowns', label: 'Takedowns' },
  { key: 'ground_game', label: 'Ground Game' },
] as const;

export const RATING_COLORS = {
  striking_offense: '#ef4444', // red
  striking_defense: '#3b82f6', // blue
  takedowns: '#f59e0b', // orange
  ground_game: '#22c55e', // green
};

export function getRatingColor(rating: number): string {
  if (rating >= 8) return '#22c55e'; // green - excellent
  if (rating >= 6) return '#3b82f6'; // blue - good
  if (rating >= 4) return '#f59e0b'; // orange - needs work
  return '#ef4444'; // red - focus area
}
