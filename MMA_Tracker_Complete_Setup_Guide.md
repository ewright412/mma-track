# MMA Progress Tracker — Complete Claude Code Setup Guide

---

## HOW THIS GUIDE WORKS

This document gives you everything you need to build your MMA progress tracker app optimally with Claude Code. It contains:

1. **Setup Instructions** — What to do before writing a single line of code
2. **CLAUDE.md** — Copy-paste this into your project root (Claude reads it every session)
3. **plan.md** — Your full phased implementation roadmap
4. **tasks.md** — Phase-by-phase checklist Claude will reference
5. **Phase Prompts** — The exact prompts to give Claude Code at each step
6. **Best Practices Cheat Sheet** — Rules to follow throughout the build

---

## STEP 1: PROJECT SETUP (Do This First)

Open VS Code, open the terminal (`Ctrl + Shift + backtick`), then run:

```powershell
mkdir C:\Projects\mma-tracker
cd C:\Projects\mma-tracker
claude
```

Once Claude Code is running, your very first prompt should be:

```
Initialize a git repository. Create the following project files from the content I'm about to give you:
- CLAUDE.md (project root)
- plan.md (project root)  
- tasks.md (project root)
- decisions.md (project root)

Don't write any application code yet. Just create these files.
```

Then paste each file from the sections below. After all files are created:

```
Commit all files with message "Initial project setup: CLAUDE.md, plan, tasks, decisions"
```

Then `/clear` to start fresh with full context for Phase 1.

---

## STEP 2: CLAUDE.md (Copy This Into Your Project Root)

```markdown
# MMA Progress Tracker

## Overview
A web app (and eventually mobile-friendly PWA) for MMA fighters and enthusiasts to track their training progress across all disciplines — striking, grappling, wrestling, cardio, strength — with the goal of systematic improvement. Think "MyFitnessPal meets Fight Camp meets a coach's notebook."

## Tech Stack
- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Backend/DB: Supabase (auth, PostgreSQL database, storage)
- Charts: Recharts (progress visualization)
- Hosting: Vercel
- PWA: next-pwa for mobile installability

## Architecture
```
/app              — Next.js App Router pages
  /dashboard      — Main dashboard/home
  /training       — Log training sessions
  /cardio         — Cardio tracking
  /strength       — Gym/strength tracking
  /progress       — Charts, analytics, trends
  /profile        — User profile and goals
  /api            — API routes
/components       — Reusable UI components
  /ui             — Base components (buttons, cards, inputs)
  /training       — Training-specific components
  /charts         — Chart/visualization components
  /layout         — Navigation, sidebar, headers
/lib              — Utilities, helpers, constants
  /supabase       — Supabase client and helpers
  /types          — TypeScript type definitions
  /utils          — Helper functions
  /constants      — MMA disciplines, exercise lists, etc.
