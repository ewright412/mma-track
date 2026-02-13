import { DailyChallenge, TodaysChallengeWithCompletion } from '../types/challenge';
import { getAllChallenges, getTodaysCompletion } from '../supabase/challengeQueries';

/**
 * Deterministically selects today's challenge based on the current date.
 * All users see the same challenge on the same day.
 *
 * Uses days since epoch (app launch: 2026-02-12) to cycle through challenges.
 */
export function getTodaysChallengeIndex(totalChallenges: number): number {
  const epochDate = new Date('2026-02-12'); // App launch date
  const today = new Date();

  // Reset to midnight to ensure consistent calculation across timezones
  today.setHours(0, 0, 0, 0);
  epochDate.setHours(0, 0, 0, 0);

  const daysSinceEpoch = Math.floor(
    (today.getTime() - epochDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSinceEpoch % totalChallenges;
}

/**
 * Fetches all challenges and returns today's challenge with completion status
 */
export async function getTodaysChallenge(): Promise<{
  data: TodaysChallengeWithCompletion | null;
  error: Error | null;
}> {
  try {
    // Get all challenges
    const { data: challenges, error: challengesError } = await getAllChallenges();

    if (challengesError || !challenges || challenges.length === 0) {
      return {
        data: null,
        error: challengesError || new Error('No challenges found')
      };
    }

    // Get today's challenge index
    const todayIndex = getTodaysChallengeIndex(challenges.length);
    const todaysChallenge = challenges[todayIndex];

    // Check if user has completed today's challenge
    const { data: completion } = await getTodaysCompletion(todaysChallenge.id);

    return {
      data: {
        challenge: todaysChallenge,
        completed: !!completion,
        completion: completion || undefined,
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

/**
 * Gets the challenge for a specific date (used for history view)
 */
export function getChallengeForDate(
  dateStr: string,
  challenges: DailyChallenge[]
): DailyChallenge | null {
  if (!challenges || challenges.length === 0) {
    return null;
  }

  const epochDate = new Date('2026-02-12');
  const targetDate = new Date(dateStr);

  epochDate.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const daysSinceEpoch = Math.floor(
    (targetDate.getTime() - epochDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const index = daysSinceEpoch % challenges.length;
  return challenges[index];
}

/**
 * Returns difficulty badge color
 */
export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'Easy':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'Medium':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'Hard':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'Impossible':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

/**
 * Returns category badge color
 */
export function getCategoryColor(category: string): string {
  switch (category) {
    case 'Striking':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'Grappling':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'Conditioning':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'Technique':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'Mental':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

/**
 * Formats minutes to readable duration
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
