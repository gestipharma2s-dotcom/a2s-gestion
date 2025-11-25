# 🔧 Timezone Debug Instructions

## Problem Summary
Duration showing as **68 minutes** when actual elapsed time is **~6 minutes** (10-11x multiplier).

**Latest observation**: Most likely cause is **time_creation column is NULL** in the database, forcing fallback to unreliable time estimates.

## Root Cause Investigation

The issue is a combination of:
1. **time_creation might be NULL** - If migration hasn't run or old interventions don't have it
2. **Timezone offset between client and Supabase** - Client is UTC+1 or similar, Supabase is UTC
3. **Fallback calculation is unreliable** - When time_creation is NULL, we fall back to date_intervention which only has the DATE, not the time

When `time_creation` is NULL, the fallback now uses: `date_intervention + current_time`
- This is just an estimate and will only be accurate if closed on the SAME day
- **Example**: If created and closed on Nov 24, the estimate should be close
- **But** if there's a timezone issue when sending/retrieving time_creation, we still get wrong values

## Testing Protocol

### Step 1: Execute Migration (CRITICAL - Do This First!)
The `time_creation` column MUST exist in Supabase for this to work.

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy and paste this migration:
```sql
ALTER TABLE public.interventions ADD COLUMN IF NOT EXISTS time_creation TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_interventions_time_creation ON public.interventions(time_creation);
```
3. Click **Run** button
4. Confirm it executed successfully

**Why**: Without this column, `time_creation` will be NULL for all interventions, forcing fallback to date_intervention.

### Step 2: Test Duration Calculation

1. **Hard refresh** your browser: `Ctrl+F5` (or `Cmd+Shift+R` on Mac)
2. **Open Developer Console**: Press `F12` → Click **Console** tab
3. **Create a NEW intervention**:
   - Fill out form normally (client, technicien, date, description)
   - Click **Enregistrer**
   - Watch console for logs starting with "DEBUG create"
4. **Wait exactly 5-10 minutes** (use a timer/stopwatch on your phone)
5. **Close the intervention** (Clôturer button):
   - The modal should show duration
   - Console will show DEBUG logs
6. **Copy ALL console output** and share it

### Expected Console Output

**When Creating** (Nov 24, 2025):
```
DEBUG create: creationTime (UTC): 2025-11-24T14:00:30.123Z
DEBUG create: intervention créée avec time_creation = 2025-11-24T14:00:30.123Z
```

**When Closing** (6 minutes later, ~14:06):
```
DEBUG cloturer:
  intervention id: xxx-xxx-xxx
  time_creation: 2025-11-24T14:00:30.123Z
  dateFin (UTC): 2025-11-24T14:06:45.456Z
  DEBUG: Checking time_creation...
  type of time_creation: string
  time_creation is null: false
  time_creation is undefined: false
  Using time_creation - parsed as: 2025-11-24T14:00:30.123Z
  
  === DURATION CALCULATION ===
  source: time_creation
  dateDebut (ISO): 2025-11-24T14:00:30.123Z
  dateDebut (getTime): 1732445430123
  dateFin (ISO): 2025-11-24T14:06:45.456Z
  dateFin (getTime): 1732445805456
  timeDiffMs: 375333
  durationMinutes: 6
  durationHeures: 0.10
  ===========================
```

### What to Look For

**✅ GOOD SIGNS**:
- `time_creation is null: false` (time_creation IS set)
- `source: time_creation` (not using fallback)
- `durationMinutes: 5` to `10` (matches your wait time)
- `durationHeures: 0.08` to `0.17` (less than 0.5 hours)
- `Using time_creation - parsed as:` (confirms time_creation was used)

**❌ PROBLEM SIGNS**:
- `time_creation is null: true` (column is NULL - migration not run!)
- `source: date_intervention with current time (fallback` (using estimate, not actual time)
- `WARNING: time_creation was NULL` (confirms time_creation is missing)
- `durationMinutes: 68` or `1500+` (huge number = wrong source)
- `type of time_creation: undefined` or `object` with null value

### If Still Wrong...

#### Issue 1: time_creation Still NULL
- **Cause**: Migration didn't apply or column has wrong type
- **Sign**: You see `time_creation is null: true` in console
- **Fix**:
  1. Go to Supabase → **Table Editor** → **interventions**
  2. Scroll right to see columns
  3. Look for `time_creation` column (TIMESTAMP type)
  4. If not there: 
     - Go to **SQL Editor**
     - Run the migration SQL from MIGRATION_ADD_TIME_CREATION.sql
     - Try again
  5. If there but type wrong (like TEXT instead of TIMESTAMP): 
     - Delete the column
     - Re-run migration

#### Issue 2: time_creation is Set But Duration Wrong
If console shows `source: time_creation` but duration is still 68 minutes for 6 minutes wait:
- **Likely cause**: Timezone mismatch when storing or retrieving from database
- **Example calculation**:
  - You in UTC+1, click create at 14:00 local = 13:00 UTC
  - `new Date().toISOString()` correctly gives "2025-11-24T13:00:00Z"
  - But what if Supabase stores it as "2025-11-24T14:00:00Z" (adds 1 hour)?
  - Then 6 minutes later at 14:06 UTC = 15:06 local
  - Calculation: 15:06 - 14:00 = 1 hour 6 minutes = 66 minutes ❌
- **Fix**: Need to check Supabase server timezone settings

**Action**: Share exact console timestamps so I can verify the offset

#### Issue 3: The 68 (or 66) Minutes Mystery
- **User report**: Waited ~6 minutes, got 68 minutes
- **Possible explanations**:
  1. ✅ time_creation is NULL, fallback using approximate time (most likely)
  2. ⚠️ time_creation set but stored with +1 hour offset (timezone issue)
  3. ⚠️ Time is being calculated as hours instead of minutes (code bug - unlikely)

**What we need**: Console output showing exact timestamps so we can debug

## Code Changes Made

✅ **Removed**: Timezone offset correction (`getTimezoneOffset() * 60 * 1000`)
✅ **Reason**: It was being applied twice, making things worse
✅ **Current**: Using pure UTC ISO strings (`new Date().toISOString()`)
✅ **Added**: Comprehensive debug logging to trace execution

## Next Steps After Testing

Once you provide console output:

1. If `source: date_intervention` → Need to investigate why `time_creation` is NULL
2. If `source: time_creation` + duration correct → **ISSUE SOLVED!** 🎉
3. If `source: time_creation` + duration wrong → Provide exact timestamps so I can calculate what's off

---

## Quick Reference

| Value | Expected | Your Result |
|-------|----------|-------------|
| wait time | ~6 min | ? |
| durationMinutes | ~6 | 66 ❌ |
| source | time_creation | ? |
| time_creation | NOT NULL | ? |

Fill this in after testing!
