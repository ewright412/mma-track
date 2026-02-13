import { supabase } from './client';
import { ReviewQueueItem, ReviewWithNode, SubmitReviewInput } from '../types/learn';
import {
  calculateNextReview,
  calculateNextReviewDate,
  isReviewDue,
} from '../utils/spacedRepetition';
import { updateMasteryLevel, getUserNodeProgress } from './nodeQueries';

// ============================================================================
// REVIEW QUEUE - Read Operations
// ============================================================================

/**
 * Get all reviews due today or overdue for the current user
 */
export async function getReviewsDue(): Promise<{
  data: ReviewWithNode[] | null;
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

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('review_queue')
      .select('*, skill_tree_nodes(*)')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .lte('due_date', today)
      .order('due_date', { ascending: true });

    if (error) {
      return { data: null, error };
    }

    // Transform data to ReviewWithNode format
    const reviews: ReviewWithNode[] =
      data?.map((item) => {
        const { skill_tree_nodes, ...review } = item as any;
        return {
          ...review,
          node: skill_tree_nodes,
        } as ReviewWithNode;
      }) || [];

    return { data: reviews, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

/**
 * Get count of reviews due today
 * Used for badge display in sidebar
 */
export async function getReviewsDueCount(): Promise<{
  data: number | null;
  error: Error | null;
}> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: 0, error: null }; // Return 0 if not authenticated
    }

    const today = new Date().toISOString().split('T')[0];

    const { count, error } = await supabase
      .from('review_queue')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .lte('due_date', today);

    if (error) {
      return { data: null, error };
    }

    return { data: count || 0, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

/**
 * Get upcoming reviews (next 7 days)
 */
export async function getUpcomingReviews(): Promise<{
  data: ReviewWithNode[] | null;
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

    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('review_queue')
      .select('*, skill_tree_nodes(*)')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .gt('due_date', today)
      .lte('due_date', nextWeekStr)
      .order('due_date', { ascending: true });

    if (error) {
      return { data: null, error };
    }

    // Transform data
    const reviews: ReviewWithNode[] =
      data?.map((item) => {
        const { skill_tree_nodes, ...review } = item as any;
        return {
          ...review,
          node: skill_tree_nodes,
        } as ReviewWithNode;
      }) || [];

    return { data: reviews, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

/**
 * Get next review date for display
 */
export async function getNextReviewDate(): Promise<{
  data: string | null;
  error: Error | null;
}> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: null };
    }

    const { data, error } = await supabase
      .from('review_queue')
      .select('due_date')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .order('due_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      return { data: null, error };
    }

    return { data: data?.due_date || null, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

// ============================================================================
// REVIEW QUEUE - Write Operations
// ============================================================================

/**
 * Schedule initial review after node completion
 * Should be called automatically when all 3 lessons are completed
 */
export async function scheduleReview(nodeId: string): Promise<{
  data: ReviewQueueItem | null;
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

    // Check if review already exists
    const { data: existing } = await supabase
      .from('review_queue')
      .select('*')
      .eq('user_id', user.id)
      .eq('node_id', nodeId)
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) {
      // Review already scheduled
      return { data: existing as ReviewQueueItem, error: null };
    }

    // Schedule review for 1 day from now (first review)
    const dueDate = calculateNextReviewDate(1);

    const { data, error } = await supabase
      .from('review_queue')
      .insert({
        user_id: user.id,
        node_id: nodeId,
        due_date: dueDate,
        interval_days: 1,
        ease_factor: 2.5, // SM-2 default
        status: 'pending',
      })
      .select()
      .single();

    if (error || !data) {
      return {
        data: null,
        error: error || new Error('Failed to schedule review'),
      };
    }

    return { data: data as ReviewQueueItem, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

/**
 * Submit review and calculate next review date
 * Awards +10 XP and updates mastery level
 */
export async function submitReview(input: SubmitReviewInput): Promise<{
  data: {
    review: ReviewQueueItem;
    xp_awarded: number;
    next_review_date: string;
  } | null;
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

    // Get current review
    const { data: currentReview, error: reviewError } = await supabase
      .from('review_queue')
      .select('*')
      .eq('user_id', user.id)
      .eq('node_id', input.node_id)
      .eq('status', 'pending')
      .single();

    if (reviewError || !currentReview) {
      return {
        data: null,
        error: reviewError || new Error('Review not found'),
      };
    }

    // Calculate next review using SM-2 algorithm
    const { interval, ease } = calculateNextReview(
      currentReview.interval_days,
      currentReview.ease_factor,
      input.score
    );

    const nextReviewDate = calculateNextReviewDate(interval);

    // Update current review to completed
    const { error: updateError } = await supabase
      .from('review_queue')
      .update({
        status: 'completed',
        last_review_score: input.score,
        next_review_date: nextReviewDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentReview.id);

    if (updateError) {
      return { data: null, error: updateError };
    }

    // Create new review queue item for next review
    const { data: newReview, error: newReviewError } = await supabase
      .from('review_queue')
      .insert({
        user_id: user.id,
        node_id: input.node_id,
        due_date: nextReviewDate,
        interval_days: interval,
        ease_factor: ease,
        status: 'pending',
      })
      .select()
      .single();

    if (newReviewError || !newReview) {
      return {
        data: null,
        error: newReviewError || new Error('Failed to schedule next review'),
      };
    }

    // Update user progress and mastery level
    // Get current progress to calculate totals
    const { data: progress } = await getUserNodeProgress(input.node_id);

    if (progress) {
      const totalReviews =
        input.score >= 3 ? progress.total_reviews + 1 : progress.total_reviews;
      const newAvgScore =
        totalReviews > 0
          ? (progress.avg_review_score * progress.total_reviews + input.score) /
            totalReviews
          : input.score;

      // Update mastery level
      await updateMasteryLevel(input.node_id, totalReviews, newAvgScore, interval);
    }

    return {
      data: {
        review: newReview as ReviewQueueItem,
        xp_awarded: 10, // Fixed XP for reviews
        next_review_date: nextReviewDate,
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
 * Skip a review (reschedule for tomorrow)
 */
export async function skipReview(nodeId: string): Promise<{
  data: ReviewQueueItem | null;
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

    // Get current review
    const { data: currentReview, error: reviewError } = await supabase
      .from('review_queue')
      .select('*')
      .eq('user_id', user.id)
      .eq('node_id', nodeId)
      .eq('status', 'pending')
      .single();

    if (reviewError || !currentReview) {
      return {
        data: null,
        error: reviewError || new Error('Review not found'),
      };
    }

    // Reschedule for tomorrow
    const tomorrowDate = calculateNextReviewDate(1);

    const { data, error } = await supabase
      .from('review_queue')
      .update({
        due_date: tomorrowDate,
        status: 'skipped',
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentReview.id)
      .select()
      .single();

    if (error || !data) {
      return {
        data: null,
        error: error || new Error('Failed to skip review'),
      };
    }

    return { data: data as ReviewQueueItem, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}
