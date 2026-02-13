'use client';

import { Clock, MapPin, Coffee, Check, AlertCircle, Minus, Dumbbell, Heart } from 'lucide-react';
import { ScheduleEntryWithAdherence, AdherenceStatus, ScheduleMuscleGroup } from '@/lib/types/schedule';
import { DISCIPLINE_HEX_COLORS } from '@/lib/constants/disciplines';
import { MMADiscipline } from '@/lib/types/training';

const MUSCLE_GROUP_LABELS: Record<ScheduleMuscleGroup, string> = {
  upper_body: 'Upper Body',
  lower_body: 'Lower Body',
  full_body: 'Full Body',
  push: 'Push',
  pull: 'Pull',
  legs: 'Legs',
};

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

function getEntryDisplay(entry: ScheduleEntryWithAdherence): {
  label: string;
  color: string;
  icon: React.ReactNode;
} {
  const sessionType = entry.session_type || 'training';

  if (sessionType === 'strength') {
    const label = entry.muscle_group
      ? MUSCLE_GROUP_LABELS[entry.muscle_group as ScheduleMuscleGroup] || 'Strength'
      : 'Strength';
    return {
      label,
      color: '#9ca3af', // gray-400
      icon: <Dumbbell className="w-3.5 h-3.5 text-gray-400" />,
    };
  }

  if (sessionType === 'cardio') {
    return {
      label: entry.cardio_type || 'Cardio',
      color: '#22c55e', // green-500
      icon: <Heart className="w-3.5 h-3.5 text-green-400" />,
    };
  }

  // Training (default)
  const color = entry.discipline
    ? DISCIPLINE_HEX_COLORS[entry.discipline as MMADiscipline] || '#6b7280'
    : '#6b7280';
  return {
    label: entry.discipline || 'Training',
    color,
    icon: null,
  };
}

export function ScheduleEntryCard({ entry, showAdherence = false, onClick }: ScheduleEntryCardProps) {
  if (entry.is_rest_day) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left p-3 bg-[#1a1a24] border border-white/[0.08] rounded-xl hover:bg-[#1f1f2a] transition-all duration-150"
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

  const { label, color, icon } = getEntryDisplay(entry);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-3 bg-[#1a1a24] border border-white/[0.08] rounded-xl hover:bg-[#1f1f2a] transition-all duration-150"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            {icon}
            <span className="text-sm font-semibold text-white">
              {label}
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
