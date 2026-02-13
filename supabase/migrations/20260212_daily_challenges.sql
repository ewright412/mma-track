-- Daily Challenges System
-- Gamification feature to drive daily engagement

-- Daily Challenges Table (60 challenges seeded)
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  discipline TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Striking', 'Grappling', 'Conditioning', 'Technique', 'Mental')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard', 'Impossible')),
  duration_minutes INTEGER NOT NULL,
  instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
  points INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_daily_challenges_category ON daily_challenges(category);
CREATE INDEX idx_daily_challenges_difficulty ON daily_challenges(difficulty);
CREATE INDEX idx_daily_challenges_discipline ON daily_challenges(discipline);

-- Challenge Completions Table
CREATE TABLE IF NOT EXISTS challenge_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES daily_challenges(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

CREATE INDEX idx_challenge_completions_user_id ON challenge_completions(user_id);
CREATE INDEX idx_challenge_completions_challenge_id ON challenge_completions(challenge_id);
CREATE INDEX idx_challenge_completions_completed_at ON challenge_completions(completed_at);

-- Unique constraint: one completion per user per challenge per day
-- Using date() function which is IMMUTABLE (required for index expressions)
CREATE UNIQUE INDEX idx_challenge_completions_user_challenge_date
  ON challenge_completions(user_id, challenge_id, date(completed_at));

-- RLS Policies
ALTER TABLE challenge_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own challenge completions"
  ON challenge_completions FOR ALL
  USING (auth.uid() = user_id);

-- Daily challenges are public read (no RLS needed for read-only data)

-- ============================================================================
-- SEED DATA: 60 CHALLENGES
-- ============================================================================

-- STRIKING (15 challenges)
INSERT INTO daily_challenges (title, description, discipline, category, difficulty, duration_minutes, instructions, points) VALUES
('Shadow Boxing Blitz', '5 rounds of high-intensity shadow boxing focused on crisp combinations and defensive movement.', 'Boxing', 'Striking', 'Medium', 12, '["Set timer for 5x2-minute rounds with 30s rest", "Round 1: Focus on jab variations and footwork", "Round 2: Add crosses and hooks to combinations", "Round 3: Mix in uppercuts and body shots", "Round 4: Practice defensive slips and rolls between combos", "Round 5: Full intensity - combine everything"]'::jsonb, 25),

('100 Kicks Challenge', '100 total roundhouse kicks (50 left, 50 right) as fast as possible with good form.', 'Muay Thai', 'Striking', 'Hard', 10, '["Warm up legs thoroughly before starting", "Set timer and begin", "50 left leg roundhouse kicks - focus on hip rotation and shin contact", "50 right leg roundhouse kicks - maintain proper form", "Track your completion time and try to beat it next time", "Cool down with light stretching"]'::jsonb, 50),

('Jab Only Rounds', '3 rounds of 3 minutes using nothing but jab variations to develop your most important punch.', 'Boxing', 'Striking', 'Easy', 12, '["Set timer for 3x3-minute rounds with 1min rest", "Round 1: Standard jabs, focus on snap and retraction", "Round 2: Double and triple jabs, mixing speeds", "Round 3: Jabs to head and body, working angles", "Keep your rear hand protecting your chin at all times", "Focus on returning to guard position quickly"]'::jsonb, 10),

('Combo Builder', 'Create 5 unique 4-punch combinations and drill each one 20 times for muscle memory.', 'Boxing', 'Striking', 'Medium', 15, '["Create your 5 combinations (example: jab-cross-hook-cross)", "Write them down so you remember", "Drill combo 1: 20 reps with focus on form", "Drill combo 2: 20 reps", "Drill combo 3: 20 reps", "Drill combo 4: 20 reps", "Drill combo 5: 20 reps", "Finish with all 5 combos in sequence 5 times"]'::jsonb, 25),

('Footwork Focus', '10 minutes of pure movement drills - in/out, lateral, pivots, and angle changes. No punches.', 'Boxing', 'Striking', 'Easy', 10, '["Set timer for 10 minutes", "2 min: In and out movement (step forward/back)", "2 min: Lateral movement (side to side)", "2 min: Pivot drills (pivot on lead and rear foot)", "2 min: Angle changes (45-degree steps)", "2 min: Combine all movements fluidly", "Stay light on your feet, maintain stance"]'::jsonb, 10),

('Power Shots', '50 rear crosses and 50 hooks thrown at maximum power on the heavy bag.', 'Boxing', 'Striking', 'Hard', 10, '["Wrap hands and warm up properly", "50 rear crosses - full hip rotation, drive off back foot", "Rest 2 minutes", "50 hooks (25 per side) - rotate from core, 90-degree elbow", "Focus on generating power from your legs and hips", "Cool down with light bag work"]'::jsonb, 50),

('Counter Striking Drill', 'Visualize opponent attacks and practice 5 counter techniques, 20 reps each.', 'Boxing', 'Striking', 'Medium', 15, '["Pick 5 counter techniques (e.g., slip-cross, parry-hook, etc.)", "Visualize opponent throwing a jab", "Counter 1: 20 reps", "Counter 2: 20 reps", "Counter 3: 20 reps", "Counter 4: 20 reps", "Counter 5: 20 reps", "Finish with random counter practice"]'::jsonb, 25),

('Switch Stance', '3 rounds of shadow boxing entirely in your opposite stance to develop versatility.', 'MMA', 'Striking', 'Hard', 10, '["If you''re orthodox, fight southpaw (and vice versa)", "Round 1 (3min): Get comfortable in the new stance", "Round 2 (3min): Practice basic combinations", "Round 3 (3min): Full intensity shadow boxing", "This will feel awkward - that''s the point", "Notice which techniques are harder in opposite stance"]'::jsonb, 50),

('Elbow Assault', '5 minutes of continuous elbow combinations on the heavy bag.', 'Muay Thai', 'Striking', 'Medium', 8, '["Wrap hands to protect knuckles", "Warm up with light punches", "Set timer for 5 minutes", "Throw horizontal elbows (both sides)", "Throw uppercut elbows", "Throw downward elbows", "Practice spinning elbows", "Keep combinations flowing for full 5 minutes"]'::jsonb, 25),

('Head Movement', '3 minutes of pure defensive slipping and rolling practice.', 'Boxing', 'Striking', 'Easy', 5, '["Stand in front of mirror if possible", "Visualize punches coming at you", "Practice slip left and slip right", "Practice roll under hooks", "Bob and weave continuously", "Keep hands up in guard position", "Small, efficient movements - don''t overcommit"]'::jsonb, 10),

('Clinch Knees', '50 knees from clinch position each side on bag or partner.', 'Muay Thai', 'Striking', 'Medium', 8, '["Get in clinch position on heavy bag", "50 right knees - drive hips forward, pull bag into knee", "Rest 1 minute", "50 left knees - maintain control of bag", "Focus on hip drive, not just lifting knee", "Keep your balance throughout"]'::jsonb, 25),

('Teep Machine', '100 teeps alternating legs with focus on push and retraction speed.', 'Muay Thai', 'Striking', 'Hard', 10, '["Warm up ankles and hips", "50 right leg teeps - full hip extension", "50 left leg teeps - quick chamber and return", "Focus on balance and control", "Can target body or head height", "Track your time to complete 100"]'::jsonb, 50),

('Body Shot Artist', '5 rounds focusing exclusively on body shots to develop this underutilized weapon.', 'Boxing', 'Striking', 'Medium', 15, '["Set timer for 5x2min rounds, 30s rest", "Target liver (right side), solar plexus, ribs", "Round 1: Jabs to the body", "Round 2: Crosses and hooks to body", "Round 3: Uppercuts to body", "Round 4: Full combinations to body", "Round 5: Mix head and body shots", "Remember to bend knees, not waist"]'::jsonb, 25),

('Speed Round', '1 round (3 minutes) throwing as many clean combinations as possible. Count them.', 'Boxing', 'Striking', 'Easy', 5, '["Set timer for 3 minutes", "Throw only combinations (2+ punches)", "Count each combination", "Maintain good form - speed with technique", "Track your number and try to beat it next time", "Rest when needed but minimize breaks"]'::jsonb, 10),

('Dirty Boxing', '5 minutes of clinch work: short hooks, uppercuts, frame and strike.', 'MMA', 'Striking', 'Medium', 8, '["Get in close range on heavy bag", "Control the bag with one hand (clinch)", "Throw short hooks with free hand", "Throw short uppercuts", "Practice framing and creating space", "Switch hands controlling the bag", "Keep pressure constant for 5 minutes"]'::jsonb, 25),

-- GRAPPLING (15 challenges)
('Solo Drill Flow', '10 minutes of fundamental solo drills: shrimps, bridges, technical standups, sprawls.', 'Brazilian Jiu-Jitsu', 'Grappling', 'Easy', 10, '["2 min: Hip escapes (shrimps) each direction", "2 min: Bridge and hip escape combinations", "2 min: Technical standups (both sides)", "2 min: Sprawls", "2 min: Flow through all movements", "Focus on smooth, efficient technique"]'::jsonb, 10),

('Submission Chain', 'Practice a 3-submission chain from guard 20 times each side.', 'Brazilian Jiu-Jitsu', 'Grappling', 'Medium', 15, '["Choose 3 connected submissions (e.g., armbar → triangle → omoplata)", "Practice the chain from closed guard", "20 reps on right side - flow between all 3 submissions", "20 reps on left side", "Focus on smooth transitions, not speed", "Visualize a resisting opponent"]'::jsonb, 25),

('Guard Retention', '5 minutes of constant hip movement and guard recovery drills.', 'Brazilian Jiu-Jitsu', 'Grappling', 'Medium', 8, '["Start on your back in guard position", "Constant hip movement for 5 minutes", "Practice recovering guard when it''s almost passed", "Keep your frames active", "Work on getting knees and feet back in position", "Stay off your back, stay on your side"]'::jsonb, 25),

('Takedown Entries', '50 shot entries (level change → penetration step) no partner needed.', 'Wrestling', 'Grappling', 'Easy', 10, '["Set up in fighting stance", "Practice explosive level change", "Penetration step (lead foot forward)", "Return to stance", "Repeat 50 times", "Focus on speed and explosiveness", "Keep head up, good posture throughout"]'::jsonb, 10),

('Sprawl Drill', '50 sprawls for time with full hip extension. As fast as possible.', 'Wrestling', 'Grappling', 'Hard', 8, '["Start in fighting stance", "Set timer", "Sprawl 1: Hips down and back explosively", "Return to stance", "Repeat for 50 total sprawls", "Maintain good form - hips low, legs spread", "Track your time and try to beat it"]'::jsonb, 50),

('Bridge Escape Marathon', '50 trap-and-roll bridge escapes each side.', 'Brazilian Jiu-Jitsu', 'Grappling', 'Hard', 15, '["Lay on back, visualize opponent in mount", "Right side: Trap right arm and leg, bridge 50 times", "Rest 2 minutes", "Left side: Trap left arm and leg, bridge 50 times", "Focus on explosive bridge, not gradual", "Full hip extension at top of bridge"]'::jsonb, 50),

('Hip Escape Ladder', 'Descending ladder of hip escapes: 10, rest 10s, 9, rest, 8... down to 1.', 'Brazilian Jiu-Jitsu', 'Grappling', 'Medium', 12, '["10 hip escapes (shrimps), rest 10 seconds", "9 hip escapes, rest 10 seconds", "8 hip escapes, rest 10 seconds", "Continue down to 1", "Total of 55 hip escapes", "Focus on creating maximum distance each shrimp"]'::jsonb, 25),

('Turtle Escapes', 'Practice 3 different turtle escape techniques, 15 reps each.', 'Brazilian Jiu-Jitsu', 'Grappling', 'Medium', 12, '["Start in turtle position", "Escape 1: Rolling to guard (15 reps)", "Escape 2: Coming up to single leg (15 reps)", "Escape 3: Sitout to face opponent (15 reps)", "Focus on protecting your neck throughout", "Visualize opponent trying to take your back"]'::jsonb, 25),

('Guard Pass Circuit', 'Knee cut, torreando, over-under: 10 reps of each, 3 rounds.', 'Brazilian Jiu-Jitsu', 'Grappling', 'Hard', 20, '["Round 1: 10 knee cut passes (5 each side)", "10 torreando passes (5 each side)", "10 over-under passes (5 each side)", "Rest 1 minute", "Round 2: Same sequence", "Rest 1 minute", "Round 3: Same sequence", "Focus on technique, not speed"]'::jsonb, 50),

('Pulling Guard', '20 guard pull entries to closed guard, butterfly, and DLR.', 'Brazilian Jiu-Jitsu', 'Grappling', 'Easy', 10, '["From standing position", "Pull to closed guard: 7 reps", "Pull to butterfly guard: 7 reps", "Pull to De La Riva guard: 6 reps", "Focus on controlling grips first", "Land in strong guard position", "Protect your back when pulling"]'::jsonb, 10),

('Back Attack Flow', 'Seatbelt → hooks → RNC attempt → if defended → armbar. 15 reps each side.', 'Brazilian Jiu-Jitsu', 'Grappling', 'Medium', 15, '["Visualize taking opponent''s back", "Establish seatbelt grip (15 times)", "Insert hooks", "Attempt rear naked choke", "If defended, transition to armbar", "Right side: 15 complete sequences", "Left side: 15 complete sequences", "Flow smoothly between positions"]'::jsonb, 25),

('Leg Lock Entries', 'SLX entry → heel hook position, 15 reps each side.', 'Brazilian Jiu-Jitsu', 'Grappling', 'Hard', 12, '["WARNING: Advanced technique, no pressure on heel", "Single leg X entry (right side): 15 reps", "Move to heel hook position (no torque)", "Single leg X entry (left side): 15 reps", "Focus on control and position, not submission", "Only for those familiar with leg locks"]'::jsonb, 50),

('Wrestling Up', 'From seated guard, technical standup and wrestling up drill, 20 reps.', 'Brazilian Jiu-Jitsu', 'Grappling', 'Medium', 10, '["Start seated on ground", "Post hand behind you", "Get feet under your hips", "Explosively stand up", "Return to seated position", "Repeat 20 times", "Maintain guard awareness throughout", "Protect your back as you stand"]'::jsonb, 25),

('Sweep to Pass', 'Complete a sweep then immediately pass guard, 10 full sequences each side.', 'Brazilian Jiu-Jitsu', 'Grappling', 'Hard', 15, '["Start in closed guard (bottom)", "Execute sweep to top position", "Immediately pass guard to side control", "Right side: 10 complete sweep-to-pass sequences", "Left side: 10 complete sweep-to-pass sequences", "Focus on maintaining pressure throughout", "Don''t pause between sweep and pass"]'::jsonb, 50),

('Flow Roll Visualization', '10 minutes of eyes-closed visualization of a perfect training roll.', 'Brazilian Jiu-Jitsu', 'Grappling', 'Easy', 10, '["Find quiet space, lie down or sit comfortably", "Close your eyes", "Visualize starting a roll from knees", "See yourself flowing through positions", "Feel the grips, the pressure, the transitions", "Execute techniques smoothly in your mind", "Visualize both offense and defense", "See the entire 10-minute roll in detail"]'::jsonb, 10),

-- CONDITIONING (15 challenges)
('Fighter Burpees', '50 sprawl-to-burpees for time. Track your completion time.', 'MMA', 'Conditioning', 'Hard', 10, '["Start in fighting stance", "Sprawl (hips down and back)", "Bring feet to hands (burpee)", "Jump up explosively", "Return to fighting stance", "Repeat for 50 total reps", "Track your time - try to beat it next time"]'::jsonb, 50),

('Wall Sit War', '5 minutes total wall sit time, break it up however you want.', 'MMA', 'Conditioning', 'Medium', 8, '["Find a wall", "Sit with back against wall, knees at 90 degrees", "Hold as long as possible", "Track each hold duration", "Rest between sets", "Total of 5 minutes accumulated", "Thighs should be parallel to ground"]'::jsonb, 25),

('Jump Rope Sprint', '10 rounds of 1-minute jump rope with 15-second rest between.', 'Boxing', 'Conditioning', 'Hard', 15, '["Set interval timer: 1min work, 15s rest, 10 rounds", "Round 1-3: Regular bounce", "Round 4-6: Alternating feet", "Round 7-8: Double unders (if able)", "Round 9-10: Maximum speed", "Track total skips if possible", "Don''t stop during work intervals"]'::jsonb, 50),

('Core Crusher', 'Plank 1min, side plank 30s each, hollow hold 45s - 3 rounds.', 'MMA', 'Conditioning', 'Medium', 12, '["Round 1: Front plank 60s → Right side plank 30s → Left side plank 30s → Hollow hold 45s", "Rest 1 minute", "Round 2: Same sequence", "Rest 1 minute", "Round 3: Same sequence", "Maintain perfect form - no sagging", "Focus on breathing throughout"]'::jsonb, 25),

('Push-Up Pyramid', 'Ascending then descending: 1, 2, 3... up to 10 and back down. 100 total push-ups.', 'MMA', 'Conditioning', 'Hard', 15, '["1 push-up, rest briefly", "2 push-ups, rest briefly", "3, 4, 5... continue up to 10", "Then back down: 9, 8, 7... down to 1", "Total of 100 push-ups", "Rest as needed between sets", "Maintain chest-to-ground depth"]'::jsonb, 50),

('Grip Strength', 'Dead hang from pull-up bar: 5 sets of max time. Track total hang time.', 'MMA', 'Conditioning', 'Medium', 10, '["Find pull-up bar", "Hang with arms fully extended", "Set 1: Hang for max time", "Rest 2 minutes between sets", "Complete 5 sets total", "Track each hang time and total accumulated time", "No swinging, just dead hang"]'::jsonb, 25),

('Sprint Intervals', '10 rounds of 30-second all-out sprint, 30-second walk recovery.', 'MMA', 'Conditioning', 'Hard', 12, '["Find space to sprint (outdoor or treadmill)", "Set interval timer: 30s sprint, 30s walk, 10 rounds", "Warm up with 5 min easy jog first", "Sprint 1-10: Give 95-100% effort", "Walk recovery - keep moving", "Cool down with 5 min easy walk after", "This should be extremely challenging"]'::jsonb, 50),

('Neck Bridges', 'Front and back wrestler bridges: 3 sets of 30 seconds each.', 'Wrestling', 'Conditioning', 'Easy', 5, '["WARNING: Start gently if new to neck bridges", "Set 1: Back bridge 30 seconds", "Set 1: Front bridge 30 seconds", "Rest 1 minute", "Repeat for 3 total sets", "Build up slowly - neck strength is crucial", "Stop if you feel pain"]'::jsonb, 10),

('Bodyweight 100s', '100 squats, 100 push-ups, 100 sit-ups, 100 lunges. For time.', 'MMA', 'Conditioning', 'Impossible', 30, '["This is a brutal challenge - pace yourself", "100 squats (break into sets as needed)", "100 push-ups (break into sets)", "100 sit-ups (break into sets)", "100 lunges total (50 each leg, break into sets)", "Track your total time", "Your goal: Complete all 400 reps"]'::jsonb, 100),

('Tabata Blast', '8 rounds of 20s work / 10s rest. Alternate burpees and squat jumps.', 'MMA', 'Conditioning', 'Medium', 6, '["Set Tabata timer: 20s work, 10s rest, 8 rounds", "Round 1: Burpees (20s max reps)", "Round 2: Squat jumps (20s max reps)", "Round 3: Burpees", "Round 4: Squat jumps", "Continue alternating for all 8 rounds", "Give 100% effort during work intervals"]'::jsonb, 25),

('Hip Mobility Flow', '15 minutes of hip opening stretches and mobility work for grappling.', 'Brazilian Jiu-Jitsu', 'Conditioning', 'Easy', 15, '["Butterfly stretch: 2 minutes", "Frog stretch: 2 minutes", "Pigeon pose (each side): 2 min per side", "Cossack squats: 2 minutes", "Hip circles: 1 minute each direction", "Deep squat hold: 2 minutes", "Focus on breathing and gradual depth increase"]'::jsonb, 10),

('Farmer Walk Challenge', 'Grab heavy dumbbells, walk for total of 5 minutes.', 'MMA', 'Conditioning', 'Medium', 8, '["Choose heavy dumbbells (challenging but manageable)", "Walk with weights at sides for as long as possible", "When you must drop weights, rest briefly", "Continue until 5 total minutes accumulated", "Track distance if possible", "Maintain upright posture - no leaning", "Great for grip strength and core"]'::jsonb, 25),

('Stair Sprints', 'Find stairs. Sprint up, walk down. 10 rounds.', 'MMA', 'Conditioning', 'Hard', 15, '["Find a staircase (10-30 steps ideal)", "Warm up with light jog", "Sprint up stairs as fast as possible", "Walk down for recovery", "Repeat for 10 total rounds", "Maintain good form - don''t trip", "Cool down with stretching after"]'::jsonb, 50),

('Cold Finish', '2 minutes of cold water exposure at end of shower. Mental toughness.', 'MMA', 'Conditioning', 'Easy', 3, '["Take your normal warm shower", "At the very end, turn water to cold", "Stay under cold water for 2 full minutes", "Focus on controlling your breathing", "Don''t tense up - relax into the cold", "Mental toughness and recovery benefits", "This is as much mental as physical"]'::jsonb, 10),

('Breathing Drill', 'Box breathing: 4s in, 4s hold, 4s out, 4s hold. 10 minutes for fight calmness.', 'MMA', 'Conditioning', 'Easy', 10, '["Sit or lie in comfortable position", "Breathe in for 4 seconds", "Hold breath for 4 seconds", "Breathe out for 4 seconds", "Hold empty for 4 seconds", "Repeat for 10 minutes", "Focus only on breath", "Practice the calm you need during a fight"]'::jsonb, 10),

-- TECHNIQUE + MENTAL (15 challenges)
('Film Study', 'Watch 1 full MMA fight on YouTube. Write down 3 techniques you want to steal.', 'MMA', 'Technique', 'Easy', 20, '["Choose a fight featuring a fighter in your weight class", "Watch the entire fight - don''t skip", "Pay attention to setups, not just finishes", "Write down 3 specific techniques you saw", "Note how and when they used each technique", "Practice visualizing yourself using these techniques", "Add these techniques to your next training session"]'::jsonb, 10),

('Mirror Work', '5 minutes shadow boxing in front of mirror, focus on guard position and stance.', 'Boxing', 'Technique', 'Easy', 8, '["Stand in front of full-length mirror", "Set timer for 5 minutes", "Watch your guard position - hands protecting face", "Check your stance - balanced, athletic", "Throw slow punches and watch your form", "Correct any bad habits you see", "Notice if you drop your hands after punching"]'::jsonb, 10),

('Weak Side Focus', 'Entire session in southpaw (or orthodox if southpaw). 10min shadow boxing.', 'Boxing', 'Technique', 'Medium', 12, '["Switch to your opposite stance", "This will feel very awkward - that''s good", "10 minutes of shadow boxing in opposite stance", "Focus on basic combinations only", "Notice which techniques feel strange", "Work on your weaker side - it pays off", "Great for developing symmetry and unpredictability"]'::jsonb, 25),

('Visualization Session', '10 minutes eyes closed, visualize your next sparring session going perfectly.', 'MMA', 'Mental', 'Easy', 10, '["Sit or lie in quiet space", "Close your eyes", "Visualize entering the gym for sparring", "See yourself moving well, staying calm", "Visualize landing clean techniques", "See yourself defending well", "Visualize the entire session going perfectly", "Feel the confidence and flow state"]'::jsonb, 10),

('Technique Journal', 'Write detailed notes on 3 techniques you learned this week. What worked, what didn''t.', 'MMA', 'Technique', 'Easy', 15, '["Choose 3 techniques from this week''s training", "Technique 1: Write what it is, when to use it, what worked, what didn''t", "Technique 2: Same process", "Technique 3: Same process", "Be specific and honest", "Note what you need to practice more", "This reflection solidifies learning"]'::jsonb, 10),

('Game Plan Builder', 'Write a 1-page game plan for your next sparring session: striking, clinch, ground.', 'MMA', 'Technique', 'Medium', 15, '["Standing strategy: What strikes will you focus on?", "Clinch plan: How will you enter and exit?", "Ground plan: What positions will you focus on?", "What is your opponent''s likely strategy?", "What are your counters?", "What are your main attacks?", "Write this down - specificity creates success"]'::jsonb, 25),

('Defense Only Round', '3 rounds shadow boxing where you ONLY practice defensive movement. No offense.', 'Boxing', 'Technique', 'Medium', 10, '["Set timer for 3x3min rounds, 30s rest", "Visualize opponent attacking you", "Practice slips, rolls, parries, and blocks ONLY", "No punches back - just defense", "Move your feet - create angles", "This builds defensive awareness", "Defense wins fights"]'::jsonb, 25),

('Combination Creator', 'Invent 3 new combinations you''ve never thrown. Drill each 30 times.', 'MMA', 'Technique', 'Medium', 12, '["Create combination 1 (mix striking and angles)", "Drill it 30 times - focus on flow", "Create combination 2", "Drill it 30 times", "Create combination 3", "Drill it 30 times", "Write them down to remember", "Use these in your next sparring session"]'::jsonb, 25),

('Position Escape Drill', 'Pick your worst position. Spend 10 min drilling escapes from it.', 'Brazilian Jiu-Jitsu', 'Technique', 'Medium', 12, '["Identify your worst position (mount bottom, side control bottom, etc.)", "Review 2-3 escape techniques for that position", "Drill escape 1: 10 reps", "Drill escape 2: 10 reps", "Drill escape 3: 10 reps", "Flow between escapes", "Deliberate practice on weaknesses makes you complete"]'::jsonb, 25),

('Recovery Session', '20 minutes of stretching, foam rolling, and breathing. Your body needs this.', 'MMA', 'Mental', 'Easy', 20, '["5 min foam rolling - hit all major muscle groups", "10 min stretching - hold each stretch 30-60s", "Focus on hips, shoulders, neck, legs", "5 min breathing - box breathing or simply deep breaths", "This is not weakness - this is smart training", "Recovery is when you actually get better", "Your body will thank you"]'::jsonb, 10),

('Highlight Reel Study', 'Watch technique highlights of a fighter in your weight class. Note 5 things they do well.', 'MMA', 'Technique', 'Easy', 15, '["Choose a fighter in your weight class", "Find a highlight reel or breakdown video", "Watch closely - not just for entertainment", "Write down 5 specific things they do well", "Examples: footwork, timing, setups, transitions", "How can you incorporate these into your game?", "Study the best to become the best"]'::jsonb, 10),

('Mental Rehearsal', 'Walk through an entire 3-round fight in your mind. See every exchange.', 'MMA', 'Mental', 'Medium', 15, '["Find quiet space, close your eyes", "Visualize the walkout - feel the nerves and excitement", "Round 1: See yourself starting strong", "Round 2: See yourself handling adversity and adjusting", "Round 3: See yourself finishing strong", "Visualize victory - your hand being raised", "Mental rehearsal creates real neural pathways", "Champions visualize success"]'::jsonb, 25),

('Reaction Drill', 'Partner claps randomly while you shadow box. Every clap = sprawl or level change.', 'Wrestling', 'Technique', 'Medium', 10, '["Need a partner or use random timer app", "Start shadow boxing", "Random signal (clap, beep, etc.)", "Immediately sprawl or shoot", "Return to shadow boxing", "Random signal again", "Repeat for 10 minutes", "Builds reaction time and wrestling readiness"]'::jsonb, 25),

('Cage/Ring Awareness', 'Shadow box in a small space (bathroom, closet). Practice angles and cutting off space.', 'MMA', 'Technique', 'Medium', 8, '["Find a very small space to work in", "Shadow box for 8 minutes", "Practice cutting angles in tight space", "Work on cornering an imaginary opponent", "Don''t let yourself get backed up", "Use pivots and lateral movement", "This simulates cage work - crucial in MMA"]'::jsonb, 25),

('Teach a Technique', 'Explain a technique out loud as if teaching someone. If you can''t explain it, you don''t know it.', 'MMA', 'Technique', 'Easy', 10, '["Choose a technique you think you know well", "Speak out loud as if teaching a beginner", "Explain the setup, execution, and finish", "Explain the key points", "Explain common mistakes", "If you stumble, you need to study it more", "Teaching forces deep understanding", "Record yourself if possible"]'::jsonb, 10);
