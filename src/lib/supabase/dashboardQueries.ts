import { supabase } from './client';
import { TrainingSession, TrainingStats, MMADiscipline } from '../types/training';
import { SparringTrendData, FocusArea } from '../types/sparring';
import { CardioStats, CardioTrendData } from '../types/cardio';
import { StrengthStats, PersonalRecord } from '../types/strength';
import { BodyMetricsStats, Goal } from '../types/metrics';
import { getTrainingStats, getTrainingSessions } from './queries';
import { getSparringTrends, detectFocusAreas } from './sparringQueries';
import { getCardioStats, getCardioTrends, getWeeklyCardioSummary } from './cardioQueries';
import { getStrengthStats, getPersonalRecords } from './strength-queries';
import { getBodyMetricsStats } from './metricsQueries';
import { getGoals, getUpcomingGoals } from './goalsQueries';

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface WeeklyDisciplineVolume {
  weekLabel: string;
  weekStart: string;
  [discipline: string]: string | number; // discipline names as keys with minute values
}

export interface TrainingInsight {
  type: 'warning' | 'info' | 'success';
  message: string;
  category: 'training' | 'sparring' | 'cardio' | 'strength' | 'goals';
}

export interface DashboardData {
  // Training overview
  trainingStats: TrainingStats | null;
  sessionsThisWeek: TrainingSession[];
  sessionsLastWeek: TrainingSession[];
  weeklyDisciplineVolume: WeeklyDisciplineVolume[];

  // Sparring
  sparringTrends: SparringTrendData[];
  sparringFocusAreas: FocusArea[];

  // Strength
  strengthStats: StrengthStats | null;
  recentPRs: PersonalRecord[];

  // Cardio
  cardioStats: CardioStats | null;
  cardioTrends: CardioTrendData[];
  cardioThisWeekMinutes: number;
  cardioLastMonthMinutes: number;

  // Body Metrics
  bodyMetricsStats: BodyMetricsStats | null;

  // Goals
  activeGoals: Goal[];
  upcomingGoals: Goal[];

  // Insights
  insights: TrainingInsight[];
}

// ============================================================================
// MAIN DASHBOARD DATA FETCHER
// ============================================================================

