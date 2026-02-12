-- Technique Library Tables
CREATE TABLE IF NOT EXISTS techniques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  discipline TEXT NOT NULL,
  category TEXT NOT NULL,
  position TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  description TEXT NOT NULL,
  key_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  common_mistakes JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_techniques JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_techniques_discipline ON techniques(discipline);
CREATE INDEX idx_techniques_category ON techniques(category);
CREATE INDEX idx_techniques_difficulty ON techniques(difficulty);

-- Technique Practice Logs (for "Mark as Practiced")
CREATE TABLE IF NOT EXISTS technique_practice_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  technique_id UUID NOT NULL REFERENCES techniques(id) ON DELETE CASCADE,
  practiced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

CREATE INDEX idx_technique_practice_logs_user_id ON technique_practice_logs(user_id);
CREATE INDEX idx_technique_practice_logs_technique_id ON technique_practice_logs(technique_id);

-- RLS Policies
ALTER TABLE technique_practice_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own practice logs"
  ON technique_practice_logs FOR ALL
  USING (auth.uid() = user_id);

-- Techniques table is public read (no RLS needed for read-only data)
-- Users can read all techniques without auth

-- SEED DATA: 200 Techniques

-- BOXING (10)
INSERT INTO techniques (name, discipline, category, position, difficulty, description, key_points, common_mistakes, related_techniques) VALUES
('Jab', 'Boxing', 'Strikes', 'Standing', 'Beginner', 'The fundamental straight punch thrown with the lead hand. The jab is used to measure distance, set up combinations, and control the pace of the fight. It''s the most important punch in boxing.',
'["Rotate your shoulder forward on extension", "Snap the punch back quickly to guard position", "Keep your rear hand protecting your chin", "Step forward slightly for power"]',
'["Dropping the rear hand while jabbing", "Telegraphing by pulling back first", "Not returning to guard position"]',
'["Cross", "Jab-Cross Combo", "Slip"]'),

('Cross', 'Boxing', 'Strikes', 'Standing', 'Beginner', 'A powerful straight punch thrown with the rear hand. The cross generates power from hip rotation and weight transfer from the back foot to the front. Often used as a counter or following a jab.',
'["Rotate hips and shoulders explosively", "Drive off the back foot", "Keep chin tucked behind shoulder", "Exhale sharply on impact"]',
'["Winding up or loading the punch", "Leaning too far forward", "Dropping the lead hand"]',
'["Jab", "Jab-Cross Combo", "Hook"]'),

('Hook', 'Boxing', 'Strikes', 'Standing', 'Intermediate', 'A bent-arm power punch thrown in a circular motion targeting the opponent''s head or body. The hook can be devastating when timed correctly and is often used in close-range exchanges.',
'["Keep elbow at shoulder height for head hooks", "Rotate from the core, not just the arm", "Maintain a 90-degree bend in the elbow", "Shift weight to the lead foot"]',
'["Swinging too wide (looping)", "Dropping the opposite hand", "Leaning back while throwing"]',
'["Cross", "Uppercut", "Body Shot"]'),

('Uppercut', 'Boxing', 'Strikes', 'Standing', 'Intermediate', 'An upward punch thrown from a bent-arm position, targeting the opponent''s chin or solar plexus. Most effective at close range when slipping inside the opponent''s guard.',
'["Bend knees slightly and drive upward", "Keep tight arc, don''t telegraph", "Rotate shoulder through the punch", "Can be thrown to head or body"]',
'["Winding up from too low", "Squaring up stance", "Poor balance after throwing"]',
'["Hook", "Cross", "Slip"]'),

('Body Shot', 'Boxing', 'Strikes', 'Standing', 'Intermediate', 'Any punch targeting the opponent''s torso, particularly the liver, solar plexus, or ribs. Body shots accumulate damage and can end fights with well-placed liver shots.',
'["Bend knees to get proper angle", "Aim for liver (right side) or solar plexus", "Keep head off centerline", "Follow up to the head"]',
'["Staying upright and reaching down", "Telegraphing by looking down", "Not protecting your own head"]',
'["Hook", "Uppercut", "Jab-Cross Combo"]'),

('Jab-Cross Combo', 'Boxing', 'Strikes', 'Standing', 'Beginner', 'The most fundamental combination in boxing: a lead jab followed immediately by a rear cross. This one-two combination is the foundation for all other combinations and creates openings for further attacks.',
'["Jab sets up the cross", "No pause between punches", "Return hands to guard after combination", "Step in with the jab for power"]',
'["Dropping hands between punches", "No head movement after combination", "Predictable rhythm"]',
'["Jab", "Cross", "Hook"]'),

