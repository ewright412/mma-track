import { supabase } from './client';

export interface UserBadge {
  id: string;
  user_id: string;
  badge_key: string;
  earned_at: string;
}

export async function getUserBadges(
  userId: string
): Promise<{ data: UserBadge[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) return { data: null, error };
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export async function awardBadge(
  userId: string,
  badgeKey: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('user_badges')
      .upsert({ user_id: userId, badge_key: badgeKey }, { onConflict: 'user_id,badge_key' });

    if (error) return { error };
    return { error: null };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error('Unknown error'),
    };
  }
}

export async function checkAndAwardBadges(
  userId: string
): Promise<string[]> {
  const newlyEarned: string[] = [];

  try {
    // Get existing badges
    const { data: existing } = await getUserBadges(userId);
    const earnedKeys = new Set((existing || []).map((b) => b.badge_key));

    // --- first_blood: 1+ training session ---
    if (!earnedKeys.has('first_blood')) {
      const { count } = await supabase
        .from('training_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (count && count >= 1) {
        await awardBadge(userId, 'first_blood');
        newlyEarned.push('first_blood');
      }
    }

    // --- week_warrior: 5 sessions in current week ---
    if (!earnedKeys.has('week_warrior')) {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      startOfWeek.setHours(0, 0, 0, 0);
      const weekStart = startOfWeek.toISOString().split('T')[0];

      const { count } = await supabase
        .from('training_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('session_date', weekStart);

      if (count && count >= 5) {
        await awardBadge(userId, 'week_warrior');
        newlyEarned.push('week_warrior');
      }
    }

    // --- iron_will: 7-day streak / unstoppable: 30-day streak ---
    if (!earnedKeys.has('iron_will') || !earnedKeys.has('unstoppable')) {
      const { data: sessions } = await supabase
        .from('training_sessions')
        .select('session_date')
        .eq('user_id', userId)
        .order('session_date', { ascending: false });

      if (sessions && sessions.length > 0) {
        const uniqueDates = [...new Set(sessions.map((s) => s.session_date))].sort().reverse();
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < uniqueDates.length; i++) {
          const sessionDate = new Date(uniqueDates[i] + 'T00:00:00');
          if (i === 0) {
            const diffDays = Math.floor(
              (today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (diffDays <= 1) {
              streak = 1;
            } else {
              break;
            }
          } else {
            const prevDate = new Date(uniqueDates[i - 1] + 'T00:00:00');
            const diffDays = Math.floor(
              (prevDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
            );
            if (diffDays === 1) {
              streak++;
            } else {
              break;
            }
          }
        }

        if (streak >= 7 && !earnedKeys.has('iron_will')) {
          await awardBadge(userId, 'iron_will');
          newlyEarned.push('iron_will');
        }
        if (streak >= 30 && !earnedKeys.has('unstoppable')) {
          await awardBadge(userId, 'unstoppable');
          newlyEarned.push('unstoppable');
        }
      }
    }

    // --- well_rounded: 4+ disciplines in current week ---
    if (!earnedKeys.has('well_rounded')) {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      startOfWeek.setHours(0, 0, 0, 0);
      const weekStart = startOfWeek.toISOString().split('T')[0];

      const { data: weekSessions } = await supabase
        .from('training_sessions')
        .select('discipline')
        .eq('user_id', userId)
        .gte('session_date', weekStart);

      if (weekSessions) {
        const disciplines = new Set(weekSessions.map((s) => s.discipline));
        if (disciplines.size >= 4) {
          await awardBadge(userId, 'well_rounded');
          newlyEarned.push('well_rounded');
        }
      }
    }

    // --- thousand_lb_club: Bench + Squat + Deadlift >= 1000 lbs ---
    if (!earnedKeys.has('thousand_lb_club')) {
      const { data: prs } = await supabase
        .from('personal_records')
        .select('exercise_name, weight')
        .eq('user_id', userId)
        .in('exercise_name', ['Bench Press', 'Squat', 'Deadlift']);

      if (prs && prs.length > 0) {
        const prMap: Record<string, number> = {};
        prs.forEach((pr) => {
          prMap[pr.exercise_name] = Math.max(prMap[pr.exercise_name] || 0, pr.weight);
        });
        const total = (prMap['Bench Press'] || 0) + (prMap['Squat'] || 0) + (prMap['Deadlift'] || 0);
        if (total >= 1000) {
          await awardBadge(userId, 'thousand_lb_club');
          newlyEarned.push('thousand_lb_club');
        }
      }
    }

    // --- pr_machine: 3+ PRs in current month ---
    if (!earnedKeys.has('pr_machine')) {
      const now = new Date();
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

      const { count } = await supabase
        .from('personal_records')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('achieved_at', monthStart);

      if (count && count >= 3) {
        await awardBadge(userId, 'pr_machine');
        newlyEarned.push('pr_machine');
      }
    }

    // --- road_warrior: 50km total cardio distance ---
    if (!earnedKeys.has('road_warrior')) {
      const { data: cardioLogs } = await supabase
        .from('cardio_logs')
        .select('distance_km')
        .eq('user_id', userId)
        .not('distance_km', 'is', null);

      if (cardioLogs) {
        const totalKm = cardioLogs.reduce((sum, l) => sum + (l.distance_km || 0), 0);
        if (totalKm >= 50) {
          await awardBadge(userId, 'road_warrior');
          newlyEarned.push('road_warrior');
        }
      }
    }

    // --- sparring_veteran: 10 sparring sessions ---
    if (!earnedKeys.has('sparring_veteran')) {
      const { count } = await supabase
        .from('sparring_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (count && count >= 10) {
        await awardBadge(userId, 'sparring_veteran');
        newlyEarned.push('sparring_veteran');
      }
    }
  } catch (error) {
    console.error('Error checking badges:', error);
  }

  return newlyEarned;
}
