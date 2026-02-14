'use client';

import { Plus } from 'lucide-react';
import { ScheduleTemplateWithEntries, ScheduleEntryWithAdherence, AdherenceStatus } from '@/lib/types/schedule';
import { ScheduleEntryCard } from './ScheduleEntryCard';
import { ScheduleEntry } from '@/lib/types/schedule';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_LABELS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface WeeklyGridProps {
  template: ScheduleTemplateWithEntries;
  adherenceMap: Map<string, AdherenceStatus>;
  selectedDay: number;
  onSelectDay: (day: number) => void;
  onAddEntry: (dayOfWeek: number) => void;
  onEditEntry: (entry: ScheduleEntry) => void;
}

function getEntriesWithAdherence(
  entries: ScheduleEntry[],
  adherenceMap: Map<string, AdherenceStatus>
): ScheduleEntryWithAdherence[] {
  return entries.map(entry => ({
    ...entry,
    adherence_status: adherenceMap.get(entry.id) || 'missed' as AdherenceStatus,
    matched_session_id: null,
  }));
}

function getTodayDayOfWeek(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function WeeklyGrid({
  template,
  adherenceMap,
  selectedDay,
  onSelectDay,
  onAddEntry,
  onEditEntry,
}: WeeklyGridProps) {
  const todayDOW = getTodayDayOfWeek();

  return (
    <>
      {/* Desktop: 7-column grid */}
      <div className="hidden md:grid md:grid-cols-7 gap-2">
        {DAY_LABELS.map((label, dayIndex) => {
          const dayEntries = template.entriesByDay[dayIndex] || [];
          const entriesWithAdherence = getEntriesWithAdherence(dayEntries, adherenceMap);
          const isToday = dayIndex === todayDOW;

          return (
            <div key={dayIndex} className="min-h-[200px]">
              {/* Day header */}
              <div
                className={`text-center py-2 mb-2 rounded-xl text-sm font-medium ${
                  isToday
                    ? 'bg-accent/20 text-accent'
                    : 'bg-white/5 text-white/60'
                }`}
              >
                {label}
              </div>

              {/* Entries */}
              <div className="space-y-2">
                {entriesWithAdherence.map(entry => (
                  <ScheduleEntryCard
                    key={entry.id}
                    entry={entry}
                    showAdherence={dayIndex <= todayDOW}
                    onClick={() => onEditEntry(entry)}
                  />
                ))}

                {/* Add button */}
                <button
                  type="button"
                  onClick={() => onAddEntry(dayIndex)}
                  className="w-full p-2 border border-dashed border-white/10 rounded-xl text-white/30 hover:text-white/60 hover:border-white/20 transition-all duration-150 flex items-center justify-center gap-1 text-xs"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: Day tabs + single day view */}
      <div className="md:hidden">
        {/* Day tabs */}
        <div className="flex overflow-x-auto gap-1 pb-2 mb-4 scrollbar-hide">
          {DAY_LABELS.map((label, dayIndex) => {
            const isSelected = selectedDay === dayIndex;
            const isToday = dayIndex === todayDOW;
            const dayEntries = template.entriesByDay[dayIndex] || [];
            const hasEntries = dayEntries.length > 0;

            return (
              <button
                key={dayIndex}
                type="button"
                onClick={() => onSelectDay(dayIndex)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 relative ${
                  isSelected
                    ? 'bg-accent text-white'
                    : isToday
                    ? 'bg-accent/20 text-accent'
                    : 'bg-[#1a1a24] text-white/60 hover:text-white/80'
                }`}
              >
                {label}
                {hasEntries && !isSelected && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-accent rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected day entries */}
        <div>
          <h3 className="text-sm font-medium text-white/60 mb-3">
            {DAY_LABELS_FULL[selectedDay]}
          </h3>
          <div className="space-y-3">
            {(() => {
              const dayEntries = template.entriesByDay[selectedDay] || [];
              const entriesWithAdherence = getEntriesWithAdherence(dayEntries, adherenceMap);

              return (
                <>
                  {entriesWithAdherence.map(entry => (
                    <ScheduleEntryCard
                      key={entry.id}
                      entry={entry}
                      showAdherence={selectedDay <= todayDOW}
                      onClick={() => onEditEntry(entry)}
                    />
                  ))}

                  {entriesWithAdherence.length === 0 && (
                    <div className="text-center py-8 text-white/30 text-sm">
                      No sessions scheduled
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => onAddEntry(selectedDay)}
                    className="w-full p-3 border border-dashed border-white/10 rounded-xl text-white/40 hover:text-white/60 hover:border-white/20 transition-all duration-150 flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Session
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </>
  );
}
