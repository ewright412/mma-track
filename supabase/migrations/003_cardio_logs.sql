-- ============================================================================
-- Cardio Logs Table
-- ============================================================================

-- Create cardio_logs table
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

-- Create indexes for performance
CREATE INDEX idx_cardio_logs_user_date ON public.cardio_logs(user_id, session_date DESC);
CREATE INDEX idx_cardio_logs_type ON public.cardio_logs(user_id, cardio_type);

-- Enable Row Level Security
ALTER TABLE public.cardio_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Row Level Security Policies
-- ============================================================================

CREATE POLICY "Users can view their own cardio logs"
    ON public.cardio_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cardio logs"
    ON public.cardio_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cardio logs"
    ON public.cardio_logs FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cardio logs"
    ON public.cardio_logs FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- Trigger for updated_at timestamp
-- ============================================================================

CREATE TRIGGER update_cardio_logs_updated_at
    BEFORE UPDATE ON public.cardio_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
