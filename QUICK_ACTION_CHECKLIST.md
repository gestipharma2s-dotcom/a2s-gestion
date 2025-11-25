# 🎯 Quick Action Checklist

## IMMEDIATE (DO THIS NOW!)

### ☐ Step 1: Execute Migration in Supabase
- [ ] Go to Supabase Dashboard → **SQL Editor**
- [ ] Copy the SQL from `MIGRATION_ADD_TIME_CREATION.sql`
- [ ] Paste into editor
- [ ] Click **Run**
- [ ] Verify: Table Editor → interventions → scroll right → `time_creation` exists ✓

### ☐ Step 2: Clear Browser Cache
- [ ] Press `Ctrl+F5` (hard refresh)
- [ ] Opens application fresh with new code

### ☐ Step 3: Test with Console Open
- [ ] Press `F12` → **Console** tab
- [ ] Press `Ctrl+L` to clear console
- [ ] Create NEW intervention (fill form, click Enregistrer)
- [ ] **WAIT EXACTLY 6-10 MINUTES** (use phone timer!)
- [ ] Click **Clôturer**
- [ ] **Copy ALL console logs** starting from "DEBUG create"

---

## WHAT TO LOOK FOR IN CONSOLE

```
DEBUG create: creationTime (UTC): 2025-11-24T14:00:30.123Z
[create was successful]

DEBUG cloturer:
  intervention id: xxx
  time_creation: 2025-11-24T14:00:30.123Z
  dateFin (UTC): 2025-11-24T14:06:45.456Z
  type of time_creation: string
  time_creation is null: false  ← THIS IS KEY!
  source: time_creation         ← THIS IS KEY!
  === DURATION CALCULATION ===
  timeDiffMs: 375333
  durationMinutes: 6            ← THIS IS KEY!
  durationHeures: 0.10
```

---

## THEN: SHARE WITH ME

1. ⏱️ **Wait time**: ___ minutes ___ seconds
2. 🕐 **Created at**: `2025-11-24T[HH:MM:SS]Z`
3. 🕓 **Closed at**: `2025-11-24T[HH:MM:SS]Z`
4. ❓ **time_creation is null**: true or false?
5. 📊 **source value**: time_creation or date_intervention?
6. ⏱️ **durationMinutes shown**: ___ minutes
7. 📱 **Modal displayed**: ___ minutes

---

## EXPECTED OUTCOMES

### ✅ Best Case (Problem Fixed!)
- time_creation is null: **false**
- source: **time_creation**
- durationMinutes: **~6** (matches your wait)
- Modal shows: **~6 minutes**

### ⚠️ Migration Issue
- time_creation is null: **true**
- WARNING message: **"time_creation was NULL"**
- Solution: Migration didn't apply, run again

### ❌ Timezone Offset Issue
- time_creation is null: **false**
- source: **time_creation**
- durationMinutes: **~68** (should be ~6)
- Modal shows: **~68 minutes**
- Solution: Check Supabase timezone settings

---

## FILES TO CHECK

| File | Purpose |
|------|---------|
| `LATEST_FIXES_SUMMARY.md` | Complete analysis and testing guide |
| `TIMEZONE_DEBUG_INSTRUCTIONS.md` | Detailed debug protocol |
| `MIGRATION_ADD_TIME_CREATION.sql` | SQL to run in Supabase |
| `src/services/interventionService.js` | Where duration is calculated |

---

## QUICK LINKS

1. **Supabase**: https://supabase.com (SQL Editor tab)
2. **App**: http://localhost:3000 (or your dev URL)
3. **Console**: Press `F12` after opening app

---

**STATUS**: ✅ Build compiled, ✅ Code ready, ⏳ Awaiting test results
