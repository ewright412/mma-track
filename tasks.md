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
**Status: NOT STARTED**
- [ ] Action buttons single-line (not two-line stacked)
- [ ] Strength volume chart color → red #ef4444
- [ ] Body fat moved out of main profile cards
- [ ] Build passes

## Prompt 2: Profile Expansion
**Status: NOT STARTED**
- [ ] Display Name, Weight Class, Home Gym, Stance, Training Since, Bio fields
- [ ] Store in Supabase user metadata
- [ ] Show display_name + weight class badge on profile
- [ ] Stats summary row (Sessions, Hours, Streak, PRs)
- [ ] Build passes

## Prompt 3: Goals Functionality
**Status: NOT STARTED**
- [ ] Database migration for target_value, target_unit, current_value, target_date
- [ ] Updated goal creation form with all fields
- [ ] GoalCard with progress bar, percentage, days remaining
- [ ] "Update Progress" inline input
- [ ] Weight goals auto-fill from body_metrics
- [ ] Goals onboarding: custom goal input + colored category badges
- [ ] Build passes

## Prompt 4: Notebook — Database + Queries
**Status: NOT STARTED**
- [ ] Migration: notes + note_tags tables with RLS
- [ ] TypeScript types (notebook.ts)
- [ ] Query functions (notebookQueries.ts)
- [ ] Build passes

## Prompt 5: Notebook — UI + Pages
**Status: NOT STARTED**
- [ ] Notebook list page (/notebook)
- [ ] Note editor (new + edit/[id])
- [ ] Search + filters
- [ ] Added to sidebar + mobile nav
- [ ] Build passes

## Prompt 6: Notebook — Integration + Techniques
**Status: NOT STARTED**
- [ ] Notes section in TrainingSessionCard
- [ ] Post-session "What did you learn?" prompt
- [ ] Note option in QuickLogFAB
- [ ] Technique Library tab with grouped tags
- [ ] Build passes

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