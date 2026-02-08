-- ============================================================================
-- Sparring Sessions Tables
-- ============================================================================

-- Create sparring_sessions table
CREATE TABLE IF NOT EXISTS public.sparring_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    total_rounds INTEGER NOT NULL CHECK (total_rounds > 0 AND total_rounds <= 20),
    opponent_skill_level TEXT NOT NULL CHECK (opponent_skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Professional')),
    notes TEXT,
    what_went_well TEXT,
    what_to_improve TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create sparring_rounds table (per-round self-ratings)
CREATE TABLE IF NOT EXISTS public.sparring_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sparring_sessions(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL CHECK (round_number > 0),
    striking_offense INTEGER NOT NULL CHECK (striking_offense >= 1 AND striking_offense <= 10),
    striking_defense INTEGER NOT NULL CHECK (striking_defense >= 1 AND striking_defense <= 10),
    takedowns INTEGER NOT NULL CHECK (takedowns >= 1 AND takedowns <= 10),
    ground_game INTEGER NOT NULL CHECK (ground_game >= 1 AND ground_game <= 10),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(session_id, round_number)
);

-- Create indexes for performance
CREATE INDEX idx_sparring_sessions_user_date ON public.sparring_sessions(user_id, session_date DESC);
CREATE INDEX idx_sparring_rounds_session ON public.sparring_rounds(session_id, round_number);

-- Enable Row Level Security
ALTER TABLE public.sparring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sparring_rounds ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Row Level Security Policies
-- ============================================================================

-- Sparring Sessions Policies
CREATE POLICY "Users can view their own sparring sessions"
    ON public.sparring_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sparring sessions"
    ON public.sparring_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sparring sessions"
    ON public.sparring_sessions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sparring sessions"
    ON public.sparring_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Sparring Rounds Policies (linked to session ownership)
CREATE POLICY "Users can view rounds from their own sessions"
    ON public.sparring_rounds FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.sparring_sessions
            WHERE sparring_sessions.id = sparring_rounds.session_id
            AND sparring_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert rounds for their own sessions"
    ON public.sparring_rounds FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.sparring_sessions
            WHERE sparring_sessions.id = sparring_rounds.session_id
            AND sparring_sessions.user_id = auth.uid()
        )
    );

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

CREATE POLICY "Users can delete rounds from their own sessions"
    ON public.sparring_rounds FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.sparring_sessions
            WHERE sparring_sessions.id = sparring_rounds.session_id
            AND sparring_sessions.user_id = auth.uid()
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

CREATE TRIGGER update_sparring_sessions_updated_at
    BEFORE UPDATE ON public.sparring_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
