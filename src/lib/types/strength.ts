// TypeScript types for strength tracking

import { ExerciseCategory, MuscleGroup } from '../constants/exercises';

// ============================================================================
// DATABASE TYPES
// ============================================================================

export interface StrengthSet {
  reps: number;
  weight: number;
  rpe: number; // Rate of Perceived Exertion (1-10)
}

export interface StrengthLog {
  id: string;
  user_id: string;
  exercise_name: string;
  exercise_category: ExerciseCategory;
  muscle_group: MuscleGroup;
  sets: StrengthSet[];
  total_volume: number; // Computed: sum of (sets × reps × weight)
  notes?: string;
  workout_date: string; // ISO date string
  created_at: string;
  updated_at: string;
}

export interface WorkoutTemplate {
  id: string;
  user_id: string;
  template_name: string;
  exercises: TemplateExercise[];
  created_at: string;
}

export interface TemplateExercise {
  exercise_name: string;
  exercise_category: ExerciseCategory;
  muscle_group: MuscleGroup;
  default_sets: number;
  default_reps: number;
}

export interface PersonalRecord {
  id: string;
  user_id: string;
  exercise_name: string;
  record_type: '1rm' | 'max_reps' | 'max_volume';
  value: number;
  achieved_date: string; // ISO date string
  previous_value?: number;
  created_at: string;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface CreateStrengthLogInput {
  exercise_name: string;
  exercise_category: ExerciseCategory;
  muscle_group: MuscleGroup;
  sets: StrengthSet[];
  notes?: string;
  workout_date: string;
}

export interface UpdateStrengthLogInput extends CreateStrengthLogInput {
  id: string;
}

export interface CreateWorkoutTemplateInput {
  template_name: string;
  exercises: TemplateExercise[];
}

// ============================================================================
// STATS & ANALYTICS TYPES
// ============================================================================

export interface StrengthStats {
  totalWorkouts: number;
  totalVolume: number; // Total weight lifted (all exercises, all time)
  workoutsThisWeek: number;
  volumeThisWeek: number;
  activeExercises: number; // Count of unique exercises logged
  prsThisMonth: number;
}

export interface VolumeByMuscleGroup {
  muscleGroup: MuscleGroup;
  volume: number;
  workoutCount: number;
}

export interface StrengthTrendDataPoint {
  date: string;
  estimated1RM: number;
  weight: number;
  reps: number;
}

export interface PRCheckResult {
  isNewPR: boolean;
  prType: '1rm' | 'max_reps' | 'max_volume';
  newValue: number;
  previousValue?: number;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface StrengthLogFilters {
  startDate?: string;
  endDate?: string;
  exerciseName?: string;
  muscleGroup?: MuscleGroup;
  category?: ExerciseCategory;
}
