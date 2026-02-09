-- ============================================================================
-- Strength Logs Table
-- ============================================================================

-- Create strength_logs table
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

-- Create indexes for performance
CREATE INDEX idx_strength_logs_user_date ON public.strength_logs(user_id, workout_date DESC);
CREATE INDEX idx_strength_logs_exercise ON public.strength_logs(user_id, exercise_name);
CREATE INDEX idx_strength_logs_muscle_group ON public.strength_logs(user_id, muscle_group);

-- Enable Row Level Security
ALTER TABLE public.strength_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Workout Templates Table
-- ============================================================================

-- Create workout_templates table
CREATE TABLE IF NOT EXISTS public.workout_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    template_name TEXT NOT NULL,
    exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX idx_workout_templates_user ON public.workout_templates(user_id);

-- Enable Row Level Security
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Personal Records Table
-- ============================================================================

-- Create personal_records table
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

-- Create indexes for performance
CREATE INDEX idx_personal_records_user ON public.personal_records(user_id);
CREATE INDEX idx_personal_records_exercise ON public.personal_records(user_id, exercise_name);
CREATE INDEX idx_personal_records_date ON public.personal_records(user_id, achieved_date DESC);

-- Enable Row Level Security
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Row Level Security Policies - strength_logs
-- ============================================================================

CREATE POLICY "Users can view their own strength logs"
    ON public.strength_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own strength logs"
    ON public.strength_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own strength logs"
    ON public.strength_logs FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own strength logs"
    ON public.strength_logs FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- Row Level Security Policies - workout_templates
-- ============================================================================

CREATE POLICY "Users can view their own workout templates"
    ON public.workout_templates FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workout templates"
    ON public.workout_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout templates"
    ON public.workout_templates FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout templates"
    ON public.workout_templates FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- Row Level Security Policies - personal_records
-- ============================================================================

CREATE POLICY "Users can view their own personal records"
    ON public.personal_records FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own personal records"
    ON public.personal_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personal records"
    ON public.personal_records FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personal records"
    ON public.personal_records FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- Trigger for updated_at timestamp
-- ============================================================================

CREATE TRIGGER update_strength_logs_updated_at
    BEFORE UPDATE ON public.strength_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
