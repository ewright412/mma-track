-- Create competitions table
CREATE TABLE IF NOT EXISTS competitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  competition_date DATE NOT NULL,
  weight_class TEXT NOT NULL DEFAULT '',
  target_weight DECIMAL(5,1),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own competitions" ON competitions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own competitions" ON competitions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own competitions" ON competitions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own competitions" ON competitions
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_competitions_user_date ON competitions(user_id, competition_date);