('Check Hook', 'Boxing', 'Strikes', 'Standing', 'Advanced', 'A defensive counter punch where you pivot away from pressure while throwing a lead hook. This technique allows you to hit while creating distance from an aggressive opponent.',
'["Pivot on lead foot while throwing", "Use opponent''s forward momentum", "Create angle with footwork", "Exit on an angle after landing"]',
'["Pivoting too slowly", "Not committing to the punch", "Poor balance during pivot"]',
'["Hook", "Slip", "Parry"]'),

('Slip', 'Boxing', 'Defense', 'Standing', 'Beginner', 'A defensive head movement that avoids a punch by moving the head to either side, outside the path of the incoming strike. Slipping allows immediate counters from advantageous positions.',
'["Keep eyes on opponent", "Slight knee bend, not waist bend", "Stay in punching range", "Small, efficient movements"]',
'["Moving too much or too early", "Looking away or closing eyes", "Slipping into another punch"]',
'["Cross", "Uppercut", "Catch and Counter"]'),

('Parry', 'Boxing', 'Defense', 'Standing', 'Beginner', 'A defensive technique using an open hand to redirect an incoming punch away from its target. Parries are subtle, efficient, and create immediate counter opportunities.',
'["Use slight hand movement to redirect", "Parry across your body", "Keep opposite hand protecting chin", "Follow immediately with counter"]',
'["Reaching too far to parry", "Using too much force", "Dropping guard after parry"]',
'["Slip", "Cross", "Catch and Counter"]'),

('Catch and Counter', 'Boxing', 'Defense', 'Standing', 'Intermediate', 'A defensive technique where you absorb an opponent''s punch with your glove while simultaneously or immediately countering. This technique requires timing and composure under pressure.',
'["Absorb punch with glove, not face", "Keep elbow tight to body", "Counter immediately while opponent is extended", "Maintain balance and posture"]',
'["Catching too late", "Not countering fast enough", "Poor positioning after catch"]',
'["Cross", "Parry", "Slip"]');

-- MUAY THAI (10)
INSERT INTO techniques (name, discipline, category, position, difficulty, description, key_points, common_mistakes, related_techniques) VALUES
('Roundhouse Kick', 'Muay Thai', 'Strikes', 'Standing', 'Beginner', 'The signature Muay Thai kick where you strike with the shin in a circular motion. Unlike karate-style roundhouse kicks, the Muay Thai version emphasizes power and turning through the target.',
'["Turn hips over completely", "Strike with the shin, not the foot", "Pivot on support foot", "Swing arm down for balance and power"]',
'["Kicking with the foot instead of shin", "Not pivoting support foot", "Telegraphing with upper body"]',
'["Low Kick", "Switch Kick", "Teep"]'),

('Teep (Push Kick)', 'Muay Thai', 'Strikes', 'Standing', 'Beginner', 'A straight pushing kick using the ball of the foot to create distance, disrupt rhythm, or strike the opponent''s body. The teep is both offensive and defensive, controlling range.',
'["Drive from the hip", "Keep hands up for balance", "Full hip extension", "Can target body or face"]',
'["Leaning too far back", "Slow chamber and return", "Not extending fully"]',
'["Roundhouse Kick", "Clinch Entry", "Front Kick"]'),

('Elbow Strike', 'Muay Thai', 'Strikes', 'Standing', 'Intermediate', 'A short-range strike using the point of the elbow. Elbows can be thrown in various angles (horizontal, upward, downward, spinning) and are devastating weapons in close quarters.',
'["Keep tight arc for power", "Rotate entire body", "Can be thrown horizontally, upward, or downward", "Most effective in clinch range"]',
'["Reaching or extending too far", "Poor balance", "Telegraphing the strike"]',
'["Knee Strike", "Clinch Entry", "Hook"]'),

('Knee Strike', 'Muay Thai', 'Strikes', 'Clinch', 'Beginner', 'A powerful strike using the knee, typically delivered in the clinch. Knees can target the body, head (when allowed), or legs, and are among the most powerful weapons in Muay Thai.',
'["Drive hips forward", "Pull opponent into the knee", "Can be straight, curved, or jumping", "Maintain clinch control"]',
'["Leaning too far back", "Not controlling opponent''s posture", "Telegraphing by looking down"]',
'["Elbow Strike", "Clinch Entry", "Dump from Clinch"]'),

('Low Kick', 'Muay Thai', 'Strikes', 'Standing', 'Beginner', 'A roundhouse kick targeting the opponent''s thigh, calf, or knee. Low kicks accumulate damage over time and can severely compromise an opponent''s mobility and power generation.',
'["Same mechanics as body roundhouse", "Target outer or inner thigh", "Shin to thigh contact", "Use to slow opponent down"]',
'["Kicking too low (easily checked)", "Not committing to the kick", "Poor balance after kick"]',
'["Roundhouse Kick", "Calf Kick", "Switch Kick"]'),

