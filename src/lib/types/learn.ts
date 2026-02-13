// Types for Skill Tree and Spaced Repetition System

export interface SkillTreeNode {
  id: string;
  technique_id: string;
  parent_node_id: string | null;
  name: string;
  discipline: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  order_index: number;
  xp_reward: number;
  created_at: string;
}

export interface LessonContent {
  id: string;
  node_id: string;
  lesson_number: 1 | 2 | 3;
  title: string;
  content_type: 'text' | 'video' | 'checklist';
  content: {
    text?: string;
    points?: string[];
    video_url?: string;
    checklist_items?: Array<{
      text: string;
      completed: boolean;
    }>;
  };
  created_at: string;
}

export interface UserNodeProgress {
  id: string;
  user_id: string;
  node_id: string;
  lessons_completed: number[];
  completed_at: string | null;
  mastery_level: 0 | 1 | 2 | 3 | 4 | 5;
  total_reviews: number;
  avg_review_score: number;
  created_at: string;
  updated_at: string;
}

export interface ReviewQueueItem {
  id: string;
  user_id: string;
  node_id: string;
  due_date: string;
  interval_days: number;
  ease_factor: number;
  status: 'pending' | 'completed' | 'skipped';
  last_review_score: number | null;
  next_review_date: string | null;
  created_at: string;
  updated_at: string;
}

// Extended types with joined data for UI

export interface SkillTreeNodeWithProgress extends SkillTreeNode {
  progress?: UserNodeProgress | null;
  has_review_due?: boolean;
}

export interface ReviewWithNode extends ReviewQueueItem {
  node: SkillTreeNode;
}

// Input types for mutations

export interface CompleteLessonInput {
  node_id: string;
  lesson_number: 1 | 2 | 3;
}

export interface SubmitReviewInput {
  node_id: string;
  score: 0 | 3 | 4 | 5; // Forgot, Hard, Good, Easy
}

// Stats types

export interface LearningStats {
  total_nodes_completed: number;
  total_xp_earned: number;
  current_mastery_breakdown: {
    mastered: number; // level 5
    proficient: number; // level 4
    practiced: number; // level 3
    reviewed: number; // level 2
    learned: number; // level 1
  };
  reviews_due_count: number;
  next_review_date: string | null;
}

// Mastery level labels
export const MASTERY_LEVELS = {
  0: 'Not Started',
  1: 'Learned',
  2: 'Reviewed',
  3: 'Practiced',
  4: 'Proficient',
  5: 'Mastered',
} as const;

// Mastery level colors
export const MASTERY_COLORS = {
  0: 'text-gray-500',
  1: 'text-green-400',
  2: 'text-blue-400',
  3: 'text-purple-400',
  4: 'text-orange-400',
  5: 'text-yellow-400',
} as const;

// Review score labels
export const REVIEW_SCORES = {
  0: 'Forgot',
  3: 'Hard',
  4: 'Good',
  5: 'Easy',
} as const;
