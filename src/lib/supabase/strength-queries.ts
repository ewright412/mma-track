// Supabase query functions for strength tracking

import { supabase } from './client';
import {
  StrengthLog,
  CreateStrengthLogInput,
  UpdateStrengthLogInput,
  WorkoutTemplate,
  CreateWorkoutTemplateInput,
  PersonalRecord,
  StrengthStats,
  VolumeByMuscleGroup,
  StrengthTrendDataPoint,
  StrengthLogFilters,
  PRCheckResult,
} from '../types/strength';
import { MuscleGroup } from '../constants/exercises';

// ============================================================================
// STRENGTH LOG FUNCTIONS
// ============================================================================

/**
 * Calculate total volume from sets
 */
function calculateTotalVolume(sets: { reps: number; weight: number }[]): number {
  return sets.reduce((total, set) => total + (set.reps * set.weight), 0);
}

/**
 * Create a new strength log (workout)
 */
export async function createStrengthLog(data: CreateStrengthLogInput): Promise<StrengthLog> {
  const totalVolume = calculateTotalVolume(data.sets);

  // Get the authenticated user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: log, error } = await supabase
    .from('strength_logs')
    .insert({
      user_id: user.id,
      exercise_name: data.exercise_name,
      exercise_category: data.exercise_category,
      muscle_group: data.muscle_group,
      sets: data.sets,
      total_volume: totalVolume,
      notes: data.notes,
      workout_date: data.workout_date,
    })
    .select()
    .single();

  if (error) throw error;
  return log;
}

/**
 * Get strength logs with optional filters
 */
