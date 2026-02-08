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
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              {/* Weekday labels */}
              <div className="flex mb-2">
                <div className="w-8" />
                {weekdays.map((day) => (
                  <div key={day} className="w-3 text-[10px] text-white/40 text-center mr-1">
                    {day[0]}
                  </div>
                ))}
              </div>

              {/* Heat map grid */}
              <div className="space-y-1">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex items-center">
                    {/* Week label (show month for first week of month) */}
                    <div className="w-8 text-xs text-white/40">
                      {week[0] && week[0].count >= 0 && week[0].displayDate.getDate() <= 7
                        ? week[0].displayDate.toLocaleDateString('en-US', { month: 'short' })
                        : ''}
                    </div>

                    {/* Days */}
                    {week.map((day, dayIndex) => (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`w-3 h-3 rounded-sm mr-1 transition-all cursor-pointer ${
                          day.count >= 0 ? getIntensityClass(day.count) : 'bg-transparent'
                        } ${
                          selectedDay?.date === day.date && day.count >= 0
                            ? 'ring-2 ring-accent'
                            : ''
                        }`}
                        onMouseEnter={() => day.count >= 0 && setSelectedDay(day)}
                        onMouseLeave={() => setSelectedDay(null)}
                        title={
                          day.count >= 0
                            ? `${formatDate(day.displayDate)}: ${day.count} session${
                                day.count !== 1 ? 's' : ''
                              }`
                            : ''
                        }
                      />
                    ))}
                  </div>
                ))}
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
