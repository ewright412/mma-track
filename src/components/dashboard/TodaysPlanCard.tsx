'use client';

import Link from 'next/link';
import { CalendarDays, Clock, MapPin, Coffee, Check, Minus, AlertCircle, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ScheduleEntryWithAdherence } from '@/lib/types/schedule';
import { DISCIPLINE_HEX_COLORS } from '@/lib/constants/disciplines';
import { MMADiscipline } from '@/lib/types/training';

interface TodaysPlanCardProps {
  entries: ScheduleEntryWithAdherence[];
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
}

export function TodaysPlanCard({ entries }: TodaysPlanCardProps) {
  // No schedule set at all
  if (entries.length === 0) {
    return null;
  }

  const isRestDay = entries.some(e => e.is_rest_day);
  const trainingEntries = entries.filter(e => !e.is_rest_day);
  const completedCount = trainingEntries.filter(e => e.adherence_status === 'completed').length;
  const allDone = trainingEntries.length > 0 && completedCount === trainingEntries.length;

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-accent" />
          <h2 className="text-base font-semibold text-white">Today&apos;s Plan</h2>
          {allDone && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
              Complete
            </span>
          )}
        </div>
        <Link
          href="/schedule"
          className="text-xs text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
        >
          Schedule
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isRestDay && trainingEntries.length === 0 ? (
        <div className="flex items-center gap-3 p-3 bg-green-500/5 border border-green-500/10 rounded-xl">
          <Coffee className="w-5 h-5 text-green-400/70" />
          <div>
            <p className="text-sm font-medium text-white/70">Rest Day</p>
            <p className="text-xs text-white/40">Recovery is part of the process</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {trainingEntries.map(entry => {
            const color = entry.discipline
              ? DISCIPLINE_HEX_COLORS[entry.discipline as MMADiscipline] || '#6b7280'
              : '#6b7280';
            const isCompleted = entry.adherence_status === 'completed';
            const isPartial = entry.adherence_status === 'partial';

            return (
              <div
                key={entry.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all ${
                  isCompleted
                    ? 'bg-green-500/5 border border-green-500/10'
                    : isPartial
                    ? 'bg-yellow-500/5 border border-yellow-500/10'
                    : 'bg-white/[0.02] border border-white/[0.06]'
                }`}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium ${
                        isCompleted ? 'text-white/50 line-through' : 'text-white'
                      }`}
                    >
                      {entry.discipline}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/40 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                    </span>
                    {entry.location && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3" />
                        {entry.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status indicator */}
                {isCompleted && (
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20">
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  </div>
                )}
                {isPartial && (
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-500/20">
                    <Minus className="w-3.5 h-3.5 text-yellow-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
