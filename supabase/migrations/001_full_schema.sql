-- ============================================================================
-- COMPLETE DATABASE SCHEMA RESTORATION
-- This migration creates ALL required tables for the MMA Track application
-- Safe to run multiple times due to IF NOT EXISTS clauses
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function for updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Immutable date extraction function (for indexes)
CREATE OR REPLACE FUNCTION immutable_date(ts TIMESTAMPTZ)
RETURNS DATE AS $$
  SELECT ts::DATE;
$$ LANGUAGE SQL IMMUTABLE;

-- ============================================================================
-- TRAINING SESSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    discipline TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 10),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.session_techniques (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.training_sessions(id) ON DELETE CASCADE,
    technique_name TEXT NOT NULL,
    reps INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_sessions_user_date ON public.training_sessions(user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_session_techniques_session ON public.session_techniques(session_id);

ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_techniques ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own training sessions" ON public.training_sessions;
CREATE POLICY "Users can view their own training sessions"
    ON public.training_sessions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own training sessions" ON public.training_sessions;
CREATE POLICY "Users can insert their own training sessions"
    ON public.training_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own training sessions" ON public.training_sessions;
CREATE POLICY "Users can update their own training sessions"
    ON public.training_sessions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own training sessions" ON public.training_sessions;
CREATE POLICY "Users can delete their own training sessions"
    ON public.training_sessions FOR DELETE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view techniques from their own sessions" ON public.session_techniques;
CREATE POLICY "Users can view techniques from their own sessions"
    ON public.session_techniques FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.training_sessions
            WHERE training_sessions.id = session_techniques.session_id
            AND training_sessions.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert techniques for their own sessions" ON public.session_techniques;
CREATE POLICY "Users can insert techniques for their own sessions"
    ON public.session_techniques FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.training_sessions
            WHERE training_sessions.id = session_techniques.session_id
            AND training_sessions.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update techniques from their own sessions" ON public.session_techniques;
CREATE POLICY "Users can update techniques from their own sessions"
    ON public.session_techniques FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.training_sessions
            WHERE training_sessions.id = session_techniques.session_id
            AND training_sessions.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.training_sessions
            WHERE training_sessions.id = session_techniques.session_id
            AND training_sessions.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete techniques from their own sessions" ON public.session_techniques;
CREATE POLICY "Users can delete techniques from their own sessions"
    ON public.session_techniques FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.training_sessions
            WHERE training_sessions.id = session_techniques.session_id
            AND training_sessions.user_id = auth.uid()
        )
    );

DROP TRIGGER IF EXISTS update_training_sessions_updated_at ON public.training_sessions;
CREATE TRIGGER update_training_sessions_updated_at
    BEFORE UPDATE ON public.training_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SPARRING SESSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.sparring_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    total_rounds INTEGER NOT NULL CHECK (total_rounds > 0 AND total_rounds <= 20),
    opponent_skill_level TEXT NOT NULL CHECK (opponent_skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Professional')),
    sparring_type TEXT DEFAULT 'MMA' CHECK (sparring_type IN ('Boxing', 'Kickboxing', 'Muay Thai', 'Wrestling', 'BJJ', 'MMA')),
    notes TEXT,
    what_went_well TEXT,
    what_to_improve TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sparring_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sparring_sessions(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL CHECK (round_number > 0),
    ratings JSONB,
    striking_offense INTEGER CHECK (striking_offense >= 1 AND striking_offense <= 10),
    striking_defense INTEGER CHECK (striking_defense >= 1 AND striking_defense <= 10),
    takedowns INTEGER CHECK (takedowns >= 1 AND takedowns <= 10),
    ground_game INTEGER CHECK (ground_game >= 1 AND ground_game <= 10),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(session_id, round_number)
);

CREATE INDEX IF NOT EXISTS idx_sparring_sessions_user_date ON public.sparring_sessions(user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_sparring_rounds_session ON public.sparring_rounds(session_id, round_number);

ALTER TABLE public.sparring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sparring_rounds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own sparring sessions" ON public.sparring_sessions;
CREATE POLICY "Users can view their own sparring sessions"
    ON public.sparring_sessions FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own sparring sessions" ON public.sparring_sessions;
CREATE POLICY "Users can insert their own sparring sessions"
    ON public.sparring_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own sparring sessions" ON public.sparring_sessions;
CREATE POLICY "Users can update their own sparring sessions"
    ON public.sparring_sessions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own sparring sessions" ON public.sparring_sessions;
CREATE POLICY "Users can delete their own sparring sessions"
    ON public.sparring_sessions FOR DELETE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view rounds from their own sessions" ON public.sparring_rounds;
CREATE POLICY "Users can view rounds from their own sessions"
    ON public.sparring_rounds FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.sparring_sessions
            WHERE sparring_sessions.id = sparring_rounds.session_id
            AND sparring_sessions.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can insert rounds for their own sessions" ON public.sparring_rounds;
CREATE POLICY "Users can insert rounds for their own sessions"
    ON public.sparring_rounds FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sparring_sessions
            WHERE sparring_sessions.id = sparring_rounds.session_id
            AND sparring_sessions.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update rounds from their own sessions" ON public.sparring_rounds;
CREATE POLICY "Users can update rounds from their own sessions"
    ON public.sparring_rounds FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.sparring_sessions
            WHERE sparring_sessions.id = sparring_rounds.session_id
            AND sparring_sessions.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sparring_sessions
            WHERE sparring_sessions.id = sparring_rounds.session_id
            AND sparring_sessions.user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can delete rounds from their own sessions" ON public.sparring_rounds;
CREATE POLICY "Users can delete rounds from their own sessions"
    ON public.sparring_rounds FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.sparring_sessions
            WHERE sparring_sessions.id = sparring_rounds.session_id
            AND sparring_sessions.user_id = auth.uid()
        )
    );

