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
import { Plus, Filter, Flame, Clock, TrendingUp } from 'lucide-react';

export default function TrainingPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<TrainingSessionWithTechniques[]>([]);
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

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
      alert('Failed to delete session: ' + deleteError.message);
      return;
    }

    if (success) {
      // Reload sessions
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
      alert('Failed to repeat session: ' + repeatError.message);
    } else {
      loadSessions();
      loadStats();
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-white/60">Track and review your training sessions</p>
          <Button onClick={() => router.push('/training/new')} className="px-4 py-2 text-sm font-medium">
            <Plus className="w-4 h-4 mr-2" />
            Log Session
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <TrendingUp className="w-5 h-5 text-[#ef4444] mb-2" />
              <p className="text-2xl font-bold text-white">{stats.totalSessions}</p>
              <p className="text-sm text-gray-400">total {stats.totalSessions === 1 ? 'session' : 'sessions'}</p>
            </Card>

            <Card className="p-4">
              <Clock className="w-5 h-5 text-[#3b82f6] mb-2" />
              <p className="text-2xl font-bold text-white">{Math.floor(stats.totalMinutes / 60)}h</p>
              <p className="text-sm text-gray-400">total time</p>
            </Card>

            <Card className="p-4">
              <Flame className="w-5 h-5 text-[#f59e0b] mb-2" />
              <p className="text-2xl font-bold text-white">{stats.averageIntensity}/10</p>
              <p className="text-sm text-gray-400">avg intensity</p>
            </Card>

            <Card className="p-4">
              <Flame className="w-5 h-5 text-[#22c55e] mb-2" />
              <p className="text-2xl font-bold text-white">{stats.currentStreak}</p>
              <p className="text-sm text-gray-400">{stats.currentStreak === 1 ? 'day' : 'days'} streak</p>
            </Card>
          </div>
        )}

        {/* Heat Map */}
        <div className="mb-6">
          <TrainingHeatMap />
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-white font-medium"
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
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Min Intensity
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="1"
                  value={intensityMinFilter}
                  onChange={(e) => setIntensityMinFilter(e.target.value)}
                  className="w-full bg-background border border-border rounded-input px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent transition-default"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">
                  Max Intensity
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="10"
                  value={intensityMaxFilter}
                  onChange={(e) => setIntensityMaxFilter(e.target.value)}
                  className="w-full bg-background border border-border rounded-input px-3 py-2 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent transition-default"
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
          <Card className="p-6 text-center">
            <p className="text-red-500">{error}</p>
          </Card>
        ) : sessions.length === 0 ? (
          <Card className="p-12 text-center">
            <TrendingUp className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No sessions yet</h3>
            <p className="text-white/60 mb-6">
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