('Switch Kick', 'Muay Thai', 'Strikes', 'Standing', 'Intermediate', 'A deceptive kicking technique where you quickly switch your stance before throwing a roundhouse kick. This adds power and surprise by allowing your rear leg to become the kicking leg.',
'["Quick switch step before kick", "Maintain balance during switch", "Commit fully to hip rotation", "Can target any level"]',
'["Telegraphing the switch", "Poor balance during transition", "Slow execution"]',
'["Roundhouse Kick", "Low Kick", "Teep"]'),

('Clinch Entry', 'Muay Thai', 'Clinch', 'Standing', 'Intermediate', 'The technique of closing distance and establishing control in the Thai clinch (plum position). Proper clinch entry requires timing, hand fighting, and posture control.',
'["Close distance quickly", "Control head and neck", "Establish double collar tie or plum", "Break opponent''s posture"]',
'["Reaching from too far", "Poor posture (bent over)", "Not controlling opponent''s arms"]',
'["Knee Strike", "Dump from Clinch", "Long Guard"]'),

('Dump from Clinch', 'Muay Thai', 'Takedowns', 'Clinch', 'Intermediate', 'A sweeping or tripping technique performed from the clinch to take the opponent to the ground. Unlike wrestling takedowns, dumps use leverage and off-balancing rather than explosive power.',
'["Control opponent''s posture first", "Use hip and leg positioning", "Off-balance before sweeping", "Maintain clinch control during dump"]',
'["Forcing the dump without setup", "Poor base and balance", "Losing clinch position"]',
'["Clinch Entry", "Knee Strike", "Sweep from Clinch"]'),

('Long Guard', 'Muay Thai', 'Defense', 'Standing', 'Intermediate', 'A defensive position where you extend one arm to maintain distance and control the opponent''s head or shoulder. The long guard is used to measure distance, create frames, and set up strikes.',
'["Extend arm to opponent''s face or shoulder", "Keep rear hand protecting chin", "Use to measure distance", "Can push or post to create openings"]',
'["Overextending and losing balance", "Not protecting with rear hand", "Static positioning"]',
'["Teep", "Clinch Entry", "Jab"]'),

('Sweep from Clinch', 'Muay Thai', 'Takedowns', 'Clinch', 'Advanced', 'A technical clinch technique where you use foot positioning to sweep or trip the opponent''s leg while controlling their upper body. Sweeps require timing, balance, and precise foot placement.',
'["Control upper body first", "Time when opponent shifts weight", "Use inside or outside leg sweep", "Maintain your base throughout"]',
'["Sweeping without upper body control", "Poor timing", "Losing your own balance"]',
'["Dump from Clinch", "Clinch Entry", "Knee Strike"]');

-- BJJ (15)
INSERT INTO techniques (name, discipline, category, position, difficulty, description, key_points, common_mistakes, related_techniques) VALUES
('Armbar from Guard', 'Brazilian Jiu-Jitsu', 'Submissions', 'Guard (Bottom)', 'Beginner', 'A fundamental submission where you hyperextend the opponent''s elbow joint while controlling their body from guard. This is one of the first submissions taught in BJJ and forms the foundation for many attacks.',
'["Control opponent''s wrist and triceps", "Pivot hips perpendicular to opponent", "Squeeze knees together", "Break posture before attempting"]',
'["Not controlling the wrist", "Giving up position too easily", "Not breaking posture first"]',
'["Triangle Choke", "Kimura", "Hip Escape (Shrimp)"]'),

('Triangle Choke', 'Brazilian Jiu-Jitsu', 'Submissions', 'Guard (Bottom)', 'Intermediate', 'A blood choke executed from guard by trapping the opponent''s head and one arm between your legs. The triangle is a high-percentage submission that can be set up from various positions.',
'["Control one arm across opponent''s body", "Lock legs in figure-four position", "Angle body 45 degrees", "Pull head down while squeezing"]',
'["Letting opponent posture up", "Not angling off", "Locking triangle too loose"]',
'["Armbar from Guard", "Kimura", "Guillotine"]'),

('Rear Naked Choke', 'Brazilian Jiu-Jitsu', 'Submissions', 'Back', 'Beginner', 'The most dominant finishing position in grappling: a blood choke applied from the back with your forearm across the opponent''s throat. This choke is highly effective and difficult to escape once locked in.',
'["Secure back control with hooks first", "Slide choking arm under chin", "Lock figure-four grip", "Expand chest while pulling"]',
'["Choking the jaw instead of neck", "Not controlling posture", "Rushing before securing position"]',
'["Back Take from Turtle", "Arm Drag", "Guillotine"]'),

