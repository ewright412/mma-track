'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Dumbbell, Plus, TrendingUp, Calendar, Trash2, ChevronDown, ChevronUp, Award } from 'lucide-react';
import {
  getStrengthLogs,
  deleteStrengthLog,
  getStrengthStats,
  getPersonalRecords,
  getUserExercises,
} from '@/lib/supabase/strength-queries';
import { StrengthLog, PersonalRecord } from '@/lib/types/strength';
import { ALL_EXERCISES, MUSCLE_GROUP_LABELS, MuscleGroup } from '@/lib/constants/exercises';
import { VolumeChart } from '@/components/strength/VolumeChart';
import { StrengthProgressChart } from '@/components/strength/StrengthProgressChart';

export default function StrengthPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<StrengthLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<StrengthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalVolume: 0,
    workoutsThisWeek: 0,
    volumeThisWeek: 0,
    activeExercises: 0,
    prsThisMonth: 0,
  });
  const [recentPRs, setRecentPRs] = useState<PersonalRecord[]>([]);

  // Filters
  const [filterExercise, setFilterExercise] = useState('');
  const [filterMuscleGroup, setFilterMuscleGroup] = useState('');
  const [userExercises, setUserExercises] = useState<string[]>([]);

  // Chart state
  const [selectedProgressExercise, setSelectedProgressExercise] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  // Reload data when page becomes visible (e.g., after navigating back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, filterExercise, filterMuscleGroup]);

  async function loadData() {
    setLoading(true);
    try {
      // Get authenticated user
      const { supabase } = await import('@/lib/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/signin');
        return;
      }

      // Load all logs
      const logsData = await getStrengthLogs(user.id);
      setLogs(logsData);

      // Load stats
      const statsData = await getStrengthStats(user.id);
      setStats(statsData);

      // Load recent PRs (last 30 days)
      const prsData = await getPersonalRecords(user.id);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentPRsData = prsData.filter(
        pr => new Date(pr.achieved_date) >= thirtyDaysAgo
      );
      setRecentPRs(recentPRsData);

      // Load user's exercise names for filter, sorted by frequency
      const exercisesData = await getUserExercises(user.id);
      // Sort exercises by frequency (most logged first)
      const exerciseFrequency = new Map<string, number>();
      logsData.forEach(log => {
        exerciseFrequency.set(log.exercise_name, (exerciseFrequency.get(log.exercise_name) || 0) + 1);
      });
      const sortedExercises = [...exercisesData].sort((a, b) => {
        return (exerciseFrequency.get(b) || 0) - (exerciseFrequency.get(a) || 0);
      });
      setUserExercises(sortedExercises);

      // Set default exercise for progress chart (most-logged exercise)
      if (sortedExercises.length > 0 && !selectedProgressExercise) {
        setSelectedProgressExercise(sortedExercises[0]);
      }
    } catch (error) {
      console.error('Failed to load strength data:', error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...logs];

    if (filterExercise) {
      filtered = filtered.filter(log => log.exercise_name === filterExercise);
    }

    if (filterMuscleGroup) {
      filtered = filtered.filter(log => log.muscle_group === filterMuscleGroup);
    }

    setFilteredLogs(filtered);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this workout? This cannot be undone.')) return;

    try {
      await deleteStrengthLog(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete workout:', error);
      alert('Failed to delete workout');
    }
  }

  function toggleExpand(id: string) {
    setExpandedLogId(expandedLogId === id ? null : id);
  }

  function clearFilters() {
    setFilterExercise('');
    setFilterMuscleGroup('');
  }

  // Group logs by date
  const logsByDate = filteredLogs.reduce((acc, log) => {
    const date = log.workout_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {} as Record<string, StrengthLog[]>);

  const dates = Object.keys(logsByDate).sort((a, b) => b.localeCompare(a));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f13] p-4 flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f13] p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-white/60">Track your lifts and personal records</p>
          <Button onClick={() => router.push('/strength/new')} className="px-4 py-2 text-sm font-medium">
            <Plus className="w-4 h-4 mr-2" />
            Log Workout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <Dumbbell className="w-5 h-5 text-[#ef4444] mb-2" />
            <div className="text-2xl font-bold text-white">{stats.totalWorkouts}</div>
            <div className="text-sm text-gray-400">total {stats.totalWorkouts === 1 ? 'workout' : 'workouts'}</div>
          </Card>
          <Card className="p-4">
            <Calendar className="w-5 h-5 text-[#3b82f6] mb-2" />
            <div className="text-2xl font-bold text-white">{stats.workoutsThisWeek}</div>
            <div className="text-sm text-gray-400">this week</div>
          </Card>
          <Card className="p-4">
            <TrendingUp className="w-5 h-5 text-[#22c55e] mb-2" />
            <div className="text-2xl font-bold text-white">
              {(stats.totalVolume / 1000).toFixed(1)}k lbs
            </div>
            <div className="text-sm text-gray-400">total volume</div>
          </Card>
          <Card className="p-4">
            <Award className="w-5 h-5 text-[#f59e0b] mb-2" />
            <div className="text-2xl font-bold text-white">{recentPRs.length}</div>
            <div className="text-sm text-gray-400">{recentPRs.length === 1 ? 'PR' : 'PRs'} (30d)</div>
          </Card>
        </div>

        {/* Recent PRs */}
        {recentPRs.length > 0 && (
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-5 h-5 text-[#f59e0b]" />
              <h2 className="text-lg font-semibold text-white">Recent Personal Records</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentPRs.slice(0, 6).map(pr => (
                <div key={pr.id} className="flex items-center justify-between p-3 bg-[#0f0f13] border border-white/[0.08] rounded-lg">
                  <div>
                    <div className="text-white font-medium">{pr.exercise_name}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(pr.achieved_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#22c55e] font-bold">{pr.value.toFixed(1)} lbs</div>
                    {pr.previous_value && (
                      <div className="text-xs text-gray-500">
                        +{(pr.value - pr.previous_value).toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Charts */}
        {logs.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <VolumeChart logs={logs} weeks={8} />
            <StrengthProgressChart
              logs={logs}
              selectedExercise={selectedProgressExercise}
              onExerciseChange={setSelectedProgressExercise}
              availableExercises={userExercises}
            />
          </div>
        )}

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Select
                label="Filter by Exercise"
                value={filterExercise}
                onChange={value => setFilterExercise(value)}
                options={[
                  { value: '', label: 'All Exercises' },
                  ...userExercises.map(ex => ({ value: ex, label: ex })),
                ]}
              />
            </div>
            <div className="flex-1">
              <Select
                label="Filter by Muscle Group"
                value={filterMuscleGroup}
                onChange={value => setFilterMuscleGroup(value)}
                options={[
                  { value: '', label: 'All Muscle Groups' },
                  ...Object.entries(MUSCLE_GROUP_LABELS).map(([value, label]) => ({
                    value,
                    label,
                  })),
                ]}
              />
            </div>
            {(filterExercise || filterMuscleGroup) && (
              <Button variant="secondary" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </Card>

        {/* Workout History */}
        <div className="space-y-6">
          {dates.length === 0 ? (
            <Card className="p-12 text-center">
              <Dumbbell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No workouts yet</h3>
              <p className="text-gray-400 mb-4">Start logging your strength training sessions</p>
              <Button onClick={() => router.push('/strength/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Log First Workout
              </Button>
            </Card>
          ) : (
            dates.map(date => {
              const dayLogs = logsByDate[date];
              const dayVolume = dayLogs.reduce((sum, log) => sum + Number(log.total_volume), 0);
              const hasPR = recentPRs.some(
                pr => pr.achieved_date === date && dayLogs.some(log => log.exercise_name === pr.exercise_name)
              );

              return (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <h2 className="text-lg font-semibold text-white">
                      {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h2>
                    {hasPR && <Badge variant="warning">PR</Badge>}
                    <span className="text-sm text-gray-400">
                      {dayLogs.length} exercise{dayLogs.length !== 1 ? 's' : ''} • {dayVolume.toLocaleString()} lbs
                    </span>
                  </div>

                  <div className="space-y-3">
                    {dayLogs.map(log => {
                      const isExpanded = expandedLogId === log.id;
                      const logHasPR = recentPRs.some(
                        pr => pr.exercise_name === log.exercise_name && pr.achieved_date === date
                      );

                      return (
                        <Card key={log.id} className="p-4">
                          <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleExpand(log.id)}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-white">{log.exercise_name}</h3>
                                  {logHasPR && (
                                    <Badge variant="warning" className="text-xs">
                                      <Award className="w-3 h-3 mr-1" />
                                      PR
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {log.sets.length} sets • {Number(log.total_volume).toLocaleString()} lbs •{' '}
                                  {MUSCLE_GROUP_LABELS[log.muscle_group as MuscleGroup]}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                              <div className="space-y-2 mb-4">
                                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-400 px-2">
                                  <div>Set</div>
                                  <div>Reps</div>
                                  <div>Weight</div>
                                  <div>RPE</div>
                                </div>
                                {log.sets.map((set, idx) => (
                                  <div key={idx} className="grid grid-cols-4 gap-2 text-sm text-white px-2">
                                    <div>{idx + 1}</div>
                                    <div>{set.reps}</div>
                                    <div>{set.weight} lbs</div>
                                    <div>{set.rpe}/10</div>
                                  </div>
                                ))}
                              </div>
                              {log.notes && (
                                <div className="mb-4">
                                  <div className="text-xs text-gray-400 mb-1">Notes</div>
                                  <div className="text-sm text-white">{log.notes}</div>
                                </div>
                              )}
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleDelete(log.id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
