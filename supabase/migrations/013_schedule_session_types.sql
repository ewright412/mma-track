-- ============================================================================
-- Extend schedule_entries to support Training, Strength, and Cardio sessions
-- ============================================================================

-- Add session_type column (defaults to 'training' for backward compat)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'schedule_entries'
    AND column_name = 'session_type'
  ) THEN
    ALTER TABLE public.schedule_entries
      ADD COLUMN session_type TEXT NOT NULL DEFAULT 'training'
      CHECK (session_type IN ('training', 'strength', 'cardio'));
  END IF;
END $$;

-- Add cardio_type for cardio entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'schedule_entries'
    AND column_name = 'cardio_type'
  ) THEN
    ALTER TABLE public.schedule_entries
      ADD COLUMN cardio_type TEXT;
  END IF;
END $$;

-- Add muscle_group for strength entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'schedule_entries'
    AND column_name = 'muscle_group'
  ) THEN
    ALTER TABLE public.schedule_entries
      ADD COLUMN muscle_group TEXT
      CHECK (muscle_group IS NULL OR muscle_group IN (
        'upper_body', 'lower_body', 'full_body', 'push', 'pull', 'legs'
      ));
  END IF;
END $$;

-- Make discipline nullable (it's only relevant for training type)
-- discipline is already nullable in the original schema, so no change needed

-- Relax the session_id FK on schedule_adherence to allow linking to
-- strength_logs or cardio_logs (drop the FK constraint, keep the column)
-- The original FK references training_sessions only — we need to allow any UUID.
ALTER TABLE public.schedule_adherence DROP CONSTRAINT IF EXISTS schedule_adherence_session_id_fkey;
