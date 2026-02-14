# Prayer App Major Update: Smart Card, Hadith Banner, Location System, Bug Fixes

## Bug Fix 1: Push Notifications

**Problem:** The notification check uses `diff === 5` (exact minute match). Since the interval runs every 30 seconds, if the check fires at 4m 45s and then 5m 15s, it skips the exact 5-minute mark entirely.

**Fix:** Change the condition to a range: `diff <= 5 && diff > 0` and track fired notifications to prevent duplicates. Also use the service worker's `showNotification` API instead of `new Notification()` for better PWA support.

**File:** `src/hooks/useNotifications.ts`

---

## Bug Fix 2: Hijri Date Auto-Increment

**Current state:** Database shows `24 Shaaban 1447, last_updated: 2026-02-14`. The code logic is correct but the service worker caches old pages aggressively, preventing fresh code from running on return visits.

**Fix:** Update the service worker to use a network-first strategy for HTML/JS and bump the cache version. Also add a check interval so the Hijri date updates at midnight without requiring a page reload.

**File:** `public/sw.js`, `src/hooks/useHijriDate.ts`

---

## Feature 1: Three-Phase Prayer Card

Replace the current single-state "Next Prayer" card with a three-phase smart card:

```text
PHASE 1: Before Adhan
+----------------------------+
| NEXT: Luhar                |
| Adhan: 12:30 PM            |
| Countdown: in 45m          |
+----------------------------+

PHASE 2: After Adhan, Before Iqamah  
+----------------------------+
| Iqamah in 12m              |
| Luhar Iqamah: 12:45 PM     |
|                             |
| Prepare for Sunnah Salah    |
| Use Miswak before prayer    |
+----------------------------+

PHASE 3: After Iqamah
-> Automatically shows Phase 1 for next prayer
```

### Logic changes needed:

- `getNextPrayerIndex` currently only checks if adhan time > current time. Must be reworked to consider iqamah time too:
  - If `current < adhan` --> Phase 1 (countdown to adhan)
  - If `adhan <= current < iqamah` --> Phase 2 (countdown to iqamah)
  - If `current >= iqamah` --> skip to next prayer
- Add a new `getPrayerPhase()` function returning `'before-adhan' | 'before-iqamah' | 'passed'`
- Update `getCountdown()` to return countdown to either adhan or iqamah based on phase
- Redesign `NextPrayerCard` component for both phases with the sunnah subtitle in Phase 2

**Files:** `src/hooks/usePrayerTimes.ts`, `src/components/NextPrayerCard.tsx`, `src/pages/Index.tsx`

---

## Feature 2: Hadith Top Banner

### Database

New table: `hadiths`


| Column         | Type        | Notes          |
| -------------- | ----------- | -------------- |
| id             | uuid (PK)   | auto-generated |
| hadith_english | text        | nullable       |
| hadith_tamil   | text        | not null       |
| reference      | text        | nullable       |
| is_active      | boolean     | default false  |
| created_at     | timestamptz | default now()  |


RLS: public read (SELECT), public insert/update (for admin usage -- matches existing pattern).

### Banner Component

New component `src/components/HadithBanner.tsx`:

- Fetches the active hadith on mount
- Shows a sliding top banner with hadith text and reference
- Auto-hides after 15 seconds
- Close button (X) for manual dismiss
- Elegant fade-in animation

### Admin Section

Add a third tab "Hadith" in the admin panel:

- Input fields for English/Tamil text, and reference
- Active toggle switch
- Save button
- Shows current active hadith
- Only one hadith can be active at a time (saving a new active one deactivates others)

**Files:** `src/components/HadithBanner.tsx` (new), `src/pages/Admin.tsx`, `src/pages/Index.tsx`

---

## Feature 3: Location Selector

### Settings Page Addition

Add a "Location" card in Settings with 3 options:

- Central Province (default, no offset)
- Western Province (+3 minutes to all adhan times)
- Eastern Province (-3 minutes to all adhan times)

### Logic

- Store selected location in localStorage (`akurana-location`)
- New hook `src/hooks/useLocation.ts` to manage location state
- Modify `getPrayerList()` in `usePrayerTimes.ts` to accept a minute offset parameter
- Apply the offset to all adhan times before calculating iqamah (so iqamah also shifts correctly)
- Changes reflect instantly via React state (no refresh needed)

**Files:** `src/hooks/useLocation.ts` (new), `src/hooks/usePrayerTimes.ts`, `src/pages/Settings.tsx`

---

## Files Summary


| File                                | Action                                       |
| ----------------------------------- | -------------------------------------------- |
| `src/hooks/useNotifications.ts`     | Fix range check for 5-min notification       |
| `src/hooks/useHijriDate.ts`         | Add midnight refresh interval                |
| `public/sw.js`                      | Bump cache version, improve caching strategy |
| `src/hooks/usePrayerTimes.ts`       | Add 3-phase logic, location offset support   |
| `src/components/NextPrayerCard.tsx` | Redesign for Phase 1/2/3 display             |
| `src/pages/Index.tsx`               | Integrate hadith banner, pass phase data     |
| `src/components/HadithBanner.tsx`   | New: hadith top banner component             |
| `src/hooks/useLocation.ts`          | New: location preference hook                |
| `src/pages/Admin.tsx`               | Add Hadith Manager tab                       |
| `src/pages/Settings.tsx`            | Add Location Selector card                   |
| Database migration                  | Create `hadiths` table with RLS              |
