import { supabase } from './client';
import {
  TrainingSession,
  TrainingSessionWithTechniques,
  CreateTrainingSessionInput,
  UpdateTrainingSessionInput,
  TrainingSessionFilters,
  SessionTechnique,
  TrainingStats,
  MMADiscipline,
} from '../types/training';

// ============================================================================
// CREATE
// ============================================================================

/**
 * Creates a new training session with techniques
 */
export async function createTrainingSession(
  input: CreateTrainingSessionInput
): Promise<{ data: TrainingSessionWithTechniques | null; error: Error | null }> {
  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    // Insert training session
    const { data: session, error: sessionError } = await supabase
      .from('training_sessions')
      .insert({
        user_id: user.id,
        session_date: input.session_date,
        discipline: input.discipline,
        duration_minutes: input.duration_minutes,
        intensity: input.intensity,
        notes: input.notes || null,
      })
      .select()
      .single();

    if (sessionError || !session) {
      return { data: null, error: sessionError || new Error('Failed to create session') };
    }

    // Insert techniques if any
    let techniques: SessionTechnique[] = [];
    if (input.techniques && input.techniques.length > 0) {
      const techniquesData = input.techniques.map((tech) => ({
        session_id: session.id,
        technique_name: tech.technique_name,
        notes: tech.notes || null,
      }));

      const { data: insertedTechniques, error: techniquesError } = await supabase
        .from('session_techniques')
        .insert(techniquesData)
        .select();

      if (techniquesError) {
        // Session was created but techniques failed - log warning but don't fail
        console.error('Failed to insert techniques:', techniquesError);
      } else {
        techniques = insertedTechniques || [];
      }
    }

    return {
      data: {
        ...session,
        techniques,
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
 * Gets all training sessions for the current user with optional filters
 */
export async function getTrainingSessions(
  filters?: TrainingSessionFilters
): Promise<{ data: TrainingSession[] | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    let query = supabase
      .from('training_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('session_date', { ascending: false });

    // Apply filters
    if (filters) {
      if (filters.discipline) {
        if (Array.isArray(filters.discipline)) {
          query = query.in('discipline', filters.discipline);
        } else {
          query = query.eq('discipline', filters.discipline);
        }
      }

      if (filters.startDate) {
        query = query.gte('session_date', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('session_date', filters.endDate);
      }

      if (filters.minIntensity !== undefined) {
        query = query.gte('intensity', filters.minIntensity);
      }

      if (filters.maxIntensity !== undefined) {
        query = query.lte('intensity', filters.maxIntensity);
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
 * Gets a single training session by ID with techniques
 */
export async function getTrainingSessionById(
  sessionId: string
): Promise<{ data: TrainingSessionWithTechniques | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    // Get session
    const { data: session, error: sessionError } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return { data: null, error: sessionError || new Error('Session not found') };
    }

    // Get techniques
    const { data: techniques, error: techniquesError } = await supabase
      .from('session_techniques')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (techniquesError) {
      return { data: null, error: techniquesError };
    }

    return {
      data: {
        ...session,
        techniques: techniques || [],
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
 * Gets training sessions grouped by date (for calendar heat map)
 */
export async function getTrainingSessionsByDate(
  startDate: string,
  endDate: string
): Promise<{ data: Record<string, number> | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data: sessions, error } = await supabase
      .from('training_sessions')
      .select('session_date')
      .eq('user_id', user.id)
      .gte('session_date', startDate)
      .lte('session_date', endDate);

    if (error) {
      return { data: null, error };
    }

    // Group by date and count
    const sessionsByDate: Record<string, number> = {};
    sessions?.forEach((session) => {
      const date = session.session_date;
      sessionsByDate[date] = (sessionsByDate[date] || 0) + 1;
    });

    return { data: sessionsByDate, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

/**
 * Calculates training statistics for the current user
 */
export async function getTrainingStats(): Promise<{
  data: TrainingStats | null;
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

    // Get all sessions
    const { data: sessions, error } = await supabase
      .from('training_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('session_date', { ascending: false });

    if (error) {
      return { data: null, error };
    }

    if (!sessions || sessions.length === 0) {
      return {
        data: {
          totalSessions: 0,
          totalMinutes: 0,
          averageIntensity: 0,
          sessionsByDiscipline: {} as Record<MMADiscipline, number>,
          currentStreak: 0,
          longestStreak: 0,
        },
        error: null,
      };
    }

    // Calculate basic stats
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
    const averageIntensity = sessions.reduce((sum, s) => sum + s.intensity, 0) / totalSessions;

    // Sessions by discipline
    const sessionsByDiscipline: Record<string, number> = {};
    sessions.forEach((session) => {
      sessionsByDiscipline[session.discipline] = (sessionsByDiscipline[session.discipline] || 0) + 1;
    });

    // Calculate streaks
    const uniqueDates = [...new Set(sessions.map((s) => s.session_date))].sort().reverse();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < uniqueDates.length; i++) {
      const sessionDate = new Date(uniqueDates[i]);
      sessionDate.setHours(0, 0, 0, 0);

      if (i === 0) {
        // Check if most recent session is today or yesterday
        const diffDays = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 1) {
          currentStreak = 1;
          tempStreak = 1;
        } else {
          break; // No current streak
        }
      } else {
        const prevDate = new Date(uniqueDates[i - 1]);
        prevDate.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((prevDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
          if (i < uniqueDates.length - 1 || currentStreak > 0) {
            currentStreak = tempStreak;
          }
        } else {
          break;
        }
      }

      longestStreak = Math.max(longestStreak, tempStreak);
    }

    return {
      data: {
        totalSessions,
        totalMinutes,
        averageIntensity: Math.round(averageIntensity * 10) / 10,
        sessionsByDiscipline: sessionsByDiscipline as Record<MMADiscipline, number>,
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
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
// UPDATE
// ============================================================================

/**
 * Updates an existing training session
 */
export async function updateTrainingSession(
  sessionId: string,
  input: UpdateTrainingSessionInput
): Promise<{ data: TrainingSession | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('training_sessions')
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
 * Updates techniques for a training session (replaces all existing techniques)
 */
export async function updateSessionTechniques(
  sessionId: string,
  techniques: Array<{ technique_name: string; notes?: string }>
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
      .from('training_sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return { success: false, error: new Error('Session not found or access denied') };
    }

    // Delete existing techniques
    const { error: deleteError } = await supabase
      .from('session_techniques')
      .delete()
      .eq('session_id', sessionId);

    if (deleteError) {
      return { success: false, error: deleteError };
    }

    // Insert new techniques if any
    if (techniques.length > 0) {
      const techniquesData = techniques.map((tech) => ({
        session_id: sessionId,
        technique_name: tech.technique_name,
        notes: tech.notes || null,
      }));

      const { error: insertError } = await supabase
        .from('session_techniques')
        .insert(techniquesData);

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
 * Deletes a training session (techniques are cascade deleted)
 */
export async function deleteTrainingSession(
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
      .from('training_sessions')
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
