import { supabase } from './client';
import {
  SparringSession,
  SparringSessionWithRounds,
  CreateSparringSessionInput,
  UpdateSparringSessionInput,
  SparringSessionFilters,
  SparringStats,
  SparringTrendData,
  FocusArea,
  SparringRound,
  OpponentSkillLevel,
} from '../types/sparring';

// ============================================================================
// CREATE
// ============================================================================

/**
 * Creates a new sparring session with rounds
 */
export async function createSparringSession(
  input: CreateSparringSessionInput
): Promise<{ data: SparringSessionWithRounds | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    // Insert sparring session
    const { data: session, error: sessionError } = await supabase
      .from('sparring_sessions')
      .insert({
        user_id: user.id,
        session_date: input.session_date,
        total_rounds: input.total_rounds,
        opponent_skill_level: input.opponent_skill_level,
        notes: input.notes || null,
        what_went_well: input.what_went_well || null,
        what_to_improve: input.what_to_improve || null,
      })
      .select()
      .single();

    if (sessionError || !session) {
      return { data: null, error: sessionError || new Error('Failed to create session') };
    }

    // Insert rounds
    let rounds: SparringRound[] = [];
    if (input.rounds && input.rounds.length > 0) {
      const roundsData = input.rounds.map((round) => ({
        session_id: session.id,
        round_number: round.round_number,
        striking_offense: round.striking_offense,
        striking_defense: round.striking_defense,
        takedowns: round.takedowns,
        ground_game: round.ground_game,
        notes: round.notes || null,
      }));

      const { data: insertedRounds, error: roundsError } = await supabase
        .from('sparring_rounds')
        .insert(roundsData)
        .select();

      if (roundsError) {
        console.error('Failed to insert rounds:', roundsError);
      } else {
        rounds = insertedRounds || [];
      }
    }

    return {
      data: {
        ...session,
        rounds,
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
// READ
// ============================================================================

/**
 * Gets all sparring sessions for the current user with optional filters
 */
export async function getSparringSessions(
  filters?: SparringSessionFilters
): Promise<{ data: SparringSession[] | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    let query = supabase
      .from('sparring_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('session_date', { ascending: false });

    if (filters) {
      if (filters.opponent_skill_level) {
        if (Array.isArray(filters.opponent_skill_level)) {
          query = query.in('opponent_skill_level', filters.opponent_skill_level);
        } else {
          query = query.eq('opponent_skill_level', filters.opponent_skill_level);
        }
      }

      if (filters.startDate) {
        query = query.gte('session_date', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('session_date', filters.endDate);
      }
    }

    const { data, error } = await query;

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

/**
 * Gets a single sparring session by ID with rounds
 */
export async function getSparringSessionById(
  sessionId: string
): Promise<{ data: SparringSessionWithRounds | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data: session, error: sessionError } = await supabase
      .from('sparring_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return { data: null, error: sessionError || new Error('Session not found') };
    }

    const { data: rounds, error: roundsError } = await supabase
      .from('sparring_rounds')
      .select('*')
      .eq('session_id', sessionId)
      .order('round_number', { ascending: true });

    if (roundsError) {
      return { data: null, error: roundsError };
    }

    return {
      data: {
        ...session,
        rounds: rounds || [],
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
 * Calculates sparring statistics for the current user
 */
export async function getSparringStats(): Promise<{
  data: SparringStats | null;
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

    const { data: sessions, error: sessionsError } = await supabase
      .from('sparring_sessions')
      .select('*, sparring_rounds(*)')
      .eq('user_id', user.id);

    if (sessionsError) {
      return { data: null, error: sessionsError };
    }

    if (!sessions || sessions.length === 0) {
      return {
        data: {
          totalSessions: 0,
          totalRounds: 0,
          averageRatings: {
            striking_offense: 0,
            striking_defense: 0,
            takedowns: 0,
            ground_game: 0,
          },
          sessionsByOpponentLevel: {
            Beginner: 0,
            Intermediate: 0,
            Advanced: 0,
            Professional: 0,
          },
        },
        error: null,
      };
    }

    const totalSessions = sessions.length;
    let totalRounds = 0;
    let sumStrikingOffense = 0;
    let sumStrikingDefense = 0;
    let sumTakedowns = 0;
    let sumGroundGame = 0;

    const sessionsByOpponentLevel: Record<OpponentSkillLevel, number> = {
      Beginner: 0,
      Intermediate: 0,
      Advanced: 0,
      Professional: 0,
    };

    sessions.forEach((session: any) => {
      sessionsByOpponentLevel[session.opponent_skill_level as OpponentSkillLevel]++;

      if (session.sparring_rounds && session.sparring_rounds.length > 0) {
        session.sparring_rounds.forEach((round: any) => {
          totalRounds++;
          sumStrikingOffense += round.striking_offense;
          sumStrikingDefense += round.striking_defense;
          sumTakedowns += round.takedowns;
          sumGroundGame += round.ground_game;
        });
      }
    });

    return {
      data: {
        totalSessions,
        totalRounds,
        averageRatings: {
          striking_offense: totalRounds > 0 ? Math.round((sumStrikingOffense / totalRounds) * 10) / 10 : 0,
          striking_defense: totalRounds > 0 ? Math.round((sumStrikingDefense / totalRounds) * 10) / 10 : 0,
          takedowns: totalRounds > 0 ? Math.round((sumTakedowns / totalRounds) * 10) / 10 : 0,
          ground_game: totalRounds > 0 ? Math.round((sumGroundGame / totalRounds) * 10) / 10 : 0,
        },
        sessionsByOpponentLevel,
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
 * Gets trend data for sparring ratings over time
 */
export async function getSparringTrends(
  limit: number = 10
): Promise<{ data: SparringTrendData[] | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data: sessions, error } = await supabase
      .from('sparring_sessions')
      .select('session_date, sparring_rounds(*)')
      .eq('user_id', user.id)
      .order('session_date', { ascending: true })
      .limit(limit);

    if (error) {
      return { data: null, error };
    }

    if (!sessions || sessions.length === 0) {
      return { data: [], error: null };
    }

    const trendData: SparringTrendData[] = sessions.map((session: any) => {
      const rounds = session.sparring_rounds || [];
      const roundCount = rounds.length;

      return {
        date: session.session_date,
        striking_offense: roundCount > 0
          ? Math.round((rounds.reduce((sum: number, r: any) => sum + r.striking_offense, 0) / roundCount) * 10) / 10
          : 0,
        striking_defense: roundCount > 0
          ? Math.round((rounds.reduce((sum: number, r: any) => sum + r.striking_defense, 0) / roundCount) * 10) / 10
          : 0,
        takedowns: roundCount > 0
          ? Math.round((rounds.reduce((sum: number, r: any) => sum + r.takedowns, 0) / roundCount) * 10) / 10
          : 0,
        ground_game: roundCount > 0
          ? Math.round((rounds.reduce((sum: number, r: any) => sum + r.ground_game, 0) / roundCount) * 10) / 10
          : 0,
      };
    });

    return { data: trendData, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

/**
 * Detects focus areas based on rating patterns
 */
export async function detectFocusAreas(): Promise<{
  data: FocusArea[] | null;
  error: Error | null;
}> {
  try {
    const { data: stats, error: statsError } = await getSparringStats();

    if (statsError || !stats) {
      return { data: null, error: statsError };
    }

    const { data: trends, error: trendsError } = await getSparringTrends(5);

    if (trendsError) {
      return { data: null, error: trendsError };
    }

    const focusAreas: FocusArea[] = [];

    // Analyze each category
    const categories = [
      { key: 'striking_offense' as const, label: 'Striking Offense' },
      { key: 'striking_defense' as const, label: 'Striking Defense' },
      { key: 'takedowns' as const, label: 'Takedowns' },
      { key: 'ground_game' as const, label: 'Ground Game' },
    ];

    categories.forEach((category) => {
      const avgRating = stats.averageRatings[category.key];

      // Calculate trend
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (trends && trends.length >= 2) {
        const recentAvg = trends.slice(-2).reduce((sum, t) => sum + t[category.key], 0) / 2;
        const olderAvg = trends.slice(0, 2).reduce((sum, t) => sum + t[category.key], 0) / 2;

        if (recentAvg > olderAvg + 0.5) trend = 'improving';
        else if (recentAvg < olderAvg - 0.5) trend = 'declining';
      }

      // Determine priority and message
      let priority: 'high' | 'medium' | 'low' = 'low';
      let message = '';

      if (avgRating < 4) {
        priority = 'high';
        message = `Your ${category.label.toLowerCase()} needs significant improvement (avg ${avgRating}/10)`;
      } else if (avgRating < 6) {
        priority = 'medium';
        message = `Focus on improving ${category.label.toLowerCase()} (avg ${avgRating}/10)`;
      } else if (avgRating >= 8) {
        priority = 'low';
        message = `Strong ${category.label.toLowerCase()} - keep it up! (avg ${avgRating}/10)`;
      } else {
        priority = 'low';
        message = `Good ${category.label.toLowerCase()} - room for growth (avg ${avgRating}/10)`;
      }

      if (trend === 'declining' && priority !== 'high') {
        priority = 'medium';
        message += ' - showing a declining trend';
      } else if (trend === 'improving') {
        message += ' - improving!';
      }

      focusAreas.push({
        category: category.key,
        categoryLabel: category.label,
        averageRating: avgRating,
        trend,
        message,
        priority,
      });
    });

    // Sort by priority (high first)
    focusAreas.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return { data: focusAreas, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Updates an existing sparring session
 */
export async function updateSparringSession(
  sessionId: string,
  input: UpdateSparringSessionInput
): Promise<{ data: SparringSession | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('sparring_sessions')
      .update(input)
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

/**
 * Updates rounds for a sparring session (replaces all existing rounds)
 */
export async function updateSparringRounds(
  sessionId: string,
  rounds: Array<{
    round_number: number;
    striking_offense: number;
    striking_defense: number;
    takedowns: number;
    ground_game: number;
    notes?: string;
  }>
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: new Error('Not authenticated') };
    }

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('sparring_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return { success: false, error: new Error('Session not found or access denied') };
    }

    // Delete existing rounds
    const { error: deleteError } = await supabase
      .from('sparring_rounds')
      .delete()
      .eq('session_id', sessionId);

    if (deleteError) {
      return { success: false, error: deleteError };
    }

    // Insert new rounds
    if (rounds.length > 0) {
      const roundsData = rounds.map((round) => ({
        session_id: sessionId,
        round_number: round.round_number,
        striking_offense: round.striking_offense,
        striking_defense: round.striking_defense,
        takedowns: round.takedowns,
        ground_game: round.ground_game,
        notes: round.notes || null,
      }));

      const { error: insertError } = await supabase
        .from('sparring_rounds')
        .insert(roundsData);

      if (insertError) {
        return { success: false, error: insertError };
      }
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

// ============================================================================
// DELETE
// ============================================================================

/**
 * Deletes a sparring session (rounds are cascade deleted)
 */
export async function deleteSparringSession(
  sessionId: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: new Error('Not authenticated') };
    }

    const { error } = await supabase
      .from('sparring_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (error) {
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}
