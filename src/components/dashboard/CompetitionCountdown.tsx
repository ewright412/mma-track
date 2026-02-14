'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Competition } from '@/lib/types/competition';
import { Swords, Scale, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CompetitionCountdownProps {
  competition: Competition | null;
  currentWeight?: number;
}

export function CompetitionCountdown({ competition, currentWeight }: CompetitionCountdownProps) {
  const router = useRouter();

  if (!competition) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compDate = new Date(competition.competition_date + 'T00:00:00');
  const diffMs = compDate.getTime() - today.getTime();
  const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysUntil < 0) return null;

  // Color coding: 30+ blue, 14-30 amber, under 14 red
  let colorClass = 'border-[#3b82f6]';
  let textColor = 'text-[#3b82f6]';
  let bgAccent = 'bg-[#3b82f6]/10';
  let pulseClass = '';

  if (daysUntil < 14) {
    colorClass = 'border-[#ef4444]';
    textColor = 'text-[#ef4444]';
    bgAccent = 'bg-[#ef4444]/10';
    pulseClass = 'animate-pulse';
  } else if (daysUntil < 30) {
    colorClass = 'border-[#f59e0b]';
    textColor = 'text-[#f59e0b]';
    bgAccent = 'bg-[#f59e0b]/10';
  }

  const weightDiff = competition.target_weight && currentWeight
    ? currentWeight - competition.target_weight
    : null;

  return (
    <Card className="p-5 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl ${bgAccent}`}>
            <Swords className={`w-5 h-5 ${textColor}`} />
          </div>
          <div>
            <div className={`text-3xl font-bold ${textColor} ${pulseClass}`}>
              {daysUntil}
            </div>
            <div className="text-sm text-gray-400 mt-0.5">
              {daysUntil === 1 ? 'day' : 'days'} until{' '}
              <span className="text-white font-medium">{competition.name}</span>
            </div>
            {competition.weight_class && (
              <div className="text-xs text-gray-500 mt-1">
                {competition.weight_class}
              </div>
            )}
          </div>
        </div>

        {weightDiff !== null && (
          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-1.5 text-sm text-gray-400">
              <Scale className="w-4 h-4" />
              <span>{currentWeight} lbs</span>
            </div>
            <div className={`text-sm font-medium mt-1 ${
              weightDiff > 0 ? 'text-orange-400' : weightDiff < 0 ? 'text-green-400' : 'text-gray-400'
            }`}>
              {weightDiff > 0
                ? `${weightDiff.toFixed(1)} lbs to cut`
                : weightDiff < 0
                ? `${Math.abs(weightDiff).toFixed(1)} lbs under`
                : 'At target'}
            </div>
            <div className="text-xs text-gray-500">
              target: {competition.target_weight} lbs
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => router.push('/profile')}
        className="mt-3 flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        Manage competitions <ArrowRight className="w-3 h-3" />
      </button>
    </Card>
  );
}
