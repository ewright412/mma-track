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
import { RATING_COLORS, SPARRING_TYPE_CATEGORIES } from '@/lib/constants/sparring';

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

  // Collect all unique rating keys across the trend data
  const allKeys = new Set<string>();
  data.forEach((d) => {
    Object.keys(d.ratings).forEach((k) => allKeys.add(k));
  });

  // All categories for label lookup
  const allCategories = [
    ...SPARRING_TYPE_CATEGORIES.mma,
    ...SPARRING_TYPE_CATEGORIES.striking,
    ...SPARRING_TYPE_CATEGORIES.grappling,
  ];

  // Flatten ratings into top-level keys for recharts
  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    ...d.ratings,
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
          formatter={(value: number, name: string) => {
            const catDef = allCategories.find((c) => c.key === name);
            const label = catDef ? catDef.label : name.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
            return [`${value}/10`, label];
          }}
        />
        <Legend
          wrapperStyle={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '11px',
            paddingTop: '4px',
          }}
          formatter={(value: string) => {
            const catDef = allCategories.find((c) => c.key === value);
            return catDef ? catDef.label : value.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
          }}
        />
        {Array.from(allKeys).map((key) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={RATING_COLORS[key] || '#3b82f6'}
            strokeWidth={2}
            dot={{ r: 3 }}
            name={key}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
