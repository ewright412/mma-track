import { MMADiscipline } from './training';

export interface Note {
  id: string;
  user_id: string;
  title: string | null;
  content: string;
  discipline: MMADiscipline | null;
  session_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface NoteTag {
  id: string;
  note_id: string;
  tag_name: string;
}

export interface NoteWithTags extends Note {
  tags: string[];
}

export interface CreateNoteInput {
  title?: string;
  content: string;
  discipline?: MMADiscipline;
  session_id?: string;
  tags?: string[];
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  discipline?: MMADiscipline | null;
  session_id?: string | null;
  tags?: string[];
}

export interface NoteFilters {
  discipline?: MMADiscipline;
  search?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}

export interface TagCount {
  tag_name: string;
  count: number;
}

export interface TagWithDiscipline {
  tag_name: string;
  discipline: MMADiscipline | null;
  count: number;
}
