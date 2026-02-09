'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { MMADiscipline } from '@/lib/types/training';
import { WeeklyDisciplineVolume } from '@/lib/supabase/dashboardQueries';

// Hex colors for each discipline
const DISCIPLINE_HEX_COLORS: Record<MMADiscipline, string> = {
  Boxing: '#ef4444',
  'Muay Thai': '#f97316',
  Kickboxing: '#eab308',
  Wrestling: '#22c55e',
  'Brazilian Jiu-Jitsu': '#3b82f6',
  Judo: '#6366f1',
  'MMA/Sparring': '#a855f7',
  'Submission Grappling/No-Gi': '#ec4899',
};

interface WeeklyVolumeChartProps {
  data: WeeklyDisciplineVolume[];
}

export function WeeklyVolumeChart({ data }: WeeklyVolumeChartProps) {
  // Find all disciplines present in the data
  const disciplinesSet = new Set<string>();
  data.forEach((week) => {
    Object.keys(week).forEach((key) => {
      if (key !== 'weekLabel' && key !== 'weekStart' && typeof week[key] === 'number') {
        disciplinesSet.add(key);
      }
    });
  });
  const disciplines = Array.from(disciplinesSet);

  if (data.length === 0 || disciplines.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-white/40 text-sm">
        No training data for chart
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.06)"
          vertical={false}
        />
        <XAxis
          dataKey="weekLabel"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          label={{
            value: 'Minutes',
            angle: -90,
            position: 'insideLeft',
            style: { fill: 'rgba(255,255,255,0.4)', fontSize: 11 },
            offset: 25,
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a1a24',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '13px',
          }}
          formatter={(value: number, name: string) => [
            `${value} min`,
            name,
          ]}
        />
        <Legend
          wrapperStyle={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '11px',
            paddingTop: '8px',
          }}
        />
        {disciplines.map((discipline) => (
          <Bar
            key={discipline}
            dataKey={discipline}
            stackId="volume"
            fill={
              DISCIPLINE_HEX_COLORS[discipline as MMADiscipline] || '#6b7280'
            }
            radius={[0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
