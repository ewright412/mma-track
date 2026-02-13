-- ============================================================================
-- Body Metrics Table
-- ============================================================================

-- Create body_metrics table
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_body_metrics_user_date ON public.body_metrics(user_id, metric_date DESC);

-- Enable Row Level Security
ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Goals Table
-- ============================================================================

-- Create goals table
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_goals_user_status ON public.goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_goals_user_date ON public.goals(user_id, target_date);
CREATE INDEX IF NOT EXISTS idx_goals_category ON public.goals(user_id, category);

-- Enable Row Level Security
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Row Level Security Policies - body_metrics
-- ============================================================================

CREATE POLICY "Users can view their own body metrics"
    ON public.body_metrics FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own body metrics"
    ON public.body_metrics FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own body metrics"
    ON public.body_metrics FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own body metrics"
    ON public.body_metrics FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- Row Level Security Policies - goals
-- ============================================================================

CREATE POLICY "Users can view their own goals"
    ON public.goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals"
    ON public.goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
    ON public.goals FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
    ON public.goals FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- Triggers for updated_at timestamp
-- ============================================================================

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
