'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { TrainingSessionCard } from '@/components/training/TrainingSessionCard';
import { TrainingHeatMap } from '@/components/training/TrainingHeatMap';
import { getTrainingSessions, deleteTrainingSession, getTrainingStats, createTrainingSession } from '@/lib/supabase/queries';
import { TrainingSessionWithTechniques, TrainingSessionFilters, TrainingStats } from '@/lib/types/training';
import { MMA_DISCIPLINES } from '@/lib/constants/disciplines';
import { Plus, Filter, Flame, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function TrainingPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<TrainingSessionWithTechniques[]>([]);
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  function handleRefresh() {
    setRefreshing(true);
    Promise.all([loadSessions(), loadStats()]).finally(() => setRefreshing(false));
  }

  // Filter state
  const [disciplineFilter, setDisciplineFilter] = useState<string>('all');
  const [intensityMinFilter, setIntensityMinFilter] = useState<string>('');
  const [intensityMaxFilter, setIntensityMaxFilter] = useState<string>('');

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const filters: TrainingSessionFilters = {};
    if (disciplineFilter !== 'all') {
      filters.discipline = disciplineFilter as any;
    }
    if (intensityMinFilter) {
      filters.minIntensity = Number(intensityMinFilter);
    }
    if (intensityMaxFilter) {
      filters.maxIntensity = Number(intensityMaxFilter);
    }

    const { data, error: fetchError } = await getTrainingSessions(filters);

    if (fetchError) {
      setError(fetchError.message);
      setIsLoading(false);
      return;
    }

    // Fetch techniques for each session
    if (data) {
      // For now, we'll use the sessions without techniques populated
      // In a real app, we'd either join the data or fetch techniques separately
      setSessions(data.map(session => ({ ...session, techniques: [] })));
    }

    setIsLoading(false);
  }, [disciplineFilter, intensityMinFilter, intensityMaxFilter]);

  const loadStats = useCallback(async () => {
    const { data } = await getTrainingStats();
    if (data) {
      setStats(data);
    }
  }, []);

  useEffect(() => {
    loadSessions();
    loadStats();
  }, [loadSessions, loadStats]);

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this training session?')) {
      return;
    }

    const { success, error: deleteError } = await deleteTrainingSession(sessionId);

    if (deleteError) {
      showToast('Failed to delete session', 'error');
      return;
    }

    if (success) {
      showToast('Session deleted');
      loadSessions();
      loadStats();
    }
  };

  const handleEdit = (sessionId: string) => {
    router.push(`/training/edit/${sessionId}`);
  };

  const handleRepeat = async (session: TrainingSessionWithTechniques) => {
    const today = new Date().toISOString().split('T')[0];
    const { error: repeatError } = await createTrainingSession({
      session_date: today,
      discipline: session.discipline,
      duration_minutes: session.duration_minutes,
      intensity: session.intensity,
      notes: session.notes || undefined,
      techniques: session.techniques.map((t) => ({
        technique_name: t.technique_name,
        notes: t.notes || undefined,
      })),
    });

    if (repeatError) {
      showToast('Failed to repeat session', 'error');
    } else {
      showToast('Session logged!');
      loadSessions();
      loadStats();
    }
  };

  return (
    <div className="px-4 pt-3">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Training</h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-500 hover:text-white transition-colors rounded-lg active:scale-[0.97]"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <Button onClick={() => router.push('/training/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Log Session
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-[#1a1a24] rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-red-500" />
              </div>
              <div>
                <p className="text-xl font-bold text-white leading-tight">{stats.totalSessions}</p>
                <p className="text-xs text-gray-500">sessions</p>
              </div>
            </div>

            <div className="bg-[#1a1a24] rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white leading-tight">{Math.floor(stats.totalMinutes / 60)}h</p>
                <p className="text-xs text-gray-500">total time</p>
              </div>
            </div>

            <div className="bg-[#1a1a24] rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Flame className="w-4 h-4 text-warning" />
              </div>
              <div>
                <p className="text-xl font-bold text-white leading-tight">{stats.averageIntensity}/10</p>
                <p className="text-xs text-gray-500">avg intensity</p>
              </div>
            </div>

            <div className="bg-[#1a1a24] rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Flame className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-xl font-bold text-white leading-tight">{stats.currentStreak}</p>
                <p className="text-xs text-gray-500">{stats.currentStreak === 1 ? 'day' : 'days'} streak</p>
              </div>
            </div>
          </div>
        )}

        {/* Heat Map */}
        <div className="mb-6 overflow-x-auto">
          <TrainingHeatMap />
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-white font-medium min-h-[44px] w-full justify-start active:scale-[0.97] transition-transform"
            style={{ touchAction: 'manipulation' }}
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Select
                label="Discipline"
                value={disciplineFilter}
                onChange={(value) => setDisciplineFilter(value)}
                options={[
                  { value: 'all', label: 'All Disciplines' },
                  ...MMA_DISCIPLINES.map((d) => ({ value: d, label: d })),
                ]}
              />

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Min Intensity
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="1"
                  value={intensityMinFilter}
                  onChange={(e) => setIntensityMinFilter(e.target.value)}
                  className="w-full bg-[#252530] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-default min-h-[44px]"
                  style={{ touchAction: 'manipulation' }}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Max Intensity
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="10"
                  value={intensityMaxFilter}
                  onChange={(e) => setIntensityMaxFilter(e.target.value)}
                  className="w-full bg-[#252530] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-default min-h-[44px]"
                  style={{ touchAction: 'manipulation' }}
                />
              </div>
            </div>
          )}
        </Card>

        {/* Session List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-32 animate-pulse">
                <div className="h-full bg-white/5 rounded" />
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="p-8 text-center">
            <TrendingUp className="w-12 h-12 text-red-400/40 mx-auto mb-3" />
            <p className="text-red-400 mb-1">Failed to load sessions</p>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <Button variant="secondary" onClick={loadSessions}>
              Try Again
            </Button>
          </Card>
        ) : sessions.length === 0 ? (
          <Card className="p-12 text-center">
            <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4 animate-float" />
            <h3 className="text-lg text-gray-400 mb-2">No sessions yet</h3>
            <p className="text-sm text-gray-500 mb-6">
              Start tracking your training by logging your first session
            </p>
            <Button onClick={() => router.push('/training/new')}>
              <Plus className="w-5 h-5 mr-2" />
              Log Your First Session
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <TrainingSessionCard
                key={session.id}
                session={session}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRepeat={handleRepeat}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
