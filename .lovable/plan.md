

# Hijri Control System + Ramadan Theme + Friday Banner

## Overview

This plan upgrades the Hijri calendar from a manually-incremented system to an **auto-incrementing** mosque-controlled system, adds a **Ramadan special theme** that auto-activates during month 9, and a **Jumu'ah Mubarak banner** on Fridays.

Current state in database: `23 Sha'ban 1447 AH` (last updated 2026-02-13).

---

## Part 1: Auto-Increment Hijri Date on App Load

**Current behavior:** Admin must manually press "Advance Hijri Day by 1" every day.

**New behavior:** On every app load, the hook compares today's Gregorian date with `last_updated`. If days have passed, it auto-increments `hijri_day` by the difference, respecting month rollover (max 30 days per month). No admin action needed for daily increments.

**File:** `src/hooks/useHijriDate.ts`

- After fetching the Hijri state, calculate `daysDiff = today - last_updated`
- If `daysDiff > 0`, loop and increment day-by-day (respecting 30-day max and month/year rollover)
- Auto-save the new state to the database
- If the system was offline for multiple days, all missed days are added correctly
- Day 29 special handling: if auto-increment lands on day 29, it pauses moon-sighting logic for admin (the day still increments to 30 next day if admin doesn't act)
- Day 30 always auto-rolls to next month (no admin needed)

**Edge case:** If admin forgets to confirm moon on day 29, the system increments to 30 next day, then auto-rolls to month+1 on the day after that.

---

## Part 2: Restricted Admin Hijri Controls

**Current behavior:** Admin can freely increment, override year/month/day, and use moon sighting buttons at any time.

**New behavior:** Admin panel shows moon sighting controls ONLY when `hijri_day == 29`. The manual override is replaced with a confirmation modal. The "Advance Day" button is removed (auto-increment handles it). A "Decide Later" button is added alongside Moon Sighted / Not Sighted.

**File:** `src/pages/Admin.tsx` (HijriControlTab)

- Remove the manual "Advance Hijri Day by 1" button
- Remove the free-form manual override (year/month/day inputs)
- Show 3 buttons only when day == 29: Moon Sighted, Moon Not Sighted, Decide Later
- Add an admin action log table (new database table `hijri_admin_log`)
- When day != 29, show a read-only display of the current Hijri date with a message: "Auto-increment active. Admin action available on day 29."

**Database migration:** Create `hijri_admin_log` table:
```
id (uuid, PK)
action (text) -- e.g. "moon_sighted", "moon_not_sighted", "decide_later"
hijri_date_snapshot (text) -- e.g. "29 Sha'ban 1447"
created_at (timestamptz)
```
With RLS: public insert and select (matches existing pattern).

---

## Part 3: Ramadan Auto-Theme

**Current behavior:** User picks a theme color in Settings; it persists in localStorage.

**New behavior:** When `hijri_month == 9` (Ramadan), the app automatically overrides the user's theme with a special "Ramadan" theme. When Ramadan ends, the user's previous selection is restored. The user's original preference stays saved in localStorage and resumes after Ramadan.

**File:** `src/hooks/useTheme.tsx`

- Add a new `ramadan` entry to `THEME_VARS` with:
  - Background: dark green (`152 70% 10%`)
  - Primary: gold (`43 80% 50%`)
  - Accent: warm gold
  - Card: dark green tint
- Accept an optional `isRamadan` boolean prop/context
- When `isRamadan` is true, force the Ramadan theme variables regardless of user selection
- The Settings page will show the user's saved preference but display a note: "Ramadan theme is active"

**File:** `src/index.css`

- Add `.theme-ramadan` class with the Ramadan color scheme
- Add a subtle crescent icon effect in the header (CSS pseudo-element or inline SVG)

**File:** `src/pages/Index.tsx`

- Pass `hijri.hijri_month` to the theme system
- Add a subtle crescent moon icon in the header during Ramadan
- Add a soft glow effect on prayer time cards during Ramadan

---

## Part 4: Friday Jumu'ah Banner

**New feature:** On Fridays (Gregorian), show a dismissible banner at the top of the home page.

**File:** `src/components/JumuahBanner.tsx` (new)

- Shows "Jumu'ah Mubarak" with the current Hijri date below
- Accent-colored background with fade-in animation
- Auto-hides after 10 seconds OR user can tap X to close
- Only renders when `new Date().getDay() === 5` (Friday)

**File:** `src/pages/Index.tsx`

- Import and render `JumuahBanner` at the top of the page
- Pass the formatted Hijri date string

---

## Part 5: Updated Month Names

**File:** `src/hooks/useHijriDate.ts`

Update the month names to match the requested format:
```
1: Muharram, 2: Safar, 3: Rabi al-Awwal, 4: Rabi al-Thani,
5: Jumada al-Ula, 6: Jumada al-Thani, 7: Rajab, 8: Shaaban,
9: Ramadan, 10: Shawwal, 11: Dhul Qadah, 12: Dhul Hijjah
```

Add "AH" suffix to display format: `29 Shaaban 1447 AH`

---

## Files Summary

| File | Action |
|---|---|
| `src/hooks/useHijriDate.ts` | Add auto-increment logic, update month names, add AH suffix |
| `src/pages/Admin.tsx` | Restrict to day-29-only controls, add logging, remove manual override |
| `src/hooks/useTheme.tsx` | Add Ramadan theme vars, accept isRamadan override |
| `src/index.css` | Add `.theme-ramadan` CSS variables |
| `src/components/JumuahBanner.tsx` | New: Friday banner component |
| `src/pages/Index.tsx` | Add Jumuah banner, pass Ramadan state to theme, crescent icon |
| `src/pages/Settings.tsx` | Show "Ramadan theme active" note when applicable |
| Database migration | Create `hijri_admin_log` table |

