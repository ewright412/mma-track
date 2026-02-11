import { supabase } from './client';
import { ChatMessage, CoachConversation } from '../types/coach';

// ============================================================================
// CONVERSATIONS
// ============================================================================

export async function getConversations(): Promise<{
  data: CoachConversation[] | null;
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
      .from('ai_coach_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

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

export async function getConversationById(
  conversationId: string
): Promise<{ data: CoachConversation | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('ai_coach_conversations')
      .select('*')
      .eq('id', conversationId)
      .eq('user_id', user.id)
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

export async function createConversation(): Promise<{
  data: CoachConversation | null;
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
      .from('ai_coach_conversations')
      .insert({
        user_id: user.id,
        messages: [],
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

export async function updateConversationMessages(
  conversationId: string,
  messages: ChatMessage[]
): Promise<{ error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: new Error('Not authenticated') };
    }

    const { error } = await supabase
      .from('ai_coach_conversations')
      .update({
        messages,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)
      .eq('user_id', user.id);

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export async function deleteConversation(
  conversationId: string
): Promise<{ error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: new Error('Not authenticated') };
    }

    const { error } = await supabase
      .from('ai_coach_conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', user.id);

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

// ============================================================================
// USAGE TRACKING
// ============================================================================

export async function getTodayUsage(): Promise<{
  data: number;
  error: Error | null;
}> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: 0, error: new Error('Not authenticated') };
    }

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('ai_usage_tracking')
      .select('message_count')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is fine
      return { data: 0, error };
    }

    return { data: data?.message_count || 0, error: null };
  } catch (error) {
    return {
      data: 0,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}
