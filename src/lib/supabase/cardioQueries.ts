import { supabase } from './client';
import {
  CardioLog,
  CreateCardioLogInput,
  UpdateCardioLogInput,
  CardioLogFilters,
  CardioStats,
  WeeklyCardioSummary,
  CardioTrendData,
  CardioType,
} from '../types/cardio';
import { estimateCalories } from '../constants/cardio';

// ============================================================================
// CREATE
// ============================================================================

/**
 * Creates a new cardio log
 */
export async function createCardioLog(
  input: CreateCardioLogInput
): Promise<{ data: CardioLog | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    // Auto-calculate calories estimate if not provided
    const calories =
      input.calories_estimate ?? estimateCalories(input.cardio_type, input.duration_minutes);

    const { data, error } = await supabase
      .from('cardio_logs')
      .insert({
        user_id: user.id,
        session_date: input.session_date,
        cardio_type: input.cardio_type,
        duration_minutes: input.duration_minutes,
        distance_km: input.distance_km ?? null,
        average_heart_rate: input.average_heart_rate ?? null,
        max_heart_rate: input.max_heart_rate ?? null,
        intervals: input.intervals ?? false,
        interval_description: input.interval_description ?? null,
        calories_estimate: calories,
        notes: input.notes ?? null,
      })
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

// ============================================================================
// READ
// ============================================================================

/**
 * Gets all cardio logs for the current user with optional filters
 */
export async function getCardioLogs(
  filters?: CardioLogFilters
): Promise<{ data: CardioLog[] | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    let query = supabase
      .from('cardio_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('session_date', { ascending: false })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters) {
      if (filters.cardio_type) {
        if (Array.isArray(filters.cardio_type)) {
          query = query.in('cardio_type', filters.cardio_type);
        } else {
          query = query.eq('cardio_type', filters.cardio_type);
        }
      }

      if (filters.startDate) {
        query = query.gte('session_date', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('session_date', filters.endDate);
      }

      if (filters.intervals !== undefined) {
        query = query.eq('intervals', filters.intervals);
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
 * Gets a single cardio log by ID
 */
export async function getCardioLogById(
  logId: string
): Promise<{ data: CardioLog | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('cardio_logs')
      .select('*')
      .eq('id', logId)
      .eq('user_id', user.id)
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
 * Gets cardio statistics for the current user
 */
export async function getCardioStats(): Promise<{
  data: CardioStats | null;
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

    const { data: logs, error } = await supabase
      .from('cardio_logs')
      .select('*')
      .eq('user_id', user.id);

    if (error || !logs) {
      return { data: null, error: error || new Error('Failed to fetch cardio logs') };
    }

    // Calculate stats
    const stats: CardioStats = {
      totalSessions: logs.length,
      totalMinutes: logs.reduce((sum, log) => sum + log.duration_minutes, 0),
      totalDistance: logs.reduce((sum, log) => sum + (log.distance_km ?? 0), 0),
      averageHeartRate: 0,
      sessionsByType: {} as Record<CardioType, number>,
      totalCalories: logs.reduce((sum, log) => sum + (log.calories_estimate ?? 0), 0),
    };

    // Calculate average heart rate (only for logs with HR data)
    const logsWithHR = logs.filter((log) => log.average_heart_rate !== null);
    if (logsWithHR.length > 0) {
      const totalHR = logsWithHR.reduce((sum, log) => sum + (log.average_heart_rate ?? 0), 0);
      stats.averageHeartRate = Math.round(totalHR / logsWithHR.length);
    }

    // Count sessions by type
    logs.forEach((log) => {
      const type = log.cardio_type as CardioType;
      stats.sessionsByType[type] = (stats.sessionsByType[type] || 0) + 1;
    });

    return { data: stats, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

/**
 * Gets weekly cardio summary for the current week
 */
export async function getWeeklyCardioSummary(): Promise<{
  data: WeeklyCardioSummary | null;
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

    // Get start of current week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const { data: logs, error } = await supabase
      .from('cardio_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('session_date', weekStart.toISOString().split('T')[0])
      .lte('session_date', weekEnd.toISOString().split('T')[0]);

    if (error || !logs) {
      return { data: null, error: error || new Error('Failed to fetch weekly cardio data') };
    }

    const summary: WeeklyCardioSummary = {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      totalMinutes: logs.reduce((sum, log) => sum + log.duration_minutes, 0),
      totalCalories: logs.reduce((sum, log) => sum + (log.calories_estimate ?? 0), 0),
      totalDistance: logs.reduce((sum, log) => sum + (log.distance_km ?? 0), 0),
      sessionsByType: {} as Record<CardioType, number>,
      avgHeartRate: 0,
    };

    // Count sessions by type
    logs.forEach((log) => {
      const type = log.cardio_type as CardioType;
      summary.sessionsByType[type] = (summary.sessionsByType[type] || 0) + 1;
    });

    // Calculate average heart rate
    const logsWithHR = logs.filter((log) => log.average_heart_rate !== null);
    if (logsWithHR.length > 0) {
      const totalHR = logsWithHR.reduce((sum, log) => sum + (log.average_heart_rate ?? 0), 0);
      summary.avgHeartRate = Math.round(totalHR / logsWithHR.length);
    }

    return { data: summary, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

/**
 * Gets cardio trend data for charts (last 30 days)
 */
export async function getCardioTrends(): Promise<{
  data: CardioTrendData[] | null;
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

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: logs, error } = await supabase
      .from('cardio_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('session_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('session_date', { ascending: true });

    if (error || !logs) {
      return { data: null, error: error || new Error('Failed to fetch trend data') };
    }

    const trends: CardioTrendData[] = logs.map((log) => ({
      date: log.session_date,
      duration: log.duration_minutes,
      distance: log.distance_km,
      pace:
        log.distance_km && log.distance_km > 0
          ? log.duration_minutes / log.distance_km
          : null,
      heartRate: log.average_heart_rate,
    }));

    return { data: trends, error: null };
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
 * Updates a cardio log
 */
export async function updateCardioLog(
  logId: string,
  input: UpdateCardioLogInput
): Promise<{ data: CardioLog | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('cardio_logs')
      .update(input)
      .eq('id', logId)
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

// ============================================================================
// DELETE
// ============================================================================

/**
 * Deletes a cardio log
 */
export async function deleteCardioLog(
  logId: string
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
      .from('cardio_logs')
      .delete()
      .eq('id', logId)
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