export async function getStrengthLogs(
  userId: string,
  filters?: StrengthLogFilters
): Promise<StrengthLog[]> {

  let query = supabase
    .from('strength_logs')
    .select('*')
    .eq('user_id', userId)
    .order('workout_date', { ascending: false });

  if (filters?.startDate) {
    query = query.gte('workout_date', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('workout_date', filters.endDate);
  }
  if (filters?.exerciseName) {
    query = query.eq('exercise_name', filters.exerciseName);
  }
  if (filters?.muscleGroup) {
    query = query.eq('muscle_group', filters.muscleGroup);
  }
  if (filters?.category) {
    query = query.eq('exercise_category', filters.category);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Get a single strength log by ID
 */
export async function getStrengthLogById(id: string): Promise<StrengthLog | null> {

  const { data, error } = await supabase
    .from('strength_logs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a strength log
 */
export async function updateStrengthLog(
  id: string,
  data: UpdateStrengthLogInput
): Promise<StrengthLog> {
  const totalVolume = calculateTotalVolume(data.sets);

  const { data: log, error } = await supabase
    .from('strength_logs')
    .update({
      exercise_name: data.exercise_name,
      exercise_category: data.exercise_category,
      muscle_group: data.muscle_group,
      sets: data.sets,
      total_volume: totalVolume,
      notes: data.notes,
      workout_date: data.workout_date,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return log;
}

/**
 * Delete a strength log
 */
export async function deleteStrengthLog(id: string): Promise<void> {

  const { error } = await supabase.from('strength_logs').delete().eq('id', id);

  if (error) throw error;
}

// ============================================================================
// PERSONAL RECORDS FUNCTIONS
// ============================================================================

/**
 * Calculate estimated 1RM using Epley formula
 * 1RM = weight × (1 + reps/30)
 */
export function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/**
 * Get all personal records for a user
 */
export async function getPersonalRecords(userId: string): Promise<PersonalRecord[]> {

  const { data, error } = await supabase
    .from('personal_records')
    .select('*')
    .eq('user_id', userId)
    .order('achieved_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Check if a new PR was set and update the personal_records table
 * Returns information about whether a PR was set
 */
export async function checkAndUpdatePR(
  userId: string,
  exerciseName: string,
  weight: number,
  reps: number
): Promise<PRCheckResult> {
  const estimated1RM = calculate1RM(weight, reps);

  // Get current PR for this exercise
  const { data: currentPR } = await supabase
    .from('personal_records')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_name', exerciseName)
    .eq('record_type', '1rm')
    .single();

  const isNewPR = !currentPR || estimated1RM > currentPR.value;

  if (isNewPR) {
    // Insert or update the PR
    await supabase
      .from('personal_records')
      .upsert({
        user_id: userId,
        exercise_name: exerciseName,
        record_type: '1rm',
        value: estimated1RM,
        achieved_date: new Date().toISOString().split('T')[0],
        previous_value: currentPR?.value,
      })
      .eq('user_id', userId)
      .eq('exercise_name', exerciseName)
      .eq('record_type', '1rm');

    return {
      isNewPR: true,
      prType: '1rm',
      newValue: estimated1RM,
      previousValue: currentPR?.value,
    };
  }

  return {
    isNewPR: false,
    prType: '1rm',
    newValue: estimated1RM,
    previousValue: currentPR?.value,
  };
}

// ============================================================================
// WORKOUT TEMPLATE FUNCTIONS
// ============================================================================

/**
 * Get all workout templates for a user
 */
export async function getWorkoutTemplates(userId: string): Promise<WorkoutTemplate[]> {

  const { data, error } = await supabase
    .from('workout_templates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Create a new workout template
 */
export async function createWorkoutTemplate(
  data: CreateWorkoutTemplateInput
): Promise<WorkoutTemplate> {

  // Get the authenticated user's ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: template, error } = await supabase
    .from('workout_templates')
    .insert({
      user_id: user.id,
      template_name: data.template_name,
      exercises: data.exercises,
    })
    .select()
    .single();

  if (error) throw error;
  return template;
}

/**
 * Delete a workout template
 */
export async function deleteWorkoutTemplate(id: string): Promise<void> {

  const { error } = await supabase.from('workout_templates').delete().eq('id', id);

  if (error) throw error;
}

// ============================================================================
// STATS & ANALYTICS FUNCTIONS
// ============================================================================

/**
 * Get overall strength stats for a user
 */
export async function getStrengthStats(userId: string): Promise<StrengthStats> {

  // Get all strength logs
  const { data: allLogs } = await supabase
    .from('strength_logs')
    .select('*')
    .eq('user_id', userId);

  // Get logs from this week
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0];

  const { data: weekLogs } = await supabase
    .from('strength_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('workout_date', startOfWeekStr);

  // Get PRs from this month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

  const { data: monthPRs } = await supabase
    .from('personal_records')
    .select('*')
    .eq('user_id', userId)
    .gte('achieved_date', startOfMonthStr);

  const totalVolume = allLogs?.reduce((sum, log) => sum + Number(log.total_volume), 0) || 0;
  const volumeThisWeek = weekLogs?.reduce((sum, log) => sum + Number(log.total_volume), 0) || 0;
  const uniqueExercises = new Set(allLogs?.map(log => log.exercise_name) || []).size;

  return {
    totalWorkouts: allLogs?.length || 0,
    totalVolume,
    workoutsThisWeek: weekLogs?.length || 0,
    volumeThisWeek,
    activeExercises: uniqueExercises,
    prsThisMonth: monthPRs?.length || 0,
  };
}

/**
 * Get volume breakdown by muscle group for a date range
 */
export async function getVolumeByMuscleGroup(
  userId: string,
  startDate: string,
  endDate: string
): Promise<VolumeByMuscleGroup[]> {

  const { data: logs } = await supabase
    .from('strength_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('workout_date', startDate)
    .lte('workout_date', endDate);

  if (!logs) return [];

  // Group by muscle group
  const volumeMap = new Map<MuscleGroup, { volume: number; count: number }>();

  logs.forEach(log => {
    const current = volumeMap.get(log.muscle_group) || { volume: 0, count: 0 };
    volumeMap.set(log.muscle_group, {
      volume: current.volume + Number(log.total_volume),
      count: current.count + 1,
    });
  });

  return Array.from(volumeMap.entries()).map(([muscleGroup, data]) => ({
    muscleGroup,
    volume: data.volume,
    workoutCount: data.count,
  }));
}

/**
 * Get strength trend data for a specific exercise (for charts)
 */
export async function getStrengthTrends(
  userId: string,
  exerciseName: string
): Promise<StrengthTrendDataPoint[]> {

  const { data: logs } = await supabase
    .from('strength_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_name', exerciseName)
    .order('workout_date', { ascending: true });

  if (!logs) return [];

  return logs.map(log => {
    // Find the best set (highest estimated 1RM)
    const bestSet = log.sets.reduce((best: any, set: any) => {
      const current1RM = calculate1RM(set.weight, set.reps);
      const best1RM = calculate1RM(best.weight, best.reps);
      return current1RM > best1RM ? set : best;
    });

    return {
      date: log.workout_date,
      estimated1RM: calculate1RM(bestSet.weight, bestSet.reps),
      weight: bestSet.weight,
      reps: bestSet.reps,
    };
  });
}

/**
 * Get unique exercise names that a user has logged
 */
export async function getUserExercises(userId: string): Promise<string[]> {

  const { data: logs } = await supabase
    .from('strength_logs')
    .select('exercise_name')
    .eq('user_id', userId);

  if (!logs) return [];

  const uniqueExercises = [...new Set(logs.map(log => log.exercise_name))];
  return uniqueExercises.sort();
}
