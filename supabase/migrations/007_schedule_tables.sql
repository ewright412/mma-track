-- ============================================================================
-- SCHEDULE TEMPLATES
-- ============================================================================

CREATE TABLE schedule_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE schedule_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own templates"
  ON schedule_templates FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_schedule_templates_active ON schedule_templates(user_id, is_active);

-- ============================================================================
-- SCHEDULE ENTRIES
-- ============================================================================

CREATE TABLE schedule_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES schedule_templates(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  discipline TEXT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  notes TEXT,
  is_rest_day BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time OR is_rest_day)
);

ALTER TABLE schedule_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage entries of their templates"
  ON schedule_entries FOR ALL
  USING (
    template_id IN (
      SELECT id FROM schedule_templates WHERE user_id = auth.uid()
    )
  );

CREATE INDEX idx_schedule_entries_template ON schedule_entries(template_id);
CREATE INDEX idx_schedule_entries_day ON schedule_entries(day_of_week);

-- ============================================================================
-- SCHEDULE ADHERENCE
-- ============================================================================

CREATE TABLE schedule_adherence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  schedule_entry_id UUID NOT NULL REFERENCES schedule_entries(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('completed', 'partial')),
  session_id UUID REFERENCES training_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(schedule_entry_id, date)
);

ALTER TABLE schedule_adherence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own adherence"
  ON schedule_adherence FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_schedule_adherence_date ON schedule_adherence(date);
CREATE INDEX idx_schedule_adherence_user_date ON schedule_adherence(user_id, date);
