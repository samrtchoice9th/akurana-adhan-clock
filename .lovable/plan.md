

# App Updates: Themes, Design Fix, Admin Separation, Push Notifications

## 1. Admin Panel -- Already Separate

The admin panel is already at `/admin` and hidden from the main UI (no link visible to users). The Settings gear icon on the home page goes to `/settings`, not admin. No changes needed here -- admin stays at `/admin`, password-protected.

---

## 2. New Theme Colors (5 options replacing current 3)

Replace the current Green/Blue/Dark themes with these 5 color themes:

| Theme | Background | Primary | Accent | Description |
|---|---|---|---|---|
| Default Light | White/Light gray | Slate/Dark | Subtle blue | Clean professional light theme |
| Dark Navy | Dark navy blue (#0f172a) | Light blue | Soft white | Dark blue professional |
| Blue Finance | White base | Corporate blue (#1e40af) | Navy accents | Corporate blue tones |
| Black Gold | Pure black | Gold (#d4a017) | Warm gold | Luxury dark with gold accents |
| Teal Fresh | Near-white | Teal (#0d9488) | Emerald | Modern teal accents |

### Changes:
- Update `src/index.css` -- replace `.theme-green`, `.theme-blue`, `.theme-dark` with 5 new theme classes
- Update `src/hooks/useTheme.ts` -- change `ThemeColor` type to `'light' | 'navy' | 'blue-finance' | 'black-gold' | 'teal'`
- Update `src/pages/Settings.tsx` -- new color picker UI with 5 options showing preview swatches

---

## 3. Fix Design Style -- Nothing Appears Bug

The current design style toggle (Modern/Classic/Glass) likely causes visual issues because:
- The `.style-classic` rule removes ALL shadows with `box-shadow: none !important` on every element
- The `.style-glass` card override uses `hsla(var(--card), 0.6)` which may not render correctly as the CSS variable returns space-separated HSL values, not a valid `hsla()` input

### Fix:
- Rewrite `.style-classic` to only flatten border-radius instead of killing all shadows
- Fix `.style-glass` to use proper CSS variable composition for the frosted glass effect
- Ensure all 3 design styles have proper, visible card backgrounds

---

## 4. Push Notifications -- 5 Minutes Before Prayer

### How it works:
1. On the Settings page, add a "Prayer Notifications" toggle (on/off)
2. When enabled, the app requests browser notification permission
3. A background timer checks every 30 seconds if any prayer is 5 minutes away
4. When a prayer is 5 minutes away, show a push notification: "Subah Adhan in 5 minutes"
5. Notification preference saved in localStorage

### Implementation:
- New hook: `src/hooks/useNotifications.ts`
  - Manages permission state and localStorage toggle
  - Runs an interval that compares current time against all prayer times
  - Fires `new Notification()` when a prayer is exactly 5 minutes away
  - Tracks which notifications have already fired today to avoid duplicates
- Update `src/pages/Settings.tsx` -- add notification toggle with permission request
- Update `src/pages/Index.tsx` -- initialize the notification hook
- Update `public/sw.js` -- add `notificationclick` handler to open the app when notification is tapped

### Note:
Push notifications require the user to grant permission in their browser. On iOS (Safari), this works only if the app is installed to the home screen (PWA). The app will show a clear message explaining this.

---

## Files Summary

| File | Action |
|---|---|
| `src/index.css` | Replace 3 theme classes with 5 new ones; fix design style rules |
| `src/hooks/useTheme.ts` | Update ThemeColor type and defaults |
| `src/pages/Settings.tsx` | New 5-color picker, notification toggle, fix design style options |
| `src/hooks/useNotifications.ts` | New: notification timer logic |
| `src/pages/Index.tsx` | Minor: initialize notification hook |
| `public/sw.js` | Add notification click handler |

### Files NOT changed
- `src/pages/Admin.tsx` -- no changes (already separate at /admin)
- `src/hooks/usePrayerTimes.ts` -- no changes
- `src/components/*` -- no changes
- Database -- no changes