DROP TRIGGER IF EXISTS update_sparring_sessions_updated_at ON public.sparring_sessions;
CREATE TRIGGER update_sparring_sessions_updated_at
    BEFORE UPDATE ON public.sparring_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- CARDIO LOGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.cardio_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    cardio_type TEXT NOT NULL CHECK (cardio_type IN (
        'Running',
        'Cycling',
        'Swimming',
        'Jump Rope',
        'Heavy Bag Rounds',
        'Rowing',
        'Circuit Training',
        'HIIT',
        'Other'
    )),
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0 AND duration_minutes <= 600),
    distance_km NUMERIC(10, 2) CHECK (distance_km IS NULL OR distance_km >= 0),
    average_heart_rate INTEGER CHECK (average_heart_rate IS NULL OR (average_heart_rate >= 40 AND average_heart_rate <= 220)),
    max_heart_rate INTEGER CHECK (max_heart_rate IS NULL OR (max_heart_rate >= 40 AND max_heart_rate <= 220)),
    intervals BOOLEAN NOT NULL DEFAULT false,
    interval_description TEXT,
    calories_estimate INTEGER CHECK (calories_estimate IS NULL OR calories_estimate >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cardio_logs_user_date ON public.cardio_logs(user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_cardio_logs_type ON public.cardio_logs(user_id, cardio_type);

ALTER TABLE public.cardio_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own cardio logs" ON public.cardio_logs;
CREATE POLICY "Users can view their own cardio logs"
    ON public.cardio_logs FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own cardio logs" ON public.cardio_logs;
CREATE POLICY "Users can insert their own cardio logs"
    ON public.cardio_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own cardio logs" ON public.cardio_logs;
CREATE POLICY "Users can update their own cardio logs"
    ON public.cardio_logs FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own cardio logs" ON public.cardio_logs;
CREATE POLICY "Users can delete their own cardio logs"
    ON public.cardio_logs FOR DELETE
    USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_cardio_logs_updated_at ON public.cardio_logs;
CREATE TRIGGER update_cardio_logs_updated_at
    BEFORE UPDATE ON public.cardio_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STRENGTH TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.strength_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    exercise_category TEXT CHECK (exercise_category IN ('compound', 'mma_specific', 'accessory')),
    muscle_group TEXT CHECK (muscle_group IN ('chest', 'back', 'shoulders', 'legs', 'arms', 'core', 'full_body')),
    sets JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_volume NUMERIC(10, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    workout_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.workout_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_name TEXT NOT NULL,
    exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.personal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    record_type TEXT NOT NULL CHECK (record_type IN ('1rm', 'max_reps', 'max_volume')),
    value NUMERIC(10, 2) NOT NULL,
    achieved_date DATE NOT NULL,
    previous_value NUMERIC(10, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, exercise_name, record_type)
);

CREATE INDEX IF NOT EXISTS idx_strength_logs_user_date ON public.strength_logs(user_id, workout_date DESC);
CREATE INDEX IF NOT EXISTS idx_strength_logs_exercise ON public.strength_logs(user_id, exercise_name);
CREATE INDEX IF NOT EXISTS idx_strength_logs_muscle_group ON public.strength_logs(user_id, muscle_group);
CREATE INDEX IF NOT EXISTS idx_workout_templates_user ON public.workout_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_user ON public.personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_exercise ON public.personal_records(user_id, exercise_name);
CREATE INDEX IF NOT EXISTS idx_personal_records_date ON public.personal_records(user_id, achieved_date DESC);

ALTER TABLE public.strength_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own strength logs" ON public.strength_logs;
CREATE POLICY "Users can view their own strength logs"
    ON public.strength_logs FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own strength logs" ON public.strength_logs;
CREATE POLICY "Users can insert their own strength logs"
    ON public.strength_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own strength logs" ON public.strength_logs;
CREATE POLICY "Users can update their own strength logs"
    ON public.strength_logs FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own strength logs" ON public.strength_logs;
CREATE POLICY "Users can delete their own strength logs"
    ON public.strength_logs FOR DELETE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own workout templates" ON public.workout_templates;
CREATE POLICY "Users can view their own workout templates"
    ON public.workout_templates FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own workout templates" ON public.workout_templates;
CREATE POLICY "Users can insert their own workout templates"
    ON public.workout_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own workout templates" ON public.workout_templates;
CREATE POLICY "Users can update their own workout templates"
    ON public.workout_templates FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own workout templates" ON public.workout_templates;
CREATE POLICY "Users can delete their own workout templates"
    ON public.workout_templates FOR DELETE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own personal records" ON public.personal_records;
CREATE POLICY "Users can view their own personal records"
    ON public.personal_records FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own personal records" ON public.personal_records;
CREATE POLICY "Users can insert their own personal records"
    ON public.personal_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own personal records" ON public.personal_records;
CREATE POLICY "Users can update their own personal records"
    ON public.personal_records FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own personal records" ON public.personal_records;
CREATE POLICY "Users can delete their own personal records"
    ON public.personal_records FOR DELETE
    USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_strength_logs_updated_at ON public.strength_logs;
CREATE TRIGGER update_strength_logs_updated_at
    BEFORE UPDATE ON public.strength_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- BODY METRICS AND GOALS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.body_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
    weight NUMERIC(6, 2) NOT NULL,
    body_fat_percentage NUMERIC(4, 2),
    photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('weight', 'cardio', 'strength', 'skill', 'other')),
    target_value NUMERIC(10, 2),
    current_value NUMERIC(10, 2),
    unit TEXT,
    target_date DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_body_metrics_user_date ON public.body_metrics(user_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON public.goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_goals_user_date ON public.goals(user_id, target_date);
CREATE INDEX IF NOT EXISTS idx_goals_category ON public.goals(user_id, category);

ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own body metrics" ON public.body_metrics;
CREATE POLICY "Users can view their own body metrics"
    ON public.body_metrics FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own body metrics" ON public.body_metrics;
CREATE POLICY "Users can insert their own body metrics"
    ON public.body_metrics FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own body metrics" ON public.body_metrics;
CREATE POLICY "Users can update their own body metrics"
    ON public.body_metrics FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own body metrics" ON public.body_metrics;
CREATE POLICY "Users can delete their own body metrics"
    ON public.body_metrics FOR DELETE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own goals" ON public.goals;
CREATE POLICY "Users can view their own goals"
    ON public.goals FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own goals" ON public.goals;
CREATE POLICY "Users can insert their own goals"
    ON public.goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own goals" ON public.goals;
CREATE POLICY "Users can update their own goals"
    ON public.goals FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own goals" ON public.goals;
CREATE POLICY "Users can delete their own goals"
    ON public.goals FOR DELETE
    USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_body_metrics_updated_at ON public.body_metrics;
CREATE TRIGGER update_body_metrics_updated_at
    BEFORE UPDATE ON public.body_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_goals_updated_at ON public.goals;
CREATE TRIGGER update_goals_updated_at
    BEFORE UPDATE ON public.goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMPETITIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.competitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  competition_date DATE NOT NULL,
  weight_class TEXT NOT NULL DEFAULT '',
  target_weight DECIMAL(5,1),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_competitions_user_date ON public.competitions(user_id, competition_date);

ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own competitions" ON public.competitions;
CREATE POLICY "Users can view own competitions" ON public.competitions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own competitions" ON public.competitions;
CREATE POLICY "Users can insert own competitions" ON public.competitions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own competitions" ON public.competitions;
CREATE POLICY "Users can update own competitions" ON public.competitions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own competitions" ON public.competitions;
CREATE POLICY "Users can delete own competitions" ON public.competitions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- AI COACH
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.ai_coach_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  message_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_ai_coach_conversations_user_id ON public.ai_coach_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_tracking_user_date ON public.ai_usage_tracking(user_id, date);

ALTER TABLE public.ai_coach_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_tracking ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own conversations" ON public.ai_coach_conversations;
CREATE POLICY "Users can manage their own conversations"
  ON public.ai_coach_conversations FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own usage tracking" ON public.ai_usage_tracking;
CREATE POLICY "Users can manage their own usage tracking"
  ON public.ai_usage_tracking FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- TECHNIQUE LIBRARY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.techniques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  discipline TEXT NOT NULL,
  category TEXT NOT NULL,
  position TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  description TEXT NOT NULL,
  key_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  common_mistakes JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_techniques JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.technique_practice_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  technique_id UUID NOT NULL REFERENCES public.techniques(id) ON DELETE CASCADE,
  practiced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_techniques_discipline ON public.techniques(discipline);
CREATE INDEX IF NOT EXISTS idx_techniques_category ON public.techniques(category);
CREATE INDEX IF NOT EXISTS idx_techniques_difficulty ON public.techniques(difficulty);
CREATE INDEX IF NOT EXISTS idx_technique_practice_logs_user_id ON public.technique_practice_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_technique_practice_logs_technique_id ON public.technique_practice_logs(technique_id);

ALTER TABLE public.technique_practice_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own practice logs" ON public.technique_practice_logs;
CREATE POLICY "Users can manage their own practice logs"
  ON public.technique_practice_logs FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- SCHEDULE SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.schedule_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.schedule_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES public.schedule_templates(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  discipline TEXT,
  session_type TEXT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  notes TEXT,
  is_rest_day BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time OR is_rest_day)
);

CREATE TABLE IF NOT EXISTS public.schedule_adherence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  schedule_entry_id UUID NOT NULL REFERENCES public.schedule_entries(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'partial')),
  session_id UUID REFERENCES public.training_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(schedule_entry_id, date)
);

