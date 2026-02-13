import { supabase } from './client';
import {
  DailyChallenge,
  ChallengeCompletion,
  CreateChallengeCompletionInput,
  ChallengeStats,
} from '../types/challenge';

// ============================================================================
// READ - Daily Challenges (public, no auth needed)
// ============================================================================

export async function getAllChallenges(): Promise<{
  data: DailyChallenge[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('daily_challenges')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      return { data: null, error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

export async function getChallengeById(
  challengeId: string
): Promise<{ data: DailyChallenge | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (error || !data) {
      return { data: null, error: error || new Error('Challenge not found') };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

// ============================================================================
// CHALLENGE COMPLETIONS (authenticated)
// ============================================================================

export async function createChallengeCompletion(
  input: CreateChallengeCompletionInput
): Promise<{ data: ChallengeCompletion | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('challenge_completions')
      .insert({
        user_id: user.id,
        challenge_id: input.challenge_id,
        notes: input.notes || null,
      })
      .select()
      .single();

    if (error || !data) {
      return {
        data: null,
        error: error || new Error('Failed to create challenge completion'),
      };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

export async function getTodaysCompletion(
  challengeId: string
): Promise<{ data: ChallengeCompletion | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: null }; // Not an error, just not authenticated
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const { data, error } = await supabase
      .from('challenge_completions')
      .select('*')
      .eq('user_id', user.id)
      .eq('challenge_id', challengeId)
      .gte('completed_at', `${today}T00:00:00`)
      .lte('completed_at', `${today}T23:59:59`)
      .maybeSingle();

    if (error) {
      return { data: null, error };
    }

    return { data: data || null, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

export async function getUserCompletions(): Promise<{
  data: ChallengeCompletion[] | null;
  error: Error | null;
}> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('challenge_completions')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });

    if (error) {
      return { data: null, error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

// ============================================================================
// CHALLENGE STATS
// ============================================================================

export async function getChallengeStats(): Promise<{
  data: ChallengeStats | null;
  error: Error | null;
}> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    // Get all user completions with challenge details
    const { data: completions, error: completionsError } = await supabase
      .from('challenge_completions')
      .select('*, daily_challenges(category, points)')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });

    if (completionsError) {
      return { data: null, error: completionsError };
    }

    if (!completions || completions.length === 0) {
      return {
        data: {
          total_points: 0,
          current_streak: 0,
          completions_this_month: 0,
          most_completed_category: null,
          completed_dates: [],
        },
        error: null,
      };
    }

    // Calculate total points
    const total_points = completions.reduce((sum, completion) => {
      const challenge = completion.daily_challenges as unknown as { points: number };
      return sum + (challenge?.points || 0);
    }, 0);

    // Calculate current streak
    const uniqueDates = Array.from(
      new Set(
        completions.map((c) => new Date(c.completed_at).toISOString().split('T')[0])
      )
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let current_streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
      current_streak = 1;
      const startDate = uniqueDates.includes(today) ? today : yesterday;
      let checkDate = new Date(startDate);

      for (let i = 1; i < uniqueDates.length; i++) {
        checkDate = new Date(checkDate.getTime() - 86400000);
        const checkDateStr = checkDate.toISOString().split('T')[0];
        if (uniqueDates.includes(checkDateStr)) {
          current_streak++;
        } else {
          break;
        }
      }
    }

    // Completions this month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const completions_this_month = completions.filter(
      (c) => new Date(c.completed_at) >= firstDayOfMonth
    ).length;

    // Most completed category
    const categoryCount: Record<string, number> = {};
    completions.forEach((completion) => {
      const challenge = completion.daily_challenges as unknown as { category: string };
      const category = challenge?.category;
      if (category) {
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      }
    });

    let most_completed_category: string | null = null;
    let maxCount = 0;
    Object.entries(categoryCount).forEach(([category, count]) => {
      if (count > maxCount) {
        maxCount = count;
        most_completed_category = category;
      }
    });

    return {
      data: {
        total_points,
        current_streak,
        completions_this_month,
        most_completed_category,
        completed_dates: uniqueDates,
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

// ============================================================================
// RECENT CHALLENGES (last 7 days)
// ============================================================================

export async function getRecentChallengesWithCompletion(
  challenges: DailyChallenge[]
): Promise<{
  data: Array<{
    date: string;
    challenge: DailyChallenge;
    completed: boolean;
  }> | null;
  error: Error | null;
}> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Get last 7 days
    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    // Get user completions if authenticated
    let completionDates: Set<string> = new Set();
    if (!authError && user) {
      const { data: completions } = await supabase
        .from('challenge_completions')
        .select('completed_at, challenge_id')
        .eq('user_id', user.id)
        .gte('completed_at', `${last7Days[0]}T00:00:00`);

      if (completions) {
        completions.forEach((c) => {
          const dateStr = new Date(c.completed_at).toISOString().split('T')[0];
          completionDates.add(`${dateStr}-${c.challenge_id}`);
        });
      }
    }

    // Map each day to its challenge
    const result = last7Days.map((dateStr, index) => {
      const challengeIndex = getChallengeIndexForDate(dateStr, challenges.length);
      const challenge = challenges[challengeIndex];
      const completed = completionDates.has(`${dateStr}-${challenge.id}`);

      return {
        date: dateStr,
        challenge,
        completed,
      };
    });

    return { data: result, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getChallengeIndexForDate(dateStr: string, totalChallenges: number): number {
  const epochDate = new Date('2026-02-12'); // App launch date
  const targetDate = new Date(dateStr);
  const daysSinceEpoch = Math.floor(
    (targetDate.getTime() - epochDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysSinceEpoch % totalChallenges;
}
