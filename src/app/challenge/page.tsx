'use client';

import { useState, useEffect } from 'react';
import { Flame, Clock, Trophy, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { getTodaysChallenge } from '@/lib/utils/dailyChallenge';
import {
  getDifficultyColor,
  getCategoryColor,
  formatDuration,
} from '@/lib/utils/dailyChallenge';
import { TodaysChallengeWithCompletion } from '@/lib/types/challenge';
import { ChallengeTimer } from '@/components/challenge/ChallengeTimer';
import { ChallengeStats } from '@/components/challenge/ChallengeStats';
import { RecentChallenges } from '@/components/challenge/RecentChallenges';

export default function ChallengePage() {
  const [todaysChallenge, setTodaysChallenge] =
    useState<TodaysChallengeWithCompletion | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadTodaysChallenge();
  }, [refreshKey]);

  const loadTodaysChallenge = async () => {
    setLoading(true);
    const { data, error } = await getTodaysChallenge();
    if (data && !error) {
      setTodaysChallenge(data);
    }
    setLoading(false);
  };

  const handleChallengeCompleted = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="p-6 max-w-[900px] mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-white/5 rounded mb-4" />
            <div className="h-64 bg-white/5 rounded-lg" />
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!todaysChallenge) {
    return (
      <AuthGuard>
        <div className="p-6 max-w-[900px] mx-auto">
          <div className="text-center text-gray-400">
            <p>No challenge available today. Check back tomorrow!</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  const { challenge, completed } = todaysChallenge;

  return (
    <AuthGuard>
      <div className="p-6 max-w-[900px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Flame className="w-6 h-6 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Daily Challenge</h1>
          </div>
          <p className="text-gray-400">
            A new challenge every day to keep you sharp and engaged
          </p>
        </div>

        {/* Today's Challenge Card */}
        <div className="bg-[#1a1a24] rounded-lg border border-white/[0.08] overflow-hidden mb-6">
          {/* Challenge Header */}
          <div className="p-6 border-b border-white/[0.08]">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {challenge.title}
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  {challenge.description}
                </p>
              </div>
              {completed && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-md">
                  <Trophy className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">Completed</span>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span
                className={`px-3 py-1 rounded-md text-xs font-medium border ${getCategoryColor(
                  challenge.category
                )}`}
              >
                {challenge.category}
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-medium border bg-purple-500/20 text-purple-400 border-purple-500/30">
                {challenge.discipline}
              </span>
              <span
                className={`px-3 py-1 rounded-md text-xs font-medium border ${getDifficultyColor(
                  challenge.difficulty
                )}`}
              >
                {challenge.difficulty}
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-medium border bg-blue-500/20 text-blue-400 border-blue-500/30 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(challenge.duration_minutes)}
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-medium border bg-yellow-500/20 text-yellow-400 border-yellow-500/30 flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                {challenge.points} pts
              </span>
            </div>
          </div>

          {/* Instructions Section */}
          <div className="border-b border-white/[0.08]">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-white font-medium">Instructions</span>
              {showInstructions ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>
            {showInstructions && (
              <div className="px-6 pb-6">
                <ol className="space-y-2">
                  {challenge.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-3 text-gray-300">
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-red-500/10 text-red-400 rounded-full text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="flex-1 leading-relaxed">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Challenge Timer/Completion */}
          <div className="p-6">
            <ChallengeTimer
              challenge={challenge}
              completed={completed}
              onCompleted={handleChallengeCompleted}
            />
          </div>
        </div>

        {/* Challenge Stats */}
        <ChallengeStats />

        {/* Recent Challenges (Last 7 Days) */}
        <RecentChallenges />
      </div>
    </AuthGuard>
  );
}
