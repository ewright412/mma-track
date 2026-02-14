'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { CardioLogCard } from '@/components/cardio/CardioLogCard';
import { CardioProgressChart } from '@/components/cardio/CardioProgressChart';
import {
  getCardioLogs,
  deleteCardioLog,
  getCardioStats,
  getWeeklyCardioSummary,
  getCardioTrends,
} from '@/lib/supabase/cardioQueries';
import {
  CardioLog,
  CardioStats,
  WeeklyCardioSummary,
  CardioTrendData,
  CardioType,
} from '@/lib/types/cardio';
import { CARDIO_TYPES } from '@/lib/constants/cardio';
import { Plus, Activity, Clock, Route, Heart, Flame, TrendingUp, Filter } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function CardioPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [logs, setLogs] = useState<CardioLog[]>([]);
  const [stats, setStats] = useState<CardioStats | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<WeeklyCardioSummary | null>(null);
  const [trends, setTrends] = useState<CardioTrendData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedType, setSelectedType] = useState<CardioType | 'All'>('All');
  const [selectedInterval, setSelectedInterval] = useState<'All' | 'true' | 'false'>('All');

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    // Build filters
    const filters = {
      cardio_type: selectedType !== 'All' ? selectedType : undefined,
      intervals: selectedInterval !== 'All' ? selectedInterval === 'true' : undefined,
    };

    // Load all data in parallel
    const [logsResult, statsResult, weeklyResult, trendsResult] = await Promise.all([
      getCardioLogs(filters),
      getCardioStats(),
      getWeeklyCardioSummary(),
      getCardioTrends(),
    ]);

    if (logsResult.error) {
      setError(logsResult.error.message);
    } else if (logsResult.data) {
      setLogs(logsResult.data);
    }

    if (statsResult.data) {
      setStats(statsResult.data);
    }

    if (weeklyResult.data) {
      setWeeklySummary(weeklyResult.data);
    }

    if (trendsResult.data) {
      setTrends(trendsResult.data);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedType, selectedInterval]);

  const handleDelete = async (logId: string) => {
    if (!confirm('Are you sure you want to delete this cardio log?')) {
      return;
    }

    const { success, error: deleteError } = await deleteCardioLog(logId);

    if (deleteError) {
      showToast('Failed to delete log. Try again.', 'error');
      return;
    }

    if (success) {
      loadData();
    }
  };

  const handleEdit = (logId: string) => {
    router.push(`/cardio/edit/${logId}`);
  };

  return (
    <div className="px-4 pt-3">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">Cardio</h1>
          <Button onClick={() => router.push('/cardio/new')} className="px-4 py-2 text-sm font-medium">
            <Plus className="w-4 h-4 mr-2" />
            Log Session
          </Button>
        </div>

        {/* Weekly Summary */}
        {weeklySummary && weeklySummary.totalMinutes > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">This Week</h2>
            <div className={`grid gap-4 ${weeklySummary.avgHeartRate > 0 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}>
              <div>
                <Clock className="w-5 h-5 text-red-400 mb-2" />
                <p className="text-2xl font-bold text-white">{weeklySummary.totalMinutes} min</p>
                <p className="text-sm text-gray-400">total time</p>
              </div>
              <div>
                <Flame className="w-5 h-5 text-[#f59e0b] mb-2" />
                <p className="text-2xl font-bold text-white">{weeklySummary.totalCalories}</p>
                <p className="text-sm text-gray-400">calories</p>
              </div>
              <div>
                <Route className="w-5 h-5 text-[#22c55e] mb-2" />
                <p className="text-2xl font-bold text-white">
                  {weeklySummary.totalDistance.toFixed(1)} km
                </p>
                <p className="text-sm text-gray-400">distance</p>
              </div>
              {weeklySummary.avgHeartRate > 0 && (
                <div>
                  <Heart className="w-5 h-5 text-[#ef4444] mb-2" />
                  <p className="text-2xl font-bold text-white">{weeklySummary.avgHeartRate} bpm</p>
                  <p className="text-sm text-gray-400">avg heart rate</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* All-Time Stats (only show when no weekly summary, or as supplementary) */}
        {stats && stats.totalSessions > 0 && (!weeklySummary || weeklySummary.totalMinutes === 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <Activity className="w-5 h-5 text-red-400 mb-2" />
              <p className="text-2xl font-bold text-white">{stats.totalSessions}</p>
              <p className="text-sm text-gray-400">total {stats.totalSessions === 1 ? 'session' : 'sessions'}</p>
            </Card>
            <Card className="p-4">
              <Clock className="w-5 h-5 text-purple-400 mb-2" />
              <p className="text-2xl font-bold text-white">{stats.totalMinutes}</p>
              <p className="text-sm text-gray-400">total minutes</p>
            </Card>
            <Card className="p-4">
              <Route className="w-5 h-5 text-[#22c55e] mb-2" />
              <p className="text-2xl font-bold text-white">{stats.totalDistance.toFixed(1)} km</p>
              <p className="text-sm text-gray-400">total distance</p>
            </Card>
            <Card className="p-4">
              <Flame className="w-5 h-5 text-[#f59e0b] mb-2" />
              <p className="text-2xl font-bold text-white">{stats.totalCalories}</p>
              <p className="text-sm text-gray-400">total calories</p>
            </Card>
          </div>
        )}

        {/* Progress Charts */}
        {trends && trends.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <CardioProgressChart data={trends} metric="duration" title="Duration Over Time" />
            <CardioProgressChart data={trends} metric="distance" title="Distance Over Time" />
            <CardioProgressChart data={trends} metric="pace" title="Pace Over Time" />
            <CardioProgressChart data={trends} metric="heartRate" title="Heart Rate Trends" />
          </div>
        )}

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white/60">Filters:</span>
            </div>

            <Select
              value={selectedType}
              onChange={(value) => setSelectedType(value as CardioType | 'All')}
              options={[
                { value: 'All', label: 'All Types' },
                ...CARDIO_TYPES.map((type) => ({ value: type, label: type })),
              ]}
              className="w-40"
            />

            <Select
              value={selectedInterval}
              onChange={(value) => setSelectedInterval(value as 'All' | 'true' | 'false')}
              options={[
                { value: 'All', label: 'All Sessions' },
                { value: 'true', label: 'Intervals Only' },
                { value: 'false', label: 'Steady-State Only' },
              ]}
              className="w-40"
            />
          </div>
        </Card>

        {/* Session History */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-semibold text-white">Session History</h2>
            {logs.length > 0 && (
              <span className="text-sm text-white/60">({logs.length})</span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-28 animate-pulse">
                  <div className="h-full bg-white/5 rounded" />
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="p-8 text-center">
              <Activity className="w-12 h-12 text-red-400/40 mx-auto mb-3" />
              <p className="text-red-400 mb-1">Failed to load cardio logs</p>
              <p className="text-gray-500 text-sm mb-4">{error}</p>
              <Button variant="secondary" onClick={loadData}>
                Try Again
              </Button>
            </Card>
          ) : logs.length === 0 ? (
            <Card className="p-8">
              <div className="text-center">
                <Activity className="w-12 h-12 text-white/20 mx-auto mb-3 animate-float" />
                <p className="text-white/60 mb-2">No cardio logs yet</p>
                <p className="text-white/40 text-sm mb-4">
                  Start tracking your conditioning work to see insights and progress
                </p>
                <Button onClick={() => router.push('/cardio/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Log Your First Session
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <CardioLogCard
                  key={log.id}
                  log={log}
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
