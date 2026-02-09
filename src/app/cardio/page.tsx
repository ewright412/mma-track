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

export default function CardioPage() {
  const router = useRouter();
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
      alert('Failed to delete log: ' + deleteError.message);
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
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Cardio Tracking</h1>
            <p className="text-white/60">Track and analyze your conditioning work</p>
          </div>
          <Button onClick={() => router.push('/cardio/new')}>
            <Plus className="w-5 h-5 mr-2" />
            Log Cardio Session
          </Button>
        </div>

        {/* Weekly Summary */}
        {weeklySummary && weeklySummary.totalMinutes > 0 && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-accent/10 to-accent-blue/10 border-accent/20">
            <h2 className="text-xl font-semibold text-white mb-4">This Week</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-accent-blue" />
                  <p className="text-xs text-white/60">Total Time</p>
                </div>
                <p className="text-2xl font-bold text-white">{weeklySummary.totalMinutes} min</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <p className="text-xs text-white/60">Calories</p>
                </div>
                <p className="text-2xl font-bold text-white">{weeklySummary.totalCalories}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Route className="w-4 h-4 text-green-400" />
                  <p className="text-xs text-white/60">Distance</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  {weeklySummary.totalDistance.toFixed(1)} km
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-4 h-4 text-red-400" />
                  <p className="text-xs text-white/60">Avg HR</p>
                </div>
                <p className="text-2xl font-bold text-white">
                  {weeklySummary.avgHeartRate > 0 ? `${weeklySummary.avgHeartRate} bpm` : 'N/A'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Overall Stats Cards */}
        {stats && stats.totalSessions > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-blue/20 rounded-lg">
                  <Activity className="w-5 h-5 text-accent-blue" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Total Sessions</p>
                  <p className="text-2xl font-bold text-white">{stats.totalSessions}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Total Minutes</p>
                  <p className="text-2xl font-bold text-white">{stats.totalMinutes}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Route className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Total Distance</p>
                  <p className="text-2xl font-bold text-white">{stats.totalDistance.toFixed(1)} km</p>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-white/60 text-sm">Total Calories</p>
                  <p className="text-2xl font-bold text-white">{stats.totalCalories}</p>
                </div>
              </div>
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
              onChange={(e) => setSelectedType(e.target.value as CardioType | 'All')}
              options={[
                { value: 'All', label: 'All Types' },
                ...CARDIO_TYPES.map((type) => ({ value: type, label: type })),
              ]}
              className="w-40"
            />

            <Select
              value={selectedInterval}
              onChange={(e) => setSelectedInterval(e.target.value as 'All' | 'true' | 'false')}
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
            <Card className="p-8">
              <p className="text-white/60 text-center">Loading cardio logs...</p>
            </Card>
          ) : error ? (
            <Card className="p-8 border-red-500/20 bg-red-500/5">
              <p className="text-red-400 text-center">{error}</p>
            </Card>
          ) : logs.length === 0 ? (
            <Card className="p-8">
              <div className="text-center">
                <Activity className="w-12 h-12 text-white/20 mx-auto mb-3" />
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
