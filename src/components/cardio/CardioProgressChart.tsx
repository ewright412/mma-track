'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { CardioTrendData } from '@/lib/types/cardio';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CardioProgressChartProps {
  data: CardioTrendData[];
  metric: 'duration' | 'distance' | 'pace' | 'heartRate';
  title: string;
}

export function CardioProgressChart({ data, metric, title }: CardioProgressChartProps) {
  // Format the data based on metric
  const chartData = data.map((item) => {
    const date = new Date(item.date);
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    let value: number | null = null;
    let label = '';

    switch (metric) {
      case 'duration':
        value = item.duration;
        label = 'Minutes';
        break;
      case 'distance':
        value = item.distance;
        label = 'Distance (km)';
        break;
      case 'pace':
        value = item.pace;
        label = 'Pace (min/km)';
        break;
      case 'heartRate':
        value = item.heartRate;
        label = 'Avg HR (bpm)';
        break;
    }

    return {
      date: formattedDate,
      [label]: value,
      labelKey: label,
    };
  });

  // Filter out null values
  const validData = chartData.filter((item) => item[item.labelKey] !== null);

  if (validData.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <p className="text-white/60 text-center py-8">
          No data available for this metric. Keep logging to see your progress!
        </p>
      </Card>
    );
  }

  // Get color based on metric
  const getLineColor = () => {
    switch (metric) {
      case 'duration':
        return '#3b82f6'; // blue
      case 'distance':
        return '#22c55e'; // green
      case 'pace':
        return '#f59e0b'; // orange
      case 'heartRate':
        return '#ef4444'; // red
      default:
        return '#3b82f6';
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={validData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="date"
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '12px' }}
            domain={metric === 'pace' ? ['auto', 'auto'] : [0, 'auto']}
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
          <Legend
            wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }}
          />
          <Line
            type="monotone"
            dataKey={validData[0]?.labelKey}
            stroke={getLineColor()}
            strokeWidth={2}
            dot={{ fill: getLineColor(), r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
