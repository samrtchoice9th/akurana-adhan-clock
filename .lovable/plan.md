

# Direct Excel Upload Support

## Problem
The current CSV parser expects a specific flat format, but your actual data is in an Excel file (.xlsx) with a completely different structure:
- Organized by month (January, February, etc.)
- January has daily entries; Feb-Dec use date ranges (e.g., "01-06", "07-12")
- Times use hyphens in some months (e.g., "5-08") and colons in others (e.g., "5:08")
- No AM/PM indicators in the file

## Solution
Replace the CSV upload system with an Excel (.xlsx) parser that understands your exact file format and converts it into carry-forward records for the database.

---

## How It Works

1. Admin uploads the `.xlsx` file directly (no CSV conversion needed)
2. The app parses each month's section automatically
3. Date ranges like "01-06" become a single `effective_from` date (the range start, e.g., 2026-02-01)
4. Times are converted from "5-08" or "5:08" to "5:08 AM" with AM/PM assigned by prayer type:
   - Subah, Sunrise: Always AM
   - Luhar: AM if hour is less than 12, PM if 12 or greater
   - Asr, Magrib, Isha: Always PM
5. Result is inserted into `prayer_time_changes` table as carry-forward records

## AM/PM Assignment Rules

```text
Prayer     | Rule
-----------|------------------
Subah      | Always AM
Sunrise    | Always AM
Luhar      | < 12 = AM, >= 12 = PM
Asr        | Always PM
Magrib     | Always PM
Isha       | Always PM
```

## Example Conversion

Excel row: `01-06 | 5-08 | 6-27 | 12-23 | 3-45 | 6-17 | 7-29` (February)

Becomes database record:
- effective_from: 2026-02-01
- subah_adhan: "5:08 AM"
- sunrise: "6:27 AM"
- luhar_adhan: "12:23 PM"
- asr_adhan: "3:45 PM"
- magrib_adhan: "6:17 PM"
- isha_adhan: "7:29 PM"

---

## Technical Changes

### 1. Install `xlsx` library
Add the SheetJS library to parse Excel files in the browser.

### 2. New file: `src/lib/excelParser.ts`
Parses the uploaded .xlsx file:
- Reads the first sheet
- Detects month sections by scanning for month names (JANUARY, FEBRUARY, etc.)
- For each month section, reads date ranges and time values
- Handles both daily entries (January: "1", "2") and range entries (Feb-Dec: "01-06")
- Converts hyphened times ("5-08") to colon format ("5:08")
- Assigns AM/PM based on prayer column
- Outputs an array of carry-forward records ready for database insertion

### 3. Update `src/pages/Admin.tsx`
- Change file input to accept `.xlsx` files instead of `.csv`
- Replace CSV parser with the new Excel parser
- Preview table and save flow remain the same
- Keep all validation: show errors clearly, reject bad data

### 4. Update `src/lib/csvParser.ts`
Keep as backup but the primary upload path will use the Excel parser.

### Files Modified
| File | Change |
|---|---|
| `package.json` | Add `xlsx` dependency |
| `src/lib/excelParser.ts` | New: Excel parsing + time conversion |
| `src/pages/Admin.tsx` | Update to use Excel parser, accept .xlsx |

### Files NOT Changed
- `src/hooks/usePrayerTimes.ts` -- carry-forward logic stays identical
- `src/pages/Index.tsx` -- no changes
- `src/components/*` -- no changes
- Database schema -- no changes (same `prayer_time_changes` table)

