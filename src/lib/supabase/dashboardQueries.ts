import { supabase } from './client';
import { TrainingSession, TrainingStats, MMADiscipline } from '../types/training';
import { SparringTrendData, FocusArea } from '../types/sparring';
import { CardioStats, CardioTrendData } from '../types/cardio';
import { StrengthStats, PersonalRecord } from '../types/strength';
import { BodyMetricsStats, Goal } from '../types/metrics';
import { Competition } from '../types/competition';
import { getTrainingStats, getTrainingSessions } from './queries';
import { getSparringTrends, detectFocusAreas } from './sparringQueries';
import { getCardioStats, getCardioTrends, getWeeklyCardioSummary } from './cardioQueries';
import { getStrengthStats, getPersonalRecords } from './strength-queries';
import { getBodyMetricsStats } from './metricsQueries';
import { getGoals, getUpcomingGoals } from './goalsQueries';
import { getNextCompetition } from './competitionQueries';

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
  priority: number; // higher = more important, used for sorting
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

  // Competition
  nextCompetition: Competition | null;

  // 30-day discipline breakdown (for radar chart)
  disciplineLast30Days: Record<string, number>;

  // Training load
  trainingLoadThisWeek: number;
  trainingLoad4WeekAvg: number;

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
      nextCompetitionRes,
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
      getNextCompetition(),
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

    // 30-day discipline breakdown (for radar chart)
    const allRecentSessions = allRecentSessionsRes.data || [];
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
    const disciplineLast30Days: Record<string, number> = {};
    allRecentSessions
      .filter((s) => s.session_date >= thirtyDaysAgoStr)
      .forEach((s) => {
        disciplineLast30Days[s.discipline] = (disciplineLast30Days[s.discipline] || 0) + 1;
      });

    // Training load calculation
    const fourWeeksAgo = new Date(today);
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    const fourWeeksAgoStr = fourWeeksAgo.toISOString().split('T')[0];

    const thisWeekSessions = thisWeekSessionsRes.data || [];
    const trainingLoadThisWeek = thisWeekSessions.reduce(
      (sum, s) => sum + s.duration_minutes * s.intensity,
      0
    );

    const last4WeekSessions = allRecentSessions.filter(
      (s) => s.session_date >= fourWeeksAgoStr && s.session_date < thisWeekStartStr
    );
    const trainingLoad4WeekAvg = last4WeekSessions.length > 0
      ? last4WeekSessions.reduce((sum, s) => sum + s.duration_minutes * s.intensity, 0) / 4
      : 0;

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
      nextCompetition: nextCompetitionRes.data || null,
      disciplineLast30Days,
      trainingLoadThisWeek,
      trainingLoad4WeekAvg,
      insights: [],
    };

    // Set cardio comparison data
    if (cardioLastMonthRes) {
      dashboardData.cardioLastMonthMinutes = cardioLastMonthRes.lastMonthMinutes;
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

  // 1. Consecutive training days warning (6+ days straight)
  if (data.trainingStats && data.trainingStats.currentStreak >= 6) {
    insights.push({
      type: 'warning',
      message: `You've trained ${data.trainingStats.currentStreak} days straight \u2014 consider a rest day`,
      category: 'training',
      priority: 90,
    });
  }

  // 2. Discipline gaps — 14+ days since last session per discipline
  if (data.trainingStats && data.trainingStats.totalSessions > 0) {
    const allSessions = [...data.sessionsThisWeek, ...data.sessionsLastWeek];
    const trainedDisciplines = Object.keys(
      data.trainingStats.sessionsByDiscipline
    ).filter(
      (d) => data.trainingStats!.sessionsByDiscipline[d as MMADiscipline] > 0
    );

    if (trainedDisciplines.length > 0) {
      const today = new Date();
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const fourteenDaysAgoStr = fourteenDaysAgo.toISOString().split('T')[0];

      // Build a map of last session date per discipline
      const lastSessionByDiscipline: Record<string, string> = {};
      allSessions.forEach((s) => {
        if (!lastSessionByDiscipline[s.discipline] || s.session_date > lastSessionByDiscipline[s.discipline]) {
          lastSessionByDiscipline[s.discipline] = s.session_date;
        }
      });

      trainedDisciplines.forEach((discipline) => {
        const lastDate = lastSessionByDiscipline[discipline];
        if (!lastDate || lastDate < fourteenDaysAgoStr) {
          const daysSince = lastDate
            ? Math.floor((today.getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24))
            : 14;
          insights.push({
            type: 'warning',
            message: `You haven't trained ${discipline} in ${daysSince} days`,
            category: 'training',
            priority: 80,
          });
        }
      });
    }
  }

  // 3. Cardio volume comparison
  if (cardioComparison && cardioComparison.lastMonthMinutes > 0) {
    const change =
      ((cardioComparison.thisMonthMinutes - cardioComparison.lastMonthMinutes) /
        cardioComparison.lastMonthMinutes) *
      100;

    if (change < -20) {
      insights.push({
        type: 'warning',
        message: `Cardio volume down ${Math.abs(Math.round(change))}% from last month`,
        category: 'cardio',
        priority: 70,
      });
    } else if (change > 20) {
      insights.push({
        type: 'success',
        message: `Cardio volume is up ${Math.round(change)}% compared to last month`,
        category: 'cardio',
        priority: 40,
      });
    }
  }

  // 4. Celebrate recent PRs individually (top 1)
  if (data.recentPRs.length > 0) {
    const latestPR = data.recentPRs[0];
    insights.push({
      type: 'success',
      message: `New PR! You hit ${Math.round(latestPR.value)} lbs on ${latestPR.exercise_name}`,
      category: 'strength',
      priority: 85,
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
      priority: 75,
    });
  }

  // 6. Sparring focus areas with declining trends
  const decliningArea = data.sparringFocusAreas.find(
    (area) => area.trend === 'declining' && area.priority !== 'low'
  );
  if (decliningArea) {
    insights.push({
      type: 'warning',
      message: `Your sparring ${decliningArea.categoryLabel.toLowerCase()} ratings are trending down`,
      category: 'sparring',
      priority: 60,
    });
  }

  // 7. Training streak celebration (not same as rest warning)
  if (data.trainingStats && data.trainingStats.currentStreak >= 7 && data.trainingStats.currentStreak < 6) {
    // This case won't fire since >= 7 is always >= 6, but the rest day warning takes priority
  }

  // 8. Week-over-week improvement
  const thisWeekCount = data.sessionsThisWeek.length;
  const lastWeekCount = data.sessionsLastWeek.length;
  if (lastWeekCount > 0 && thisWeekCount > lastWeekCount) {
    insights.push({
      type: 'success',
      message: `Training up this week: ${thisWeekCount} sessions vs ${lastWeekCount} last week`,
      category: 'training',
      priority: 30,
    });
  }

  // Sort by priority (highest first) and return max 3
  insights.sort((a, b) => b.priority - a.priority);
  return insights.slice(0, 3);
}
