/**
 * Spaced Repetition System using simplified SM-2 algorithm
 *
 * Score mapping:
 * - 0 = Forgot (couldn't remember key points)
 * - 3 = Hard (remembered but struggled)
 * - 4 = Good (remembered well)
 * - 5 = Easy (knew it instantly)
 *
 * Interval progression: 1 day → 3 days → 7 days → 18 days → 45 days → etc.
 * Ease factor range: 1.3 - 5.0
 */

export interface NextReviewCalculation {
  interval: number; // Days until next review
  ease: number; // Updated ease factor
}

/**
 * Calculate next review interval and ease factor based on SM-2 algorithm
 *
 * @param currentInterval - Current interval in days
 * @param easeFactor - Current ease factor (1.3-5.0)
 * @param score - Review score (0, 3, 4, or 5)
 * @returns Object with next interval and updated ease factor
 */
export function calculateNextReview(
  currentInterval: number,
  easeFactor: number,
  score: 0 | 3 | 4 | 5
): NextReviewCalculation {
  // Score < 3 means review failed - reset interval to 1 day and decrease ease
  if (score < 3) {
    return {
      interval: 1,
      ease: Math.max(1.3, easeFactor - 0.2),
    };
  }

  // Calculate new ease factor based on score
  let newEase = easeFactor;

  if (score === 3) {
    // Hard - slight decrease in ease
    newEase = Math.max(1.3, easeFactor - 0.15);
  } else if (score === 5) {
    // Easy - increase ease
    newEase = Math.min(5.0, easeFactor + 0.15);
  }
  // score === 4 (Good) - maintain current ease

  // Calculate new interval
  let newInterval: number;

  if (currentInterval === 0) {
    // First review after learning
    newInterval = 1;
  } else if (currentInterval === 1) {
    // Second review
    newInterval = 3;
  } else {
    // Subsequent reviews - multiply by ease factor
    newInterval = Math.round(currentInterval * newEase);
  }

  // Bonus for "Easy" - accelerate interval growth
  if (score === 5) {
    newInterval = Math.round(newInterval * 1.3);
  }

  return {
    interval: newInterval,
    ease: newEase,
  };
}

/**
 * Determine mastery level based on review history
 *
 * Mastery levels:
 * - 0 = Not Started
 * - 1 = Learned (completed all 3 lessons)
 * - 2 = Reviewed (1 successful review, score >= 3)
 * - 3 = Practiced (3 successful reviews, score >= 3)
 * - 4 = Proficient (5 successful reviews, avg_score >= 4)
 * - 5 = Mastered (10 successful reviews, avg_score >= 4, max interval > 30 days)
 *
 * @param totalReviews - Total number of successful reviews (score >= 3)
 * @param avgReviewScore - Average review score
 * @param currentInterval - Current interval in days
 * @param completedAt - When all lessons were completed (null if not completed)
 * @returns Mastery level (0-5)
 */
export function calculateMasteryLevel(
  totalReviews: number,
  avgReviewScore: number,
  currentInterval: number,
  completedAt: string | null
): 0 | 1 | 2 | 3 | 4 | 5 {
  // Not started - lessons not completed
  if (!completedAt) {
    return 0;
  }

  // Learned - completed all 3 lessons but no reviews yet
  if (totalReviews === 0) {
    return 1;
  }

  // Mastered - 10+ reviews with good average and long intervals
  if (totalReviews >= 10 && avgReviewScore >= 4.0 && currentInterval > 30) {
    return 5;
  }

  // Proficient - 5+ reviews with good average
  if (totalReviews >= 5 && avgReviewScore >= 4.0) {
    return 4;
  }

  // Practiced - 3+ successful reviews
  if (totalReviews >= 3) {
    return 3;
  }

  // Reviewed - at least 1 successful review
  if (totalReviews >= 1) {
    return 2;
  }

  // Fallback to Learned
  return 1;
}

/**
 * Calculate the date for the next review
 *
 * @param intervalDays - Number of days until next review
 * @returns ISO date string (YYYY-MM-DD)
 */
export function calculateNextReviewDate(intervalDays: number): string {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);
  return nextDate.toISOString().split('T')[0];
}

/**
 * Check if a review is due today
 *
 * @param dueDate - Review due date (YYYY-MM-DD)
 * @returns True if review is due today or overdue
 */
export function isReviewDue(dueDate: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dueDate <= today;
}

/**
 * Get days until next review
 *
 * @param dueDate - Review due date (YYYY-MM-DD)
 * @returns Number of days (negative if overdue)
 */
export function getDaysUntilReview(dueDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
