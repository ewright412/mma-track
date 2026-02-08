-- ============================================================================
-- Training Sessions Tables
-- ============================================================================

-- Create training_sessions table
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

-- Create session_techniques table (techniques practiced in each session)
CREATE TABLE IF NOT EXISTS public.session_techniques (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.training_sessions(id) ON DELETE CASCADE,
    technique_name TEXT NOT NULL,
    reps INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_training_sessions_user_date ON public.training_sessions(user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_session_techniques_session ON public.session_techniques(session_id);

-- Enable Row Level Security
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_techniques ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Row Level Security Policies
-- ============================================================================

-- Training Sessions Policies
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

-- Session Techniques Policies (linked to session ownership)
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

-- ============================================================================
-- Trigger for updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_training_sessions_updated_at ON public.training_sessions;
CREATE TRIGGER update_training_sessions_updated_at
    BEFORE UPDATE ON public.training_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
