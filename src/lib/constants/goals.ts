import { GoalCategory, GoalStatus } from '../types/metrics';

// ============================================================================
// GOAL CATEGORIES
// ============================================================================

export const GOAL_CATEGORIES: GoalCategory[] = [
  'weight',
  'cardio',
  'strength',
  'skill',
  'other',
];

// Category labels for display
export const GOAL_CATEGORY_LABELS: Record<GoalCategory, string> = {
  weight: 'Weight/Body Composition',
  cardio: 'Cardio/Conditioning',
  strength: 'Strength Training',
  skill: 'Skill Development',
  other: 'Other',
};

// Category colors for UI
export const GOAL_CATEGORY_COLORS: Record<GoalCategory, string> = {
  weight: 'bg-blue-500',
  cardio: 'bg-green-500',
  strength: 'bg-red-500',
  skill: 'bg-purple-500',
  other: 'bg-gray-500',
};

// Category text colors for badges
export const GOAL_CATEGORY_TEXT_COLORS: Record<GoalCategory, string> = {
  weight: 'text-blue-100',
  cardio: 'text-green-100',
  strength: 'text-red-100',
  skill: 'text-purple-100',
  other: 'text-gray-100',
};

// Category icons (Lucide icon names)
export const GOAL_CATEGORY_ICONS: Record<GoalCategory, string> = {
  weight: 'Scale',
  cardio: 'Heart',
  strength: 'Dumbbell',
  skill: 'Target',
  other: 'Star',
};

// ============================================================================
// GOAL STATUS
// ============================================================================

export const GOAL_STATUSES: GoalStatus[] = ['active', 'completed', 'abandoned'];

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  active: 'Active',
  completed: 'Completed',
  abandoned: 'Abandoned',
};

export const GOAL_STATUS_COLORS: Record<GoalStatus, string> = {
  active: 'bg-blue-500',
  completed: 'bg-green-500',
  abandoned: 'bg-gray-500',
};

// ============================================================================
// COMMON UNITS
// ============================================================================

// Weight units
export const WEIGHT_UNITS = ['lbs', 'kg'];

// Distance units
export const DISTANCE_UNITS = ['km', 'mi', 'm'];

// Time units
export const TIME_UNITS = ['min', 'sec', 'hours'];

// Repetition units
export const REP_UNITS = ['reps', 'sets', 'rounds'];

// All common units
export const COMMON_UNITS = [
  ...WEIGHT_UNITS,
  ...DISTANCE_UNITS,
  ...TIME_UNITS,
  ...REP_UNITS,
  '%', // For percentages (body fat, etc.)
];

// ============================================================================
// GOAL EXAMPLES BY CATEGORY
// ============================================================================

export const GOAL_EXAMPLES: Record<GoalCategory, string[]> = {
  weight: [
    'Reach 155 lbs by fight camp',
    'Maintain weight at 170 lbs',
    'Reduce body fat to 10%',
    'Gain 5 lbs of lean muscle',
  ],
  cardio: [
    'Run 5K under 25 minutes',
    'Complete 10 rounds of 3-minute bag work',
    'Maintain heart rate under 150 during sparring',
    'Bike 20 miles in under 1 hour',
  ],
  strength: [
    'Deadlift 2x bodyweight',
    'Bench press 225 lbs for 5 reps',
    'Complete 20 consecutive pull-ups',
    'Squat 315 lbs',
  ],
  skill: [
    'Master rear naked choke escape',
    'Land double leg takedown in sparring',
    'Improve jab speed and accuracy',
    'Complete blue belt in BJJ',
  ],
  other: [
    'Train 5 days per week consistently',
    'Complete fight camp without injury',
    'Compete in amateur tournament',
    'Improve flexibility (touch toes)',
  ],
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate progress percentage for a goal
 * @param currentValue - Current value
 * @param targetValue - Target value
 * @param startValue - Optional starting value (defaults to 0)
 * @returns Progress percentage (0-100+)
 */
export function calculateGoalProgress(
  currentValue: number | null | undefined,
  targetValue: number | null | undefined,
  startValue: number = 0
): number {
  if (currentValue === null || currentValue === undefined) return 0;
  if (targetValue === null || targetValue === undefined) return 0;

  const range = targetValue - startValue;
  if (range === 0) return 100; // Already at target

  const progress = ((currentValue - startValue) / range) * 100;
  return Math.round(Math.max(0, progress)); // Don't go below 0
}

/**
 * Calculate days remaining until target date
 * @param targetDate - Target date as ISO string
 * @returns Days remaining (negative if overdue, null if no target date)
 */
export function calculateDaysRemaining(targetDate: string | null | undefined): number | null {
  if (!targetDate) return null;

  const target = new Date(targetDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Check if a goal is overdue
 * @param targetDate - Target date as ISO string
 * @param status - Goal status
 * @returns True if the goal is overdue
 */
export function isGoalOverdue(targetDate: string | null | undefined, status: GoalStatus): boolean {
  if (status !== 'active') return false; // Only active goals can be overdue
  if (!targetDate) return false; // No target date means not overdue

  const daysRemaining = calculateDaysRemaining(targetDate);
  return daysRemaining !== null && daysRemaining < 0;
}

/**
 * Format days remaining as human-readable string
 * @param daysRemaining - Days remaining (can be negative)
 * @returns Formatted string like "5 days left" or "2 days overdue"
 */
export function formatDaysRemaining(daysRemaining: number | null): string {
  if (daysRemaining === null) return 'No deadline';
  if (daysRemaining === 0) return 'Due today';
  if (daysRemaining === 1) return '1 day left';
  if (daysRemaining > 1) return `${daysRemaining} days left`;
  if (daysRemaining === -1) return '1 day overdue';
  return `${Math.abs(daysRemaining)} days overdue`;
}

/**
 * Get progress bar color based on progress percentage
 * @param progress - Progress percentage (0-100+)
 * @returns Tailwind color class
 */
export function getProgressBarColor(progress: number): string {
  if (progress >= 100) return 'bg-green-500';
  if (progress >= 75) return 'bg-blue-500';
  if (progress >= 50) return 'bg-yellow-500';
  if (progress >= 25) return 'bg-orange-500';
  return 'bg-red-500';
}

/**
 * Get urgency level based on days remaining
 * @param daysRemaining - Days remaining (can be negative for overdue)
 * @returns Urgency level and color
 */
export function getGoalUrgency(daysRemaining: number | null): {
  level: 'overdue' | 'urgent' | 'soon' | 'normal' | 'none';
  color: string;
  textColor: string;
} {
  if (daysRemaining === null) {
    return { level: 'none', color: 'bg-gray-500', textColor: 'text-gray-400' };
  }

  if (daysRemaining < 0) {
    return { level: 'overdue', color: 'bg-red-500', textColor: 'text-red-400' };
  }

  if (daysRemaining <= 7) {
    return { level: 'urgent', color: 'bg-orange-500', textColor: 'text-orange-400' };
  }

  if (daysRemaining <= 30) {
    return { level: 'soon', color: 'bg-yellow-500', textColor: 'text-yellow-400' };
  }

  return { level: 'normal', color: 'bg-blue-500', textColor: 'text-blue-400' };
}
