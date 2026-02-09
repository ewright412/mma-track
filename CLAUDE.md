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
Boxing, Muay Thai, Kickboxing, Wrestling, Brazilian Jiu-Jitsu, MMA

## Current Phase
See tasks.md for current implementation phase and checklist.

## Known Issues
(None yet — update as issues are discovered)
