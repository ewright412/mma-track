-- ============================================================================
-- Add sparring_type to sessions and JSONB ratings to rounds
-- ============================================================================

-- Add sparring_type to sparring_sessions (defaults to 'mma' for backward compat)
ALTER TABLE public.sparring_sessions
  ADD COLUMN sparring_type TEXT NOT NULL DEFAULT 'mma'
  CHECK (sparring_type IN ('mma', 'striking', 'grappling'));

-- Add JSONB ratings column to sparring_rounds (stores dynamic category ratings)
-- Example: {"striking": 7, "wrestling": 5, "grappling": 6, "defense": 8}
ALTER TABLE public.sparring_rounds
  ADD COLUMN ratings JSONB;

-- Migrate existing data: populate ratings from the old fixed columns
UPDATE public.sparring_rounds
SET ratings = jsonb_build_object(
  'striking', striking_offense,
  'wrestling', takedowns,
  'grappling', ground_game,
  'defense', striking_defense
);

-- Make old fixed columns nullable for new sessions that use ratings JSONB
ALTER TABLE public.sparring_rounds ALTER COLUMN striking_offense DROP NOT NULL;
ALTER TABLE public.sparring_rounds ALTER COLUMN striking_defense DROP NOT NULL;
ALTER TABLE public.sparring_rounds ALTER COLUMN takedowns DROP NOT NULL;
ALTER TABLE public.sparring_rounds ALTER COLUMN ground_game DROP NOT NULL;
