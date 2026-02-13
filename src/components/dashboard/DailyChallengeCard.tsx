'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Trophy, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { getTodaysChallenge } from '@/lib/utils/dailyChallenge';
import { formatDuration } from '@/lib/utils/dailyChallenge';
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
      <div className="bg-[#1a1a24] rounded-xl p-5 mb-4 animate-pulse">
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
    <div className="bg-[#1a1a24] rounded-xl p-4 mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-red-400" />
          <span className="text-xs text-gray-500 uppercase tracking-wide">Daily Challenge</span>
        </div>
        {completed && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/20 rounded-full flex-shrink-0">
            <CheckCircle className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs font-medium text-green-400">Done</span>
          </div>
        )}
      </div>

      <h2 className="text-base font-semibold text-white">{challenge.title}</h2>
      <p className="text-sm text-gray-400 mt-1 mb-2 line-clamp-2">
        {challenge.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="text-xs py-0.5 px-2 rounded-full bg-white/5 text-gray-400">
          {challenge.category}
        </span>
        <span className="text-xs py-0.5 px-2 rounded-full bg-white/5 text-gray-400">
          {challenge.difficulty}
        </span>
        <span className="text-xs py-0.5 px-2 rounded-full bg-white/5 text-gray-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDuration(challenge.duration_minutes)}
        </span>
        <span className="text-xs py-0.5 px-2 rounded-full bg-white/5 text-gray-400 flex items-center gap-1">
          <Trophy className="w-3 h-3" />
          {challenge.points} pts
        </span>
      </div>

      <Link
        href="/challenge"
        className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors active:scale-[0.97] ${
          !completed ? 'animate-pulse-attention' : ''
        }`}
      >
        {completed ? 'View Challenge' : 'Start Challenge'}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
