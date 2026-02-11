import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MAX_MESSAGES_PER_DAY = 30;

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

function getSupabaseAuth() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(request: Request) {
  try {
    // Auth
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing authorization' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await getSupabaseAuth().auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { message, conversationHistory } = (await request.json()) as {
      message: string;
      conversationHistory: ConversationMessage[];
    };

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const today = new Date().toISOString().split('T')[0];

    // Rate limiting
    const { data: usageRow } = await supabaseAdmin
      .from('ai_usage_tracking')
      .select('message_count')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    const currentCount = usageRow?.message_count || 0;

    if (currentCount >= MAX_MESSAGES_PER_DAY) {
      return NextResponse.json(
        { error: 'Daily message limit reached (30/day). Try again tomorrow.' },
        { status: 429 }
      );
    }

    // Increment usage
    await supabaseAdmin.from('ai_usage_tracking').upsert(
      {
        user_id: user.id,
        date: today,
        message_count: currentCount + 1,
      },
      { onConflict: 'user_id,date' }
    );

    // Fetch user context data in parallel
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const thisWeekStart = getThisWeekStart();

    const [
      trainingRes,
      sparringRes,
      goalsRes,
      strengthPRsRes,
      weekSessionsRes,
    ] = await Promise.all([
      // Last 30 days training
      supabaseAdmin
        .from('training_sessions')
        .select('session_date, discipline, duration_minutes, intensity, notes')
        .eq('user_id', user.id)
        .gte('session_date', thirtyDaysAgoStr)
        .order('session_date', { ascending: false }),
      // Last 10 sparring sessions with rounds
      supabaseAdmin
        .from('sparring_sessions')
        .select('session_date, sparring_type, opponent_skill_level, total_rounds, what_went_well, what_to_improve, sparring_rounds(ratings)')
        .eq('user_id', user.id)
        .order('session_date', { ascending: false })
        .limit(10),
      // Active goals
      supabaseAdmin
        .from('goals')
        .select('title, description, category, target_value, current_value, unit, target_date, status')
        .eq('user_id', user.id)
        .eq('status', 'active'),
      // Top PRs
      supabaseAdmin
        .from('personal_records')
        .select('exercise_name, value, record_type, achieved_date')
        .eq('user_id', user.id)
        .order('value', { ascending: false })
        .limit(5),
      // This week's sessions (for streak/count)
      supabaseAdmin
        .from('training_sessions')
        .select('session_date')
        .eq('user_id', user.id)
        .gte('session_date', thisWeekStart),
    ]);

    // Calculate streak
    const allSessionDates = trainingRes.data
      ?.map((s) => s.session_date)
      .filter((d, i, arr) => arr.indexOf(d) === i)
      .sort()
      .reverse() || [];

    let streak = 0;
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < allSessionDates.length; i++) {
      const sessionDate = new Date(allSessionDates[i]);
      sessionDate.setHours(0, 0, 0, 0);
      const expectedDate = new Date(todayDate);
      expectedDate.setDate(expectedDate.getDate() - i);

      const diffDays = Math.floor(
        (todayDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (i === 0 && diffDays > 1) break;
      if (i > 0) {
        const prevDate = new Date(allSessionDates[i - 1]);
        prevDate.setHours(0, 0, 0, 0);
        const gap = Math.floor(
          (prevDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (gap > 1) break;
      }
      streak++;
    }

    // Build user profile from metadata
    const meta = user.user_metadata || {};
    const profileName = meta.display_name || user.email?.split('@')[0] || 'Fighter';
    const weightClass = meta.weight_class || 'Not set';
    const stance = meta.stance || 'Not set';
    const disciplines = meta.disciplines
      ? (meta.disciplines as string[]).join(', ')
      : 'Not set';
    const trainingLevel = meta.training_level || 'Not set';

    // Format training data
    const trainingSummary = formatTrainingSessions(trainingRes.data || []);
    const sparringSummary = formatSparringSessions(sparringRes.data || []);
    const goalsSummary = formatGoals(goalsRes.data || []);
    const prsSummary = formatPRs(strengthPRsRes.data || []);
    const weekCount = weekSessionsRes.data?.length || 0;

    const systemPrompt = `You are an expert MMA coach inside the Clinch training app. You have access to this fighter's real training data.

FIGHTER PROFILE:
${profileName}, ${weightClass}, ${stance}, trains: ${disciplines}
Training level: ${trainingLevel}

RECENT TRAINING (last 30 days):
${trainingSummary || 'No sessions logged yet.'}

SPARRING PERFORMANCE:
${sparringSummary || 'No sparring sessions logged yet.'}

CURRENT GOALS:
${goalsSummary || 'No active goals set.'}

STRENGTH PRs:
${prsSummary || 'No PRs recorded yet.'}

THIS WEEK:
${weekCount} sessions this week, ${streak} day streak

RULES:
- Be direct and specific. No generic advice. Reference their actual data.
- If they ask what to work on, look at their weakest sparring categories and least-trained disciplines.
- If they ask for a plan, build it around their actual schedule and goals.
- Keep responses concise — 2-4 paragraphs max unless they ask for a detailed plan.
- Use MMA terminology naturally. You're a coach, not a chatbot.
- If you notice patterns (overtraining, neglecting a discipline, plateau), call it out.
- Be encouraging but honest. Fighters respect directness.`;

    // Build messages for OpenAI
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-20)) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    messages.push({ role: 'user', content: message });

    // Call OpenAI with streaming
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      stream: true,
      max_tokens: 1000,
      temperature: 0.7,
    });

    // Stream the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(new TextEncoder().encode(content));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('AI Coach error:', error);
    return NextResponse.json(
      { error: 'Failed to get coach response' },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function getThisWeekStart(): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);
  return monday.toISOString().split('T')[0];
}