/public           — Static assets, icons
```

## Commands
- `npm run dev` — Start development server (localhost:3000)
- `npm run build` — Production build
- `npm run lint` — Run ESLint
- `npx supabase db push` — Push database migrations

## Database Schema (Supabase/PostgreSQL)
- users — Auth managed by Supabase Auth
- training_sessions — Date, discipline, duration, intensity, notes
- session_techniques — Techniques practiced per session (linked to training_sessions)
- cardio_logs — Type, duration, distance, heart_rate, intervals
- strength_logs — Exercise, sets, reps, weight, RPE
- body_metrics — Weight, body_fat (optional), date
- goals — Target description, target_date, status, category
- sparring_logs — Opponent level, rounds, notes, self_rating

## Coding Rules
- IMPORTANT: Prefer small, focused changes. Do NOT refactor code I didn't ask you to change.
- Always use TypeScript with strict types. No `any`.
- Use Tailwind for ALL styling. No separate CSS files.
- Mobile-first responsive design — test at 375px width first, then scale up.
- All database queries go through /lib/supabase/ helper functions, never inline.
- Error handling on every async operation. Show user-friendly error messages.
- Use loading skeletons, not spinners, for data fetching states.
- Dates stored in ISO 8601 format. Display in user's local timezone.
- IMPORTANT: After making changes, always run `npm run build` to verify no TypeScript errors.

## Design System
- Dark theme primary: Background #0f0f13, Cards #1a1a24, Borders rgba(255,255,255,0.08)
- Accent: Red #ef4444 (MMA/combat feel), Secondary blue #3b82f6 (progress/positive)
- Success: #22c55e, Warning: #f59e0b
- Font: Inter (system font fallback: -apple-system, sans-serif)
- Border radius: 8px cards, 6px buttons, 4px inputs
- Spacing: 4px base unit (p-1 = 4px, p-2 = 8px, etc.)
- Subtle transitions on all interactive elements (150ms ease-out)
- NO flashy gradients or neon glows. Clean, dark, athletic aesthetic.

## MMA Disciplines (Constants)
Boxing, Muay Thai, Kickboxing, Wrestling, Brazilian Jiu-Jitsu, Judo, MMA/Sparring, Submission Grappling/No-Gi

## Current Phase
See tasks.md for current implementation phase and checklist.

## Known Issues
(None yet — update as issues are discovered)
```

---

## STEP 3: plan.md (Copy This Into Your Project Root)

```markdown
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
```

---

## STEP 4: tasks.md (Copy This Into Your Project Root)

```markdown
# MMA Tracker — Task Tracker

## Current Phase: Phase 1 — Foundation & Authentication

### Setup
- [ ] Initialize Next.js 14 with TypeScript, Tailwind, ESLint
- [ ] Install dependencies: @supabase/supabase-js, @supabase/auth-helpers-nextjs, recharts
- [ ] Configure Tailwind with custom dark theme colors
- [ ] Set up project folder structure per CLAUDE.md architecture
- [ ] Create base UI components: Button, Card, Input, Badge, Select, Slider, Modal
- [ ] Create layout components: Sidebar, Header, MobileNav, PageContainer

### Database
- [ ] Create Supabase project and get credentials
- [ ] Create database tables: training_sessions, session_techniques, cardio_logs, strength_logs, body_metrics, goals, sparring_logs
- [ ] Set up Row Level Security (RLS) policies on all tables
- [ ] Create TypeScript types matching database schema
- [ ] Create Supabase client helper (lib/supabase/client.ts)
- [ ] Create database query helpers (lib/supabase/queries.ts)

### Authentication
- [ ] Build sign-up page with email/password
- [ ] Build sign-in page
- [ ] Build forgot password / reset flow
- [ ] Auth middleware: Protect all app routes, redirect unauthenticated users
- [ ] Auth context: Provide user info throughout app
- [ ] Sign-out functionality

### Navigation & Layout
- [ ] Sidebar navigation with icons: Dashboard, Training, Sparring, Cardio, Strength, Progress, Profile
- [ ] Active route highlighting
- [ ] Mobile: Bottom tab bar or hamburger menu
- [ ] Responsive layout that works at 375px - 1920px
- [ ] Page transition animations (subtle fade, 150ms)

### Deployment
- [ ] Connect GitHub repo to Vercel
- [ ] Set environment variables in Vercel (Supabase URL, Anon Key)
- [ ] Verify production build + deploy works

### Phase 1 Exit Criteria
- [ ] User can sign up, sign in, and sign out
- [ ] All navigation tabs render (even if pages are empty)
- [ ] App looks clean on both mobile and desktop
- [ ] No TypeScript errors in production build
- [ ] Deployed and accessible via Vercel URL

---

## Phase 2 Tasks: Training Session Logger
(Unlock after Phase 1 complete)

- [ ] Training session form: Date, discipline, duration, intensity, notes
- [ ] Technique sub-items within a session
- [ ] Quick-log presets for common sessions
- [ ] Session history list view with filters
- [ ] Session detail/expand view
- [ ] Edit and delete sessions
- [ ] Calendar heat map (training frequency)
- [ ] Training streak counter
- [ ] Phase 2 exit: Can log, view, edit, delete sessions with full detail

---

## Phase 3 Tasks: Sparring Log
(Unlock after Phase 2 complete)

- [ ] Sparring log form with round-by-round self-rating
- [ ] What went well / what to improve fields
- [ ] Sparring history view
- [ ] Trend lines on self-ratings over time
- [ ] Focus area suggestions based on patterns
- [ ] Phase 3 exit: Sparring sessions fully trackable with trend analysis

---

## Phase 4-8: See plan.md for details
(Tasks will be broken out when those phases begin)
```

