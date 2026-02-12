import { supabase } from './client';
import {
  Technique,
  TechniqueFilters,
  TechniquePracticeLog,
  CreatePracticeLogInput,
} from '../types/technique';

// ============================================================================
// READ - Techniques (public, no auth needed)
// ============================================================================

export async function getAllTechniques(
  filters?: TechniqueFilters
): Promise<{ data: Technique[] | null; error: Error | null }> {
  try {
    let query = supabase
      .from('techniques')
      .select('*')
      .order('discipline', { ascending: true })
      .order('name', { ascending: true });

    if (filters) {
      if (filters.discipline && filters.discipline !== 'All') {
        query = query.eq('discipline', filters.discipline);
      }

      if (filters.category && filters.category !== 'All') {
        query = query.eq('category', filters.category);
      }

      if (filters.position && filters.position !== 'All') {
        query = query.eq('position', filters.position);
      }

      if (filters.difficulty && filters.difficulty !== 'All') {
        query = query.eq('difficulty', filters.difficulty);
      }

      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }
    }

    const { data, error } = await query;

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

export async function getTechniqueById(
  techniqueId: string
): Promise<{ data: Technique | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('techniques')
      .select('*')
      .eq('id', techniqueId)
      .single();

    if (error || !data) {
      return { data: null, error: error || new Error('Technique not found') };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

export async function getTechniquesByDiscipline(
  discipline: string
): Promise<{ data: Technique[] | null; error: Error | null }> {
  return getAllTechniques({ discipline });
}

export async function searchTechniques(
  searchTerm: string
): Promise<{ data: Technique[] | null; error: Error | null }> {
  return getAllTechniques({ search: searchTerm });
}

// ============================================================================
// PRACTICE LOGS (authenticated)
// ============================================================================

export async function createPracticeLog(
  input: CreatePracticeLogInput
): Promise<{ data: TechniquePracticeLog | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('technique_practice_logs')
      .insert({
        user_id: user.id,
        technique_id: input.technique_id,
        notes: input.notes || null,
      })
      .select()
      .single();

    if (error || !data) {
      return { data: null, error: error || new Error('Failed to create practice log') };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

export async function getUserPracticeLogs(
  techniqueId?: string
): Promise<{ data: TechniquePracticeLog[] | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    let query = supabase
      .from('technique_practice_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('practiced_at', { ascending: false });

    if (techniqueId) {
      query = query.eq('technique_id', techniqueId);
    }

    const { data, error } = await query;

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

export async function getTechniqueLastPracticed(
  techniqueId: string
): Promise<{ data: string | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: null }; // Return null if not authenticated, not an error
    }

    const { data, error } = await supabase
      .from('technique_practice_logs')
      .select('practiced_at')
      .eq('user_id', user.id)
      .eq('technique_id', techniqueId)
      .order('practiced_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return { data: null, error };
    }

    return { data: data?.practiced_at || null, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}