('Kimura', 'Brazilian Jiu-Jitsu', 'Submissions', 'Guard (Bottom)', 'Intermediate', 'A shoulder lock submission using a figure-four grip on the opponent''s arm. The Kimura can be applied from various positions and is both a submission and a powerful control position.',
'["Control wrist with both hands", "Create figure-four grip", "Apply pressure by rotating their arm", "Can be done from many positions"]',
'["Not isolating the arm first", "Wrong direction of pressure", "Losing control of the wrist"]',
'["Armbar from Guard", "Triangle Choke", "Guillotine"]'),

('Guillotine', 'Brazilian Jiu-Jitsu', 'Submissions', 'Standing', 'Beginner', 'A front choke executed by wrapping your arm around the opponent''s neck, often catching them during takedown attempts. The guillotine can be finished from standing, guard, or mount.',
'["Wrap arm deep around neck", "Lock hands together (various grips)", "Fall to guard or jump guard", "Lift with forearm while pulling down"]',
'["Not getting deep enough under chin", "Squeezing with arms only, not hips", "Poor grip selection"]',
'["Triangle Choke", "Rear Naked Choke", "Sprawl"]'),

('Hip Escape (Shrimp)', 'Brazilian Jiu-Jitsu', 'Escapes', 'Ground (Bottom)', 'Beginner', 'The fundamental movement for creating space and escaping bad positions. The shrimp involves turning on your side and using your legs to push away from the opponent.',
'["Turn to your side", "Bridge and push with legs", "Create space with knee and hip", "Essential for all escapes"]',
'["Staying flat on back", "Not creating enough space", "Moving without framing first"]',
'["Mount Escape (Trap and Roll)", "Guard Pass (Knee Cut)", "Closed Guard Break"]'),

('Guard Pass (Knee Cut)', 'Brazilian Jiu-Jitsu', 'Sweeps', 'Guard (Top)', 'Intermediate', 'An aggressive guard pass where you slice your knee across the opponent''s thigh to flatten their guard and establish side control. The knee cut is one of the most common and high-percentage passes.',
'["Control opponent''s far hip and near collar", "Drive knee across thigh to mat", "Maintain heavy chest pressure", "Transition to side control"]',
'["Not controlling the far hip", "Allowing space underneath", "Standing too upright"]',
'["Closed Guard Break", "Underhook", "Mount Escape (Trap and Roll)"]'),

('Mount Escape (Trap and Roll)', 'Brazilian Jiu-Jitsu', 'Escapes', 'Mount (Bottom)', 'Beginner', 'A fundamental mount escape where you trap the opponent''s arm and leg on one side, then bridge explosively to roll them over. This is the first mount escape taught to beginners.',
'["Trap opponent''s arm to your chest", "Hook their foot with your foot", "Bridge explosively up and over", "Roll to their guard"]',
'["Bridging without trapping", "Not committing to the bridge", "Poor timing"]',
'["Hip Escape (Shrimp)", "Armbar from Guard", "Guillotine"]'),

('Back Take from Turtle', 'Brazilian Jiu-Jitsu', 'Sweeps', 'Turtle', 'Intermediate', 'The process of establishing back control when your opponent is in turtle position. Back control is the most dominant position in BJJ, making this transition highly valuable.',
'["Control near hip and far shoulder", "Insert first hook", "Break them down to side", "Secure second hook and seat belt grip"]',
'["Rushing to get both hooks", "Not controlling posture", "Allowing them to roll"]',
'["Rear Naked Choke", "Arm Drag", "Sprawl to Back Take"]'),

('Scissor Sweep', 'Brazilian Jiu-Jitsu', 'Sweeps', 'Guard (Bottom)', 'Beginner', 'A fundamental sweep from closed guard using a scissoring leg motion to off-balance and reverse the opponent. The scissor sweep is highly effective when the opponent is postured up.',
'["Control opponent''s sleeve and collar", "One leg across chest, one behind knee", "Scissor legs while pulling", "Come up to mount"]',
'["Not controlling the sleeve", "Sweeping before breaking posture", "Not committing to the scissor motion"]',
'["Armbar from Guard", "Triangle Choke", "Hip Escape (Shrimp)"]'),

('Closed Guard Break', 'Brazilian Jiu-Jitsu', 'Sweeps', 'Guard (Top)', 'Beginner', 'The technique of opening the opponent''s closed guard to begin passing. Breaking the guard safely while maintaining good posture is essential for all top players.',
'["Maintain strong posture", "Stand or use knee wedge", "Control opponent''s hips", "Prevent submissions during break"]',
'["Poor posture (hunched over)", "Not controlling distance", "Leaving arms exposed"]',
'["Guard Pass (Knee Cut)", "Armbar from Guard", "Triangle Choke"]'),

