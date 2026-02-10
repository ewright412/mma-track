import { supabase } from './client';
import { MMADiscipline } from '../types/training';
import {
  ScheduleTemplate,
  ScheduleTemplateWithEntries,
  ScheduleEntry,
  ScheduleAdherence,
  ScheduleEntryWithAdherence,
  CreateScheduleTemplateInput,
  CreateScheduleEntryInput,
  UpdateScheduleEntryInput,
  WeeklyAdherenceSummary,
  AdherenceStreak,
  AdherenceStatus,
  ScheduleSessionType,
} from '../types/schedule';

// ============================================================================
// TEMPLATE CRUD
// ============================================================================

export async function getScheduleTemplates(): Promise<{
  data: ScheduleTemplate[] | null;
  error: string | null;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('schedule_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    console.error('Error fetching schedule templates:', err);
    return { data: null, error: 'Failed to fetch schedule templates' };
  }
}

export async function getActiveScheduleTemplate(): Promise<{
  data: ScheduleTemplateWithEntries | null;
  error: string | null;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data: template, error: templateError } = await supabase
      .from('schedule_templates')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (templateError || !template) return { data: null, error: null };

    const { data: entries, error: entriesError } = await supabase
      .from('schedule_entries')
      .select('*')
      .eq('template_id', template.id)
      .order('start_time', { ascending: true });

    if (entriesError) return { data: null, error: entriesError.message };

    const allEntries = entries || [];
    const entriesByDay: Record<number, ScheduleEntry[]> = {};
    for (let i = 0; i <= 6; i++) {
      entriesByDay[i] = allEntries.filter(e => e.day_of_week === i);
    }

    return {
      data: { ...template, entries: allEntries, entriesByDay },
      error: null,
    };
  } catch (err) {
    console.error('Error fetching active schedule template:', err);
    return { data: null, error: 'Failed to fetch active template' };
  }
}

export async function createScheduleTemplate(
  input: CreateScheduleTemplateInput
): Promise<{ data: ScheduleTemplate | null; error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    // If this is the first template or is_active requested, deactivate others first
    if (input.is_active) {
      await supabase
        .from('schedule_templates')
        .update({ is_active: false })
        .eq('user_id', user.id);
    }

    const { data, error } = await supabase
      .from('schedule_templates')
      .insert({
        user_id: user.id,
        name: input.name,
        is_active: input.is_active ?? true,
      })
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    console.error('Error creating schedule template:', err);
    return { data: null, error: 'Failed to create schedule template' };
  }
}

export async function updateScheduleTemplate(
  id: string,
  updates: Partial<CreateScheduleTemplateInput>
): Promise<{ data: ScheduleTemplate | null; error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('schedule_templates')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    console.error('Error updating schedule template:', err);
    return { data: null, error: 'Failed to update schedule template' };
  }
}

export async function setActiveTemplate(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // Deactivate all templates
    await supabase
      .from('schedule_templates')
      .update({ is_active: false })
      .eq('user_id', user.id);

    // Activate the selected one
    const { error } = await supabase
      .from('schedule_templates')
      .update({ is_active: true })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    console.error('Error setting active template:', err);
    return { success: false, error: 'Failed to set active template' };
  }
}

export async function deleteScheduleTemplate(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('schedule_templates')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    console.error('Error deleting schedule template:', err);
    return { success: false, error: 'Failed to delete schedule template' };
  }
}

// ============================================================================
// ENTRY CRUD
// ============================================================================

export async function createScheduleEntry(
  input: CreateScheduleEntryInput
): Promise<{ data: ScheduleEntry | null; error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const sessionType = input.is_rest_day ? 'training' : (input.session_type || 'training');

    const { data, error } = await supabase
      .from('schedule_entries')
      .insert({
        template_id: input.template_id,
        day_of_week: input.day_of_week,
        session_type: sessionType,
        discipline: input.is_rest_day ? null : (sessionType === 'training' ? input.discipline || null : null),
        cardio_type: sessionType === 'cardio' ? input.cardio_type || null : null,
        muscle_group: sessionType === 'strength' ? input.muscle_group || null : null,
        start_time: input.start_time,
        end_time: input.end_time,
        location: input.location || null,
        notes: input.notes || null,
        is_rest_day: input.is_rest_day || false,
      })
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    console.error('Error creating schedule entry:', err);
    return { data: null, error: 'Failed to create schedule entry' };
  }
}

export async function updateScheduleEntry(
  id: string,
  input: UpdateScheduleEntryInput
): Promise<{ data: ScheduleEntry | null; error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('schedule_entries')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    console.error('Error updating schedule entry:', err);
    return { data: null, error: 'Failed to update schedule entry' };
  }
}

