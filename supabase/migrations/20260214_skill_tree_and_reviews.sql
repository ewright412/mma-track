-- Skill Tree and Spaced Repetition System
-- Creates hierarchical learning paths with lesson content and SM-2 review scheduling

-- ============================================================================
-- TABLE: skill_tree_nodes
-- ============================================================================
CREATE TABLE IF NOT EXISTS skill_tree_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technique_id UUID REFERENCES techniques(id) ON DELETE CASCADE,
  parent_node_id UUID REFERENCES skill_tree_nodes(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  discipline TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  order_index INTEGER NOT NULL DEFAULT 0,
  xp_reward INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skill_tree_nodes_discipline ON skill_tree_nodes(discipline);
CREATE INDEX IF NOT EXISTS idx_skill_tree_nodes_parent ON skill_tree_nodes(parent_node_id);
CREATE INDEX IF NOT EXISTS idx_skill_tree_nodes_technique ON skill_tree_nodes(technique_id);

-- ============================================================================
-- TABLE: lesson_content
-- ============================================================================
CREATE TABLE IF NOT EXISTS lesson_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id UUID NOT NULL REFERENCES skill_tree_nodes(id) ON DELETE CASCADE,
  lesson_number INTEGER NOT NULL CHECK (lesson_number IN (1, 2, 3)),
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('text', 'video', 'checklist')),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(node_id, lesson_number)
);

CREATE INDEX IF NOT EXISTS idx_lesson_content_node_id ON lesson_content(node_id);

-- ============================================================================
-- TABLE: user_node_progress
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_node_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES skill_tree_nodes(id) ON DELETE CASCADE,
  lessons_completed JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ,
  mastery_level INTEGER NOT NULL DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 5),
  total_reviews INTEGER NOT NULL DEFAULT 0,
  avg_review_score NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, node_id)
);

CREATE INDEX IF NOT EXISTS idx_user_node_progress_user_id ON user_node_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_node_progress_node_id ON user_node_progress(node_id);

