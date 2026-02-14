'use client';

import { useState, useEffect, useCallback } from 'react';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { WeeklyGrid } from '@/components/schedule/WeeklyGrid';
import { ScheduleEntryModal } from '@/components/schedule/ScheduleEntryModal';
import { AdherenceSummary } from '@/components/schedule/AdherenceSummary';
import { TemplateSwitcher } from '@/components/schedule/TemplateSwitcher';
import {
  getScheduleTemplates,
  getActiveScheduleTemplate,
  createScheduleTemplate,
  setActiveTemplate,
  deleteScheduleTemplate,
  getAdherenceForDateRange,
  getWeeklyAdherenceSummary,
  getAdherenceStreak,
  getMonthlyAdherenceTrend,
} from '@/lib/supabase/scheduleQueries';
import {
  ScheduleTemplate,
  ScheduleTemplateWithEntries,
  ScheduleEntry,
  WeeklyAdherenceSummary as WeeklyAdherenceSummaryType,
  AdherenceStreak as AdherenceStreakType,
  AdherenceStatus,
} from '@/lib/types/schedule';

function getWeekStartDate(): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  return monday.toISOString().split('T')[0];
}

function getTodayDayOfWeek(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export default function SchedulePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([]);
  const [activeTemplate, setActiveTemplateState] = useState<ScheduleTemplateWithEntries | null>(null);
  const [adherenceMap, setAdherenceMap] = useState<Map<string, AdherenceStatus>>(new Map());
  const [weeklySummary, setWeeklySummary] = useState<WeeklyAdherenceSummaryType | null>(null);
  const [streak, setStreak] = useState<AdherenceStreakType | null>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<Array<{ month: string; percentage: number }>>([]);
  const [selectedDay, setSelectedDay] = useState(getTodayDayOfWeek());

  // Modal state
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [entryModalDay, setEntryModalDay] = useState(0);
  const [editingEntry, setEditingEntry] = useState<ScheduleEntry | undefined>(undefined);

  // Create template modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [creating, setCreating] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const weekStart = getWeekStartDate();
      const weekEnd = new Date(weekStart + 'T00:00:00');
      weekEnd.setDate(weekEnd.getDate() + 6);
      const weekEndStr = weekEnd.toISOString().split('T')[0];

      const [templatesRes, activeRes, adherenceRes, summaryRes, streakRes, trendRes] = await Promise.all([
        getScheduleTemplates(),
        getActiveScheduleTemplate(),
        getAdherenceForDateRange(weekStart, weekEndStr),
        getWeeklyAdherenceSummary(weekStart),
        getAdherenceStreak(),
        getMonthlyAdherenceTrend(3),
      ]);

      setTemplates(templatesRes.data || []);
      setActiveTemplateState(activeRes.data);

      // Build adherence map (entry_id -> status)
      const map = new Map<string, AdherenceStatus>();
      (adherenceRes.data || []).forEach(a => {
        map.set(a.schedule_entry_id, a.status as AdherenceStatus);
      });
      setAdherenceMap(map);

      setWeeklySummary(summaryRes.data);
      setStreak(streakRes.data);
      setMonthlyTrend(trendRes.data || []);
    } catch (err) {
      console.error('Failed to load schedule data:', err);
      setError('Failed to load schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSwitchTemplate(templateId: string) {
    await setActiveTemplate(templateId);
    await loadData();
  }

  async function handleDeleteTemplate(templateId: string) {
    if (!confirm('Delete this template and all its entries?')) return;
    await deleteScheduleTemplate(templateId);
    await loadData();
  }

  async function handleCreateTemplate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTemplateName.trim()) return;

    setCreating(true);
    try {
      await createScheduleTemplate({ name: newTemplateName.trim(), is_active: true });
      setNewTemplateName('');
      setCreateModalOpen(false);
      await loadData();
    } finally {
      setCreating(false);
    }
  }

  function handleAddEntry(dayOfWeek: number) {
    setEntryModalDay(dayOfWeek);
    setEditingEntry(undefined);
    setEntryModalOpen(true);
  }

  function handleEditEntry(entry: ScheduleEntry) {
    setEntryModalDay(entry.day_of_week);
    setEditingEntry(entry);
    setEntryModalOpen(true);
  }

  if (loading) {
    return (
      <div className="px-4 pt-3">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-48 bg-white/5 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-[#1a1a24] rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="hidden md:grid md:grid-cols-7 gap-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-48 bg-[#1a1a24] rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="md:hidden h-48 bg-[#1a1a24] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 pt-3 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <CalendarDays className="w-12 h-12 text-red-400/40 mx-auto mb-3" />
          <p className="text-red-400 mb-1">Failed to load schedule</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <Button variant="secondary" onClick={loadData}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-3">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">Schedule</h1>
          {templates.length > 0 && (
            <TemplateSwitcher
              templates={templates}
              activeTemplateId={activeTemplate?.id || null}
              onSwitch={handleSwitchTemplate}
              onCreate={() => setCreateModalOpen(true)}
              onDelete={handleDeleteTemplate}
            />
          )}
        </div>

        {/* Empty state */}
        {templates.length === 0 && (
          <div className="text-center py-16">
            <CalendarDays className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-white mb-2">
              No schedule templates yet
            </h2>
            <p className="text-white/50 mb-6 max-w-md mx-auto">
              Create a weekly training template to plan your sessions and track your adherence.
            </p>
            <Button onClick={() => setCreateModalOpen(true)}>
              Create Your First Template
            </Button>
          </div>
        )}

        {/* Active template content */}
        {activeTemplate && (
          <>
            {/* Adherence Summary */}
            <AdherenceSummary
              weeklySummary={weeklySummary}
              streak={streak}
              monthlyTrend={monthlyTrend}
            />

            {/* Weekly Grid */}
            <WeeklyGrid
              template={activeTemplate}
              adherenceMap={adherenceMap}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
              onAddEntry={handleAddEntry}
              onEditEntry={handleEditEntry}
            />
          </>
        )}

        {/* Has templates but none active */}
        {templates.length > 0 && !activeTemplate && (
          <div className="text-center py-12">
            <p className="text-white/50 mb-4">No active template selected.</p>
            <p className="text-white/40 text-sm">
              Use the template switcher above to activate one, or create a new template.
            </p>
          </div>
        )}

        {/* Entry Modal */}
        {activeTemplate && (
          <ScheduleEntryModal
            isOpen={entryModalOpen}
            onClose={() => setEntryModalOpen(false)}
            dayOfWeek={entryModalDay}
            templateId={activeTemplate.id}
            existingEntry={editingEntry}
            onSave={loadData}
          />
        )}

        {/* Create Template Modal */}
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Create Template"
        >
          <form onSubmit={handleCreateTemplate} className="space-y-4">
            <Input
              label="Template Name"
              type="text"
              value={newTemplateName}
              onChange={e => setNewTemplateName(e.target.value)}
              placeholder='e.g. "Regular Week" or "Fight Camp"'
              required
            />
            <div className="flex gap-3">
              <Button type="submit" disabled={creating || !newTemplateName.trim()}>
                {creating ? 'Creating...' : 'Create'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
