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
  SparringType,
  OpponentSkillLevel,
} from '../types/sparring';
import { SPARRING_TYPE_CATEGORIES } from '../constants/sparring';

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Normalizes a round row from the DB into our SparringRound type.
 * Legacy rows have fixed columns but no ratings JSONB — we build ratings from them.
 */
function normalizeRound(row: Record<string, unknown>, sessionType: SparringType): SparringRound {
  let ratings = row.ratings as Record<string, number> | null;

  // If no JSONB ratings, build from legacy columns (old MMA sessions)
  if (!ratings) {
    ratings = {
      striking: (row.striking_offense as number) ?? 5,
      wrestling: (row.takedowns as number) ?? 5,
      grappling: (row.ground_game as number) ?? 5,
      defense: (row.striking_defense as number) ?? 5,
    };
  }

  return {
    id: row.id as string,
    session_id: row.session_id as string,
    round_number: row.round_number as number,
    ratings,
    striking_offense: (row.striking_offense as number | null) ?? null,
    striking_defense: (row.striking_defense as number | null) ?? null,
    takedowns: (row.takedowns as number | null) ?? null,
    ground_game: (row.ground_game as number | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    created_at: row.created_at as string,
  };
}

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
        sparring_type: input.sparring_type,
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

    // Insert rounds with JSONB ratings
    let rounds: SparringRound[] = [];
    if (input.rounds && input.rounds.length > 0) {
      const roundsData = input.rounds.map((round) => ({
        session_id: session.id,
        round_number: round.round_number,
        ratings: round.ratings,
        notes: round.notes || null,
      }));

      const { data: insertedRounds, error: roundsError } = await supabase
        .from('sparring_rounds')
        .insert(roundsData)
        .select();

      if (roundsError) {
        console.error('Failed to insert rounds:', roundsError);
      } else if (insertedRounds) {
        rounds = insertedRounds.map((r: Record<string, unknown>) =>
          normalizeRound(r, input.sparring_type)
        );
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

      if (filters.sparring_type) {
        query = query.eq('sparring_type', filters.sparring_type);
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

    const sparringType = (session.sparring_type as SparringType) || 'mma';

    return {
      data: {
        ...session,
        sparring_type: sparringType,
        rounds: (rounds || []).map((r: Record<string, unknown>) =>
          normalizeRound(r, sparringType)
        ),
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
          averageRatings: {},
          sessionsByOpponentLevel: {
            Beginner: 0,
            Intermediate: 0,
            Advanced: 0,
            Professional: 0,
          },
          sessionsBySparringType: {
            mma: 0,
            striking: 0,
            grappling: 0,
          },
        },
        error: null,
      };
    }

    const totalSessions = sessions.length;
    let totalRounds = 0;

    // Accumulate sums per category key across all rounds
    const ratingSums: Record<string, number> = {};
    const ratingCounts: Record<string, number> = {};

    const sessionsByOpponentLevel: Record<OpponentSkillLevel, number> = {
      Beginner: 0,
      Intermediate: 0,
      Advanced: 0,
      Professional: 0,
    };

    const sessionsBySparringType: Record<SparringType, number> = {
      mma: 0,
      striking: 0,
      grappling: 0,
    };

    sessions.forEach((session: Record<string, unknown>) => {
      const oppLevel = session.opponent_skill_level as OpponentSkillLevel;
      sessionsByOpponentLevel[oppLevel]++;

      const sparringType = (session.sparring_type as SparringType) || 'mma';
      sessionsBySparringType[sparringType]++;

      const rawRounds = session.sparring_rounds as Record<string, unknown>[] | null;
      if (rawRounds && rawRounds.length > 0) {
        rawRounds.forEach((rawRound) => {
          totalRounds++;
          const round = normalizeRound(rawRound, sparringType);
          for (const [key, value] of Object.entries(round.ratings)) {
            ratingSums[key] = (ratingSums[key] || 0) + value;
            ratingCounts[key] = (ratingCounts[key] || 0) + 1;
          }
        });
      }
    });

    const averageRatings: Record<string, number> = {};
    for (const key of Object.keys(ratingSums)) {
      averageRatings[key] = Math.round((ratingSums[key] / ratingCounts[key]) * 10) / 10;
    }

    return {
      data: {
        totalSessions,
        totalRounds,
        averageRatings,
        sessionsByOpponentLevel,
        sessionsBySparringType,
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
      .select('session_date, sparring_type, sparring_rounds(*)')
      .eq('user_id', user.id)
      .order('session_date', { ascending: true })
      .limit(limit);

    if (error) {
      return { data: null, error };
    }

    if (!sessions || sessions.length === 0) {
      return { data: [], error: null };
    }

    const trendData: SparringTrendData[] = sessions.map((session: Record<string, unknown>) => {
      const sparringType = (session.sparring_type as SparringType) || 'mma';
      const rawRounds = session.sparring_rounds as Record<string, unknown>[] | null;
      const rounds = (rawRounds || []).map((r) => normalizeRound(r, sparringType));
      const roundCount = rounds.length;

      // Average ratings across rounds for this session
      const avgRatings: Record<string, number> = {};
      if (roundCount > 0) {
        const sums: Record<string, number> = {};
        rounds.forEach((round) => {
          for (const [key, value] of Object.entries(round.ratings)) {
            sums[key] = (sums[key] || 0) + value;
          }
        });
        for (const key of Object.keys(sums)) {
          avgRatings[key] = Math.round((sums[key] / roundCount) * 10) / 10;
        }
      }

      return {
        date: session.session_date as string,
        sparring_type: sparringType,
        ratings: avgRatings,
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
 * Detects focus areas based on rating patterns.
 * Groups by sparring type and analyzes categories within each type.
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

    // Determine which sparring type the user does most, and analyze those categories
    const primaryType: SparringType =
      stats.sessionsBySparringType.mma >= stats.sessionsBySparringType.striking &&
      stats.sessionsBySparringType.mma >= stats.sessionsBySparringType.grappling
        ? 'mma'
        : stats.sessionsBySparringType.striking >= stats.sessionsBySparringType.grappling
        ? 'striking'
        : 'grappling';

    // Analyze all category keys that appear in averageRatings
    // Map them to labels using the primary type's categories, falling back to all types
    const allCategories = [
      ...SPARRING_TYPE_CATEGORIES.mma,
      ...SPARRING_TYPE_CATEGORIES.striking,
      ...SPARRING_TYPE_CATEGORIES.grappling,
    ];

    for (const [key, avgRating] of Object.entries(stats.averageRatings)) {
      const catDef = allCategories.find((c) => c.key === key);
      const categoryLabel = catDef ? catDef.label : key;

      // Calculate trend from recent data
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (trends && trends.length >= 2) {
        const recentSessions = trends.slice(-2);
        const olderSessions = trends.slice(0, 2);

        const recentAvg =
          recentSessions.reduce((sum, t) => sum + (t.ratings[key] || 0), 0) /
          recentSessions.filter((t) => t.ratings[key] !== undefined).length || 0;
        const olderAvg =
          olderSessions.reduce((sum, t) => sum + (t.ratings[key] || 0), 0) /
          olderSessions.filter((t) => t.ratings[key] !== undefined).length || 0;

        if (recentAvg && olderAvg) {
          if (recentAvg > olderAvg + 0.5) trend = 'improving';
          else if (recentAvg < olderAvg - 0.5) trend = 'declining';
        }
      }

      // Determine priority and message
      let priority: 'high' | 'medium' | 'low' = 'low';
      let message = '';

      if (avgRating < 4) {
        priority = 'high';
        message = `Your ${categoryLabel.toLowerCase()} needs significant improvement (avg ${avgRating}/10)`;
      } else if (avgRating < 6) {
        priority = 'medium';
        message = `Focus on improving ${categoryLabel.toLowerCase()} (avg ${avgRating}/10)`;
      } else if (avgRating >= 8) {
        priority = 'low';
        message = `Strong ${categoryLabel.toLowerCase()} - keep it up! (avg ${avgRating}/10)`;
      } else {
        priority = 'low';
        message = `Good ${categoryLabel.toLowerCase()} - room for growth (avg ${avgRating}/10)`;
      }

      if (trend === 'declining' && priority !== 'high') {
        priority = 'medium';
        message += ' - showing a declining trend';
      } else if (trend === 'improving') {
        message += ' - improving!';
      }

      focusAreas.push({
        category: key,
        categoryLabel,
        averageRating: avgRating,
        trend,
        message,
        priority,
      });
    }

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
    ratings: Record<string, number>;
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
        ratings: round.ratings,
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
