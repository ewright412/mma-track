'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { getTrainingSessionsByDate } from '@/lib/supabase/queries';

interface HeatMapDay {
  date: string;
  count: number;
  displayDate: Date;
}

export function TrainingHeatMap() {
  const [heatMapData, setHeatMapData] = useState<HeatMapDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<HeatMapDay | null>(null);

  useEffect(() => {
    loadHeatMapData();
  }, []);

  const loadHeatMapData = async () => {
    setIsLoading(true);

    // Calculate date range: last 90 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 89); // 90 days including today

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const { data } = await getTrainingSessionsByDate(startDateStr, endDateStr);

    // Generate all dates in range
    const days: HeatMapDay[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        count: data?.[dateStr] || 0,
        displayDate: new Date(currentDate),
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setHeatMapData(days);
    setIsLoading(false);
  };

  const getIntensityClass = (count: number): string => {
    if (count === 0) return 'bg-white/5';
    if (count === 1) return 'bg-accent/30';
    if (count === 2) return 'bg-accent/60';
    return 'bg-accent/90';
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Group days by week
  const weeks: HeatMapDay[][] = [];
  let currentWeek: HeatMapDay[] = [];

  // Pad the beginning to start on Sunday
  const firstDay = heatMapData[0]?.displayDate;
  if (firstDay) {
    const dayOfWeek = firstDay.getDay();
    for (let i = 0; i < dayOfWeek; i++) {
      currentWeek.push({ date: '', count: -1, displayDate: new Date(0) });
    }
  }

  heatMapData.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Add remaining days to last week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: '', count: -1, displayDate: new Date(0) });
    }
    weeks.push(currentWeek);
  }

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-white mb-1">Training Activity</h2>
        <p className="text-sm text-white/60">Last 90 days</p>
      </div>

      {isLoading ? (
        <div className="h-48 bg-white/5 rounded animate-pulse" />
      ) : (
        <>
          <div className="w-full overflow-x-auto">
            <div className="w-full">
              {/* Weekday labels */}
              <div className="grid mb-1" style={{ gridTemplateColumns: `2rem repeat(${weeks.length}, 1fr)` }}>
                <div />
                {/* empty header cells */}
              </div>

              {/* Heat map grid - rows are days of week, columns are weeks */}
              <div className="space-y-1">
                {weekdays.map((dayName, dayIndex) => (
                  <div
                    key={dayName}
                    className="flex items-center gap-1"
                  >
                    <div className="w-8 text-xs text-white/40 flex-shrink-0">{dayName[0]}</div>
                    <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}>
                      {weeks.map((week, weekIndex) => {
                        const day = week[dayIndex];
                        return (
                          <div
                            key={`${weekIndex}-${dayIndex}`}
                            className={`aspect-square rounded-sm transition-all cursor-pointer ${
                              day && day.count >= 0 ? getIntensityClass(day.count) : 'bg-transparent'
                            } ${
                              selectedDay?.date === day?.date && day?.count >= 0
                                ? 'ring-2 ring-accent'
                                : ''
                            }`}
                            style={{ minHeight: '14px' }}
                            onMouseEnter={() => day && day.count >= 0 && setSelectedDay(day)}
                            onMouseLeave={() => setSelectedDay(null)}
                            title={
                              day && day.count >= 0
                                ? `${formatDate(day.displayDate)}: ${day.count} session${
                                    day.count !== 1 ? 's' : ''
                                  }`
                                : ''
                            }
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Month labels below */}
              <div className="flex items-center mt-2" style={{ paddingLeft: '2.25rem' }}>
                <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}>
                  {weeks.map((week, weekIndex) => {
                    const firstValidDay = week.find(d => d.count >= 0);
                    const showMonth = firstValidDay && firstValidDay.displayDate.getDate() <= 7;
                    return (
                      <div key={weekIndex} className="text-xs text-white/40">
                        {showMonth ? firstValidDay.displayDate.toLocaleDateString('en-US', { month: 'short' }) : ''}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-sm bg-white/5" />
                <div className="w-3 h-3 rounded-sm bg-accent/30" />
                <div className="w-3 h-3 rounded-sm bg-accent/60" />
                <div className="w-3 h-3 rounded-sm bg-accent/90" />
              </div>
              <span>More</span>
            </div>

            {selectedDay && selectedDay.count >= 0 && (
              <div className="text-sm text-white">
                <span className="text-white/60">{formatDate(selectedDay.displayDate)}:</span>{' '}
                <span className="font-semibold">
                  {selectedDay.count} session{selectedDay.count !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
