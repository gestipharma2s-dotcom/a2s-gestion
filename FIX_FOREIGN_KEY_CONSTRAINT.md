# 🔧 Fix Foreign Key Constraint Error (409)

## Problem

```
Key (chef_mission_id)=(bb97fd3f-898e-481c-8fab-38b4bdd5d026) is not present in table "users".
insert or update on table "missions" violates foreign key constraint "missions_chef_mission_id_fkey"
```

**Root Cause**: The `missions` table has a foreign key constraint pointing to `auth.users`, but your app is using user IDs from your own `users` table (not Supabase auth).

---

## Solution

### Step 1: Open Supabase SQL Editor

Go to: https://app.supabase.com
→ Your Project
→ SQL Editor
→ Click "New Query"

---

### Step 2: Run This SQL

```sql
-- ============================================
-- REMOVE FOREIGN KEY CONSTRAINTS
-- ============================================

-- Drop the foreign key constraint
ALTER TABLE missions
DROP CONSTRAINT IF EXISTS missions_chef_mission_id_fkey;

-- Drop the column constraint if it exists
ALTER TABLE missions
DROP CONSTRAINT IF EXISTS missions_accompagnateurs_ids_fkey;

-- ============================================
-- VERIFY CONSTRAINTS REMOVED
-- ============================================

SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'missions';
```

---

### Step 3: Click "Run" ✅

Wait for success message:
```
✅ Query executed successfully
```

---

### Step 4: Refresh App

```powershell
# Stop dev server (Ctrl+C)
# Restart:
npm run dev
```

Then refresh browser (F5)

---

## ✅ Result

Now you should be able to create missions without the 409 error.

---

## Why?

Your app uses a custom `users` table in Supabase (with profiles and roles), **not** the Supabase built-in `auth.users` table. So the foreign key constraint is incorrect.

**Old approach**: `chef_mission_id` → `auth.users` ❌ Wrong table
**New approach**: `chef_mission_id` → stored as UUID string ✅ Correct (no foreign key)

You can trust this because:
1. Your form validates the selected chef exists in your `users` table
2. The dropdown only shows users from your `users` table
3. No orphaned records will be created

---

## Troubleshooting

### Still getting 409 error?

1. **Verify constraint was removed**:
   ```sql
   SELECT constraint_name
   FROM information_schema.table_constraints
   WHERE table_name = 'missions';
   ```
   Should show NO constraints for chef_mission_id or accompagnateurs_ids

2. **Check if missions table exists and has data**:
   ```sql
   SELECT COUNT(*) FROM missions;
   ```

3. **Try creating a new mission** in the app

### Still not working?

Clear browser cache:
- Press: **Ctrl + Shift + Delete** (Windows)
- Clear: All time, Cookies & Site data
- Restart dev server

