// TypeScript types for body metrics and goals

// ============================================================================
// DATABASE TYPES
// ============================================================================

export interface BodyMetric {
  id: string;
  user_id: string;
  metric_date: string; // ISO date string
  weight: number;
  body_fat_percentage?: number;
  photo_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type GoalCategory = 'weight' | 'cardio' | 'strength' | 'skill' | 'other';
export type GoalStatus = 'active' | 'completed' | 'abandoned';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  target_value?: number;
  current_value?: number;
  unit?: string;
  target_date?: string; // ISO date string
  status: GoalStatus;
  created_at: string;
  completed_at?: string;
  updated_at: string;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CreateBodyMetricInput {
  metric_date: string;
  weight: number;
  body_fat_percentage?: number;
  photo_url?: string;
  notes?: string;
}

export interface UpdateBodyMetricInput extends CreateBodyMetricInput {
  id: string;
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  category: GoalCategory;
  target_value?: number;
  current_value?: number;
  unit?: string;
  target_date?: string;
}

export interface UpdateGoalInput extends Partial<CreateGoalInput> {
  id: string;
}

export interface UpdateGoalProgressInput {
  id: string;
  current_value: number;
}

// ============================================================================
// STATS & ANALYTICS TYPES
// ============================================================================

export interface BodyMetricsStats {
  currentWeight?: number;
  latestBodyFat?: number;
  totalEntries: number;
  trendDirection: 'up' | 'down' | 'stable'; // Based on 7-day average
  weightChange7Days?: number; // Change from 7 days ago
  weightChange30Days?: number; // Change from 30 days ago
}

export interface WeightTrendDataPoint {
  date: string;
  weight: number;
  sevenDayAverage?: number;
}

export interface GoalProgress {
  goal: Goal;
  progressPercentage: number; // 0-100 (can exceed 100 if overachieved)
  daysRemaining?: number; // Null if no target_date
  isOverdue: boolean;
  isCompleted: boolean;
}

export interface GoalsStats {
  activeGoals: number;
  completedGoals: number;
  upcomingDeadlines: number; // Goals due in next 30 days
  goalsCompletedThisMonth: number;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface BodyMetricFilters {
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface GoalFilters {
  status?: GoalStatus;
  category?: GoalCategory;
  includeCompleted?: boolean;
}
