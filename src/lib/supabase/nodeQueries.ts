import { supabase } from './client';
import {
  SkillTreeNode,
  LessonContent,
  UserNodeProgress,
  SkillTreeNodeWithProgress,
  CompleteLessonInput,
} from '../types/learn';
import { calculateMasteryLevel } from '../utils/spacedRepetition';

// ============================================================================
// SKILL TREE NODES - Read Operations
// ============================================================================

export async function getAllSkillTreeNodes(): Promise<{
  data: SkillTreeNode[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('skill_tree_nodes')
      .select('*')
      .order('discipline', { ascending: true })
      .order('order_index', { ascending: true });

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

export async function getNodeById(nodeId: string): Promise<{
  data: SkillTreeNode | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('skill_tree_nodes')
      .select('*')
      .eq('id', nodeId)
      .single();

    if (error || !data) {
      return { data: null, error: error || new Error('Node not found') };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

export async function getNodesByDiscipline(discipline: string): Promise<{
  data: SkillTreeNode[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('skill_tree_nodes')
      .select('*')
      .eq('discipline', discipline)
      .order('order_index', { ascending: true });

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

/**
 * Get all skill tree nodes with user progress data
 * Joins progress and checks for due reviews
 */
export async function getNodesWithProgress(): Promise<{
  data: SkillTreeNodeWithProgress[] | null;
  error: Error | null;
}> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      // Return nodes without progress if not authenticated
      const { data, error } = await getAllSkillTreeNodes();
      return { data: data as SkillTreeNodeWithProgress[], error };
    }

    // Get all nodes
    const { data: nodes, error: nodesError } = await getAllSkillTreeNodes();
    if (nodesError || !nodes) {
      return { data: null, error: nodesError || new Error('Failed to load nodes') };
    }

    // Get user progress for all nodes
    const { data: progressData, error: progressError } = await supabase
      .from('user_node_progress')
      .select('*')
      .eq('user_id', user.id);

    if (progressError) {
      return { data: null, error: progressError };
    }

    // Get review queue to check for due reviews
    const today = new Date().toISOString().split('T')[0];
    const { data: reviews, error: reviewsError } = await supabase
      .from('review_queue')
      .select('node_id')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .lte('due_date', today);

    if (reviewsError) {
      return { data: null, error: reviewsError };
    }

    // Create a map of progress by node_id
    const progressMap = new Map<string, UserNodeProgress>();
    if (progressData) {
      progressData.forEach((p) => progressMap.set(p.node_id, p as UserNodeProgress));
    }

    // Create a set of nodes with due reviews
    const dueReviewNodes = new Set<string>();
    if (reviews) {
      reviews.forEach((r) => dueReviewNodes.add(r.node_id));
    }

    // Merge data
    const nodesWithProgress: SkillTreeNodeWithProgress[] = nodes.map((node) => ({
      ...node,
      progress: progressMap.get(node.id) || null,
      has_review_due: dueReviewNodes.has(node.id),
    }));

    return { data: nodesWithProgress, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

// ============================================================================
// LESSON CONTENT - Read Operations
// ============================================================================

export async function getLessonsForNode(nodeId: string): Promise<{
  data: LessonContent[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('lesson_content')
      .select('*')
      .eq('node_id', nodeId)
      .order('lesson_number', { ascending: true });

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

export async function getLessonByNumber(
  nodeId: string,
  lessonNumber: 1 | 2 | 3
): Promise<{
  data: LessonContent | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('lesson_content')
      .select('*')
      .eq('node_id', nodeId)
      .eq('lesson_number', lessonNumber)
      .single();

    if (error || !data) {
      return { data: null, error: error || new Error('Lesson not found') };
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
// USER NODE PROGRESS - Read Operations
// ============================================================================

export async function getUserNodeProgress(nodeId: string): Promise<{
  data: UserNodeProgress | null;
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
      .from('user_node_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('node_id', nodeId)
      .maybeSingle();

    if (error) {
      return { data: null, error };
    }

    return { data: data as UserNodeProgress | null, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

// ============================================================================
// USER NODE PROGRESS - Write Operations
// ============================================================================

/**
 * Mark a lesson as complete
 * If all 3 lessons are complete, update completed_at and award XP
 */
export async function completeLesson(input: CompleteLessonInput): Promise<{
  data: {
    progress: UserNodeProgress;
    all_lessons_complete: boolean;
    xp_awarded: number;
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

    // Get current progress or create new
    const { data: existingProgress } = await getUserNodeProgress(input.node_id);

    let lessonsCompleted: number[] = existingProgress?.lessons_completed || [];

    // Add lesson to completed array if not already there
    if (!lessonsCompleted.includes(input.lesson_number)) {
      lessonsCompleted = [...lessonsCompleted, input.lesson_number].sort();
    }

    const allLessonsComplete = lessonsCompleted.length === 3;

    // Get node for XP reward
    const { data: node } = await getNodeById(input.node_id);
    const xpReward = node?.xp_reward || 0;

    // Upsert progress
    const { data, error } = await supabase
      .from('user_node_progress')
      .upsert(
        {
          user_id: user.id,
          node_id: input.node_id,
          lessons_completed: lessonsCompleted,
          completed_at: allLessonsComplete ? new Date().toISOString() : null,
          mastery_level: allLessonsComplete ? 1 : 0, // Level 1 when all lessons done
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,node_id' }
      )
      .select()
      .single();

    if (error || !data) {
      return {
        data: null,
        error: error || new Error('Failed to update progress'),
      };
    }

    return {
      data: {
        progress: data as UserNodeProgress,
        all_lessons_complete: allLessonsComplete,
        xp_awarded: allLessonsComplete ? xpReward : 0,
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
 * Update mastery level based on review performance
 * Should be called after each review
 */
export async function updateMasteryLevel(
  nodeId: string,
  totalReviews: number,
  avgReviewScore: number,
  currentInterval: number
): Promise<{
  data: UserNodeProgress | null;
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

    // Get current progress
    const { data: progress, error: progressError } = await getUserNodeProgress(nodeId);

    if (progressError || !progress) {
      return {
        data: null,
        error: progressError || new Error('Progress not found'),
      };
    }

    // Calculate new mastery level
    const newMasteryLevel = calculateMasteryLevel(
      totalReviews,
      avgReviewScore,
      currentInterval,
      progress.completed_at
    );

    // Update progress
    const { data, error } = await supabase
      .from('user_node_progress')
      .update({
        mastery_level: newMasteryLevel,
        total_reviews: totalReviews,
        avg_review_score: avgReviewScore,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('node_id', nodeId)
      .select()
      .single();

    if (error || !data) {
      return {
        data: null,
        error: error || new Error('Failed to update mastery'),
      };
    }

    return { data: data as UserNodeProgress, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}
