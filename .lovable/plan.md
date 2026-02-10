

# CSV Upload + Carry-Forward + Iqamath Offsets + Hijri Control

## Overview

Major architecture change: replace per-day manual entry with a CSV-based carry-forward system, rule-based Iqamath offset generation, and admin-controlled Hijri date management with moon sighting confirmation.

---

## 1. New Database Tables

### Table: `prayer_time_changes`
Stores CSV change-point rows (NOT daily entries).

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | auto-generated |
| effective_from | date (unique) | when this change takes effect |
| subah_adhan | text, nullable | empty = no change |
| sunrise | text, nullable | |
| luhar_adhan | text, nullable | |
| asr_adhan | text, nullable | |
| magrib_adhan | text, nullable | |
| isha_adhan | text, nullable | |
| created_at | timestamptz | auto |

RLS: Public read/insert/update/delete (same as current `prayer_times`).

### Table: `hijri_date`
Stores the current Hijri date state (single row, admin-controlled).

| Column | Type | Notes |
|---|---|---|
| id | uuid (PK) | auto-generated |
| hijri_year | integer | e.g. 1447 |
| hijri_month | integer | 1-12 |
| hijri_day | integer | 1-30 |
| last_updated | date | Gregorian date of last change |
| created_at | timestamptz | auto |

RLS: Public read/update/insert.

The existing `prayer_times` table remains untouched (unused going forward).

---

## 2. Carry-Forward + Iqamath Offset Logic

### New hook: `usePrayerTimes.ts` (rewrite)

**Step 1 -- Build today's Adhan times:**
1. Fetch all rows from `prayer_time_changes` where `effective_from <= today`
2. Sort ascending by `effective_from`
3. Merge: for each field, if value is non-null/non-empty, overwrite; otherwise keep previous
4. Result = today's Adhan + Sunrise times

**Step 2 -- Generate Iqamath via fixed offsets:**

| Prayer | Rule |
|---|---|
| Subah | Adhan + 30 min |
| Luhar | Adhan + 15 min |
| Asr | Adhan + 15 min |
| Magrib | Adhan + 10 min |
| Isha | Adhan + 15 min |

- Parse Adhan time string, add minutes, format back to `HH:MM AM/PM`
- If Adhan is missing, Iqamath is NOT shown
- No rounding, no seasonal adjustment

**Step 3 -- Fetch Hijri date:**
- Read single row from `hijri_date` table
- Format as "Day Month Year" for display (e.g. "15 Sha'ban 1447")
- Hijri month names mapped client-side

### New utility: `src/lib/iqamathOffset.ts`
- `addMinutesToTime(timeStr: string, minutes: number): string`
- Parses HH:MM AM/PM, adds offset, returns HH:MM AM/PM

---

## 3. Admin Page -- Complete Rewrite

Two sections with tabs:

### Tab 1: CSV Upload
1. **File input** -- accepts `.csv` only
2. **Strict validation** (client-side, in `src/lib/csvParser.ts`):
   - Header must match exactly: `effective_from,subah_adhan,sunrise,luhar_adhan,asr_adhan,magrib_adhan,isha_adhan`
   - `effective_from` must be valid YYYY-MM-DD
   - First row must be `2026-01-01`
   - Time values must match `HH:MM AM` or `HH:MM PM` or empty
   - No duplicate `effective_from` dates
   - Auto-sort by date ascending
   - On failure: show clear error, reject entire file
3. **Preview table** -- shows parsed rows with validation status
4. **Confirm and Save** -- deletes all existing `prayer_time_changes` rows, inserts new CSV data
5. **Current data view** -- shows existing records count

### Tab 2: Hijri Control Panel
1. **Current Hijri date display** -- shows year/month/day
2. **Daily increment button** -- admin clicks to advance day by 1
3. **Day 29 alert** -- when `hijri_day = 29`, show prominent alert:
   - "Hijri month day 29 reached. Moon sighting not confirmed."
   - Two buttons:
     - "Moon Sighted" -- sets day to 1, increments month (and year if month was 12)
     - "Moon Not Sighted" -- sets day to 30
4. **Manual override** -- inputs for year/month/day with save button
5. No auto-calculation, no internet moon data

Password gate remains unchanged.

---

## 4. User Page Changes

### `Index.tsx` updates:
- Display Hijri date from `hijri_date` table (formatted as "Day MonthName Year")
- Everything else stays the same -- `NextPrayerCard` and `PrayerRow` components unchanged

### Hijri month name mapping (client-side constant):
```text
1: Muharram, 2: Safar, 3: Rabi ul-Awwal, 4: Rabi ul-Akhir,
5: Jumada ul-Ula, 6: Jumada ul-Akhira, 7: Rajab, 8: Sha'ban,
9: Ramadan, 10: Shawwal, 11: Dhul Qa'dah, 12: Dhul Hijjah
```

---

## 5. Files Summary

| File | Action |
|---|---|
| `supabase/migrations/new.sql` | Create `prayer_time_changes` + `hijri_date` tables with RLS |
| `src/lib/csvParser.ts` | New: CSV parsing + strict validation |
| `src/lib/iqamathOffset.ts` | New: time offset utility |
| `src/hooks/usePrayerTimes.ts` | Rewrite: carry-forward merge + iqamath offsets |
| `src/hooks/useHijriDate.ts` | New: fetch/update Hijri date from DB |
| `src/pages/Admin.tsx` | Complete rewrite: CSV upload tab + Hijri control tab |
| `src/pages/Index.tsx` | Minor: use Hijri hook for date display |
| `.lovable/plan.md` | Update with new architecture |

### Files NOT changed
- `src/components/NextPrayerCard.tsx` -- no changes
- `src/components/PrayerRow.tsx` -- no changes
- `src/hooks/useClock.ts` -- no changes
- `src/App.tsx` -- no changes

