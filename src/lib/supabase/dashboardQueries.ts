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
import { getTodaysSchedule, getWeeklyAdherenceSummary } from './scheduleQueries';
import { ScheduleEntryWithAdherence, WeeklyAdherenceSummary } from '../types/schedule';

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface WeeklyDisciplineVolume {
  weekLabel: string;
  weekStart: string;
  [discipline: string]: string | number; // discipline names as keys with minute values
}

export interface TrainingInsight {
  id: string;
  type: 'warning' | 'info' | 'success';
  icon: string; // lucide-react icon name
  message: string;
  advice: string;
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

  // Schedule
  todaysSchedule: ScheduleEntryWithAdherence[];
  scheduleAdherenceThisWeek: WeeklyAdherenceSummary | null;
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
      todaysScheduleRes,
      weeklyAdherenceRes,
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
      getTodaysSchedule(),
      getWeeklyAdherenceSummary(thisWeekStartStr),
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
      todaysSchedule: todaysScheduleRes.data || [],
      scheduleAdherenceThisWeek: weeklyAdherenceRes.data,
    };

    // Set cardio comparison data
    if (cardioLastMonthRes) {
      dashboardData.cardioLastMonthMinutes = cardioLastMonthRes.lastMonthMinutes;
    }

    // Generate insights
    dashboardData.insights = generateInsights(dashboardData, cardioLastMonthRes, allRecentSessions);

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
  cardioComparison: CardioComparisonResult | null,
  allRecentSessions: TrainingSession[]
): TrainingInsight[] {
  const insights: TrainingInsight[] = [];
  const today = new Date();

  // ── RECOVERY ──────────────────────────────────────────────────────────

  // Consecutive training days (3+)
  if (data.trainingStats && data.trainingStats.currentStreak >= 3) {
    insights.push({
      id: 'rest-day-needed',
      type: 'warning',
      icon: 'Moon',
      message: `You've trained ${data.trainingStats.currentStreak} days straight.`,
      advice: 'Consider a rest day to prevent overtraining.',
      category: 'training',
      priority: 90,
    });
  }

  // High intensity yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const highIntensityYesterday = allRecentSessions.find(
    (s) => s.session_date === yesterdayStr && s.intensity >= 8
  );
  if (highIntensityYesterday) {
    insights.push({
      id: 'post-intensity-recovery',
      type: 'info',
      icon: 'Battery',
      message: `Yesterday was intense (${highIntensityYesterday.intensity}/10).`,
      advice: 'Today might be a good day for light technique work or mobility.',
      category: 'training',
      priority: 85,
    });
  }

  // ── DISCIPLINE BALANCE ────────────────────────────────────────────────

  // Discipline gap (14+ days since last session for a trained discipline)
  if (data.trainingStats && data.trainingStats.totalSessions > 0) {
    const trainedDisciplines = Object.keys(
      data.trainingStats.sessionsByDiscipline
    ).filter(
      (d) => data.trainingStats!.sessionsByDiscipline[d as MMADiscipline] > 0
    );

    if (trainedDisciplines.length > 1) {
      const fourteenDaysAgo = new Date(today);
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const fourteenDaysAgoStr = fourteenDaysAgo.toISOString().split('T')[0];

      const lastSessionByDiscipline: Record<string, string> = {};
      allRecentSessions.forEach((s) => {
        if (
          !lastSessionByDiscipline[s.discipline] ||
          s.session_date > lastSessionByDiscipline[s.discipline]
        ) {
          lastSessionByDiscipline[s.discipline] = s.session_date;
        }
      });

      trainedDisciplines.forEach((discipline) => {
        const lastDate = lastSessionByDiscipline[discipline];
        if (!lastDate || lastDate < fourteenDaysAgoStr) {
          const daysSince = lastDate
            ? Math.floor(
                (today.getTime() - new Date(lastDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              )
            : 14;
          insights.push({
            id: `discipline-gap-${discipline}`,
            type: 'warning',
            icon: 'Shuffle',
            message: `You haven't trained ${discipline} in ${daysSince} days.`,
            advice: 'Consider scheduling a session this week.',
            category: 'training',
            priority: 78,
          });
        }
      });
    }
  }

  // Discipline dominance (>60% of last 30 days)
  const totalLast30 = Object.values(data.disciplineLast30Days).reduce(
    (sum, n) => sum + n,
    0
  );
  if (totalLast30 >= 5) {
    const sorted = Object.entries(data.disciplineLast30Days).sort(
      ([, a], [, b]) => b - a
    );
    if (sorted.length > 1) {
      const [topDiscipline, topCount] = sorted[0];
      const percentage = Math.round((topCount / totalLast30) * 100);
      if (percentage > 60) {
        const leastTrained = sorted[sorted.length - 1][0];
        insights.push({
          id: 'discipline-dominance',
          type: 'info',
          icon: 'Scale',
          message: `Your training is ${percentage}% ${topDiscipline}.`,
          advice: `Mix in more ${leastTrained} for better balance.`,
          category: 'training',
          priority: 70,
        });
      }
    }
  }

  // ── PROGRESSION ───────────────────────────────────────────────────────

  // Recent PR celebration
  if (data.recentPRs.length > 0) {
    const latestPR = data.recentPRs[0];
    insights.push({
      id: `recent-pr-${latestPR.exercise_name}`,
      type: 'success',
      icon: 'Trophy',
      message: `New PR on ${latestPR.exercise_name} \u2014 ${Math.round(latestPR.value)} lbs!`,
      advice: 'Try progressive overload \u2014 add 5 lbs next session.',
      category: 'strength',
      priority: 75,
    });
  }

  // No PRs in 30+ days (only if user has strength data)
  if (
    data.recentPRs.length === 0 &&
    data.strengthStats &&
    data.strengthStats.totalWorkouts > 0
  ) {
    insights.push({
      id: 'no-recent-prs',
      type: 'info',
      icon: 'Dumbbell',
      message: 'No new PRs this month.',
      advice: 'Consider a deload week or changing your rep scheme.',
      category: 'strength',
      priority: 55,
    });
  }

  // ── SPARRING ──────────────────────────────────────────────────────────

  // Low sparring category (avg < 4)
  const lowFocusArea = data.sparringFocusAreas.find(
    (area) => area.averageRating < 4 && area.priority !== 'low'
  );
  if (lowFocusArea) {
    insights.push({
      id: `sparring-low-${lowFocusArea.category}`,
      type: 'warning',
      icon: 'Shield',
      message: `Your ${lowFocusArea.categoryLabel.toLowerCase()} has been trending low (avg ${lowFocusArea.averageRating.toFixed(1)}/10).`,
      advice: `Focus on ${lowFocusArea.categoryLabel.toLowerCase()} drills this week.`,
      category: 'sparring',
      priority: 65,
    });
  }

  // Declining sparring area (catches areas that were fine but dropping)
  const decliningArea = data.sparringFocusAreas.find(
    (area) =>
      area.trend === 'declining' &&
      area.priority !== 'low' &&
      area.averageRating >= 4
  );
  if (decliningArea) {
    insights.push({
      id: `sparring-declining-${decliningArea.category}`,
      type: 'warning',
      icon: 'Shield',
      message: `Your sparring ${decliningArea.categoryLabel.toLowerCase()} ratings are trending down.`,
      advice: 'Dedicate a few rounds to focused positional sparring.',
      category: 'sparring',
      priority: 62,
    });
  }

  // Low sparring frequency
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
  const sparringThisMonth = data.sparringTrends.filter(
    (s) => s.date >= thirtyDaysAgoStr
  ).length;
  if (sparringThisMonth > 0 && sparringThisMonth < 4) {
    insights.push({
      id: 'sparring-frequency-low',
      type: 'info',
      icon: 'Swords',
      message: `You've only sparred ${sparringThisMonth} ${sparringThisMonth === 1 ? 'time' : 'times'} this month.`,
      advice: 'More sparring = faster improvement. Try to get 2+ rounds per week.',
      category: 'sparring',
      priority: 60,
    });
  }

  // ── GOALS ─────────────────────────────────────────────────────────────

  // Goal deadline approaching + behind pace
  data.activeGoals.forEach((goal) => {
    if (!goal.target_date || !goal.target_value || goal.target_value === 0)
      return;

    const targetDate = new Date(goal.target_date);
    const daysRemaining = Math.ceil(
      (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysRemaining <= 0 || daysRemaining > 30) return;

    const currentValue = goal.current_value || 0;
    const progressPercent = Math.round(
      (currentValue / goal.target_value) * 100
    );

    const createdDate = new Date(goal.created_at);
    const totalDays = Math.ceil(
      (targetDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const elapsed = totalDays - daysRemaining;
    const expectedPercent =
      totalDays > 0 ? Math.round((elapsed / totalDays) * 100) : 100;

    if (progressPercent < expectedPercent * 0.75 && progressPercent < 90) {
      insights.push({
        id: `goal-behind-${goal.id}`,
        type: 'warning',
        icon: 'Flag',
        message: `Your "${goal.title}" deadline is in ${daysRemaining} days but you're only ${progressPercent}% there.`,
        advice: 'Time to accelerate \u2014 review your plan and increase consistency.',
        category: 'goals',
        priority: 88,
      });
    }
  });

  // Overdue goals
  const overdueGoals = data.activeGoals.filter((g) => {
    if (!g.target_date) return false;
    return new Date(g.target_date) < today;
  });
  if (overdueGoals.length > 0) {
    insights.push({
      id: 'goals-overdue',
      type: 'warning',
      icon: 'Flag',
      message: `${overdueGoals.length} goal${overdueGoals.length > 1 ? 's are' : ' is'} past the target date.`,
      advice: 'Update your timeline or mark them complete if achieved.',
      category: 'goals',
      priority: 82,
    });
  }

  // ── CARDIO ────────────────────────────────────────────────────────────

  if (cardioComparison && cardioComparison.lastMonthMinutes > 0) {
    const change =
      ((cardioComparison.thisMonthMinutes - cardioComparison.lastMonthMinutes) /
        cardioComparison.lastMonthMinutes) *
      100;

    if (change < -20) {
      insights.push({
        id: 'cardio-volume-down',
        type: 'warning',
        icon: 'Heart',
        message: `Cardio volume down ${Math.abs(Math.round(change))}% from last month.`,
        advice: 'Try to fit in 2\u20133 steady-state sessions this week.',
        category: 'cardio',
        priority: 68,
      });
    } else if (change > 20) {
      insights.push({
        id: 'cardio-volume-up',
        type: 'success',
        icon: 'Heart',
        message: `Cardio volume is up ${Math.round(change)}% compared to last month.`,
        advice: 'Great consistency \u2014 keep it going!',
        category: 'cardio',
        priority: 35,
      });
    }
  }

  // ── POSITIVE MOMENTUM ─────────────────────────────────────────────────

  const thisWeekCount = data.sessionsThisWeek.length;
  const lastWeekCount = data.sessionsLastWeek.length;
  if (lastWeekCount > 0 && thisWeekCount > lastWeekCount) {
    insights.push({
      id: 'week-over-week-up',
      type: 'success',
      icon: 'TrendingUp',
      message: `Training up this week: ${thisWeekCount} sessions vs ${lastWeekCount} last week.`,
      advice: 'Momentum is building \u2014 stay consistent.',
      category: 'training',
      priority: 30,
    });
  }

  // Sort by priority (highest first), return pool of 6 so dismissing reveals next
  insights.sort((a, b) => b.priority - a.priority);
  return insights.slice(0, 6);
}
