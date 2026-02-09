import { MMADiscipline } from './training';

// ============================================================================
// SCHEDULE TEMPLATE
// ============================================================================

export interface ScheduleTemplate {
  id: string;
  user_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface CreateScheduleTemplateInput {
  name: string;
  is_active?: boolean;
}

// ============================================================================
// SCHEDULE ENTRY
// ============================================================================

export interface ScheduleEntry {
  id: string;
  template_id: string;
  day_of_week: number; // 0=Monday, 1=Tuesday, ..., 6=Sunday
  discipline: MMADiscipline | null; // null for rest days
  start_time: string; // HH:MM format
  end_time: string;   // HH:MM format
  location: string | null;
  notes: string | null;
  is_rest_day: boolean;
  created_at: string;
}

export interface CreateScheduleEntryInput {
  template_id: string;
  day_of_week: number;
  discipline?: MMADiscipline;
  start_time: string;
  end_time: string;
  location?: string;
  notes?: string;
  is_rest_day?: boolean;
}

export interface UpdateScheduleEntryInput {
  discipline?: MMADiscipline | null;
  start_time?: string;
  end_time?: string;
  location?: string | null;
  notes?: string | null;
  is_rest_day?: boolean;
}

// ============================================================================
// SCHEDULE ADHERENCE
// ============================================================================

export type AdherenceStatus = 'completed' | 'partial' | 'missed';

export interface ScheduleAdherence {
  id: string;
  user_id: string;
  schedule_entry_id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  status: 'completed' | 'partial';
  session_id: string | null;
  created_at: string;
}

// ============================================================================
// COMPUTED / VIEW TYPES (not stored, calculated client-side)
// ============================================================================

export interface ScheduleEntryWithAdherence extends ScheduleEntry {
  adherence_status: AdherenceStatus; // includes inferred 'missed'
  matched_session_id: string | null;
}

export interface DaySchedule {
  dayOfWeek: number;
  dayLabel: string; // "Mon", "Tue", etc.
  entries: ScheduleEntryWithAdherence[];
  isRestDay: boolean;
}

export interface WeeklyAdherenceSummary {
  completed: number;
  partial: number;
  missed: number;
  total: number;
  percentage: number; // 0-100
}

export interface AdherenceStreak {
  current: number;
  longest: number;
}

export interface ScheduleTemplateWithEntries extends ScheduleTemplate {
  entries: ScheduleEntry[];
  entriesByDay: Record<number, ScheduleEntry[]>;
}
