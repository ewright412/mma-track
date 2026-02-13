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
} from 'lucide-react';
import { getDashboardData, DashboardData } from '@/lib/supabase/dashboardQueries';
import { TrainingInsights } from '@/components/charts/TrainingInsights';
import { GoalProgressIndicator } from '@/components/metrics/GoalProgressIndicator';
import { CompetitionCountdown } from '@/components/dashboard/CompetitionCountdown';
import { TrainingLoadCard } from '@/components/dashboard/TrainingLoadCard';
import { TodaysPlanCard } from '@/components/dashboard/TodaysPlanCard';
import { DailyChallengeCard } from '@/components/dashboard/DailyChallengeCard';
import { PaywallGate } from '@/components/billing/PaywallGate';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { CountUp } from '@/components/ui/CountUp';

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
const DisciplineBalanceChart = dynamic(
  () => import('@/components/charts/DisciplineBalanceChart').then(mod => ({ default: mod.DisciplineBalanceChart })),
  { loading: () => <div className="h-64 bg-card rounded-card animate-pulse" /> }
);

export default function DashboardPage() {
  const router = useRouter();
  const { isPro } = useSubscription();
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
      <div className="max-w-7xl mx-auto">
        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[72px] bg-[#1a1a24] rounded-xl animate-pulse" />
          ))}
        </div>
        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-[#1a1a24] rounded-xl animate-pulse" />
          ))}
        </div>
        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="h-72 bg-[#1a1a24] rounded-xl animate-pulse" />
          <div className="h-72 bg-[#1a1a24] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Failed to load dashboard</h2>
          <p className="text-gray-400 text-sm mb-4">Something went wrong loading your data.</p>
          <button
            onClick={loadDashboardData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const thisWeekCount = data.sessionsThisWeek.length;
  const thisWeekMinutes = data.sessionsThisWeek.reduce(
    (sum, s) => sum + s.duration_minutes,
    0
  );

  return (
    <div className="max-w-7xl mx-auto space-y-3">
        <h1 className="text-xl font-bold text-white md:hidden">Dashboard</h1>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => router.push('/training/new')}
            className="flex items-center gap-3 bg-[#1a1a24] rounded-xl h-14 px-4 hover:bg-[#1f1f2a] active:scale-[0.97] active:bg-white/5 transition-all duration-150"
            style={{ touchAction: 'manipulation' }}
          >
            <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <Target className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-sm font-medium text-white">Log Training</span>
          </button>
          <button
            onClick={() => router.push('/strength/new')}
            className="flex items-center gap-3 bg-[#1a1a24] rounded-xl h-14 px-4 hover:bg-[#1f1f2a] active:scale-[0.97] active:bg-white/5 transition-all duration-150"
            style={{ touchAction: 'manipulation' }}
          >
            <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <Dumbbell className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-sm font-medium text-white">Log Workout</span>
          </button>
          <button
            onClick={() => router.push('/sparring/new')}
            className="flex items-center gap-3 bg-[#1a1a24] rounded-xl h-14 px-4 hover:bg-[#1f1f2a] active:scale-[0.97] active:bg-white/5 transition-all duration-150"
            style={{ touchAction: 'manipulation' }}
          >
            <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
              <Activity className="w-4 h-4 text-amber-500" />
            </div>
            <span className="text-sm font-medium text-white">Log Sparring</span>
          </button>
          <button
            onClick={() => router.push('/cardio/new')}
            className="flex items-center gap-3 bg-[#1a1a24] rounded-xl h-14 px-4 hover:bg-[#1f1f2a] active:scale-[0.97] active:bg-white/5 transition-all duration-150"
            style={{ touchAction: 'manipulation' }}
          >
            <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <Heart className="w-4 h-4 text-green-500" />
            </div>
            <span className="text-sm font-medium text-white">Log Cardio</span>
          </button>
        </div>

        {/* Daily Challenge */}
        <DailyChallengeCard />

        {/* Competition Countdown */}
        <CompetitionCountdown
          competition={data.nextCompetition}
          currentWeight={data.bodyMetricsStats?.currentWeight}
        />

        {/* Today's Plan */}
        <TodaysPlanCard entries={data.todaysSchedule} />

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-[#1a1a24] rounded-xl p-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-white"><CountUp end={thisWeekCount} /></div>
            <div className="text-xs text-gray-500">
              {thisWeekCount === 1 ? 'session' : 'sessions'} this week
            </div>
          </div>

          <div className="bg-[#1a1a24] rounded-xl p-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center mb-2">
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-xl font-bold text-white">
              {thisWeekMinutes >= 60
                ? <><CountUp end={Math.floor(thisWeekMinutes / 60)} />h <CountUp end={thisWeekMinutes % 60} />m</>
                : <><CountUp end={thisWeekMinutes} />m</>}
            </div>
            <div className="text-xs text-gray-500">training time</div>
          </div>

          <div className="bg-[#1a1a24] rounded-xl p-3">
            <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center mb-2">
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-xl font-bold text-white">
              <CountUp end={data.trainingStats?.currentStreak || 0} />
            </div>
            <div className="text-xs text-gray-500">
              {(data.trainingStats?.currentStreak || 0) === 1 ? 'day' : 'days'} streak
            </div>
          </div>

          <div className="bg-[#1a1a24] rounded-xl p-3">
            <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center mb-2">
              <Award className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-xl font-bold text-white">
              <CountUp end={data.recentPRs.length} />
            </div>
            <div className="text-xs text-gray-500">personal records</div>
          </div>
        </div>

        {/* Training Load */}
        <PaywallGate isPro={isPro} feature="Training Load analytics">
          <TrainingLoadCard
            loadThisWeek={data.trainingLoadThisWeek}
            load4WeekAvg={data.trainingLoad4WeekAvg}
          />
        </PaywallGate>

        {/* Insights */}
        {data.insights.length > 0 && (
          <TrainingInsights insights={data.insights} />
        )}

        {/* Training Overview + Discipline Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Weekly Volume Chart */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <h2 className="text-base font-semibold text-white">
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

          {/* Discipline Balance (Radar) */}
          <PaywallGate isPro={isPro} feature="Discipline Balance chart">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-red-400" />
                <h2 className="text-base font-semibold text-white">
                  Discipline Balance
                </h2>
                <span className="text-xs text-gray-500">Last 30 days</span>
              </div>
              <DisciplineBalanceChart
                sessionsByDiscipline={data.disciplineLast30Days}
              />
            </Card>
          </PaywallGate>
        </div>

        {/* Sparring Trends */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <h2 className="text-base font-semibold text-white">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Strength Highlights */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-red-400" />
                <h2 className="text-base font-semibold text-white">
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
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-green-400" />
                <h2 className="text-base font-semibold text-white">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* Body Metrics Snapshot */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-500" />
                <h2 className="text-base font-semibold text-white">
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
  );
}
