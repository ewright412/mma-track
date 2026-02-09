'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { MUSCLE_GROUP_LABELS, MuscleGroup } from '@/lib/constants/exercises';
import { StrengthLog } from '@/lib/types/strength';

// Volume chart-specific palette: brand-consistent, no teal/cyan
const VOLUME_CHART_COLORS: Record<MuscleGroup, string> = {
  chest: '#ef4444',
  back: '#3b82f6',
  legs: '#22c55e',
  shoulders: '#f59e0b',
  arms: '#8b5cf6',
  core: '#f97316',
  full_body: '#6b7280',
};

interface VolumeChartProps {
  logs: StrengthLog[];
  weeks?: number; // Number of weeks to show (default 8)
}

export function VolumeChart({ logs, weeks = 8 }: VolumeChartProps) {
  const chartData = useMemo(() => {
    const today = new Date();
    const weeksAgo = new Date(today);
    weeksAgo.setDate(today.getDate() - weeks * 7);

    // Filter logs to last N weeks
    const recentLogs = logs.filter(log => new Date(log.workout_date) >= weeksAgo);

    // Group by week
    const weeklyData = new Map<string, Record<MuscleGroup, number>>();

    recentLogs.forEach(log => {
      const date = new Date(log.workout_date);
      // Get week start (Sunday)
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, {
          chest: 0,
          back: 0,
          shoulders: 0,
          legs: 0,
          arms: 0,
          core: 0,
          full_body: 0,
        });
      }

      const weekData = weeklyData.get(weekKey)!;
      weekData[log.muscle_group as MuscleGroup] += Number(log.total_volume);
    });

    // Convert to array and sort by date
    return Array.from(weeklyData.entries())
      .map(([weekStart, volumes]) => ({
        week: new Date(weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        ...volumes,
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-weeks); // Take last N weeks
  }, [logs, weeks]);

  // Get unique muscle groups present in the data
  const activeMuscleGroups = useMemo(() => {
    const groups = new Set<MuscleGroup>();
    chartData.forEach(week => {
      Object.keys(week).forEach(key => {
        if (key !== 'week' && week[key as MuscleGroup] > 0) {
          groups.add(key as MuscleGroup);
        }
      });
    });
    return Array.from(groups);
  }, [chartData]);

  if (chartData.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Weekly Volume by Muscle Group</h3>
        <p className="text-gray-400 text-sm">No data available for the selected period</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Weekly Volume by Muscle Group</h3>
      <p className="text-sm text-gray-400 mb-4">Training volume (lbs) over the last {weeks} weeks</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="week" stroke="#ffffff60" style={{ fontSize: '12px' }} />
          <YAxis stroke="#ffffff60" style={{ fontSize: '12px' }} />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            contentStyle={{
              backgroundColor: '#1a1a24',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: number) => [`${value.toLocaleString()} lbs`, '']}
          />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            formatter={(value) => MUSCLE_GROUP_LABELS[value as MuscleGroup]}
          />
          {activeMuscleGroups.map(muscleGroup => (
            <Bar
              key={muscleGroup}
              dataKey={muscleGroup}
              stackId="a"
              fill={VOLUME_CHART_COLORS[muscleGroup]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
