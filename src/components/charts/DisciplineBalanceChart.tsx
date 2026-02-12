'use client';

import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { MMADiscipline } from '@/lib/types/training';

interface DisciplineBalanceChartProps {
  sessionsByDiscipline: Record<string, number>;
}

export function DisciplineBalanceChart({ sessionsByDiscipline }: DisciplineBalanceChartProps) {
  // Only show disciplines the user has actually trained
  const data = Object.entries(sessionsByDiscipline)
    .filter(([, count]) => count > 0)
    .map(([discipline, count]) => ({
      discipline: shortenName(discipline as MMADiscipline),
      fullName: discipline,
      sessions: count,
    }));

  if (data.length < 3) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
        Train at least 3 disciplines to see your balance chart
      </div>
    );
  }

  const maxSessions = Math.max(...data.map((d) => d.sessions));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
        <PolarGrid
          stroke="rgba(255,255,255,0.08)"
          strokeDasharray="3 3"
        />
        <PolarAngleAxis
          dataKey="discipline"
          tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
        />
        <PolarRadiusAxis
          domain={[0, maxSessions]}
          tick={false}
          axisLine={false}
        />
        <Radar
          name="Sessions (30d)"
          dataKey="sessions"
          stroke="#ef4444"
          fill="#ef4444"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Tooltip
          contentStyle={{
            background: '#1a1a24',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '13px',
          }}
          formatter={(value: number) => [`${value} sessions`, 'Sessions']}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function shortenName(discipline: MMADiscipline): string {
  const SHORT_NAMES: Record<MMADiscipline, string> = {
    'Boxing': 'Boxing',
    'Muay Thai': 'Muay Thai',
    'Kickboxing': 'Kickbox',
    'Wrestling': 'Wrestling',
    'Brazilian Jiu-Jitsu': 'BJJ',
    'Judo': 'Judo',
    'MMA': 'MMA',
  };
  return SHORT_NAMES[discipline] || discipline;
}
