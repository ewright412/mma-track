'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Gauge } from 'lucide-react';

interface TrainingLoadCardProps {
  loadThisWeek: number;
  load4WeekAvg: number;
}

type LoadLevel = 'low' | 'optimal' | 'high';

function getLoadLevel(current: number, avg: number): LoadLevel {
  if (avg === 0) return current > 0 ? 'optimal' : 'low';
  const ratio = current / avg;
  if (ratio < 0.7) return 'low';
  if (ratio > 1.3) return 'high';
  return 'optimal';
}

const LOAD_CONFIG: Record<LoadLevel, { label: string; color: string; bgColor: string; barColor: string }> = {
  low: {
    label: 'Low',
    color: 'text-[#3b82f6]',
    bgColor: 'bg-[#3b82f6]/10',
    barColor: '#3b82f6',
  },
  optimal: {
    label: 'Optimal',
    color: 'text-[#22c55e]',
    bgColor: 'bg-[#22c55e]/10',
    barColor: '#22c55e',
  },
  high: {
    label: 'High',
    color: 'text-[#ef4444]',
    bgColor: 'bg-[#ef4444]/10',
    barColor: '#ef4444',
  },
};

export function TrainingLoadCard({ loadThisWeek, load4WeekAvg }: TrainingLoadCardProps) {
  const level = getLoadLevel(loadThisWeek, load4WeekAvg);
  const config = LOAD_CONFIG[level];

  const ratio = load4WeekAvg > 0 ? loadThisWeek / load4WeekAvg : 0;
  const percentChange = load4WeekAvg > 0 ? Math.round((ratio - 1) * 100) : 0;

  // Bar fill: cap at 200% of average for visual
  const barPercent = load4WeekAvg > 0
    ? Math.min((loadThisWeek / (load4WeekAvg * 2)) * 100, 100)
    : loadThisWeek > 0 ? 50 : 0;

  let subtext = '';
  if (load4WeekAvg === 0 && loadThisWeek === 0) {
    subtext = 'No training data yet';
  } else if (load4WeekAvg === 0) {
    subtext = 'Building your baseline';
  } else if (percentChange > 0) {
    subtext = `Training ${percentChange}% more than your average`;
  } else if (percentChange < 0) {
    subtext = `Recovery week \u2014 volume is ${Math.abs(percentChange)}% down`;
  } else {
    subtext = 'Right on track with your average';
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${config.bgColor}`}>
          <Gauge className={`w-5 h-5 ${config.color}`} />
        </div>
        <div>
          <div className="text-sm text-gray-400">Weekly Training Load</div>
          <div className={`text-xl font-bold ${config.color}`}>
            {config.label}
          </div>
        </div>
      </div>

      {/* Visual bar */}
      <div className="relative h-3 bg-white/5 rounded-full overflow-hidden mb-2">
        {/* Optimal zone markers */}
        <div
          className="absolute top-0 bottom-0 bg-white/5"
          style={{ left: '35%', width: '30%' }}
        />
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${barPercent}%`,
            backgroundColor: config.barColor,
          }}
        />
      </div>

      <p className="text-xs text-gray-500">{subtext}</p>
    </Card>
  );
}
