# MMA Tracker — Architecture Decisions Log

## Decision 001: Next.js + Supabase + Vercel
**Date:** 2026-02-08
**Context:** Need a full-stack solution a solo builder can manage with Claude Code.
**Decision:** Next.js for frontend + API routes, Supabase for auth/db/storage, Vercel for hosting.
**Reasoning:**
- Claude Code knows Next.js deeply — produces higher quality output
- Supabase gives auth + database + storage in one service with a generous free tier
- Vercel deploys directly from GitHub with zero config
- All three have excellent TypeScript support
- Total cost at MVP: $0/month

## Decision 002: Dark Theme, Athletic Aesthetic
**Date:** 2026-02-08
**Context:** App is for fighters/athletes. Should feel premium and focused.
**Decision:** Dark theme with red (#ef4444) as primary accent, clean and minimal.
**Reasoning:**
- Dark themes reduce eye strain during evening use (common for athletes checking after training)
- Red signals combat/MMA without being garish
- Clean aesthetic builds trust and feels professional
- Avoiding "AI slop" look with excessive gradients/glow effects

## Decision 003: PWA Instead of Native App
**Date:** 2026-02-08
**Context:** Want mobile app experience but building native iOS/Android is too complex for solo.
**Decision:** Build as Progressive Web App (PWA) — installable from browser, works offline.
**Reasoning:**
- One codebase serves web AND mobile
- No App Store approval process
- Claude Code can build this vs. needing React Native expertise
- PWAs can still send push notifications and work offline
- Can always go native later if demand warrants it

## Decision 004: Intensity on 1-10 Scale (Not RPE/Heart Rate)
**Date:** 2026-02-08
**Context:** Need a simple way for users to rate session difficulty.
**Decision:** Simple 1-10 slider for perceived intensity per session.
**Reasoning:**
- Most MMA gyms don't use heart rate monitors during class
- RPE (Rate of Perceived Exertion) is familiar in strength training but not common in MMA
- 1-10 is universally understood
- Can layer in heart rate data later for users who have wearables

---
(Add new decisions as they're made during development)