export async function deleteScheduleEntry(
  id: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('schedule_entries')
      .delete()
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    console.error('Error deleting schedule entry:', err);
    return { success: false, error: 'Failed to delete schedule entry' };
  }
}

// ============================================================================
// ADHERENCE
// ============================================================================

export async function recordAdherence(
  entryId: string,
  date: string,
  status: 'completed' | 'partial',
  sessionId?: string
): Promise<{ data: ScheduleAdherence | null; error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('schedule_adherence')
      .upsert(
        {
          user_id: user.id,
          schedule_entry_id: entryId,
          date,
          status,
          session_id: sessionId || null,
        },
        { onConflict: 'schedule_entry_id,date' }
      )
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data, error: null };
  } catch (err) {
    console.error('Error recording adherence:', err);
    return { data: null, error: 'Failed to record adherence' };
  }
}

export async function getAdherenceForDateRange(
  startDate: string,
  endDate: string
): Promise<{ data: ScheduleAdherence[] | null; error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('schedule_adherence')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) return { data: null, error: error.message };
    return { data: data || [], error: null };
  } catch (err) {
    console.error('Error fetching adherence:', err);
    return { data: null, error: 'Failed to fetch adherence data' };
  }
}

// ============================================================================
// AUTO-MATCHING
// ============================================================================

/** Helper: compute day of week (0=Monday) from a date string */
function getDayOfWeek(dateStr: string): number {
  const date = new Date(dateStr + 'T00:00:00');
  const jsDay = date.getDay(); // 0=Sun, 1=Mon
  return jsDay === 0 ? 6 : jsDay - 1; // Convert to 0=Mon
}

/** Helper: compute expected duration in minutes from an entry's times */
function getExpectedMinutes(entry: ScheduleEntry): number {
  const [startH, startM] = entry.start_time.split(':').map(Number);
  const [endH, endM] = entry.end_time.split(':').map(Number);
  return (endH * 60 + endM) - (startH * 60 + startM);
}

/**
 * Match a training session to the schedule (existing behavior, now scoped to session_type='training')
 */
export async function matchSessionToSchedule(
  sessionId: string,
  sessionDate: string,
  discipline: MMADiscipline,
  durationMinutes: number
): Promise<{ matched: boolean; error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { matched: false, error: 'Not authenticated' };

    const { data: template } = await getActiveScheduleTemplate();
    if (!template) return { matched: false, error: null };

    const dayOfWeek = getDayOfWeek(sessionDate);

    // Find matching training entries (same day, same discipline, not rest day)
    const dayEntries = template.entries.filter(
      e => e.day_of_week === dayOfWeek
        && (e.session_type === 'training' || !e.session_type)
        && e.discipline === discipline
        && !e.is_rest_day
    );

    if (dayEntries.length === 0) return { matched: false, error: null };

    const { data: existingAdherence } = await getAdherenceForDateRange(sessionDate, sessionDate);
    const matchedEntryIds = new Set((existingAdherence || []).map(a => a.schedule_entry_id));
    const unmatchedEntry = dayEntries.find(e => !matchedEntryIds.has(e.id));

    if (!unmatchedEntry) return { matched: false, error: null };

    const expectedMinutes = getExpectedMinutes(unmatchedEntry);
    const status = durationMinutes >= expectedMinutes * 0.8 ? 'completed' : 'partial';

    await recordAdherence(unmatchedEntry.id, sessionDate, status, sessionId);
    return { matched: true, error: null };
  } catch (err) {
    console.error('Error matching session to schedule:', err);
    return { matched: false, error: 'Schedule matching failed' };
  }
}

/**
 * Match a strength workout to the schedule
 */
export async function matchStrengthToSchedule(
  logId: string,
  workoutDate: string,
  durationMinutes: number
): Promise<{ matched: boolean; error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { matched: false, error: 'Not authenticated' };

    const { data: template } = await getActiveScheduleTemplate();
    if (!template) return { matched: false, error: null };

    const dayOfWeek = getDayOfWeek(workoutDate);

    // Find strength entries for this day
    const dayEntries = template.entries.filter(
      e => e.day_of_week === dayOfWeek
        && e.session_type === 'strength'
        && !e.is_rest_day
    );

    if (dayEntries.length === 0) return { matched: false, error: null };

    const { data: existingAdherence } = await getAdherenceForDateRange(workoutDate, workoutDate);
    const matchedEntryIds = new Set((existingAdherence || []).map(a => a.schedule_entry_id));
    const unmatchedEntry = dayEntries.find(e => !matchedEntryIds.has(e.id));

    if (!unmatchedEntry) return { matched: false, error: null };

    const expectedMinutes = getExpectedMinutes(unmatchedEntry);
    const status = durationMinutes >= expectedMinutes * 0.8 ? 'completed' : 'partial';

    await recordAdherence(unmatchedEntry.id, workoutDate, status, logId);
    return { matched: true, error: null };
  } catch (err) {
    console.error('Error matching strength to schedule:', err);
    return { matched: false, error: 'Schedule matching failed' };
  }
}

