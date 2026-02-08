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
import { Plus, Target, TrendingUp, Users, AlertCircle } from 'lucide-react';
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

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'border-accent bg-accent/10';
      case 'medium':
        return 'border-warning bg-warning/10';
      case 'low':
        return 'border-success bg-success/10';
    }
  };

  const getPriorityIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-5 h-5 text-accent" />;
      case 'medium':
        return <Target className="w-5 h-5 text-warning" />;
      case 'low':
        return <TrendingUp className="w-5 h-5 text-success" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Sparring Log</h1>
            <p className="text-white/60">Track and analyze your sparring performance</p>
          </div>
          <Button onClick={() => router.push('/sparring/new')}>
            <Plus className="w-5 h-5 mr-2" />
            Log Sparring Session
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && stats.totalSessions > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Total Sessions</p>
                  <p className="text-2xl font-bold text-white">{stats.totalSessions}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-blue/20 rounded-lg">
                  <Target className="w-5 h-5 text-accent-blue" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Total Rounds</p>
                  <p className="text-2xl font-bold text-white">{stats.totalRounds}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div>
                <p className="text-white/60 text-xs mb-2">Avg Striking</p>
                <div className="flex gap-2 text-sm">
                  <span className="text-accent font-bold">Off: {stats.averageRatings.striking_offense}</span>
                  <span className="text-accent-blue font-bold">Def: {stats.averageRatings.striking_defense}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div>
                <p className="text-white/60 text-xs mb-2">Avg Grappling</p>
                <div className="flex gap-2 text-sm">
                  <span className="text-warning font-bold">TD: {stats.averageRatings.takedowns}</span>
                  <span className="text-success font-bold">GG: {stats.averageRatings.ground_game}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Focus Areas */}
        {focusAreas && focusAreas.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Focus Areas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {focusAreas.slice(0, 4).map((area) => (
                <Card
                  key={area.category}
                  className={`p-4 ${getPriorityColor(area.priority)}`}
                >
                  <div className="flex items-start gap-3">
                    {getPriorityIcon(area.priority)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{area.categoryLabel}</h3>
                      <p className="text-sm text-white/80">{area.message}</p>
                      {area.trend !== 'stable' && (
                        <p className="text-xs text-white/60 mt-1">
                          Trend: {area.trend === 'improving' ? '📈 Improving' : '📉 Declining'}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
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
