'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { calculate1RM } from '@/lib/supabase/strength-queries';
import { StrengthLog } from '@/lib/types/strength';

interface StrengthProgressChartProps {
  logs: StrengthLog[];
  selectedExercise: string;
  onExerciseChange: (exercise: string) => void;
  availableExercises: string[];
}

export function StrengthProgressChart({
  logs,
  selectedExercise,
  onExerciseChange,
  availableExercises,
}: StrengthProgressChartProps) {
  const chartData = useMemo(() => {
    const exerciseLogs = logs
      .filter(log => log.exercise_name === selectedExercise)
      .sort((a, b) => a.workout_date.localeCompare(b.workout_date));

    return exerciseLogs.map(log => {
      // Find the best set (highest estimated 1RM)
      const bestSet = log.sets.reduce((best, set) => {
        const current1RM = calculate1RM(set.weight, set.reps);
        const best1RM = calculate1RM(best.weight, best.reps);
        return current1RM > best1RM ? set : best;
      });

      const estimated1RM = calculate1RM(bestSet.weight, bestSet.reps);

      return {
        date: new Date(log.workout_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        fullDate: log.workout_date,
        estimated1RM: Math.round(estimated1RM * 10) / 10,
        weight: bestSet.weight,
        reps: bestSet.reps,
      };
    });
  }, [logs, selectedExercise]);

  // Find max value for reference dot
  const maxPoint = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData.reduce((max, point) =>
      point.estimated1RM > max.estimated1RM ? point : max
    );
  }, [chartData]);

  if (!selectedExercise) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-2">Strength Progress</h3>
        <p className="text-gray-400 text-sm">Select an exercise to view progress</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Strength Progress</h3>
          <p className="text-sm text-gray-400">Estimated 1RM over time</p>
        </div>
        <div className="w-64">
          <Select
            value={selectedExercise}
            onChange={e => onExerciseChange(e.target.value)}
            options={availableExercises.map(ex => ({ value: ex, label: ex }))}
          />
        </div>
      </div>

      {chartData.length === 0 ? (
        <p className="text-gray-400 text-sm">No data available for {selectedExercise}</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-400">Current 1RM</div>
              <div className="text-2xl font-bold text-white">
                {chartData[chartData.length - 1].estimated1RM} lbs
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Personal Best</div>
              <div className="text-2xl font-bold text-yellow-400">
                {maxPoint?.estimated1RM} lbs
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Total Sessions</div>
              <div className="text-2xl font-bold text-blue-400">{chartData.length}</div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="date" stroke="#ffffff60" style={{ fontSize: '12px' }} />
              <YAxis stroke="#ffffff60" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a24',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'estimated1RM') {
                    return [`${value} lbs`, 'Estimated 1RM'];
                  }
                  return [value, name];
                }}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="estimated1RM"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
              {maxPoint && (
                <ReferenceDot
                  x={maxPoint.date}
                  y={maxPoint.estimated1RM}
                  r={6}
                  fill="#f59e0b"
                  stroke="#fff"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </Card>
  );
}
