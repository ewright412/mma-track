import { supabase } from './client';
import {
  Goal,
  CreateGoalInput,
  UpdateGoalInput,
  UpdateGoalProgressInput,
  GoalFilters,
  GoalProgress,
  GoalsStats,
  GoalStatus,
} from '../types/metrics';
import { calculateGoalProgress, calculateDaysRemaining, isGoalOverdue } from '../constants/goals';

// ============================================================================
// CREATE
// ============================================================================

/**
 * Creates a new goal
 */
export async function createGoal(
  input: CreateGoalInput
): Promise<{ data: Goal | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        title: input.title,
        description: input.description ?? null,
        category: input.category,
        target_value: input.target_value ?? null,
        current_value: input.current_value ?? null,
        unit: input.unit ?? null,
        target_date: input.target_date ?? null,
        status: 'active',
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
 * Gets all goals for the current user with optional filters
 */
export async function getGoals(
  filters?: GoalFilters
): Promise<{ data: Goal[] | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    let query = supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      // Default: only show active goals unless includeCompleted is true
      if (!filters.includeCompleted && !filters.status) {
        query = query.eq('status', 'active');
      }
    } else {
      // Default: only active goals
      query = query.eq('status', 'active');
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
 * Gets a single goal by ID
 */
export async function getGoalById(
  goalId: string
): Promise<{ data: Goal | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
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
 * Gets goals statistics for the current user
 */
export async function getGoalsStats(): Promise<{
  data: GoalsStats | null;
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

    const { data: goals, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id);

    if (error || !goals) {
      return { data: null, error: error || new Error('Failed to fetch goals') };
    }

    const activeGoals = goals.filter((g) => g.status === 'active');
    const completedGoals = goals.filter((g) => g.status === 'completed');

    // Count upcoming deadlines (active goals due in next 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const upcomingDeadlines = activeGoals.filter((g) => {
      if (!g.target_date) return false;
      const targetDate = new Date(g.target_date);
      return targetDate >= now && targetDate <= thirtyDaysFromNow;
    }).length;

    // Count goals completed this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const goalsCompletedThisMonth = completedGoals.filter((g) => {
      if (!g.completed_at) return false;
      const completedDate = new Date(g.completed_at);
      return completedDate >= startOfMonth;
    }).length;

    const stats: GoalsStats = {
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      upcomingDeadlines,
      goalsCompletedThisMonth,
    };

    return { data: stats, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

/**
 * Gets goal progress with calculated metrics
 * @param goalId - Optional goal ID. If not provided, returns progress for all active goals
 */
export async function getGoalProgress(
  goalId?: string
): Promise<{ data: GoalProgress[] | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    let query = supabase.from('goals').select('*').eq('user_id', user.id);

    if (goalId) {
      query = query.eq('id', goalId);
    } else {
      query = query.eq('status', 'active');
    }

    const { data: goals, error } = await query;

    if (error || !goals) {
      return { data: null, error: error || new Error('Failed to fetch goal progress') };
    }

    const progressData: GoalProgress[] = goals.map((goal) => {
      const progressPercentage = calculateGoalProgress(
        goal.current_value,
        goal.target_value,
        0 // Starting value defaults to 0
      );

      const daysRemaining = calculateDaysRemaining(goal.target_date);
      const isOverdue = isGoalOverdue(goal.target_date, goal.status);
      const isCompleted = goal.status === 'completed';

      return {
        goal,
        progressPercentage,
        daysRemaining: daysRemaining ?? undefined,
        isOverdue,
        isCompleted,
      };
    });

    return { data: progressData, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

/**
 * Gets goals with upcoming deadlines (due in next N days)
 * @param days - Number of days to look ahead (default 30)
 */
export async function getUpcomingGoals(
  days: number = 30
): Promise<{ data: Goal[] | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .gte('target_date', now.toISOString().split('T')[0])
      .lte('target_date', futureDate.toISOString().split('T')[0])
      .order('target_date', { ascending: true });

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
 * Gets recently completed goals
 * @param limit - Maximum number of goals to return (default 10)
 */
export async function getCompletedGoals(
  limit: number = 10
): Promise<{ data: Goal[] | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(limit);

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
// UPDATE
// ============================================================================

/**
 * Updates a goal
 */
export async function updateGoal(
  goalId: string,
  input: UpdateGoalInput
): Promise<{ data: Goal | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const updateData: Record<string, unknown> = {};

    // Only include fields that are provided
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.target_value !== undefined) updateData.target_value = input.target_value;
    if (input.current_value !== undefined) updateData.current_value = input.current_value;
    if (input.unit !== undefined) updateData.unit = input.unit;
    if (input.target_date !== undefined) updateData.target_date = input.target_date;

    const { data, error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', goalId)
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
 * Updates goal progress (current_value)
 */
export async function updateGoalProgress(
  input: UpdateGoalProgressInput
): Promise<{ data: Goal | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('goals')
      .update({ current_value: input.current_value })
      .eq('id', input.id)
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
 * Marks a goal as completed
 */
export async function completeGoal(
  goalId: string
): Promise<{ data: Goal | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('goals')
      .update({
        status: 'completed' as GoalStatus,
        completed_at: now,
      })
      .eq('id', goalId)
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
 * Marks a goal as abandoned
 */
export async function abandonGoal(
  goalId: string
): Promise<{ data: Goal | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('goals')
      .update({ status: 'abandoned' as GoalStatus })
      .eq('id', goalId)
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
 * Deletes a goal
 */
export async function deleteGoal(
  goalId: string
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
      .from('goals')
      .delete()
      .eq('id', goalId)
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
