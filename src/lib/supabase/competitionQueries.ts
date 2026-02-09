import { supabase } from './client';
import { Competition, CreateCompetitionInput } from '../types/competition';

/**
 * Get all competitions for the current user, ordered by date ascending
 */
export async function getCompetitions(): Promise<{
  data: Competition[] | null;
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
      .from('competitions')
      .select('*')
      .eq('user_id', user.id)
      .order('competition_date', { ascending: true });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Get the next upcoming competition (closest future date)
 */
export async function getNextCompetition(): Promise<{
  data: Competition | null;
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
      .from('competitions')
      .select('*')
      .eq('user_id', user.id)
      .gte('competition_date', today)
      .order('competition_date', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Create a new competition
 */
export async function createCompetition(
  input: CreateCompetitionInput
): Promise<{ data: Competition | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('competitions')
      .insert({
        user_id: user.id,
        name: input.name,
        competition_date: input.competition_date,
        weight_class: input.weight_class,
        target_weight: input.target_weight || null,
        notes: input.notes || null,
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
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

/**
 * Delete a competition
 */
export async function deleteCompetition(
  id: string
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
      .from('competitions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}
