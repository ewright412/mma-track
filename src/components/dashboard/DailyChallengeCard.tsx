'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Trophy, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { getTodaysChallenge } from '@/lib/utils/dailyChallenge';
import {
  getDifficultyColor,
  getCategoryColor,
  formatDuration,
} from '@/lib/utils/dailyChallenge';
import { TodaysChallengeWithCompletion } from '@/lib/types/challenge';

export function DailyChallengeCard() {
  const [todaysChallenge, setTodaysChallenge] =
    useState<TodaysChallengeWithCompletion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodaysChallenge();
  }, []);

  const loadTodaysChallenge = async () => {
    setLoading(true);
    const { data, error } = await getTodaysChallenge();
    if (data && !error) {
      setTodaysChallenge(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-[#1a1a24] rounded-lg border border-white/[0.08] p-5 mb-6 animate-pulse">
        <div className="h-6 w-32 bg-white/5 rounded mb-3" />
        <div className="h-4 w-full bg-white/5 rounded mb-2" />
        <div className="h-4 w-2/3 bg-white/5 rounded" />
      </div>
    );
  }

  if (!todaysChallenge) {
    return null;
  }

  const { challenge, completed } = todaysChallenge;

  return (
    <div className="bg-gradient-to-br from-red-500/10 via-[#1a1a24] to-orange-500/10 rounded-lg border border-red-500/20 p-5 mb-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <Flame className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400">Daily Challenge</h3>
            <h2 className="text-lg font-bold text-white">{challenge.title}</h2>
          </div>
        </div>
        {completed && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-500/20 border border-green-500/30 rounded-md flex-shrink-0">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs font-medium text-green-400">Done</span>
          </div>
        )}
      </div>

      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
        {challenge.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <span
          className={`px-2.5 py-1 rounded text-xs font-medium border ${getCategoryColor(
            challenge.category
          )}`}
        >
          {challenge.category}
        </span>
        <span
          className={`px-2.5 py-1 rounded text-xs font-medium border ${getDifficultyColor(
            challenge.difficulty
          )}`}
        >
          {challenge.difficulty}
        </span>
        <span className="px-2.5 py-1 rounded text-xs font-medium border bg-blue-500/20 text-blue-400 border-blue-500/30 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDuration(challenge.duration_minutes)}
        </span>
        <span className="px-2.5 py-1 rounded text-xs font-medium border bg-yellow-500/20 text-yellow-400 border-yellow-500/30 flex items-center gap-1">
          <Trophy className="w-3 h-3" />
          {challenge.points} pts
        </span>
      </div>

      <Link
        href="/challenge"
        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
      >
        {completed ? (
          <>
            View Challenge
            <ArrowRight className="w-4 h-4" />
          </>
        ) : (
          <>
            Start Challenge
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Link>
    </div>
  );
}
