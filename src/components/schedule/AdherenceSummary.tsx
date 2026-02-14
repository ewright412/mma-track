'use client';

import { Flame, CheckCircle, AlertCircle, Minus } from 'lucide-react';
import { WeeklyAdherenceSummary, AdherenceStreak } from '@/lib/types/schedule';

interface AdherenceSummaryProps {
  weeklySummary: WeeklyAdherenceSummary | null;
  streak: AdherenceStreak | null;
  monthlyTrend?: Array<{ month: string; percentage: number }>;
}

export function AdherenceSummary({ weeklySummary, streak, monthlyTrend }: AdherenceSummaryProps) {
  if (!weeklySummary || weeklySummary.total === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      {/* Weekly Progress */}
      <div className="bg-[#1a1a24] border border-white/[0.08] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-white/80">This Week</span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-white">
            {weeklySummary.completed + weeklySummary.partial}
          </span>
          <span className="text-sm text-white/40">/ {weeklySummary.total} sessions</span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${weeklySummary.percentage}%`,
              backgroundColor: weeklySummary.percentage >= 80 ? '#22c55e' : weeklySummary.percentage >= 50 ? '#f59e0b' : '#ef4444',
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-white/40">{weeklySummary.percentage}% adherence</span>
          <div className="flex items-center gap-2 text-xs">
            {weeklySummary.partial > 0 && (
              <span className="flex items-center gap-0.5 text-yellow-400">
                <Minus className="w-3 h-3" />{weeklySummary.partial}
              </span>
            )}
            {weeklySummary.missed > 0 && (
              <span className="flex items-center gap-0.5 text-red-400">
                <AlertCircle className="w-3 h-3" />{weeklySummary.missed}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Streak */}
      <div className="bg-[#1a1a24] border border-white/[0.08] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-medium text-white/80">Streak</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">
            {streak?.current || 0}
          </span>
          <span className="text-sm text-white/40">
            {(streak?.current || 0) === 1 ? 'day' : 'days'}
          </span>
        </div>
        {streak && streak.longest > 0 && (
          <div className="text-xs text-white/30 mt-1">
            Best: {streak.longest} {streak.longest === 1 ? 'day' : 'days'}
          </div>
        )}
      </div>

      {/* Monthly Trend */}
      {monthlyTrend && monthlyTrend.length > 0 && (
        <div className="bg-[#1a1a24] border border-white/[0.08] rounded-xl p-4">
          <div className="text-sm font-medium text-white/80 mb-2">Monthly Trend</div>
          <div className="flex items-end gap-2 h-12">
            {monthlyTrend.map((month, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-white/5 rounded-sm overflow-hidden relative" style={{ height: '32px' }}>
                  <div
                    className="absolute bottom-0 w-full rounded-sm transition-all duration-300"
                    style={{
                      height: `${month.percentage}%`,
                      backgroundColor: month.percentage >= 80 ? '#22c55e' : month.percentage >= 50 ? '#f59e0b' : '#ef4444',
                    }}
                  />
                </div>
                <span className="text-[10px] text-white/40">{month.month}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
