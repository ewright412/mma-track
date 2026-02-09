'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { SparringTrendData } from '@/lib/types/sparring';
import { RATING_COLORS } from '@/lib/constants/sparring';

interface SparringTrendMiniProps {
  data: SparringTrendData[];
}

export function SparringTrendMini({ data }: SparringTrendMiniProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-white/40 text-sm">
        No sparring data yet
      </div>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.06)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 10]}
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          ticks={[0, 2, 4, 6, 8, 10]}
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
            `${value}/10`,
            name
              .replace('_', ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase()),
          ]}
        />
        <Legend
          wrapperStyle={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '11px',
            paddingTop: '4px',
          }}
          formatter={(value: string) =>
            value
              .replace('_', ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase())
          }
        />
        <Line
          type="monotone"
          dataKey="striking_offense"
          stroke={RATING_COLORS.striking_offense}
          strokeWidth={2}
          dot={{ r: 3 }}
          name="striking_offense"
        />
        <Line
          type="monotone"
          dataKey="striking_defense"
          stroke={RATING_COLORS.striking_defense}
          strokeWidth={2}
          dot={{ r: 3 }}
          name="striking_defense"
        />
        <Line
          type="monotone"
          dataKey="takedowns"
          stroke={RATING_COLORS.takedowns}
          strokeWidth={2}
          dot={{ r: 3 }}
          name="takedowns"
        />
        <Line
          type="monotone"
          dataKey="ground_game"
          stroke={RATING_COLORS.ground_game}
          strokeWidth={2}
          dot={{ r: 3 }}
          name="ground_game"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
