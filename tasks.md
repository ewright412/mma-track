# MMA Tracker — Task Tracker

## Completed ✅
- Phases 1-10 (Foundation through Schedule)
- Custom dark dropdowns (replaced all native selects)
- Discipline list finalized (Boxing, Muay Thai, Kickboxing, Wrestling, BJJ, MMA)
- Onboarding colored selection states
- Stat cards standardized (4 per row)
- Heat map full width
- Sparring focus areas with color-coded ratings + trends
- Cardio duplicate data removed
- Pluralization fixed
- Profile avatar with initials
- Chart gray hover fix (submitted)
- Chart gray bar fix (submitted)
- Form UI polish (submitted)

---

## Prompt 1: Remaining Bug Fixes
**Status: COMPLETE ✅**
- [x] Action buttons single-line (not two-line stacked)
- [x] Strength volume chart color → red #ef4444
- [x] Body fat moved out of main profile cards
- [x] Build passes

## Prompt 2: Profile Expansion
**Status: COMPLETE ✅**
- [x] Display Name, Weight Class, Home Gym, Stance, Training Since, Bio fields
- [x] Store in Supabase user metadata
- [x] Show display_name + weight class badge on profile
- [x] Stats summary row (Sessions, Hours, Streak, PRs)
- [x] Build passes

## Prompt 3: Goals Functionality
**Status: COMPLETE ✅**
- [x] Database migration for target_value, target_unit, current_value, target_date
- [x] Updated goal creation form with all fields
- [x] GoalCard with progress bar, percentage, days remaining
- [x] "Update Progress" inline input
- [x] Weight goals auto-fill from body_metrics
- [x] Goals onboarding: custom goal input + colored category badges
- [x] Build passes

## Prompt 4: Notebook — Database + Queries
**Status: COMPLETE ✅**
- [x] Migration: notes + note_tags tables with RLS
- [x] TypeScript types (notebook.ts)
- [x] Query functions (notebookQueries.ts)
- [x] Build passes

## Prompt 5: Notebook — UI + Pages
**Status: COMPLETE ✅**
- [x] Notebook list page (/notebook)
- [x] Note editor (new + edit/[id])
- [x] Search + filters
- [x] Added to sidebar + mobile nav
- [x] Build passes

## Prompt 6: Notebook — Integration + Techniques
**Status: COMPLETE ✅**
- [x] Notes section in TrainingSessionCard
- [x] Post-session "What did you learn?" prompt
- [x] Note option in QuickLogFAB
- [x] Technique Library tab with grouped tags
- [x] Build passes

## Prompt 7: Fighter Profile + Achievements
**Status: NOT STARTED**
- [ ] Fighter Profile Card redesign
- [ ] Badges migration + constants + queries
- [ ] Achievements grid on profile
- [ ] Auto-check badges on session save
- [ ] Celebration toast for new badges
- [ ] Build passes

## Prompt 8: Share Card + Final Polish
**Status: NOT STARTED**
- [ ] Shareable weekly summary (1080x1080 PNG)
- [ ] Data export verification
- [ ] Full app verification pass
- [ ] Build passes