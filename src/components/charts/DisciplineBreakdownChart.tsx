'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MMADiscipline } from '@/lib/types/training';

// Hex colors for each discipline (matching the design system)
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

interface DisciplineBreakdownChartProps {
  sessionsByDiscipline: Record<string, number>;
}

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

export function DisciplineBreakdownChart({
  sessionsByDiscipline,
}: DisciplineBreakdownChartProps) {
  const data: ChartDataItem[] = Object.entries(sessionsByDiscipline)
    .filter(([, count]) => count > 0)
    .map(([discipline, count]) => ({
      name: discipline,
      value: count,
      color:
        DISCIPLINE_HEX_COLORS[discipline as MMADiscipline] || '#6b7280',
    }))
    .sort((a, b) => b.value - a.value);

  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-white/40 text-sm">
        No training sessions logged yet
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="w-48 h-48 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a24',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '13px',
              }}
              formatter={(value: number, name: string) => [
                `${value} session${value > 1 ? 's' : ''} (${Math.round((value / total) * 100)}%)`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-white/70 truncate flex-1">{item.name}</span>
            <span className="text-white font-medium tabular-nums">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
