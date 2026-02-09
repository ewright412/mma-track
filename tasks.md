# MMA Tracker — Task Tracker

## Current Phase: Phases 1-3 Complete ✅ (DEPLOYED TO VERCEL)

### Setup
- [x] Initialize Next.js 14 with TypeScript, Tailwind, ESLint
- [x] Install dependencies: @supabase/supabase-js, @supabase/auth-helpers-nextjs, recharts, lucide-react
- [x] Configure Tailwind with custom dark theme colors
- [x] Set up project folder structure per CLAUDE.md architecture
- [x] Create base UI components: Button, Card, Input, Badge, Select, Slider, Modal
- [x] Create layout components: Sidebar, Header, MobileNav, PageContainer

### Database
- [ ] Create Supabase project and get credentials (MANUAL: User needs to create project)
- [x] Create database tables: training_sessions, session_techniques (SQL provided)
- [x] Set up Row Level Security (RLS) policies on all tables (SQL provided)
- [x] Create TypeScript types matching database schema (lib/types/training.ts)
- [x] Create Supabase client helper (lib/supabase/client.ts)
- [x] Create database query helpers (lib/supabase/queries.ts)

### Authentication
- [x] Build sign-up page with email/password
- [x] Build sign-in page
- [x] Build forgot password / reset flow
- [x] Auth middleware: Protect all app routes, redirect unauthenticated users
- [x] Auth context: Provide user info throughout app
- [x] Sign-out functionality

### Navigation & Layout
- [x] Sidebar navigation with icons: Dashboard, Training, Sparring, Cardio, Strength, Progress, Profile
- [x] Active route highlighting
- [x] Mobile: Bottom tab bar or hamburger menu
- [x] Responsive layout that works at 375px - 1920px
- [x] Page transition animations (subtle fade, 150ms)

### Deployment
- [x] Connect GitHub repo to Vercel
- [x] Set environment variables in Vercel (Supabase URL, Anon Key)
- [x] Verify production build + deploy works

### Phase 1 Exit Criteria
- [x] User can sign up, sign in, and sign out
- [x] All navigation tabs render (even if pages are empty)
- [x] App looks clean on both mobile and desktop
- [x] No TypeScript errors in production build
- [x] Deployed and accessible via Vercel URL ✅

---

## Phase 2 Tasks: Training Session Logger
**Status: COMPLETE** ✅

### Core Features
- [x] Training session form: Date, discipline, duration, intensity, notes (app/training/new/page.tsx)
- [x] Technique sub-items within a session (dynamic add/remove in form)
- [x] Quick-log presets for common sessions (duration quick buttons: 30, 45, 60, 90, 120 min)
- [x] Session history list view with filters (app/training/page.tsx)
- [x] Session detail/expand view (TrainingSessionCard component)
- [x] Edit and delete sessions (full CRUD operations)
- [x] Calendar heat map (training frequency) (TrainingHeatMap component)
- [x] Training streak counter (displayed in stats cards)

### Database & Types
- [x] SQL schema for training_sessions and session_techniques tables
- [x] TypeScript types (lib/types/training.ts)
- [x] Supabase query functions (lib/supabase/queries.ts)
- [x] MMA disciplines constants (lib/constants/disciplines.ts)

### Components Created
- [x] TrainingSessionCard - expandable session card with edit/delete
- [x] TrainingHeatMap - GitHub-style activity heat map (last 90 days)
- [x] Training form at /training/new with all fields and validation
- [x] Training history page with stats cards, filters, and session list
- [x] Edit training session page at /training/edit/[id] with pre-populated form

### Phase 2 Complete
- [x] Edit session functionality (app/training/edit/[id]/page.tsx)
- [x] Added updateSessionTechniques function to queries.ts
- [x] Build verified with no TypeScript errors
- [x] Phase 2 exit criteria met: Can log, view, edit, delete sessions with full detail

---

## Phase 3 Tasks: Sparring Log
**Status: COMPLETE** ✅

### Database & Types
- [x] Created sparring_sessions table with all fields (date, rounds, opponent level, notes, reflections)
- [x] Created sparring_rounds table with per-round ratings (4 categories: striking offense/defense, takedowns, ground game)
- [x] Row Level Security policies for both tables
- [x] TypeScript types for all sparring entities (lib/types/sparring.ts)
- [x] Constants for opponent skill levels and rating colors (lib/constants/sparring.ts)

### Database Functions
- [x] CRUD operations for sparring sessions (lib/supabase/sparringQueries.ts)
- [x] Get sparring stats (total sessions, rounds, average ratings by category)
- [x] Get sparring trends (rating averages over time for charts)
- [x] Detect focus areas algorithm (analyzes patterns and suggests improvements)

### Components & Pages
- [x] SparringSessionCard component with round breakdown and avg ratings
- [x] Sparring session form at /sparring/new with:
  - [x] Session details (date, opponent level, total rounds)
  - [x] Round-by-round ratings (4 sliders per round)
  - [x] "What went well" / "What to improve" reflection fields
  - [x] General notes field
- [x] Sparring history page at /sparring with:
  - [x] Stats cards (total sessions, rounds, avg ratings)
  - [x] Focus areas display (color-coded by priority)
  - [x] Trend chart (Recharts line graph showing all 4 categories over time)
  - [x] Session list with expandable cards
  - [x] Delete functionality

### Phase 3 Complete
- [x] Sparring log form with round-by-round self-rating
- [x] What went well / what to improve fields
- [x] Sparring history view
- [x] Trend lines on self-ratings over time (Recharts)
- [x] Focus area suggestions based on patterns (intelligent algorithm)
- [x] Phase 3 exit criteria met: Sparring sessions fully trackable with detailed trend analysis

---

## Phase 4 Tasks: Cardio Tracking
(Next phase - see plan.md for details)

- [ ] Cardio log form: Type, duration, distance, heart rate, intervals
- [ ] Pre-built cardio templates
- [ ] Weekly cardio summary
- [ ] Cardio progress charts

---

## Phase 5-8: See plan.md for details
(Tasks will be broken out when those phases begin)