/**
 * Match a cardio session to the schedule
 */
export async function matchCardioToSchedule(
  logId: string,
  sessionDate: string,
  cardioType: string,
  durationMinutes: number
): Promise<{ matched: boolean; error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { matched: false, error: 'Not authenticated' };

    const { data: template } = await getActiveScheduleTemplate();
    if (!template) return { matched: false, error: null };

    const dayOfWeek = getDayOfWeek(sessionDate);

    // Find cardio entries for this day. Optionally match cardio_type if specified.
    const dayEntries = template.entries.filter(
      e => e.day_of_week === dayOfWeek
        && e.session_type === 'cardio'
        && !e.is_rest_day
    );

    if (dayEntries.length === 0) return { matched: false, error: null };

    const { data: existingAdherence } = await getAdherenceForDateRange(sessionDate, sessionDate);
    const matchedEntryIds = new Set((existingAdherence || []).map(a => a.schedule_entry_id));

    // Prefer matching same cardio type first, fall back to any unmatched cardio entry
    const unmatchedEntry =
      dayEntries.find(e => !matchedEntryIds.has(e.id) && e.cardio_type === cardioType) ||
      dayEntries.find(e => !matchedEntryIds.has(e.id));

    if (!unmatchedEntry) return { matched: false, error: null };

    const expectedMinutes = getExpectedMinutes(unmatchedEntry);
    const status = durationMinutes >= expectedMinutes * 0.8 ? 'completed' : 'partial';

    await recordAdherence(unmatchedEntry.id, sessionDate, status, logId);
    return { matched: true, error: null };
  } catch (err) {
    console.error('Error matching cardio to schedule:', err);
    return { matched: false, error: 'Schedule matching failed' };
  }
}

// ============================================================================
// DASHBOARD HELPERS
// ============================================================================

export async function getTodaysSchedule(): Promise<{
  data: ScheduleEntryWithAdherence[] | null;
  error: string | null;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data: template } = await getActiveScheduleTemplate();
    if (!template) return { data: [], error: null };

    const today = new Date();
    const jsDay = today.getDay();
    const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1;
    const todayStr = today.toISOString().split('T')[0];

    const dayEntries = template.entriesByDay[dayOfWeek] || [];

    // Get adherence for today
    const { data: adherence } = await getAdherenceForDateRange(todayStr, todayStr);
    const adherenceMap = new Map((adherence || []).map(a => [a.schedule_entry_id, a]));

    const entriesWithAdherence: ScheduleEntryWithAdherence[] = dayEntries.map(entry => {
      const record = adherenceMap.get(entry.id);
      let adherenceStatus: AdherenceStatus = 'missed';

      if (record) {
        adherenceStatus = record.status as AdherenceStatus;
      } else if (!entry.is_rest_day) {
        const now = new Date();
        const [endH, endM] = entry.end_time.split(':').map(Number);
        const entryEndTime = new Date(today);
        entryEndTime.setHours(endH, endM, 0, 0);

        if (now < entryEndTime) {
          adherenceStatus = 'missed'; // upcoming — displayed differently in component
        }
      }

      return {
        ...entry,
        adherence_status: adherenceStatus,
        matched_session_id: record?.session_id || null,
      };
    });

    return { data: entriesWithAdherence, error: null };
  } catch (err) {
    console.error('Error fetching today schedule:', err);
    return { data: null, error: 'Failed to fetch today schedule' };
  }
}