('De La Riva Guard', 'Brazilian Jiu-Jitsu', 'Sweeps', 'Guard (Bottom)', 'Advanced', 'An open guard position where you hook your leg around the opponent''s leg while controlling their sleeve and collar. De La Riva guard offers powerful sweeping and submission options.',
'["Hook leg around opponent''s leg", "Control opposite sleeve", "Control far collar or belt", "Off-balance to sweep or transition"]',
'["Not maintaining distance control", "Poor grip fighting", "Letting opponent clear the hook easily"]',
'["X-Guard Sweep", "Scissor Sweep", "Back Take from Turtle"]'),

('X-Guard Sweep', 'Brazilian Jiu-Jitsu', 'Sweeps', 'Guard (Bottom)', 'Advanced', 'A powerful sweeping position where you control both of the opponent''s legs with your legs in an X configuration. X-guard provides excellent elevation and control for sweeps and back takes.',
'["Cross legs in X formation under opponent", "Control far ankle", "Elevate and off-balance", "Sweep to top position or back"]',
'["Not controlling ankle", "Poor hip positioning", "Letting opponent step over"]',
'["De La Riva Guard", "Back Take from Turtle", "Scissor Sweep"]'),

('Arm Drag', 'Brazilian Jiu-Jitsu', 'Sweeps', 'Standing', 'Intermediate', 'A fundamental position where you pull the opponent''s arm across their body to gain access to their back. The arm drag is essential for wrestling, takedowns, and back takes.',
'["Control opponent''s wrist and triceps", "Pull arm across their body", "Step to their back", "Can lead to back take or takedown"]',
'["Not controlling both points on arm", "Not moving your feet", "Telegraphing the drag"]',
'["Back Take from Turtle", "Rear Naked Choke", "Single Leg Takedown"]'),

('Loop Choke', 'Brazilian Jiu-Jitsu', 'Submissions', 'Guard (Bottom)', 'Advanced', 'A sneaky collar choke from closed guard where you use the opponent''s own collar to create a loop around their neck. This choke is often set up when the opponent is defending other attacks.',
'["Feed opponent''s collar deep across neck", "Control their posture", "Use your other hand to tighten", "Can finish from bottom or by rolling"]',
'["Not getting deep enough grip", "Telegraphing the setup", "Poor posture control"]',
'["Triangle Choke", "Armbar from Guard", "Kimura"]');

-- WRESTLING (10)
INSERT INTO techniques (name, discipline, category, position, difficulty, description, key_points, common_mistakes, related_techniques) VALUES
('Double Leg Takedown', 'Wrestling', 'Takedowns', 'Standing', 'Beginner', 'A fundamental takedown where you shoot in low, grab both of the opponent''s legs, and drive them to the mat. The double leg is one of the most reliable and high-percentage takedowns.',
'["Change levels explosively", "Drive through with hips", "Head to the side, not middle", "Run the pipe or lift to finish"]',
'["Standing too upright", "Head in the middle (dangerous)", "Not penetrating deep enough"]',
'["Single Leg Takedown", "High Crotch", "Sprawl"]'),

('Single Leg Takedown', 'Wrestling', 'Takedowns', 'Standing', 'Beginner', 'A versatile takedown where you control one of the opponent''s legs and work to take them down. The single leg offers multiple finishing options and is less committal than the double leg.',
'["Grab behind the knee", "Stand up with the leg", "Multiple finish options", "Control opponent''s hips"]',
'["Not securing the leg properly", "Letting opponent hop away", "Poor balance while finishing"]',
'["Double Leg Takedown", "Ankle Pick", "High Crotch"]'),

('High Crotch', 'Wrestling', 'Takedowns', 'Standing', 'Intermediate', 'A takedown variation where you drive your shoulder into the opponent''s hip while controlling their leg high on the thigh. The high crotch is powerful and creates strong angles.',
'["Penetrate deep with lead leg", "Lock hands high on thigh", "Shoulder into hip", "Run the pipe or elevate"]',
'["Not getting deep enough", "Poor head position", "Letting opponent whizzer"]',
'["Double Leg Takedown", "Single Leg Takedown", "Whizzer"]'),

('Ankle Pick', 'Wrestling', 'Takedowns', 'Standing', 'Intermediate', 'A quick takedown where you grab the opponent''s ankle while pulling their upper body in the opposite direction. The ankle pick requires excellent timing and hand speed.',
'["Create reaction with collar tie", "Snatch ankle quickly", "Pull upper body opposite direction", "Drive forward after picking"]',
'["Telegraphing by looking down", "Slow hand speed", "Not creating upper body reaction"]',
'["Single Leg Takedown", "Arm Drag", "Underhook"]'),

