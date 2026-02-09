import { supabase } from './client';
import {
  Note,
  NoteWithTags,
  CreateNoteInput,
  UpdateNoteInput,
  NoteFilters,
  TagCount,
  TagWithDiscipline,
} from '../types/notebook';

// ============================================================================
// CREATE
// ============================================================================

export async function createNote(
  input: CreateNoteInput
): Promise<{ data: NoteWithTags | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data: note, error: noteError } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title: input.title ?? null,
        content: input.content,
        discipline: input.discipline ?? null,
        session_id: input.session_id ?? null,
      })
      .select()
      .single();

    if (noteError || !note) {
      return { data: null, error: noteError || new Error('Failed to create note') };
    }

    // Insert tags if any
    const tags: string[] = [];
    if (input.tags && input.tags.length > 0) {
      const tagsData = input.tags.map((tag) => ({
        note_id: note.id,
        tag_name: tag,
      }));

      const { error: tagsError } = await supabase
        .from('note_tags')
        .insert(tagsData);

      if (tagsError) {
        console.error('Failed to insert tags:', tagsError);
      } else {
        tags.push(...input.tags);
      }
    }

    return {
      data: { ...note, tags },
      error: null,
    };
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

export async function getNotes(
  filters?: NoteFilters
): Promise<{ data: NoteWithTags[] | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    let query = supabase
      .from('notes')
      .select('*, note_tags(tag_name)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (filters) {
      if (filters.discipline) {
        query = query.eq('discipline', filters.discipline);
      }

      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`
        );
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 20) - 1
        );
      }
    }

    const { data: notes, error } = await query;

    if (error) {
      return { data: null, error };
    }

    if (!notes) {
      return { data: [], error: null };
    }

    // Transform note_tags join into flat tags array
    const notesWithTags: NoteWithTags[] = notes.map((note) => {
      const tagRecords = (note.note_tags || []) as Array<{ tag_name: string }>;
      const { note_tags: _, ...noteData } = note;
      return {
        ...(noteData as Note),
        tags: tagRecords.map((t) => t.tag_name),
      };
    });

    // Filter by tag in-memory (Supabase doesn't easily filter parent by child value)
    if (filters?.tag) {
      const filtered = notesWithTags.filter((n) => n.tags.includes(filters.tag!));
      return { data: filtered, error: null };
    }

    return { data: notesWithTags, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

export async function getNoteById(
  noteId: string
): Promise<{ data: NoteWithTags | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data: note, error } = await supabase
      .from('notes')
      .select('*, note_tags(tag_name)')
      .eq('id', noteId)
      .eq('user_id', user.id)
      .single();

    if (error || !note) {
      return { data: null, error: error || new Error('Note not found') };
    }

    const tagRecords = (note.note_tags || []) as Array<{ tag_name: string }>;
    const { note_tags: _, ...noteData } = note;

    return {
      data: {
        ...(noteData as Note),
        tags: tagRecords.map((t) => t.tag_name),
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

export async function getNotesBySession(
  sessionId: string
): Promise<{ data: NoteWithTags[] | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    const { data: notes, error } = await supabase
      .from('notes')
      .select('*, note_tags(tag_name)')
      .eq('session_id', sessionId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      return { data: null, error };
    }

    if (!notes) {
      return { data: [], error: null };
    }

    const notesWithTags: NoteWithTags[] = notes.map((note) => {
      const tagRecords = (note.note_tags || []) as Array<{ tag_name: string }>;
      const { note_tags: _, ...noteData } = note;
      return {
        ...(noteData as Note),
        tags: tagRecords.map((t) => t.tag_name),
      };
    });

    return { data: notesWithTags, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

export async function getAllTags(
  userId: string
): Promise<{ data: string[] | null; error: Error | null }> {
  try {
    const { data: tags, error } = await supabase
      .from('note_tags')
      .select('tag_name, notes!inner(user_id)')
      .eq('notes.user_id', userId);

    if (error) {
      return { data: null, error };
    }

    if (!tags || tags.length === 0) {
      return { data: [], error: null };
    }

    // Count frequency and sort by most used
    const freq: Record<string, number> = {};
    for (const t of tags) {
      freq[t.tag_name] = (freq[t.tag_name] || 0) + 1;
    }

    const sorted = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    return { data: sorted, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

export async function getTagCounts(
  userId: string
): Promise<{ data: TagCount[] | null; error: Error | null }> {
  try {
    const { data: tags, error } = await supabase
      .from('note_tags')
      .select('tag_name, notes!inner(user_id)')
      .eq('notes.user_id', userId);

    if (error) {
      return { data: null, error };
    }

    if (!tags || tags.length === 0) {
      return { data: [], error: null };
    }

    const freq: Record<string, number> = {};
    for (const t of tags) {
      freq[t.tag_name] = (freq[t.tag_name] || 0) + 1;
    }

    const tagCounts: TagCount[] = Object.entries(freq)
      .map(([tag_name, count]) => ({ tag_name, count }))
      .sort((a, b) => b.count - a.count);

    return { data: tagCounts, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

export async function getTagsWithDiscipline(
  userId: string
): Promise<{ data: TagWithDiscipline[] | null; error: Error | null }> {
  try {
    const { data: rows, error } = await supabase
      .from('note_tags')
      .select('tag_name, notes!inner(user_id, discipline)')
      .eq('notes.user_id', userId);

    if (error) {
      return { data: null, error };
    }

    if (!rows || rows.length === 0) {
      return { data: [], error: null };
    }

    // Group by (tag_name, discipline)
    const key = (tag: string, disc: string | null) => `${tag}|||${disc ?? '__none__'}`;
    const freq: Record<string, { tag_name: string; discipline: string | null; count: number }> = {};

    for (const row of rows) {
      const noteData = row.notes as unknown as { discipline: string | null };
      const disc = noteData?.discipline ?? null;
      const k = key(row.tag_name, disc);
      if (!freq[k]) {
        freq[k] = { tag_name: row.tag_name, discipline: disc, count: 0 };
      }
      freq[k].count++;
    }

    const result = Object.values(freq).sort((a, b) => b.count - a.count) as TagWithDiscipline[];
    return { data: result, error: null };
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

export async function updateNote(
  noteId: string,
  input: UpdateNoteInput
): Promise<{ data: NoteWithTags | null; error: Error | null }> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    // Build update payload — only include provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (input.title !== undefined) updateData.title = input.title;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.discipline !== undefined) updateData.discipline = input.discipline;
    if (input.session_id !== undefined) updateData.session_id = input.session_id;

    const { data: note, error: noteError } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', noteId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (noteError || !note) {
      return { data: null, error: noteError || new Error('Note not found') };
    }

    // Replace tags if provided
    let tags: string[] = [];
    if (input.tags !== undefined) {
      // Delete existing tags
      const { error: deleteError } = await supabase
        .from('note_tags')
        .delete()
        .eq('note_id', noteId);

      if (deleteError) {
        return { data: null, error: deleteError };
      }

      // Insert new tags
      if (input.tags.length > 0) {
        const tagsData = input.tags.map((tag) => ({
          note_id: noteId,
          tag_name: tag,
        }));

        const { error: insertError } = await supabase
          .from('note_tags')
          .insert(tagsData);

        if (insertError) {
          return { data: null, error: insertError };
        }

        tags = input.tags;
      }
    } else {
      // Tags not being updated — fetch current tags
      const { data: existingTags } = await supabase
        .from('note_tags')
        .select('tag_name')
        .eq('note_id', noteId);

      tags = (existingTags || []).map((t) => t.tag_name);
    }

    return {
      data: { ...note, tags },
      error: null,
    };
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

export async function deleteNote(
  noteId: string
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
      .from('notes')
      .delete()
      .eq('id', noteId)
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
