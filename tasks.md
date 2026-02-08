# MMA Tracker — Task Tracker

## Current Phase: Phase 1 — Foundation & Authentication

### Setup
- [ ] Initialize Next.js 14 with TypeScript, Tailwind, ESLint
- [ ] Install dependencies: @supabase/supabase-js, @supabase/auth-helpers-nextjs, recharts, lucide-react
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