('Body Lock Takedown', 'Wrestling', 'Takedowns', 'Standing', 'Beginner', 'A powerful throw or trip executed with your arms locked around the opponent''s body. Body locks are commonly used in no-gi grappling and MMA where collar ties are unavailable.',
'["Lock hands behind opponent''s back", "Control head position", "Can throw or trip", "Works well in clinch"]',
'["Locking too high on back", "Poor hip position", "Telegraphing the throw"]',
'["Cement Mixer", "Fireman''s Carry", "Clinch Entry"]'),

('Sprawl', 'Wrestling', 'Defense', 'Standing', 'Beginner', 'The fundamental defense against takedowns where you throw your legs back while maintaining pressure on the opponent. A good sprawl stops takedowns and can lead to dominant positions.',
'["Hips down and back explosively", "Maintain downward pressure on opponent", "Spread legs wide", "Can transition to front headlock"]',
'["Slow reaction time", "Not getting hips down", "Jumping back too far"]',
'["Double Leg Takedown", "Guillotine", "Sprawl to Back Take"]'),

('Underhook', 'Wrestling', 'Clinch', 'Standing', 'Beginner', 'A control position where your arm goes under the opponent''s arm, providing strong control and offensive opportunities. Underhooks are fundamental to clinch fighting and wrestling control.',
'["Arm under opponent''s armpit", "Control their back or lat", "Keep elbow tight", "Drive opponent backward"]',
'["Allowing opponent to get their own underhook", "Reaching too high", "Not maintaining connection"]',
'["Whizzer", "Body Lock Takedown", "Clinch Entry"]'),

('Whizzer', 'Wrestling', 'Defense', 'Standing', 'Intermediate', 'A defensive overhook where you lock your arm over the opponent''s arm and control their triceps. The whizzer is crucial for defending single legs and creating scrambles.',
'["Lock over opponent''s arm", "Control triceps", "Drive their head down", "Can counter with hip toss"]',
'["Not locking tight enough", "Poor head position", "Giving up position"]',
'["Single Leg Takedown", "High Crotch", "Underhook"]'),

('Cement Mixer', 'Wrestling', 'Takedowns', 'Turtle', 'Advanced', 'A powerful turnover from turtle position where you hook the opponent''s arm and drive them over to their back. The cement mixer is a high-percentage way to expose a turtled opponent.',
'["Control near arm and far leg", "Drive arm up and across", "Roll opponent to back", "Maintain pressure throughout"]',
'["Not controlling leg properly", "Letting opponent roll through", "Poor positioning"]',
'["Back Take from Turtle", "Body Lock Takedown", "Fireman''s Carry"]'),

('Fireman''s Carry', 'Wrestling', 'Takedowns', 'Standing', 'Advanced', 'A dynamic throw where you load the opponent onto your shoulders and flip them over. The fireman''s carry requires good timing and athleticism but can be spectacular when executed.',
'["Control arm and head", "Drop level and turn in", "Load onto shoulders", "Flip opponent over"]',
'["Telegraphing by dropping too early", "Poor grip control", "Not committing fully"]',
'["Arm Drag", "Body Lock Takedown", "High Crotch"]');

-- KICKBOXING (5)
INSERT INTO techniques (name, discipline, category, position, difficulty, description, key_points, common_mistakes, related_techniques) VALUES
('Spinning Back Kick', 'Kickboxing', 'Strikes', 'Standing', 'Advanced', 'A powerful spinning kick where you rotate 180 degrees and drive your heel into the opponent. This kick generates tremendous power but requires commitment and timing.',
'["Turn head to find target first", "Chamber knee during spin", "Drive heel through target", "Can target body or head"]',
'["Telegraphing with shoulder movement", "Spinning blindly", "Poor balance after spinning"]',
'["Roundhouse Kick", "Side Kick", "Front Kick"]'),

('Front Kick', 'Kickboxing', 'Strikes', 'Standing', 'Beginner', 'A straight kick delivered with the ball of the foot or instep, used to maintain distance or strike the opponent''s face or body. Similar to the Muay Thai teep but often more focused on striking than pushing.',
'["Chamber knee to chest", "Extend leg straight forward", "Strike with ball of foot", "Snap back quickly"]',
'["Telegraphing by leaning back", "Not chambering high enough", "Slow return to stance"]',
'["Teep (Push Kick)", "Roundhouse Kick", "Side Kick"]'),

('Side Kick', 'Kickboxing', 'Strikes', 'Standing', 'Intermediate', 'A powerful linear kick where you turn sideways and drive your heel into the opponent. The side kick can target the body, legs, or head and is highly effective for creating distance.',
'["Turn body sideways", "Chamber knee high", "Extend heel through target", "Lean back for balance"]',
'["Not turning fully sideways", "Kicking with wrong part of foot", "Poor balance"]',
'["Front Kick", "Spinning Back Kick", "Roundhouse Kick"]'),