---

## STEP 5: decisions.md (Copy This Into Your Project Root)

```markdown
# MMA Tracker — Architecture Decisions Log

## Decision 001: Next.js + Supabase + Vercel
**Date:** [Today]
**Context:** Need a full-stack solution a solo builder can manage with Claude Code.
**Decision:** Next.js for frontend + API routes, Supabase for auth/db/storage, Vercel for hosting.
**Reasoning:**
- Claude Code knows Next.js deeply — produces higher quality output
- Supabase gives auth + database + storage in one service with a generous free tier
- Vercel deploys directly from GitHub with zero config
- All three have excellent TypeScript support
- Total cost at MVP: $0/month

## Decision 002: Dark Theme, Athletic Aesthetic
**Date:** [Today]
**Context:** App is for fighters/athletes. Should feel premium and focused.
**Decision:** Dark theme with red (#ef4444) as primary accent, clean and minimal.
**Reasoning:**
- Dark themes reduce eye strain during evening use (common for athletes checking after training)
- Red signals combat/MMA without being garish
- Clean aesthetic builds trust and feels professional
- Avoiding "AI slop" look with excessive gradients/glow effects

## Decision 003: PWA Instead of Native App
**Date:** [Today]
**Context:** Want mobile app experience but building native iOS/Android is too complex for solo.
**Decision:** Build as Progressive Web App (PWA) — installable from browser, works offline.
**Reasoning:**
- One codebase serves web AND mobile
- No App Store approval process
- Claude Code can build this vs. needing React Native expertise
- PWAs can still send push notifications and work offline
- Can always go native later if demand warrants it

## Decision 004: Intensity on 1-10 Scale (Not RPE/Heart Rate)
**Date:** [Today]  
**Context:** Need a simple way for users to rate session difficulty.
**Decision:** Simple 1-10 slider for perceived intensity per session.
**Reasoning:**
- Most MMA gyms don't use heart rate monitors during class
- RPE (Rate of Perceived Exertion) is familiar in strength training but not common in MMA
- 1-10 is universally understood
- Can layer in heart rate data later for users who have wearables

(Add new decisions as they're made during development)
```

---

## STEP 6: THE PHASE PROMPTS

These are the exact prompts to give Claude Code at each phase. Copy-paste them when you're ready for each phase.

### Phase 1 Prompt:

```
Read CLAUDE.md, plan.md, and tasks.md to understand the full project context.

We're implementing Phase 1: Foundation & Authentication.

Do this in order:

1. Initialize Next.js 14 with TypeScript and Tailwind CSS. Use the App Router.
2. Install these dependencies: @supabase/supabase-js, @supabase/auth-helpers-nextjs, recharts, lucide-react (for icons)
3. Set up the folder structure exactly as defined in CLAUDE.md.
4. Configure Tailwind with our custom dark theme colors from CLAUDE.md's Design System section.
5. Create the base UI components: Button, Card, Input, Badge, Select, Slider, Modal — all using Tailwind, all supporting dark theme, all typed with TypeScript.
6. Create the app layout: Sidebar navigation (desktop) with icons for each section, bottom tab bar (mobile), header with user info. Use lucide-react icons.
7. Create placeholder pages for each route: /dashboard, /training, /sparring, /cardio, /strength, /progress, /profile — each just showing the page name for now.
8. Make sure navigation works — clicking each tab/link shows the correct page.

Don't set up Supabase auth yet — that's the next step. Focus on getting the UI shell perfect first.

Run npm run dev and verify everything works. Run npm run build and fix any TypeScript errors.

Check off completed items in tasks.md as you go.
```