export async function getDashboardData(): Promise<{
  data: DashboardData | null;
  error: Error | null;
}> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: new Error('Not authenticated') };
    }

    // Calculate date ranges
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() + diffToMonday);
    const thisWeekStartStr = thisWeekStart.toISOString().split('T')[0];

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekStartStr = lastWeekStart.toISOString().split('T')[0];

    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
    const lastWeekEndStr = lastWeekEnd.toISOString().split('T')[0];

    const eightWeeksAgo = new Date(today);
    eightWeeksAgo.setDate(today.getDate() - 56);
    const eightWeeksAgoStr = eightWeeksAgo.toISOString().split('T')[0];

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(today.getDate() - 60);

    // Fetch all data in parallel
    const [
      trainingStatsRes,
      thisWeekSessionsRes,
      lastWeekSessionsRes,
      allRecentSessionsRes,
      sparringTrendsRes,
      sparringFocusRes,
      cardioStatsRes,
      cardioTrendsRes,
      cardioThisWeekRes,
      cardioLastMonthRes,
      bodyMetricsStatsRes,
      activeGoalsRes,
      upcomingGoalsRes,
      strengthStatsResult,
      personalRecordsResult,
    ] = await Promise.all([
      getTrainingStats(),
      getTrainingSessions({ startDate: thisWeekStartStr }),
      getTrainingSessions({ startDate: lastWeekStartStr, endDate: lastWeekEndStr }),
      getTrainingSessions({ startDate: eightWeeksAgoStr }),
      getSparringTrends(15),
      detectFocusAreas(),
      getCardioStats(),
      getCardioTrends(),
      getWeeklyCardioSummary(),
      getCardioLast30vs60(thirtyDaysAgo, sixtyDaysAgo),
      getBodyMetricsStats(),
      getGoals({ status: 'active' }),
      getUpcomingGoals(30),
      getStrengthStats(user.id).catch(() => null),
      getPersonalRecords(user.id).catch(() => []),
    ]);

    // Build weekly discipline volume data (last 8 weeks)
    const weeklyDisciplineVolume = buildWeeklyDisciplineVolume(
      allRecentSessionsRes.data || [],
      eightWeeksAgo,
      today
    );

    // Filter recent PRs (last 30 days)
    const allPRs = personalRecordsResult || [];
    const recentPRs = allPRs.filter(
      (pr) => new Date(pr.achieved_date) >= thirtyDaysAgo
    );

    // Build dashboard data
    const dashboardData: DashboardData = {
      trainingStats: trainingStatsRes.data,
      sessionsThisWeek: thisWeekSessionsRes.data || [],
      sessionsLastWeek: lastWeekSessionsRes.data || [],
      weeklyDisciplineVolume,
      sparringTrends: sparringTrendsRes.data || [],
      sparringFocusAreas: sparringFocusRes.data || [],
      strengthStats: strengthStatsResult,
      recentPRs,
      cardioStats: cardioStatsRes.data,
      cardioTrends: cardioTrendsRes.data || [],
      cardioThisWeekMinutes: cardioThisWeekRes.data?.totalMinutes || 0,
      cardioLastMonthMinutes: 0,
      bodyMetricsStats: bodyMetricsStatsRes.data,
      activeGoals: activeGoalsRes.data || [],
      upcomingGoals: upcomingGoalsRes.data || [],
      insights: [],
    };

    // Set cardio comparison data
    if (cardioLastMonthRes) {
      dashboardData.cardioLastMonthMinutes = cardioLastMonthRes.lastMonthMinutes;
      // Store for insights
      const thisMonthMinutes = cardioLastMonthRes.thisMonthMinutes;
      if (cardioLastMonthRes.lastMonthMinutes > 0 && thisMonthMinutes > 0) {
        const change =
          ((thisMonthMinutes - cardioLastMonthRes.lastMonthMinutes) /
            cardioLastMonthRes.lastMonthMinutes) *
          100;
        if (change < -20) {
          dashboardData.insights.push({
            type: 'warning',
            message: `Cardio volume is ${Math.abs(Math.round(change))}% lower than last month`,
            category: 'cardio',
          });
        }
      }
    }

    // Generate insights
    dashboardData.insights = generateInsights(dashboardData, cardioLastMonthRes);

    return { data: dashboardData, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

// ============================================================================
// HELPER: Cardio comparison (this month vs last month)
// ============================================================================

interface CardioComparisonResult {
  thisMonthMinutes: number;
  lastMonthMinutes: number;
}

async function getCardioLast30vs60(
  thirtyDaysAgo: Date,
  sixtyDaysAgo: Date
): Promise<CardioComparisonResult> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { thisMonthMinutes: 0, lastMonthMinutes: 0 };

    const { data: recentLogs } = await supabase
      .from('cardio_logs')
      .select('duration_minutes, session_date')
      .eq('user_id', user.id)
      .gte('session_date', sixtyDaysAgo.toISOString().split('T')[0]);

    if (!recentLogs) return { thisMonthMinutes: 0, lastMonthMinutes: 0 };

    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const thisMonthMinutes = recentLogs
      .filter((l) => l.session_date >= thirtyDaysAgoStr)
      .reduce((sum, l) => sum + l.duration_minutes, 0);

    const lastMonthMinutes = recentLogs
      .filter((l) => l.session_date < thirtyDaysAgoStr)
      .reduce((sum, l) => sum + l.duration_minutes, 0);

    return { thisMonthMinutes, lastMonthMinutes };
  } catch {
    return { thisMonthMinutes: 0, lastMonthMinutes: 0 };
  }
}

// ============================================================================
// HELPER: Build weekly discipline volume data for stacked bar chart
// ============================================================================

function buildWeeklyDisciplineVolume(
  sessions: TrainingSession[],
  startDate: Date,
  endDate: Date
): WeeklyDisciplineVolume[] {
  const weeks: WeeklyDisciplineVolume[] = [];

  // Walk through each week
  const current = new Date(startDate);
  // Align to Monday
  const dayOfWeek = current.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  current.setDate(current.getDate() + diffToMonday);

  while (current <= endDate) {
    const weekEnd = new Date(current);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekStartStr = current.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    // Get sessions for this week
    const weekSessions = sessions.filter(
      (s) => s.session_date >= weekStartStr && s.session_date <= weekEndStr
    );

    // Aggregate minutes by discipline
    const weekData: WeeklyDisciplineVolume = {
      weekLabel: formatWeekLabel(current),
      weekStart: weekStartStr,
    };

    weekSessions.forEach((session) => {
      const discipline = session.discipline;
      weekData[discipline] =
        ((weekData[discipline] as number) || 0) + session.duration_minutes;
    });

    weeks.push(weekData);

    // Move to next week
    current.setDate(current.getDate() + 7);
  }

  return weeks;
}