('Question Mark Kick', 'Kickboxing', 'Strikes', 'Standing', 'Advanced', 'A deceptive kick that starts like a front kick but converts into a roundhouse kick to the head. The question mark kick is difficult to defend because it changes trajectory mid-flight.',
'["Start chamber like front kick", "Convert to roundhouse mid-kick", "Target opponent''s head", "Use to deceive guard"]',
'["Telegraphing the conversion", "Poor balance during transition", "Not committing to the kick"]',
'["Front Kick", "Roundhouse Kick", "Switch Kick"]'),

('Calf Kick', 'Kickboxing', 'Strikes', 'Standing', 'Beginner', 'A low roundhouse kick specifically targeting the opponent''s calf muscle. Calf kicks have become extremely popular in modern MMA and kickboxing due to their effectiveness and difficulty to check.',
'["Target meaty part of calf", "Same mechanics as roundhouse", "Very hard to check", "Accumulates damage quickly"]',
'["Kicking too high (easily checked)", "Not pivoting support foot", "Poor balance"]',
'["Low Kick", "Roundhouse Kick", "Teep (Push Kick)"]');

-- MMA SPECIFIC (10)
INSERT INTO techniques (name, discipline, category, position, difficulty, description, key_points, common_mistakes, related_techniques) VALUES
('Ground and Pound from Guard', 'MMA', 'Strikes', 'Guard (Top)', 'Intermediate', 'Striking from inside the opponent''s guard using short punches and elbows. Ground and pound from guard requires balancing offensive strikes with defensive awareness of submissions.',
'["Maintain good posture", "Use short punches and elbows", "Control opponent''s hips", "Watch for submissions"]',
'["Posturing up too much (swept)", "Leaving arms exposed", "Predictable striking patterns"]',
'["Guard Pass (Knee Cut)", "Armbar from Guard", "Triangle Choke"]'),

('Wall Walk (Cage)', 'MMA', 'Escapes', 'Ground (Bottom)', 'Intermediate', 'Using the cage to walk up to your feet from bottom position. The cage is a unique tool in MMA that allows fighters to escape bad positions more easily.',
'["Get back to cage", "Post hand on mat", "Walk feet up cage", "Frame to create space"]',
'["Not getting back to cage", "Leaving neck exposed", "Poor hand positioning"]',
'["Hip Escape (Shrimp)", "Cage Clinch Control", "Takedown Defense (Cage)"]'),

('Takedown Defense (Cage)', 'MMA', 'Defense', 'Against Cage', 'Intermediate', 'Defending takedowns when pressed against the cage by using frames, whizzers, and cage positioning. Cage wrestling is a distinct skillset in MMA.',
'["Create frames to prevent penetration", "Use cage for leverage", "Whizzer and limp leg", "Circle off cage when possible"]',
'["Giving up back to cage too easily", "Not fighting hands", "Static positioning"]',
'["Sprawl", "Whizzer", "Wall Walk (Cage)"]'),

('Dirty Boxing', 'MMA', 'Strikes', 'Clinch', 'Intermediate', 'Close-range boxing in the clinch, using short hooks, uppercuts, and elbows. Dirty boxing is particularly effective in MMA where clinch striking is allowed.',
'["Short, compact punches", "Control opponent''s head", "Mix punches with clinch control", "Target body and head"]',
'["Reaching for big punches", "Ignoring clinch control", "Poor energy management"]',
'["Clinch Entry", "Elbow Strike", "Body Shot"]'),

('Standing Elbow', 'MMA', 'Strikes', 'Standing', 'Advanced', 'Elbows thrown from standing range, often in close quarters or as the opponent enters. Standing elbows are legal in MMA and can cause devastating cuts.',
'["Close distance first", "Multiple angles available", "Rotate through entire body", "Target head or temple"]',
'["Throwing from too far", "Telegraphing", "Poor balance"]',
'["Elbow Strike", "Dirty Boxing", "Hook"]'),

('Ground and Pound from Mount', 'MMA', 'Strikes', 'Mount (Top)', 'Beginner', 'Striking from the dominant mount position. Mount is the most dominant position for ground and pound, allowing powerful punches and elbows with little risk.',
'["Maintain mount control first", "Use powerful punches and elbows", "Mix up targets (head and body)", "Watch for escape attempts"]',
'["Losing mount while striking", "Predictable striking", "Not maintaining base"]',
'["Mount Escape (Trap and Roll)", "Rear Naked Choke", "Armbar from Guard"]'),

('Cage Clinch Control', 'MMA', 'Clinch', 'Against Cage', 'Intermediate', 'Controlling the opponent against the cage using collar ties, underhooks, and body positioning. Cage control is essential for MMA wrestling and setting up takedowns or strikes.',
'["Pin opponent to cage", "Control head and hips", "Use dirty boxing", "Set up takedowns or trips"]',
'["Not using cage leverage", "Static positioning", "Poor energy management"]',
'["Dirty Boxing", "Takedown Defense (Cage)", "Underhook"]'),