### After the shell is built, in a NEW session (`/clear` first):

```
Read CLAUDE.md, plan.md, and tasks.md.

Continuing Phase 1. The UI shell and navigation are complete.

Now implement the database and authentication:

1. Create a lib/supabase/client.ts that initializes the Supabase client using environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY).

2. Create TypeScript types for all database tables defined in CLAUDE.md's Database Schema section. Put them in lib/types/database.ts.

3. Create the auth pages:
   - /auth/signin — Email + password sign in form, link to sign up, link to forgot password
   - /auth/signup — Email + password sign up form, link to sign in
   - /auth/forgot-password — Email input to send reset link
   - All auth pages should be clean, centered on the page, dark theme, with our red accent for the primary button.

4. Create auth middleware that:
   - Redirects unauthenticated users to /auth/signin
   - Redirects authenticated users away from /auth pages to /dashboard
   - Provides the current user throughout the app via context

5. Add a user menu in the header with sign-out functionality.

6. Create lib/supabase/queries.ts with placeholder query functions for each table (we'll implement these in Phase 2).

NOTE: For the actual Supabase project setup (creating tables, RLS policies), give me the SQL I need to run in the Supabase dashboard SQL editor. Don't try to run it from here.

Run npm run build to verify no errors. Update tasks.md.
```

### Phase 2 Prompt (after Phase 1 is complete, `/clear` first):

```
Read CLAUDE.md, plan.md, and tasks.md.

We're starting Phase 2: Training Session Logger. This is the core feature.

Implement in this order:

1. Build the "Log Training Session" form at /training/new:
   - Date picker (defaults to today)
   - Discipline dropdown (from CLAUDE.md constants: Boxing, Muay Thai, Kickboxing, Wrestling, BJJ, Judo, MMA/Sparring, Submission Grappling)
   - Duration (minutes) — number input with quick buttons: 30, 45, 60, 90, 120
   - Intensity slider (1-10) with color gradient (green → yellow → red)
   - Techniques practiced — dynamic list where user can add/remove technique entries (name + optional notes)
   - Session notes — textarea
   - Save button that writes to Supabase training_sessions + session_techniques tables

2. Create the Supabase query functions for training sessions in lib/supabase/queries.ts:
   - createTrainingSession()
   - getTrainingSessions(filters)
   - getTrainingSessionById(id)
   - updateTrainingSession(id, data)
   - deleteTrainingSession(id)

3. Build the training history view at /training:
   - List of past sessions, most recent first
   - Each card shows: Date, discipline (with color badge), duration, intensity indicator, technique count
   - Filter by: Discipline, date range, intensity range
   - Click a session to expand and see full details
   - Edit and delete buttons on each session

4. Build a calendar heat map component showing training frequency:
   - Similar to GitHub's contribution graph
   - Darker squares = more training that day
   - Shows last 3 months by default
   - Clicking a day shows that day's sessions

5. Training streak counter on the training page:
   - "Current streak: X days"
   - Logic: Counts consecutive days with at least one logged session

Give me the SQL for any new tables or modifications needed in Supabase.

Run npm run build after each major feature. Update tasks.md.
```

### Phase 3-8 Prompts:

Follow the same pattern:
1. `/clear` to start a fresh session
2. "Read CLAUDE.md, plan.md, and tasks.md."
3. "We're starting Phase X: [Name]. Implement in this order: [list specifics from plan.md]"
4. "Run npm run build. Update tasks.md."

---

## STEP 7: BEST PRACTICES CHEAT SHEET

### The Rules (Follow These Every Session)