interface TrainingRow {
  session_date: string;
  discipline: string;
  duration_minutes: number;
  intensity: number;
  notes: string | null;
}

function formatTrainingSessions(sessions: TrainingRow[]): string {
  if (sessions.length === 0) return '';

  // Group by discipline
  const byDiscipline: Record<string, { count: number; totalMin: number; avgIntensity: number }> = {};
  sessions.forEach((s) => {
    if (!byDiscipline[s.discipline]) {
      byDiscipline[s.discipline] = { count: 0, totalMin: 0, avgIntensity: 0 };
    }
    byDiscipline[s.discipline].count++;
    byDiscipline[s.discipline].totalMin += s.duration_minutes;
    byDiscipline[s.discipline].avgIntensity += s.intensity;
  });

  const lines: string[] = [];
  lines.push(`${sessions.length} total sessions in last 30 days`);

  for (const [disc, data] of Object.entries(byDiscipline)) {
    const avg = (data.avgIntensity / data.count).toFixed(1);
    lines.push(`- ${disc}: ${data.count} sessions, ${data.totalMin} min total, avg intensity ${avg}/10`);
  }

  // Show last 5 sessions
  lines.push('\nRecent sessions:');
  sessions.slice(0, 5).forEach((s) => {
    lines.push(`- ${s.session_date}: ${s.discipline}, ${s.duration_minutes}min, intensity ${s.intensity}/10`);
  });

  return lines.join('\n');
}

interface SparringRow {
  session_date: string;
  sparring_type: string;
  opponent_skill_level: string;
  total_rounds: number;
  what_went_well: string | null;
  what_to_improve: string | null;
  sparring_rounds: Array<{ ratings: Record<string, number> | null }> | null;
}

function formatSparringSessions(sessions: SparringRow[]): string {
  if (sessions.length === 0) return '';

  const lines: string[] = [];
  lines.push(`${sessions.length} recent sparring sessions`);

  sessions.forEach((s) => {
    let ratingsStr = '';
    if (s.sparring_rounds && s.sparring_rounds.length > 0) {
      // Average across rounds
      const avgRatings: Record<string, number> = {};
      const counts: Record<string, number> = {};
      s.sparring_rounds.forEach((r) => {
        if (r.ratings) {
          for (const [key, val] of Object.entries(r.ratings)) {
            avgRatings[key] = (avgRatings[key] || 0) + val;
            counts[key] = (counts[key] || 0) + 1;
          }
        }
      });
      const parts: string[] = [];
      for (const key of Object.keys(avgRatings)) {
        parts.push(`${key}: ${(avgRatings[key] / counts[key]).toFixed(1)}`);
      }
      if (parts.length > 0) ratingsStr = ` [${parts.join(', ')}]`;
    }

    lines.push(
      `- ${s.session_date}: ${s.sparring_type} vs ${s.opponent_skill_level}, ${s.total_rounds} rounds${ratingsStr}`
    );
    if (s.what_went_well) lines.push(`  Well: ${s.what_went_well}`);
    if (s.what_to_improve) lines.push(`  Improve: ${s.what_to_improve}`);
  });

  return lines.join('\n');
}

interface GoalRow {
  title: string;
  description: string | null;
  category: string;
  target_value: number | null;
  current_value: number | null;
  unit: string | null;
  target_date: string | null;
  status: string;
}

function formatGoals(goals: GoalRow[]): string {
  if (goals.length === 0) return '';

  return goals
    .map((g) => {
      const progress =
        g.target_value && g.current_value
          ? `${Math.round((g.current_value / g.target_value) * 100)}%`
          : 'no measurable progress';
      const deadline = g.target_date || 'no deadline';
      return `- ${g.title} (${g.category}): ${progress} complete, deadline: ${deadline}`;
    })
    .join('\n');
}

interface PRRow {
  exercise_name: string;
  value: number;
  record_type: string;
  achieved_date: string;
}

function formatPRs(prs: PRRow[]): string {
  if (prs.length === 0) return '';

  return prs
    .map(
      (pr) =>
        `- ${pr.exercise_name}: ${Math.round(pr.value)} lbs (${pr.record_type}, ${pr.achieved_date})`
    )
    .join('\n');
}
