'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WeightTrendDataPoint } from '@/lib/types/metrics';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface WeightTrendChartProps {
  data: WeightTrendDataPoint[];
  title?: string;
}

export function WeightTrendChart({ data, title = 'Weight Trend' }: WeightTrendChartProps) {
  const [timeRange, setTimeRange] = useState<30 | 60 | 90 | 180>(90);

  // Filter data based on time range
  const filteredData = data.slice(-timeRange);

  // Format the data for the chart
  const chartData = filteredData.map((item) => {
    const date = new Date(item.date);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      date: formattedDate,
      'Weight (lbs)': item.weight,
      '7-Day Avg': item.sevenDayAverage,
    };
  });

  if (chartData.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <p className="text-white/60 text-center py-8">
          No weight data available yet. Log your first body metric to see your progress!
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>

        {/* Time range selector */}
        <div className="flex gap-2">
          {[30, 60, 90, 180].map((days) => (
            <Button
              key={days}
              variant={timeRange === days ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(days as 30 | 60 | 90 | 180)}
              className={
                timeRange === days
                  ? 'bg-blue-500 text-white'
                  : 'text-white/60 hover:text-white'
              }
            >
              {days}d
            </Button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="date"
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
            domain={['dataMin - 5', 'dataMax + 5']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a24',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
            }}
            labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
          />
          <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />

          {/* Actual weight line */}
          <Line
            type="monotone"
            dataKey="Weight (lbs)"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 3 }}
            activeDot={{ r: 5 }}
          />

          {/* 7-day rolling average line */}
          <Line
            type="monotone"
            dataKey="7-Day Avg"
            stroke="#22c55e"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 text-sm text-white/60">
        <p className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-blue-500"></span>
          Actual weight
        </p>
        <p className="flex items-center gap-2 mt-1">
          <span className="w-3 h-0.5 bg-green-500 border-dashed"></span>
          7-day rolling average (smooths daily fluctuations)
        </p>
      </div>
    </Card>
  );
}