CREATE INDEX IF NOT EXISTS idx_schedule_templates_active ON public.schedule_templates(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_schedule_entries_template ON public.schedule_entries(template_id);
CREATE INDEX IF NOT EXISTS idx_schedule_entries_day ON public.schedule_entries(day_of_week);
CREATE INDEX IF NOT EXISTS idx_schedule_adherence_date ON public.schedule_adherence(date);
CREATE INDEX IF NOT EXISTS idx_schedule_adherence_user_date ON public.schedule_adherence(user_id, date);

ALTER TABLE public.schedule_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_adherence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own templates" ON public.schedule_templates;
CREATE POLICY "Users can manage their own templates"
  ON public.schedule_templates FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage entries of their templates" ON public.schedule_entries;
CREATE POLICY "Users can manage entries of their templates"
  ON public.schedule_entries FOR ALL
  USING (
    template_id IN (
      SELECT id FROM public.schedule_templates WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage their own adherence" ON public.schedule_adherence;
CREATE POLICY "Users can manage their own adherence"
  ON public.schedule_adherence FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- NOTEBOOK
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  discipline TEXT,
  session_id UUID REFERENCES public.training_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.note_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE NOT NULL,
  tag_name TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notes_user ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_discipline ON public.notes(discipline);
CREATE INDEX IF NOT EXISTS idx_notes_session ON public.notes(session_id);
CREATE INDEX IF NOT EXISTS idx_note_tags_note ON public.note_tags(note_id);
CREATE INDEX IF NOT EXISTS idx_note_tags_name ON public.note_tags(tag_name);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own notes" ON public.notes;
CREATE POLICY "Users can CRUD own notes" ON public.notes FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can CRUD own note tags" ON public.note_tags;
CREATE POLICY "Users can CRUD own note tags" ON public.note_tags FOR ALL USING (
  EXISTS (SELECT 1 FROM public.notes WHERE notes.id = note_tags.note_id AND notes.user_id = auth.uid())
);

-- ============================================================================
-- BADGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_key TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, badge_key)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own badges" ON public.user_badges;
CREATE POLICY "Users can read own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own badges" ON public.user_badges;
CREATE POLICY "Users can insert own badges" ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- SUBSCRIPTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sub_user ON public.subscriptions(user_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own sub" ON public.subscriptions;
CREATE POLICY "Users read own sub" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- DAILY CHALLENGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discipline TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Striking', 'Grappling', 'Conditioning', 'Technique', 'Mental')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Impossible')),
  duration_minutes INTEGER NOT NULL,
  instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
  points INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.challenge_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_daily_challenges_category ON public.daily_challenges(category);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_difficulty ON public.daily_challenges(difficulty);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_discipline ON public.daily_challenges(discipline);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_user_id ON public.challenge_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_challenge_id ON public.challenge_completions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_completions_completed_at ON public.challenge_completions(completed_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_challenge_completions_user_challenge_date
  ON public.challenge_completions(user_id, challenge_id, immutable_date(completed_at));

ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own challenge completions" ON public.challenge_completions;
CREATE POLICY "Users can manage their own challenge completions"
  ON public.challenge_completions FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- SKILL TREE AND SPACED REPETITION
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.skill_tree_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technique_id UUID REFERENCES public.techniques(id) ON DELETE CASCADE,
  parent_node_id UUID REFERENCES public.skill_tree_nodes(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  discipline TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  order_index INTEGER NOT NULL DEFAULT 0,
  xp_reward INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lesson_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID NOT NULL REFERENCES public.skill_tree_nodes(id) ON DELETE CASCADE,
  lesson_number INTEGER NOT NULL CHECK (lesson_number IN (1, 2, 3)),
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'video', 'checklist')),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(node_id, lesson_number)
);