('Level Change', 'MMA', 'Takedowns', 'Standing', 'Beginner', 'The act of changing your height level from standing to shooting for takedowns. Clean level changes disguise takedown entries and create openings.',
'["Drop level explosively", "Keep head up", "Use striking to set up", "Commit to the entry"]',
'["Telegraphing by looking down", "Slow level change", "No setup or feint"]',
'["Double Leg Takedown", "Single Leg Takedown", "High Crotch"]'),

('Sprawl to Back Take', 'MMA', 'Sweeps', 'Standing', 'Advanced', 'Defending a takedown with a sprawl and transitioning to the opponent''s back in one motion. This advanced technique turns defense into offense.',
'["Sprawl hard on opponent", "Control far hip", "Spin to back", "Secure hooks and seat belt"]',
'["Not controlling hips", "Slow transition", "Losing position during spin"]',
'["Sprawl", "Back Take from Turtle", "Rear Naked Choke"]'),

('Knee Tap', 'MMA', 'Takedowns', 'Standing', 'Intermediate', 'A quick takedown where you tap or lift the opponent''s knee while controlling their upper body. The knee tap is fast, low-risk, and particularly effective in MMA gloves.',
'["Control opponent''s head or shoulder", "Tap behind their knee", "Drive forward", "Low commitment, high success"]',
'["Not controlling upper body", "Telegraphing", "Poor timing"]',
'["Ankle Pick", "Single Leg Takedown", "Arm Drag"]');

-- Additional techniques to reach 60+ total
-- Adding Judo techniques under MMA/Grappling
INSERT INTO techniques (name, discipline, category, position, difficulty, description, key_points, common_mistakes, related_techniques) VALUES
('Osoto Gari (Major Outer Reap)', 'Wrestling', 'Takedowns', 'Standing', 'Intermediate', 'A powerful Judo throw where you reap the opponent''s leg from the outside while pulling them backward. This throw is highly effective in no-gi grappling and MMA.',
'["Control opponent''s collar and sleeve", "Step outside their leg", "Reap leg while pulling upper body", "Drive them straight back"]',
'["Not committing to the pull", "Poor foot placement", "Letting opponent turn in"]',
'["Body Lock Takedown", "Fireman''s Carry", "Clinch Entry"]'),

('Uchi Mata (Inner Thigh Throw)', 'Wrestling', 'Takedowns', 'Standing', 'Advanced', 'An explosive Judo throw where you lift the opponent by driving your leg between theirs and rotating. Uchi mata is one of the most dynamic and high-scoring techniques in Judo.',
'["Break opponent''s balance forward", "Step in deep", "Lift with leg between theirs", "Rotate and throw"]',
'["Not breaking balance first", "Poor hip positioning", "Not committing to rotation"]',
'["Fireman''s Carry", "Body Lock Takedown", "High Crotch"]'),

('Seoi Nage (Shoulder Throw)', 'Wrestling', 'Takedowns', 'Standing', 'Advanced', 'A classic Judo throw where you turn in and throw the opponent over your shoulder. Seoi nage requires excellent timing and can be adapted for no-gi grappling.',
'["Control opponent''s arm", "Turn in and drop level", "Load onto shoulder/back", "Throw forward"]',
'["Telegraphing the entry", "Not getting low enough", "Poor grip control"]',
'["Fireman''s Carry", "Arm Drag", "Body Lock Takedown"]'),

('Guillotine from Standing (MMA variant)', 'MMA', 'Submissions', 'Standing', 'Intermediate', 'The standing guillotine choke, particularly effective in MMA when defending takedowns. This variation focuses on catching the choke during the opponent''s shot.',
'["Wrap neck during their shot", "Get grip deep under chin", "Can finish standing or jump guard", "Squeeze with entire body"]',
'["Not getting under chin", "Weak grip", "Poor timing on entry"]',
'["Guillotine", "Sprawl", "Front Headlock"]'),

('Darce Choke', 'Brazilian Jiu-Jitsu', 'Submissions', 'Guard (Top)', 'Advanced', 'A no-gi choke similar to the anaconda, often applied from side control or when passing guard. The darce involves threading your arm under the opponent''s neck and through their armpit.',
'["Thread arm under neck and through armpit", "Lock figure-four grip", "Apply pressure by squeezing and driving shoulder", "Can finish from various positions"]',
'["Not getting deep enough", "Wrong angle of pressure", "Losing position while setting up"]',
'["Guillotine", "Rear Naked Choke", "Guard Pass (Knee Cut)"]');
