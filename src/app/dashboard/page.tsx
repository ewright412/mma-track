'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Dumbbell,
  Award,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Activity,
  Heart,
  Zap,
  ArrowRight,
  Scale,
  Clock,
  Flame,
  Lightbulb,
} from 'lucide-react';
import { getDashboardData, DashboardData } from '@/lib/supabase/dashboardQueries';
import { TrainingInsights } from '@/components/charts/TrainingInsights';
import { GoalProgressIndicator } from '@/components/metrics/GoalProgressIndicator';

// Lazy load heavy chart components for better initial load performance
const DisciplineBreakdownChart = dynamic(
  () => import('@/components/charts/DisciplineBreakdownChart').then(mod => ({ default: mod.DisciplineBreakdownChart })),
  { loading: () => <div className="h-64 bg-card rounded-card animate-pulse" /> }
);
const WeeklyVolumeChart = dynamic(
  () => import('@/components/charts/WeeklyVolumeChart').then(mod => ({ default: mod.WeeklyVolumeChart })),
  { loading: () => <div className="h-64 bg-card rounded-card animate-pulse" /> }
);
const SparringTrendMini = dynamic(
  () => import('@/components/charts/SparringTrendMini').then(mod => ({ default: mod.SparringTrendMini })),
  { loading: () => <div className="h-64 bg-card rounded-card animate-pulse" /> }
);

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const result = await getDashboardData();
      if (result.data) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f13] p-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="h-8 w-48 bg-white/5 rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-white/5 rounded animate-pulse" />
          </div>
          {/* Quick Actions Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-[#1a1a24] rounded-lg animate-pulse" />
            ))}
          </div>
          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-[#1a1a24] rounded-lg animate-pulse" />
            ))}
          </div>
          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="h-72 bg-[#1a1a24] rounded-lg animate-pulse" />
            <div className="h-72 bg-[#1a1a24] rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0f0f13] p-4 flex items-center justify-center">
        <div className="text-gray-400">Failed to load dashboard data</div>
      </div>
    );
  }

  const thisWeekCount = data.sessionsThisWeek.length;
  const lastWeekCount = data.sessionsLastWeek.length;
  const thisWeekMinutes = data.sessionsThisWeek.reduce(
    (sum, s) => sum + s.duration_minutes,
    0
  );

  return (
    <div className="min-h-screen bg-[#0f0f13] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => router.push('/training/new')}
            className="flex items-center gap-3 p-3 bg-[#1a1a24] border-l-4 border-l-[#ef4444] border border-white/[0.08] rounded-lg hover:brightness-110 transition-all duration-150"
          >
            <Target className="w-5 h-5 text-[#ef4444]" />
            <span className="text-sm font-medium text-white">Log Training</span>
          </button>
          <button
            onClick={() => router.push('/strength/new')}
            className="flex items-center gap-3 p-3 bg-[#1a1a24] border-l-4 border-l-[#3b82f6] border border-white/[0.08] rounded-lg hover:brightness-110 transition-all duration-150"
          >
            <Dumbbell className="w-5 h-5 text-[#3b82f6]" />
            <span className="text-sm font-medium text-white">Log Workout</span>
          </button>
          <button
            onClick={() => router.push('/sparring/new')}
            className="flex items-center gap-3 p-3 bg-[#1a1a24] border-l-4 border-l-[#f59e0b] border border-white/[0.08] rounded-lg hover:brightness-110 transition-all duration-150"
          >
            <Activity className="w-5 h-5 text-[#f59e0b]" />
            <span className="text-sm font-medium text-white">Log Sparring</span>
          </button>
          <button
            onClick={() => router.push('/cardio/new')}
            className="flex items-center gap-3 p-3 bg-[#1a1a24] border-l-4 border-l-[#22c55e] border border-white/[0.08] rounded-lg hover:brightness-110 transition-all duration-150"
          >
            <Heart className="w-5 h-5 text-[#22c55e]" />
            <span className="text-sm font-medium text-white">Log Cardio</span>
          </button>
        </div>

        {/* Key Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Sessions This Week */}
          <Card className="p-4">
            <Calendar className="w-5 h-5 text-blue-400 mb-2" />
            <div className="text-2xl font-bold text-white">{thisWeekCount}</div>
            <div className="text-sm text-gray-400">
              {thisWeekCount === 1 ? 'session' : 'sessions'} this week
              {lastWeekCount > 0 && (
                <span
                  className={
                    thisWeekCount >= lastWeekCount
                      ? ' text-green-400'
                      : ' text-orange-400'
                  }
                >
                  {' '}
                  ({thisWeekCount >= lastWeekCount ? '+' : ''}
                  {thisWeekCount - lastWeekCount} vs last)
                </span>
              )}
            </div>
          </Card>

          {/* Training Time */}
          <Card className="p-4">
            <Clock className="w-5 h-5 text-purple-400 mb-2" />
            <div className="text-2xl font-bold text-white">
              {thisWeekMinutes >= 60
                ? `${Math.floor(thisWeekMinutes / 60)}h ${thisWeekMinutes % 60}m`
                : `${thisWeekMinutes}m`}
            </div>
            <div className="text-sm text-gray-400">training this week</div>
          </Card>

          {/* Streak */}
          <Card className="p-4">
            <Flame className="w-5 h-5 text-orange-400 mb-2" />
            <div className="text-2xl font-bold text-white">
              {data.trainingStats?.currentStreak || 0}
            </div>
            <div className="text-sm text-gray-400">
              {(data.trainingStats?.currentStreak || 0) === 1 ? 'day' : 'days'} streak
              {data.trainingStats && data.trainingStats.longestStreak > 0 && (
                <span className="text-gray-500">
                  {' '}(best: {data.trainingStats.longestStreak})
                </span>
              )}
            </div>
          </Card>

          {/* PRs This Month */}
          <Card className="p-4">
            <Award className="w-5 h-5 text-yellow-400 mb-2" />
            <div className="text-2xl font-bold text-white">
              {data.recentPRs.length}
            </div>
            <div className="text-sm text-gray-400">
              {data.recentPRs.length > 0 ? (
                <span className="text-yellow-400 truncate block">
                  Latest: {data.recentPRs[0].exercise_name}
                </span>
              ) : (
                data.recentPRs.length === 1 ? 'personal record' : 'personal records'
              )}
            </div>
          </Card>
        </div>

        {/* Training Insights */}
        <div className="mb-6">
          {data.insights.length > 1 ? (
            <TrainingInsights insights={data.insights} />
          ) : (
            <Card className="p-6 border-dashed">
              <div className="flex items-center gap-3 mb-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-semibold text-white">Areas to Focus</h2>
              </div>
              <p className="text-sm text-gray-400">
                Train more this week to unlock personalized insights.
              </p>
            </Card>
          )}
        </div>

        {/* Training Overview + Discipline Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly Volume Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">
                  Weekly Training Volume
                </h2>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => router.push('/training')}
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <WeeklyVolumeChart data={data.weeklyDisciplineVolume} />
          </Card>

          {/* Discipline Breakdown */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-red-400" />
              <h2 className="text-lg font-semibold text-white">
                Discipline Breakdown
              </h2>
            </div>
            <DisciplineBreakdownChart
              sessionsByDiscipline={
                data.trainingStats?.sessionsByDiscipline || {}
              }
            />
          </Card>
        </div>

        {/* Sparring Trends */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">
                Sparring Trends
              </h2>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.push('/sparring')}
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <SparringTrendMini data={data.sparringTrends} />
        </Card>

        {/* Strength + Cardio Highlights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Strength Highlights */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Dumbbell className="w-5 h-5 text-red-500" />
                <h2 className="text-lg font-semibold text-white">
                  Strength Highlights
                </h2>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => router.push('/strength')}
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <Card className="p-3 bg-[#0f0f13]">
                <div className="text-xs text-gray-400 mb-1">Weekly Volume</div>
                <div className="text-lg font-bold text-white">
                  {data.strengthStats
                    ? `${(data.strengthStats.volumeThisWeek / 1000).toFixed(1)}k`
                    : '0'}
                </div>
                <div className="text-xs text-gray-500">lbs this week</div>
              </Card>
              <Card className="p-3 bg-[#0f0f13]">
                <div className="text-xs text-gray-400 mb-1">Workouts</div>
                <div className="text-lg font-bold text-white">
                  {data.strengthStats?.workoutsThisWeek || 0}
                </div>
                <div className="text-xs text-gray-500">this week</div>
              </Card>
            </div>

            {/* Recent PRs */}
            {data.recentPRs.length > 0 ? (
              <div>
                <div className="text-sm text-gray-400 mb-2">Recent PRs</div>
                <div className="space-y-2">
                  {data.recentPRs.slice(0, 3).map((pr) => (
                    <div
                      key={pr.id}
                      className="flex items-center justify-between p-2 bg-yellow-500/5 border border-yellow-500/10 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-white">
                          {pr.exercise_name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-yellow-400">
                          {Math.round(pr.value)} lbs
                        </div>
                        {pr.previous_value && (
                          <div className="text-xs text-gray-500">
                            was {Math.round(pr.previous_value)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                No recent PRs — keep pushing!
              </div>
            )}
          </Card>

          {/* Cardio Highlights */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-semibold text-white">
                  Cardio Highlights
                </h2>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => router.push('/cardio')}
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <Card className="p-3 bg-[#0f0f13]">
                <div className="text-xs text-gray-400 mb-1">This Week</div>
                <div className="text-lg font-bold text-white">
                  {data.cardioThisWeekMinutes} min
                </div>
                <div className="text-xs text-gray-500">cardio training</div>
              </Card>
              <Card className="p-3 bg-[#0f0f13]">
                <div className="text-xs text-gray-400 mb-1">Total Sessions</div>
                <div className="text-lg font-bold text-white">
                  {data.cardioStats?.totalSessions || 0}
                </div>
                <div className="text-xs text-gray-500">all time</div>
              </Card>
            </div>

            {/* Recent Cardio Trends */}
            {data.cardioTrends.length > 0 ? (
              <div>
                <div className="text-sm text-gray-400 mb-2">Recent Sessions</div>
                <div className="space-y-2">
                  {data.cardioTrends
                    .slice(-3)
                    .reverse()
                    .map((trend, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                      >
                        <div className="text-sm text-white">
                          {new Date(trend.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-green-400">
                            {trend.duration} min
                          </span>
                          {trend.distance && (
                            <span className="text-blue-400">
                              {trend.distance.toFixed(1)} km
                            </span>
                          )}
                          {trend.heartRate && (
                            <span className="text-red-400">
                              {trend.heartRate} bpm
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                No cardio sessions yet
              </div>
            )}
          </Card>
        </div>

        {/* Body Metrics + Goals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Body Metrics Snapshot */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Scale className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-white">
                  Body Metrics
                </h2>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => router.push('/profile')}
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {data.bodyMetricsStats ? (
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-[#0f0f13]">
                  <div className="text-sm text-gray-400 mb-2">
                    Current Weight
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {data.bodyMetricsStats.currentWeight
                      ? `${data.bodyMetricsStats.currentWeight} lbs`
                      : 'N/A'}
                  </div>
                </Card>
                <Card className="p-4 bg-[#0f0f13]">
                  <div className="text-sm text-gray-400 mb-2">7-Day Trend</div>
                  <div className="flex items-center gap-2">
                    {data.bodyMetricsStats.trendDirection === 'up' && (
                      <TrendingUp className="w-5 h-5 text-orange-400" />
                    )}
                    {data.bodyMetricsStats.trendDirection === 'down' && (
                      <TrendingDown className="w-5 h-5 text-blue-400" />
                    )}
                    <div className="text-lg font-semibold text-white capitalize">
                      {data.bodyMetricsStats.trendDirection}
                    </div>
                  </div>
                  {data.bodyMetricsStats.weightChange7Days != null && (
                    <div className="text-xs text-gray-400 mt-1">
                      {data.bodyMetricsStats.weightChange7Days > 0 ? '+' : ''}
                      {data.bodyMetricsStats.weightChange7Days.toFixed(1)} lbs
                    </div>
                  )}
                </Card>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-400">
                No body metrics logged yet
              </div>
            )}
          </Card>

          {/* Goals */}
          <GoalProgressIndicator goals={data.activeGoals} maxDisplay={3} />
        </div>
      </div>
    </div>
  );
}