export async function getWeeklyAdherenceSummary(
  weekStartDate: string
): Promise<{ data: WeeklyAdherenceSummary | null; error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data: template } = await getActiveScheduleTemplate();
    if (!template) return { data: null, error: null };

    // Calculate week end date
    const weekStart = new Date(weekStartDate + 'T00:00:00');
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    const todayStr = new Date().toISOString().split('T')[0];

    // Count total non-rest entries for days that have passed
    const today = new Date();
    const jsDay = today.getDay();
    const currentDayOfWeek = jsDay === 0 ? 6 : jsDay - 1;

    let totalScheduled = 0;
    for (let d = 0; d <= 6; d++) {
      const dayEntries = (template.entriesByDay[d] || []).filter(e => !e.is_rest_day);
      // Only count days that are in the past or today
      if (d <= currentDayOfWeek) {
        totalScheduled += dayEntries.length;
      }
    }

    if (totalScheduled === 0) {
      return {
        data: { completed: 0, partial: 0, missed: 0, total: 0, percentage: 100 },
        error: null,
      };
    }

    // Get adherence records for this week
    const { data: adherence } = await getAdherenceForDateRange(weekStartDate, weekEndStr < todayStr ? weekEndStr : todayStr);
    const adherenceRecords = adherence || [];

    const completed = adherenceRecords.filter(a => a.status === 'completed').length;
    const partial = adherenceRecords.filter(a => a.status === 'partial').length;
    const missed = totalScheduled - completed - partial;
    const percentage = totalScheduled > 0
      ? Math.round(((completed + partial * 0.5) / totalScheduled) * 100)
      : 100;

    return {
      data: { completed, partial, missed, total: totalScheduled, percentage },
      error: null,
    };
  } catch (err) {
    console.error('Error calculating weekly adherence:', err);
    return { data: null, error: 'Failed to calculate weekly adherence' };
  }
}

export async function getAdherenceStreak(): Promise<{
  data: AdherenceStreak | null;
  error: string | null;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data: template } = await getActiveScheduleTemplate();
    if (!template) return { data: { current: 0, longest: 0 }, error: null };

    // Look back up to 90 days for streak calculation
    const today = new Date();
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: adherence } = await getAdherenceForDateRange(
      ninetyDaysAgo.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    );
    const adherenceByDate = new Map<string, ScheduleAdherence[]>();
    (adherence || []).forEach(a => {
      const existing = adherenceByDate.get(a.date) || [];
      existing.push(a);
      adherenceByDate.set(a.date, existing);
    });

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Walk backwards from today
    for (let i = 0; i < 90; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      const jsDay = checkDate.getDay();
      const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1;

      const dayEntries = (template.entriesByDay[dayOfWeek] || []).filter(e => !e.is_rest_day);

      // Rest days or no-schedule days don't break the streak
      if (dayEntries.length === 0) {
        continue;
      }

      const dayAdherence = adherenceByDate.get(dateStr) || [];
      const allCompleted = dayEntries.every(entry =>
        dayAdherence.some(a => a.schedule_entry_id === entry.id && (a.status === 'completed' || a.status === 'partial'))
      );

      if (allCompleted) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (i === 0) {
          // Today not complete yet - don't count today, check if yesterday keeps streak
          continue;
        }
        if (currentStreak === 0) {
          currentStreak = tempStreak;
        }
        break;
      }
    }

    if (currentStreak === 0) {
      currentStreak = tempStreak;
    }

    return { data: { current: currentStreak, longest: longestStreak }, error: null };
  } catch (err) {
    console.error('Error calculating adherence streak:', err);
    return { data: null, error: 'Failed to calculate streak' };
  }
}

export async function getMonthlyAdherenceTrend(
  months: number = 3
): Promise<{ data: Array<{ month: string; percentage: number }> | null; error: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: 'Not authenticated' };

    const { data: template } = await getActiveScheduleTemplate();
    if (!template) return { data: [], error: null };

    const today = new Date();
    const result: Array<{ month: string; percentage: number }> = [];

    for (let m = months - 1; m >= 0; m--) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() - m, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - m + 1, 0);
      const endDate = monthEnd > today ? today : monthEnd;

      const monthStartStr = monthStart.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Count scheduled entries for this month
      let totalScheduled = 0;
      const current = new Date(monthStart);
      while (current <= endDate) {
        const jsDay = current.getDay();
        const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1;
        const dayEntries = (template.entriesByDay[dayOfWeek] || []).filter(e => !e.is_rest_day);
        totalScheduled += dayEntries.length;
        current.setDate(current.getDate() + 1);
      }

      const { data: adherence } = await getAdherenceForDateRange(monthStartStr, endDateStr);
      const completed = (adherence || []).filter(a => a.status === 'completed').length;
      const partial = (adherence || []).filter(a => a.status === 'partial').length;

      const percentage = totalScheduled > 0
        ? Math.round(((completed + partial * 0.5) / totalScheduled) * 100)
        : 0;

      result.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        percentage,
      });
    }

    return { data: result, error: null };
  } catch (err) {
    console.error('Error calculating monthly adherence trend:', err);
    return { data: null, error: 'Failed to calculate monthly trend' };
  }
}