-- ============================================================================
-- TABLE: review_queue
-- ============================================================================
CREATE TABLE IF NOT EXISTS review_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  node_id UUID NOT NULL REFERENCES skill_tree_nodes(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  interval_days INTEGER NOT NULL DEFAULT 1,
  ease_factor NUMERIC(3,2) NOT NULL DEFAULT 2.50 CHECK (ease_factor >= 1.30 AND ease_factor <= 5.00),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  last_review_score INTEGER CHECK (last_review_score >= 0 AND last_review_score <= 5),
  next_review_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_review_queue_user_due_status ON review_queue(user_id, due_date, status);
CREATE INDEX IF NOT EXISTS idx_review_queue_node_id ON review_queue(node_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- skill_tree_nodes: Public read
-- (No RLS needed, anyone can see the tree structure)

-- lesson_content: Public read
-- (No RLS needed, lesson content is public educational material)

-- user_node_progress: User-scoped
ALTER TABLE user_node_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own node progress"
  ON user_node_progress FOR ALL
  USING (auth.uid() = user_id);

-- review_queue: User-scoped
ALTER TABLE review_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own review queue"
  ON review_queue FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- SEED DATA: Skill Tree Nodes (30 nodes across 6 disciplines)
-- ============================================================================

-- Get technique IDs for reference
DO $$
DECLARE
  -- Boxing
  jab_id UUID;
  cross_id UUID;
  hook_id UUID;
  jab_cross_id UUID;
  slip_id UUID;

  -- Muay Thai
  teep_id UUID;
  roundhouse_id UUID;
  low_kick_id UUID;
  knee_id UUID;
  clinch_entry_id UUID;

  -- BJJ
  shrimp_id UUID;
  guard_break_id UUID;
  armbar_id UUID;
  triangle_id UUID;
  scissor_id UUID;
  mount_escape_id UUID;

  -- Wrestling
  sprawl_id UUID;
  double_leg_id UUID;
  single_leg_id UUID;
  underhook_id UUID;
  body_lock_id UUID;

  -- Kickboxing
  front_kick_id UUID;
  kb_roundhouse_id UUID;
  calf_kick_id UUID;

  -- MMA
  level_change_id UUID;
  gnp_guard_id UUID;
  wall_walk_id UUID;
  td_defense_id UUID;
  cage_clinch_id UUID;
  dirty_boxing_id UUID;

  -- Node IDs (for parent relationships)
  boxing_node_1 UUID;
  boxing_node_2 UUID;
  mt_node_1 UUID;
  mt_node_2 UUID;
  bjj_node_1 UUID;
  bjj_node_2 UUID;
  bjj_node_3 UUID;
  wrestling_node_1 UUID;
  wrestling_node_2 UUID;
BEGIN
  -- Get technique IDs
  SELECT id INTO jab_id FROM techniques WHERE name = 'Jab' LIMIT 1;
  SELECT id INTO cross_id FROM techniques WHERE name = 'Cross' LIMIT 1;
  SELECT id INTO hook_id FROM techniques WHERE name = 'Hook' LIMIT 1;
  SELECT id INTO jab_cross_id FROM techniques WHERE name = 'Jab-Cross Combo' LIMIT 1;
  SELECT id INTO slip_id FROM techniques WHERE name = 'Slip' LIMIT 1;

  SELECT id INTO teep_id FROM techniques WHERE name = 'Teep (Push Kick)' LIMIT 1;
  SELECT id INTO roundhouse_id FROM techniques WHERE name = 'Roundhouse Kick' LIMIT 1;
  SELECT id INTO low_kick_id FROM techniques WHERE name = 'Low Kick' LIMIT 1;
  SELECT id INTO knee_id FROM techniques WHERE name = 'Knee Strike' LIMIT 1;
  SELECT id INTO clinch_entry_id FROM techniques WHERE name = 'Clinch Entry' LIMIT 1;

  SELECT id INTO shrimp_id FROM techniques WHERE name = 'Hip Escape (Shrimp)' LIMIT 1;
  SELECT id INTO guard_break_id FROM techniques WHERE name = 'Closed Guard Break' LIMIT 1;
  SELECT id INTO armbar_id FROM techniques WHERE name = 'Armbar from Guard' LIMIT 1;
  SELECT id INTO triangle_id FROM techniques WHERE name = 'Triangle Choke' LIMIT 1;
  SELECT id INTO scissor_id FROM techniques WHERE name = 'Scissor Sweep' LIMIT 1;
  SELECT id INTO mount_escape_id FROM techniques WHERE name = 'Mount Escape (Trap and Roll)' LIMIT 1;

  SELECT id INTO sprawl_id FROM techniques WHERE name = 'Sprawl' LIMIT 1;
  SELECT id INTO double_leg_id FROM techniques WHERE name = 'Double Leg Takedown' LIMIT 1;
  SELECT id INTO single_leg_id FROM techniques WHERE name = 'Single Leg Takedown' LIMIT 1;
  SELECT id INTO underhook_id FROM techniques WHERE name = 'Underhook' LIMIT 1;
  SELECT id INTO body_lock_id FROM techniques WHERE name = 'Body Lock Takedown' LIMIT 1;

  SELECT id INTO front_kick_id FROM techniques WHERE name = 'Front Kick' LIMIT 1;
  SELECT id INTO kb_roundhouse_id FROM techniques WHERE name = 'Roundhouse Kick' AND discipline = 'Kickboxing' LIMIT 1;
  IF kb_roundhouse_id IS NULL THEN
    SELECT id INTO kb_roundhouse_id FROM techniques WHERE name = 'Roundhouse Kick' LIMIT 1;
  END IF;
  SELECT id INTO calf_kick_id FROM techniques WHERE name = 'Calf Kick' LIMIT 1;

  SELECT id INTO level_change_id FROM techniques WHERE name = 'Level Change' LIMIT 1;
  SELECT id INTO gnp_guard_id FROM techniques WHERE name = 'Ground and Pound from Guard' LIMIT 1;
  SELECT id INTO wall_walk_id FROM techniques WHERE name = 'Wall Walk (Cage)' LIMIT 1;
  SELECT id INTO td_defense_id FROM techniques WHERE name = 'Takedown Defense (Cage)' LIMIT 1;
  SELECT id INTO cage_clinch_id FROM techniques WHERE name = 'Cage Clinch Control' LIMIT 1;
  SELECT id INTO dirty_boxing_id FROM techniques WHERE name = 'Dirty Boxing' LIMIT 1;

  -- BOXING NODES (5)
  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (jab_id, NULL, 'The Jab', 'Boxing', 'Beginner', 1, 10)
  RETURNING id INTO boxing_node_1;

  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (cross_id, boxing_node_1, 'The Cross', 'Boxing', 'Beginner', 2, 10)
  RETURNING id INTO boxing_node_2;

  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (hook_id, boxing_node_2, 'The Hook', 'Boxing', 'Intermediate', 3, 15);

  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (jab_cross_id, boxing_node_2, 'Jab-Cross Combination', 'Boxing', 'Beginner', 4, 15);

  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (slip_id, boxing_node_1, 'Defensive Slipping', 'Boxing', 'Beginner', 5, 10);

  -- MUAY THAI NODES (5)
  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (teep_id, NULL, 'The Teep', 'Muay Thai', 'Beginner', 1, 10)
  RETURNING id INTO mt_node_1;

  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (roundhouse_id, mt_node_1, 'Roundhouse Kick', 'Muay Thai', 'Beginner', 2, 15)
  RETURNING id INTO mt_node_2;

  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (low_kick_id, mt_node_2, 'Low Kick', 'Muay Thai', 'Beginner', 3, 15);

  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (knee_id, mt_node_1, 'Knee Strike', 'Muay Thai', 'Beginner', 4, 15);

  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (clinch_entry_id, mt_node_1, 'Clinch Entry', 'Muay Thai', 'Intermediate', 5, 20);

  -- BJJ NODES (6)
  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (shrimp_id, NULL, 'Hip Escape Fundamentals', 'Brazilian Jiu-Jitsu', 'Beginner', 1, 10)
  RETURNING id INTO bjj_node_1;

  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (guard_break_id, bjj_node_1, 'Breaking Closed Guard', 'Brazilian Jiu-Jitsu', 'Beginner', 2, 10)
  RETURNING id INTO bjj_node_2;

  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (armbar_id, bjj_node_2, 'Armbar from Guard', 'Brazilian Jiu-Jitsu', 'Beginner', 3, 15)
  RETURNING id INTO bjj_node_3;

  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (triangle_id, bjj_node_3, 'Triangle Choke', 'Brazilian Jiu-Jitsu', 'Intermediate', 4, 20);

  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (scissor_id, bjj_node_2, 'Scissor Sweep', 'Brazilian Jiu-Jitsu', 'Beginner', 5, 15);

  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (mount_escape_id, bjj_node_1, 'Mount Escape', 'Brazilian Jiu-Jitsu', 'Beginner', 6, 15);

  -- WRESTLING NODES (5)
  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (sprawl_id, NULL, 'The Sprawl', 'Wrestling', 'Beginner', 1, 10)
  RETURNING id INTO wrestling_node_1;

  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (double_leg_id, wrestling_node_1, 'Double Leg Takedown', 'Wrestling', 'Beginner', 2, 15)
  RETURNING id INTO wrestling_node_2;

  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (single_leg_id, wrestling_node_2, 'Single Leg Takedown', 'Wrestling', 'Beginner', 3, 15);

  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (underhook_id, wrestling_node_1, 'Underhook Control', 'Wrestling', 'Beginner', 4, 10);

  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (body_lock_id, wrestling_node_2, 'Body Lock Takedown', 'Wrestling', 'Beginner', 5, 15);

  -- KICKBOXING NODES (3)
  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (front_kick_id, NULL, 'Front Kick', 'Kickboxing', 'Beginner', 1, 10);

  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (kb_roundhouse_id, NULL, 'Roundhouse Kick', 'Kickboxing', 'Beginner', 2, 15);

  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (calf_kick_id, NULL, 'Calf Kick', 'Kickboxing', 'Beginner', 3, 15);

  -- MMA NODES (6)
  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (level_change_id, NULL, 'Level Change', 'MMA', 'Beginner', 1, 10);

  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (gnp_guard_id, NULL, 'Ground and Pound (Guard)', 'MMA', 'Intermediate', 2, 20);

  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (wall_walk_id, NULL, 'Wall Walk', 'MMA', 'Intermediate', 3, 15);

  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (td_defense_id, NULL, 'Cage Takedown Defense', 'MMA', 'Intermediate', 4, 20);

  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (cage_clinch_id, NULL, 'Cage Clinch Control', 'MMA', 'Intermediate', 5, 20);

  INSERT INTO skill_tree_nodes (technique_id, parent_node_id, name, discipline, difficulty, order_index, xp_reward)
  VALUES (dirty_boxing_id, NULL, 'Dirty Boxing', 'MMA', 'Intermediate', 6, 20);
END $$;

-- ============================================================================
-- SEED DATA: Lesson Content (3 lessons per node = 90 total)
-- ============================================================================

-- Helper function to create 3 standard lessons for a node
CREATE OR REPLACE FUNCTION create_standard_lessons(
  p_node_id UUID,
  p_technique_name TEXT,
  p_key_points JSONB,
  p_common_mistakes JSONB
) RETURNS void AS $$
BEGIN
  -- Lesson 1: Introduction & Key Points
  INSERT INTO lesson_content (node_id, lesson_number, title, content_type, content)
  VALUES (
    p_node_id,
    1,
    'Introduction & Key Points',
    'text',
    jsonb_build_object(
      'text', 'Welcome to ' || p_technique_name || '! This lesson introduces the fundamental concepts and key execution points.',
      'points', p_key_points
    )
  );

  -- Lesson 2: Common Mistakes
  INSERT INTO lesson_content (node_id, lesson_number, title, content_type, content)
  VALUES (
    p_node_id,
    2,
    'Common Mistakes to Avoid',
    'text',
    jsonb_build_object(
      'text', 'Learn what NOT to do. Avoiding these common mistakes will accelerate your progress.',
      'points', p_common_mistakes
    )
  );

  -- Lesson 3: Practice Drills
  INSERT INTO lesson_content (node_id, lesson_number, title, content_type, content)
  VALUES (
    p_node_id,
    3,
    'Practice Drills & Application',
    'checklist',
    jsonb_build_object(
      'text', 'Complete these drills to master ' || p_technique_name || '. Check off each as you practice.',
      'checklist_items', jsonb_build_array(
        jsonb_build_object('text', 'Shadow practice: 3 sets of 10 reps', 'completed', false),
        jsonb_build_object('text', 'Partner drill: Controlled practice with feedback', 'completed', false),
        jsonb_build_object('text', 'Live application: Use in sparring or rolling', 'completed', false)
      )
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Generate lessons for all nodes using technique data
DO $$
DECLARE
  node_record RECORD;
  tech_record RECORD;
BEGIN
  FOR node_record IN SELECT id, technique_id, name FROM skill_tree_nodes LOOP
    -- Get technique data
    SELECT key_points, common_mistakes INTO tech_record
    FROM techniques
    WHERE id = node_record.technique_id;

    IF tech_record IS NOT NULL THEN
      PERFORM create_standard_lessons(
        node_record.id,
        node_record.name,
        tech_record.key_points,
        tech_record.common_mistakes
      );
    END IF;
  END LOOP;
END $$;

-- Clean up helper function
DROP FUNCTION create_standard_lessons;