| Rule | Why |
|------|-----|
| **One phase per session** | Prevents context rot. Fresh context = better code. |
| **`/clear` between phases** | Resets conversation while keeping CLAUDE.md loaded. |
| **Always start with "Read CLAUDE.md, plan.md, and tasks.md"** | Grounds Claude in your project context every time. |
| **Build → Test → Fix → Move On** | Never move to the next feature until the current one works. |
| **"Run npm run build"** | Forces Claude to catch TypeScript errors before you do. |
| **Update tasks.md** | Keeps your progress tracked and gives Claude awareness of what's done. |
| **Small prompts > giant prompts** | "Add the calendar heat map component" beats "add calendar, streak, filters, and charts" |
| **If it breaks, describe the error** | Screenshot the error or paste it. Claude fixes things faster with the exact error. |
| **Use `/rewind` if Claude messes up** | Rolls back to before the last set of changes. |
| **Commit after each working feature** | "Commit with message: Add training session form with Supabase integration" |

### Prompting Patterns That Work

**For new features:**
```
"Add [specific feature]. It should [specific behavior]. 
Use [specific approach] consistent with the rest of the app. 
Put it in [specific location]. Run npm run build when done."
```

**For bug fixes:**
```
"[Paste the error or describe the bug]. This happens when 
[specific trigger]. The expected behavior is [what should happen]. 
Fix it and verify by [test step]."
```

**For UI tweaks:**
```
"The [component] doesn't look right. [Specific issue: too much spacing, 
wrong color, not responsive on mobile]. Fix it to match our design 
system in CLAUDE.md."
```

**For refactoring (only when needed):**
```
"The [component/file] has gotten messy. Refactor it to [specific improvement] 
but don't change any functionality. Run the build to verify nothing broke."
```

### What NOT To Do

- ❌ Don't ask for 5+ features in one prompt
- ❌ Don't skip testing ("just build it all and we'll test later")
- ❌ Don't let the conversation go over 20+ exchanges without `/clear`
- ❌ Don't say "make it look good" — be specific about what "good" means
- ❌ Don't build Phase 3 features while Phase 2 is broken
- ❌ Don't forget to commit working code before starting something new

---

## STEP 8: SUPABASE SETUP GUIDE

Before starting Phase 1, you need a Supabase project:

1. Go to **supabase.com** and sign up (free)
2. Click **"New Project"** — name it "mma-tracker"
3. Pick a strong database password (save it somewhere)
4. Wait for it to provision (~2 minutes)
5. Go to **Settings → API** and copy:
   - `Project URL` → This becomes NEXT_PUBLIC_SUPABASE_URL
   - `anon public key` → This becomes NEXT_PUBLIC_SUPABASE_ANON_KEY
6. Create a `.env.local` file in your project root with these values

When Claude Code gives you SQL for creating tables, go to **Supabase Dashboard → SQL Editor** and paste + run it there.

---

## STEP 9: VERCEL DEPLOYMENT

After Phase 1 is working locally:

1. Push your project to GitHub (Claude Code can help: "Initialize a git repo and push to GitHub")
2. Go to **vercel.com** and sign up (free, use your GitHub account)
3. Click **"Import Project"** → Select your mma-tracker repo
4. Add environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
5. Click **Deploy**

Every future `git push` will auto-deploy.

---

## QUICK REFERENCE: SESSION WORKFLOW

Every time you sit down to work on this project:

```
1. Open VS Code → Open mma-tracker folder
2. Open terminal → type: claude
3. First message: "Read CLAUDE.md, plan.md, and tasks.md. 
   What's the current status? What should we work on next?"
4. Claude tells you where you left off
5. Give it the specific task for this session
6. Test as you go
7. When the feature works: "Commit with message: [description]"
8. When you're done for the day: "Update tasks.md with current progress"
9. /clear or close the session
```

That's it. Follow this system and you'll have a working MMA tracker in a few weeks of part-time building.