function formatWeekLabel(weekStart: Date): string {
  const month = weekStart.toLocaleDateString('en-US', { month: 'short' });
  const day = weekStart.getDate();
  return `${month} ${day}`;
}

// ============================================================================
// HELPER: Generate training insights
// ============================================================================

function generateInsights(
  data: DashboardData,
  cardioComparison: CardioComparisonResult | null
): TrainingInsight[] {
  const insights: TrainingInsight[] = [];

  // 1. Check for undertrained disciplines
  if (data.trainingStats && data.trainingStats.totalSessions > 0) {
    const allSessions = [...data.sessionsThisWeek, ...data.sessionsLastWeek];
    const disciplines: MMADiscipline[] = [
      'Boxing',
      'Muay Thai',
      'Kickboxing',
      'Wrestling',
      'Brazilian Jiu-Jitsu',
      'MMA',
    ];

    // Check which trained disciplines haven't been trained recently
    const trainedDisciplines = Object.keys(
      data.trainingStats.sessionsByDiscipline
    ).filter(
      (d) => data.trainingStats!.sessionsByDiscipline[d as MMADiscipline] > 0
    );

    // For each discipline the user has ever trained, check if it's been trained in the last 3 weeks
    if (trainedDisciplines.length > 0) {
      const threeWeeksAgo = new Date();
      threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
      const threeWeeksAgoStr = threeWeeksAgo.toISOString().split('T')[0];

      // Use all sessions from the 8-week data (allRecentSessions covers this)
      const recentDisciplines = new Set(
        allSessions
          .filter((s) => s.session_date >= threeWeeksAgoStr)
          .map((s) => s.discipline)
      );

      trainedDisciplines.forEach((discipline) => {
        if (!recentDisciplines.has(discipline as MMADiscipline)) {
          insights.push({
            type: 'warning',
            message: `You haven't trained ${discipline} in 3+ weeks`,
            category: 'training',
          });
        }
      });
    }

    // Training streak
    if (data.trainingStats.currentStreak >= 7) {
      insights.push({
        type: 'success',
        message: `${data.trainingStats.currentStreak}-day training streak! Keep it up!`,
        category: 'training',
      });
    }

    // Week-over-week comparison
    const thisWeekCount = data.sessionsThisWeek.length;
    const lastWeekCount = data.sessionsLastWeek.length;
    if (lastWeekCount > 0 && thisWeekCount > lastWeekCount) {
      insights.push({
        type: 'success',
        message: `Training up this week: ${thisWeekCount} sessions vs ${lastWeekCount} last week`,
        category: 'training',
      });
    }
  }

  // 2. Sparring focus areas with declining trends
  data.sparringFocusAreas.forEach((area) => {
    if (area.trend === 'declining' && area.priority !== 'low') {
      insights.push({
        type: 'warning',
        message: `Your sparring ${area.categoryLabel.toLowerCase()} ratings are trending down`,
        category: 'sparring',
      });
    }
  });

  // 3. Cardio comparison
  if (cardioComparison && cardioComparison.lastMonthMinutes > 0) {
    const change =
      ((cardioComparison.thisMonthMinutes - cardioComparison.lastMonthMinutes) /
        cardioComparison.lastMonthMinutes) *
      100;

    if (change < -20) {
      insights.push({
        type: 'warning',
        message: `Cardio volume is ${Math.abs(Math.round(change))}% lower than last month`,
        category: 'cardio',
      });
    } else if (change > 20) {
      insights.push({
        type: 'success',
        message: `Cardio volume is up ${Math.round(change)}% compared to last month`,
        category: 'cardio',
      });
    }
  }

  // 4. Strength PRs
  if (data.recentPRs.length > 0) {
    insights.push({
      type: 'success',
      message: `${data.recentPRs.length} new personal record${data.recentPRs.length > 1 ? 's' : ''} in the last 30 days!`,
      category: 'strength',
    });
  }

  // 5. Goal deadlines
  const overdueGoals = data.activeGoals.filter((g) => {
    if (!g.target_date) return false;
    return new Date(g.target_date) < new Date();
  });

  if (overdueGoals.length > 0) {
    insights.push({
      type: 'warning',
      message: `${overdueGoals.length} goal${overdueGoals.length > 1 ? 's are' : ' is'} past the target date`,
      category: 'goals',
    });
  }

  if (data.upcomingGoals.length > 0) {
    insights.push({
      type: 'info',
      message: `${data.upcomingGoals.length} goal${data.upcomingGoals.length > 1 ? 's' : ''} due in the next 30 days`,
      category: 'goals',
    });
  }

  return insights;
}
