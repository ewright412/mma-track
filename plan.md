# MMA Progress Tracker — Implementation Plan

## Product Vision
A training companion that helps MMA fighters track every aspect of their preparation — technique drilling, sparring, cardio, strength training, body composition — and visualizes progress over time to identify strengths, weaknesses, and trends.

The app should feel like a coach's notebook meets a modern fitness tracker, specifically designed for combat sports.

## Target User
- Amateur/recreational MMA fighters and enthusiasts
- People training at MMA gyms who want to track progress systematically
- Coaches who want to monitor fighter development

---

## Phase 1: Foundation & Authentication
**Goal:** Project scaffolding, Supabase setup, auth flow, basic navigation shell.

- Initialize Next.js 14 with TypeScript + Tailwind
- Configure Supabase project (auth, database)
- Build auth pages: Sign up, Sign in, Forgot password
- Create database tables and Row Level Security policies
- Build the app shell: sidebar navigation, header, mobile-responsive layout
- Dark theme implementation across all base components
- Create base UI components: Button, Card, Input, Badge, Modal
- Deploy to Vercel (basic)

**Deliverable:** User can sign up, log in, see an empty dashboard with working navigation.

---

## Phase 2: Training Session Logger (Core Feature)
**Goal:** The primary feature — logging MMA training sessions.

- "Log Training" form: Date, discipline (dropdown), duration, intensity (1-10 slider), notes
- Technique tracker within sessions: What techniques were drilled, reps/rounds
- Quick-log presets for common session types (e.g., "Boxing — Pad Work", "BJJ — Rolling")
- Session history list view with filters (by discipline, date range, intensity)
- Session detail view (click to expand and see full breakdown)
- Session edit and delete functionality
- Calendar heat map showing training frequency (like GitHub contribution graph)
- Training streak counter

**Deliverable:** User can log, view, edit, and delete training sessions with full detail.

---

## Phase 3: Sparring Log
**Goal:** Dedicated sparring tracking with self-assessment.

- Sparring log form: Date, rounds, opponent skill level, notes
- Self-rating per round (1-10): Striking offense, striking defense, takedowns, ground game
- What went well / what to improve (structured text fields)
- Sparring history with trend lines on self-ratings
- "Patterns" detector: If user consistently rates ground defense low, surface that as a focus area

**Deliverable:** User can log sparring sessions with detailed self-assessment and see trends.

---

## Phase 4: Cardio Tracking
**Goal:** Track all conditioning work.

- Cardio log form: Type (running, cycling, swimming, jump rope, heavy bag rounds, circuit), duration, distance (if applicable), heart rate (optional), intervals (yes/no)
- Pre-built cardio templates: "5K Run", "3x5min Heavy Bag Rounds", "Jump Rope Intervals"
- Weekly cardio summary: Total minutes, calories estimate, type breakdown
- Cardio progress charts: Pace over time, duration trends

**Deliverable:** User can log and track all conditioning work with progress visualization.

---

## Phase 5: Strength & Gym Tracking
**Goal:** Track weight training and gym work.

- Exercise database: Pre-populated with common MMA-relevant exercises
  - Compound: Squat, Deadlift, Bench Press, Overhead Press, Barbell Row, Pull-ups
  - MMA-specific: Turkish Get-ups, Medicine Ball Slams, Kettlebell Swings, Neck Bridges, Hip Escapes (weighted), Farmer Carries
  - Accessory: Bicep curls, Tricep dips, Lateral raises, etc.
- Strength log: Exercise, sets × reps × weight, RPE (rate of perceived exertion)
- Personal records (PR) tracker with automatic detection
- Workout templates: Save and reuse common workout structures
- Volume tracking: Total volume (sets × reps × weight) per muscle group per week
- Strength progress charts: 1RM estimates over time per exercise

**Deliverable:** Full gym tracking with PRs, templates, and progress charts.

---

## Phase 6: Body Metrics & Goals
**Goal:** Track physical changes and set goals.

- Body metrics log: Weight, body fat % (optional), photos (optional, stored in Supabase Storage)
- Weight trend chart with 7-day rolling average (smooths daily fluctuation)
- Goal system: Set goals with target dates
  - Examples: "Compete at 155 by June", "Run 5K under 25 min", "Deadlift 2x bodyweight"
- Goal progress indicators on dashboard
- Goal completion history

**Deliverable:** User can track body changes, set goals, and monitor progress toward them.

---

## Phase 7: Dashboard & Analytics
**Goal:** Make the dashboard the command center.

- Training overview: Sessions this week vs. last week, streak, discipline breakdown (pie chart)
- Weekly training volume by discipline (stacked bar chart)
- Sparring trend lines (self-ratings over time)
- Strength highlights: Recent PRs, volume trends
- Cardio highlights: Recent sessions, pace/endurance trends
- Body metrics snapshot: Current weight, trend direction
- Upcoming goals and deadlines
- "Areas to focus" — AI-generated suggestions based on training patterns
  - "You haven't trained wrestling in 3 weeks"
  - "Your sparring ground defense ratings are trending down"
  - "Cardio volume is 30% lower than last month"

**Deliverable:** Dashboard gives a complete picture of training status at a glance.

---

## Phase 8: PWA & Polish
**Goal:** Make it installable on phones and polish the experience.

- Configure next-pwa for Progressive Web App
- Add manifest.json with MMA tracker branding
- Offline support for viewing recent data
- Push notification reminders (optional): "You haven't trained today"
- Performance optimization: Lazy loading, image optimization
- Onboarding flow for new users: Pick your disciplines, set first goals
- Export data as CSV
- Final UI polish pass: Consistency check, animation tuning, accessibility

**Deliverable:** App feels native on mobile, polished, ready for real users.

---

## Future Ideas (Post-MVP)
- Fight camp planner: Plan structured training camps for upcoming fights
- Coach view: Coaches can monitor multiple fighters
- Video analysis: Upload technique clips with timestamp notes
- Community features: Share workouts, compare progress (opt-in)
- Wearable integration: Import heart rate data from Apple Watch/Garmin
- AI coach: Natural language training recommendations based on your data