CREATE TABLE IF NOT EXISTS public.user_node_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES public.skill_tree_nodes(id) ON DELETE CASCADE,
  lessons_completed JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ,
  mastery_level INTEGER NOT NULL DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 5),
  total_reviews INTEGER NOT NULL DEFAULT 0,
  avg_review_score NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, node_id)
);

CREATE TABLE IF NOT EXISTS public.review_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES public.skill_tree_nodes(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  interval_days INTEGER NOT NULL DEFAULT 1,
  ease_factor NUMERIC(3,2) NOT NULL DEFAULT 2.50 CHECK (ease_factor >= 1.30 AND ease_factor <= 5.00),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  last_review_score INTEGER CHECK (last_review_score >= 0 AND last_review_score <= 5),
  next_review_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skill_tree_nodes_discipline ON public.skill_tree_nodes(discipline);
CREATE INDEX IF NOT EXISTS idx_skill_tree_nodes_parent ON public.skill_tree_nodes(parent_node_id);
CREATE INDEX IF NOT EXISTS idx_skill_tree_nodes_technique ON public.skill_tree_nodes(technique_id);
CREATE INDEX IF NOT EXISTS idx_lesson_content_node_id ON public.lesson_content(node_id);
CREATE INDEX IF NOT EXISTS idx_user_node_progress_user_id ON public.user_node_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_node_progress_node_id ON public.user_node_progress(node_id);
CREATE INDEX IF NOT EXISTS idx_review_queue_user_due_status ON public.review_queue(user_id, due_date, status);
CREATE INDEX IF NOT EXISTS idx_review_queue_node_id ON public.review_queue(node_id);

ALTER TABLE public.user_node_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own node progress" ON public.user_node_progress;
CREATE POLICY "Users can manage their own node progress"
  ON public.user_node_progress FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own review queue" ON public.review_queue;
CREATE POLICY "Users can manage their own review queue"
  ON public.review_queue FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'Schema restoration complete! All tables created with RLS policies.';
END $$;
