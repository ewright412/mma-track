'use client';

import { Clock, MapPin, Coffee, Check, AlertCircle, Minus } from 'lucide-react';
import { ScheduleEntryWithAdherence, AdherenceStatus } from '@/lib/types/schedule';
import { DISCIPLINE_HEX_COLORS } from '@/lib/constants/disciplines';
import { MMADiscipline } from '@/lib/types/training';

interface ScheduleEntryCardProps {
  entry: ScheduleEntryWithAdherence;
  showAdherence?: boolean;
  onClick?: () => void;
}

function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
}

function AdherenceIcon({ status }: { status: AdherenceStatus }) {
  switch (status) {
    case 'completed':
      return (
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500/20">
          <Check className="w-3 h-3 text-green-400" />
        </div>
      );
    case 'partial':
      return (
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-yellow-500/20">
          <Minus className="w-3 h-3 text-yellow-400" />
        </div>
      );
    case 'missed':
      return (
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-red-500/20">
          <AlertCircle className="w-3 h-3 text-red-400" />
        </div>
      );
  }
}

export function ScheduleEntryCard({ entry, showAdherence = false, onClick }: ScheduleEntryCardProps) {
  if (entry.is_rest_day) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left p-3 bg-[#1a1a24] border border-white/[0.08] rounded-lg border-l-4 hover:brightness-110 transition-all duration-150"
        style={{ borderLeftColor: '#4b5563' }}
      >
        <div className="flex items-center gap-2">
          <Coffee className="w-4 h-4 text-green-400/70" />
          <span className="text-sm font-medium text-white/60">Rest Day</span>
        </div>
        {entry.notes && (
          <p className="text-xs text-white/40 mt-1">{entry.notes}</p>
        )}
      </button>
    );
  }

  const color = entry.discipline
    ? DISCIPLINE_HEX_COLORS[entry.discipline as MMADiscipline] || '#6b7280'
    : '#6b7280';

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-3 bg-[#1a1a24] border border-white/[0.08] rounded-lg border-l-4 hover:brightness-110 transition-all duration-150"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-white">
              {entry.discipline}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-white/50">
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
        {showAdherence && <AdherenceIcon status={entry.adherence_status} />}
      </div>
    </button>
  );
}
