'use client';

import { useState, useEffect } from 'react';
import { Trophy, Flame, Calendar, Target } from 'lucide-react';
import { getChallengeStats } from '@/lib/supabase/challengeQueries';
import { ChallengeStats as ChallengeStatsType } from '@/lib/types/challenge';

export function ChallengeStats() {
  const [stats, setStats] = useState<ChallengeStatsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const { data, error } = await getChallengeStats();
    if (data && !error) {
      setStats(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Your Progress</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-[#1a1a24] rounded-lg border border-white/[0.08] p-4 animate-pulse"
            >
              <div className="h-4 w-16 bg-white/5 rounded mb-2" />
              <div className="h-8 w-12 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      label: 'Total Points',
      value: stats.total_points.toLocaleString(),
      icon: Trophy,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
    },
    {
      label: 'Current Streak',
      value: `${stats.current_streak} ${stats.current_streak === 1 ? 'day' : 'days'}`,
      icon: Flame,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
    {
      label: 'This Month',
      value: stats.completions_this_month,
      icon: Calendar,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Favorite Category',
      value: stats.most_completed_category || 'N/A',
      icon: Target,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
  ];

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">Your Progress</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-[#1a1a24] rounded-lg border border-white/[0.08] p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1.5 ${stat.bgColor} rounded`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <span className="text-xs text-gray-400">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Calendar View */}
      {stats.completed_dates.length > 0 && (
        <div className="bg-[#1a1a24] rounded-lg border border-white/[0.08] p-4">
          <h3 className="text-sm font-medium text-white mb-3">Activity Calendar</h3>
          <div className="grid grid-cols-7 gap-2">
            {getLast30Days().map((date, index) => {
              const isCompleted = stats.completed_dates.includes(date);
              const isToday = date === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={index}
                  className={`aspect-square rounded flex items-center justify-center text-xs ${
                    isCompleted
                      ? 'bg-green-500/30 border border-green-500/50 text-green-400'
                      : isToday
                      ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                      : 'bg-white/[0.02] border border-white/[0.05] text-gray-600'
                  }`}
                  title={date}
                >
                  {new Date(date).getDate()}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-green-500/30 border border-green-500/50 rounded" />
              <span>Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-red-500/20 border border-red-500/30 rounded" />
              <span>Today</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getLast30Days(): string[] {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
}
