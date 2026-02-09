'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SparringSessionCard } from '@/components/sparring/SparringSessionCard';
import {
  getSparringSessions,
  deleteSparringSession,
  getSparringStats,
  getSparringTrends,
  detectFocusAreas,
} from '@/lib/supabase/sparringQueries';
import {
  SparringSessionWithRounds,
  SparringStats,
  SparringTrendData,
  FocusArea,
} from '@/lib/types/sparring';
import { Plus, Target, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RATING_COLORS } from '@/lib/constants/sparring';

export default function SparringPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SparringSessionWithRounds[]>([]);
  const [stats, setStats] = useState<SparringStats | null>(null);
  const [trends, setTrends] = useState<SparringTrendData[] | null>(null);
  const [focusAreas, setFocusAreas] = useState<FocusArea[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    // Load all data in parallel
    const [sessionsResult, statsResult, trendsResult, focusResult] = await Promise.all([
      getSparringSessions(),
      getSparringStats(),
      getSparringTrends(10),
      detectFocusAreas(),
    ]);

    if (sessionsResult.error) {
      setError(sessionsResult.error.message);
    } else if (sessionsResult.data) {
      // Map sessions to include empty rounds array (we'll load them on expand if needed)
      setSessions(sessionsResult.data.map((s) => ({ ...s, rounds: [] })));
    }

    if (statsResult.data) {
      setStats(statsResult.data);
    }

    if (trendsResult.data) {
      setTrends(trendsResult.data);
    }

    if (focusResult.data) {
      setFocusAreas(focusResult.data);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this sparring session?')) {
      return;
    }

    const { success, error: deleteError } = await deleteSparringSession(sessionId);

    if (deleteError) {
      alert('Failed to delete session: ' + deleteError.message);
      return;
    }

    if (success) {
      loadData();
    }
  };

  const handleEdit = (sessionId: string) => {
    alert('Edit functionality coming soon!');
  };

  const getRatingStyle = (area: FocusArea) => {
    const rating = area.averageRating;
    if (rating >= 7) return { border: 'border-l-[#22c55e]', label: 'Strong', labelColor: 'text-[#22c55e]' };
    if (rating >= 4) return { border: 'border-l-[#f59e0b]', label: 'Developing', labelColor: 'text-[#f59e0b]' };
    return { border: 'border-l-[#ef4444]', label: 'Needs Work', labelColor: 'text-[#ef4444]' };
  };

  const getTrendLabel = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving': return { text: 'Improved', icon: '↑', color: 'text-[#22c55e]' };
      case 'declining': return { text: 'Declining', icon: '↓', color: 'text-[#ef4444]' };
      case 'stable': return { text: 'Stable', icon: '→', color: 'text-gray-400' };
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-white/60">Track and analyze your sparring performance</p>
          <Button onClick={() => router.push('/sparring/new')} className="px-4 py-2 text-sm font-medium">
            <Plus className="w-4 h-4 mr-2" />
            Log Session
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && stats.totalSessions > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <Card className="p-4">
                <Users className="w-5 h-5 text-[#ef4444] mb-2" />
                <p className="text-2xl font-bold text-white">{stats.totalSessions}</p>
                <p className="text-sm text-gray-400">total {stats.totalSessions === 1 ? 'session' : 'sessions'}</p>
              </Card>

              <Card className="p-4">
                <Target className="w-5 h-5 text-red-400 mb-2" />
                <p className="text-2xl font-bold text-white">{stats.totalRounds}</p>
                <p className="text-sm text-gray-400">total {stats.totalRounds === 1 ? 'round' : 'rounds'}</p>
              </Card>

              {/* Striking Offense */}
              <Card className="p-4">
                <p className="text-sm text-gray-400 mb-2">Striking Offense</p>
                <p className="text-2xl font-bold text-white">{stats.averageRatings.striking_offense}/10</p>
                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#ef4444]"
                    style={{ width: `${stats.averageRatings.striking_offense * 10}%` }}
                  />
                </div>
              </Card>

              {/* Striking Defense */}
              <Card className="p-4">
                <p className="text-sm text-gray-400 mb-2">Striking Defense</p>
                <p className="text-2xl font-bold text-white">{stats.averageRatings.striking_defense}/10</p>
                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-400"
                    style={{ width: `${stats.averageRatings.striking_defense * 10}%` }}
                  />
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {/* Takedowns */}
              <Card className="p-4">
                <p className="text-sm text-gray-400 mb-2">Takedowns</p>
                <p className="text-2xl font-bold text-white">{stats.averageRatings.takedowns}/10</p>
                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#f59e0b]"
                    style={{ width: `${stats.averageRatings.takedowns * 10}%` }}
                  />
                </div>
              </Card>

              {/* Ground Game */}
              <Card className="p-4">
                <p className="text-sm text-gray-400 mb-2">Ground Game</p>
                <p className="text-2xl font-bold text-white">{stats.averageRatings.ground_game}/10</p>
                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#22c55e]"
                    style={{ width: `${stats.averageRatings.ground_game * 10}%` }}
                  />
                </div>
              </Card>
            </div>
          </>
        )}

        {/* Focus Areas */}
        {focusAreas && focusAreas.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Focus Areas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {focusAreas.slice(0, 4).map((area) => {
                const ratingStyle = getRatingStyle(area);
                const trendInfo = getTrendLabel(area.trend);
                return (
                  <Card
                    key={area.category}
                    className={`p-4 border-l-4 ${ratingStyle.border}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-white">{area.categoryLabel}</h3>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${ratingStyle.labelColor} bg-white/5`}>
                        {ratingStyle.label}
                      </span>
                    </div>
                    <p className="text-sm text-white/70 mb-2">{area.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white">{area.averageRating}/10</span>
                      <span className={`text-xs ${trendInfo.color}`}>
                        {trendInfo.icon} {trendInfo.text}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Trend Chart */}
        {trends && trends.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Performance Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="date"
                  stroke="rgba(255,255,255,0.6)"
                  tick={{ fill: 'rgba(255,255,255,0.6)' }}
                />
                <YAxis
                  domain={[0, 10]}
                  stroke="rgba(255,255,255,0.6)"
                  tick={{ fill: 'rgba(255,255,255,0.6)' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a24',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Legend wrapperStyle={{ color: '#fff' }} />
                <Line
                  type="monotone"
                  dataKey="striking_offense"
                  stroke={RATING_COLORS.striking_offense}
                  name="Striking Offense"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="striking_defense"
                  stroke={RATING_COLORS.striking_defense}
                  name="Striking Defense"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="takedowns"
                  stroke={RATING_COLORS.takedowns}
                  name="Takedowns"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="ground_game"
                  stroke={RATING_COLORS.ground_game}
                  name="Ground Game"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Session List */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Sessions</h2>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-32 animate-pulse">
                  <div className="h-full bg-white/5 rounded" />
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="p-6 text-center">
              <p className="text-red-500">{error}</p>
            </Card>
          ) : sessions.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No sparring sessions yet</h3>
              <p className="text-white/60 mb-6">
                Start tracking your sparring to analyze your performance over time
              </p>
              <Button onClick={() => router.push('/sparring/new')}>
                <Plus className="w-5 h-5 mr-2" />
                Log Your First Session
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <SparringSessionCard
                  key={session.id}
                  session={session}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
