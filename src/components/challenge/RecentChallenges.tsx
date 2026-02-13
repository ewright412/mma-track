'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, X, Clock } from 'lucide-react';
import { getAllChallenges, getRecentChallengesWithCompletion } from '@/lib/supabase/challengeQueries';
import { getDifficultyColor, formatDuration } from '@/lib/utils/dailyChallenge';

export function RecentChallenges() {
  const [recentChallenges, setRecentChallenges] = useState<
    Array<{
      date: string;
      challenge: {
        id: string;
        title: string;
        difficulty: string;
        duration_minutes: number;
        points: number;
      };
      completed: boolean;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentChallenges();
  }, []);

  const loadRecentChallenges = async () => {
    setLoading(true);
    const { data: challenges } = await getAllChallenges();
    if (challenges) {
      const { data } = await getRecentChallengesWithCompletion(challenges);
      if (data) {
        setRecentChallenges(data);
      }
    }
    setLoading(false);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = date.toISOString().split('T')[0];
    const todayOnly = today.toISOString().split('T')[0];
    const yesterdayOnly = yesterday.toISOString().split('T')[0];

    if (dateOnly === todayOnly) return 'Today';
    if (dateOnly === yesterdayOnly) return 'Yesterday';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Challenges</h2>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-[#1a1a24] rounded-lg border border-white/[0.08] p-4 animate-pulse"
            >
              <div className="h-4 w-32 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">Recent Challenges</h2>
      <p className="text-sm text-gray-400 mb-4">
        Last 7 days of challenges. Missed challenges cannot be completed retroactively.
      </p>

      <div className="space-y-2">
        {recentChallenges.map((item, index) => (
          <div
            key={index}
            className="bg-[#1a1a24] rounded-lg border border-white/[0.08] p-4 flex items-center justify-between gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm text-gray-400 w-20">
                  {formatDate(item.date)}
                </span>
                <h3 className="text-white font-medium">{item.challenge.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium border ${getDifficultyColor(
                    item.challenge.difficulty
                  )}`}
                >
                  {item.challenge.difficulty}
                </span>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDuration(item.challenge.duration_minutes)}
                </span>
                <span className="text-xs text-gray-500">
                  {item.challenge.points} pts
                </span>
              </div>
            </div>

            <div>
              {item.completed ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-md">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400 font-medium">Done</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-500/20 border border-gray-500/30 rounded-md">
                  <X className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500 font-medium">Missed</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
