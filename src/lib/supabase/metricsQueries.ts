import { supabase } from './client';
import {
  BodyMetric,
  CreateBodyMetricInput,
  UpdateBodyMetricInput,
  BodyMetricFilters,
  BodyMetricsStats,
  WeightTrendDataPoint,
} from '../types/metrics';

// ============================================================================
// CREATE
// ============================================================================

/**
 * Creates a new body metric entry
 */
export async function createBodyMetric(
  input: CreateBodyMetricInput
): Promise<{ data: BodyMetric | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('body_metrics')
      .insert({
        user_id: user.id,
        metric_date: input.metric_date,
        weight: input.weight,
        body_fat_percentage: input.body_fat_percentage ?? null,
        photo_url: input.photo_url ?? null,
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
 * Gets all body metrics for the current user with optional filters
 */
export async function getBodyMetrics(
  filters?: BodyMetricFilters
): Promise<{ data: BodyMetric[] | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    let query = supabase
      .from('body_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('metric_date', { ascending: false })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters) {
      if (filters.startDate) {
        query = query.gte('metric_date', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('metric_date', filters.endDate);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
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
 * Gets a single body metric by ID
 */
export async function getBodyMetricById(
  metricId: string
): Promise<{ data: BodyMetric | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('body_metrics')
      .select('*')
      .eq('id', metricId)
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
 * Gets body metrics statistics for the current user
 */
export async function getBodyMetricsStats(): Promise<{
  data: BodyMetricsStats | null;
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

    const { data: metrics, error } = await supabase
      .from('body_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('metric_date', { ascending: false });

    if (error || !metrics) {
      return { data: null, error: error || new Error('Failed to fetch body metrics') };
    }

    const stats: BodyMetricsStats = {
      currentWeight: metrics.length > 0 ? metrics[0].weight : undefined,
      latestBodyFat: metrics.length > 0 ? metrics[0].body_fat_percentage ?? undefined : undefined,
      totalEntries: metrics.length,
      trendDirection: 'stable',
      weightChange7Days: undefined,
      weightChange30Days: undefined,
    };

    // Calculate trend based on 7-day average
    if (metrics.length >= 2) {
      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);

      // Get metrics from last 7 days
      const recent7Days = metrics.filter(
        (m) => new Date(m.metric_date) >= sevenDaysAgo
      );
      const avg7Days =
        recent7Days.length > 0
          ? recent7Days.reduce((sum, m) => sum + m.weight, 0) / recent7Days.length
          : stats.currentWeight;

      // Get metrics from 7-14 days ago
      const fourteenDaysAgo = new Date(now);
      fourteenDaysAgo.setDate(now.getDate() - 14);
      const previous7Days = metrics.filter(
        (m) =>
          new Date(m.metric_date) < sevenDaysAgo &&
          new Date(m.metric_date) >= fourteenDaysAgo
      );
      const avgPrevious7Days =
        previous7Days.length > 0
          ? previous7Days.reduce((sum, m) => sum + m.weight, 0) / previous7Days.length
          : undefined;

      // Determine trend
      if (avg7Days && avgPrevious7Days) {
        const diff = avg7Days - avgPrevious7Days;
        if (Math.abs(diff) < 1) {
          stats.trendDirection = 'stable';
        } else if (diff > 0) {
          stats.trendDirection = 'up';
        } else {
          stats.trendDirection = 'down';
        }
        stats.weightChange7Days = diff;
      }

      // Calculate 30-day change
      const metrics30DaysAgo = metrics.filter(
        (m) => new Date(m.metric_date) < thirtyDaysAgo
      );
      if (metrics30DaysAgo.length > 0 && stats.currentWeight) {
        const weight30DaysAgo = metrics30DaysAgo[metrics30DaysAgo.length - 1].weight;
        stats.weightChange30Days = stats.currentWeight - weight30DaysAgo;
      }
    }

    return { data: stats, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

/**
 * Gets weight trend data for charts with 7-day rolling average
 * @param days - Number of days to fetch (default 90)
 */
export async function getWeightTrend(
  days: number = 90
): Promise<{ data: WeightTrendDataPoint[] | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: metrics, error } = await supabase
      .from('body_metrics')
      .select('*')
      .eq('user_id', user.id)
      .gte('metric_date', startDate.toISOString().split('T')[0])
      .order('metric_date', { ascending: true });

    if (error || !metrics) {
      return { data: null, error: error || new Error('Failed to fetch weight trend data') };
    }

    // Calculate 7-day rolling average
    const trendData: WeightTrendDataPoint[] = metrics.map((metric, index) => {
      // Get the last 7 days including current
      const startIndex = Math.max(0, index - 6);
      const last7Days = metrics.slice(startIndex, index + 1);
      const sevenDayAverage =
        last7Days.reduce((sum, m) => sum + m.weight, 0) / last7Days.length;

      return {
        date: metric.metric_date,
        weight: metric.weight,
        sevenDayAverage: Math.round(sevenDayAverage * 10) / 10, // Round to 1 decimal
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

// ============================================================================
// UPDATE
// ============================================================================

/**
 * Updates a body metric
 */
export async function updateBodyMetric(
  metricId: string,
  input: UpdateBodyMetricInput
): Promise<{ data: BodyMetric | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('body_metrics')
      .update({
        metric_date: input.metric_date,
        weight: input.weight,
        body_fat_percentage: input.body_fat_percentage ?? null,
        photo_url: input.photo_url ?? null,
        notes: input.notes ?? null,
      })
      .eq('id', metricId)
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
 * Deletes a body metric
 */
export async function deleteBodyMetric(
  metricId: string
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
      .from('body_metrics')
      .delete()
      .eq('id', metricId)
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
