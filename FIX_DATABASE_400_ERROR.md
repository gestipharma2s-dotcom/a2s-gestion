# 🔧 Fix Database Error: missions table 400 error

**Date**: 22 Novembre 2025 | **Status**: 🚨 REQUIRES USER ACTION

---

## 🎯 Problem

Browser console shows:
```
Failed to load resource: the server responded with a status of 400 ()
missionService.js:14  Table access error: Object
```

This means the Supabase database cannot access the `missions` table.

---

## 🔍 Root Causes (Check These)

### 1. **Missions Table Doesn't Exist**
- The `missions` table may not be created in your Supabase database
- Migration file exists but hasn't been executed

### 2. **RLS (Row Level Security) Policy Issues**
- The table exists but has RLS enabled without proper policies
- Anonymous/user token cannot access it

### 3. **Environment Variables Not Set**
- `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` missing
- App can't authenticate with Supabase

---

## ✅ Solution: Step-by-Step

### Step 1: Check Supabase Database Connection

**File**: `.env.local`

Verify you have:
```
VITE_SUPABASE_URL=https://ynoxsibapzatlxhmredp.supabase.co
VITE_SUPABASE_ANON_KEY=your-key-here
```

If missing or empty, add your credentials from Supabase → Settings → API.

---

### Step 2: Create Missions Table

**Option A: Using Supabase SQL Editor (Fastest)**

1. Go to: **Supabase Dashboard** → **SQL Editor**
2. Click **"New Query"**
3. Copy-paste from: `MIGRATION_WILAYA_MISSIONS.sql` (first 50 lines)
4. Click **"Run"**

**Option B: Using Migration File**

Run this SQL in Supabase SQL Editor:

```sql
-- CREATE MISSIONS TABLE
CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID REFERENCES prospects(id),
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  statut VARCHAR(50) DEFAULT 'creee',
  lieu VARCHAR(100),
  type_mission VARCHAR(50),
  priorite VARCHAR(50) DEFAULT 'moyenne',
  budget_alloue DECIMAL(10, 2),
  budget_depense DECIMAL(10, 2),
  date_debut DATE,
  date_fin_prevue DATE,
  date_fin_reelle DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  wilaya VARCHAR(100),
  chef_mission_id UUID REFERENCES auth.users(id),
  accompagnateurs_ids TEXT[] DEFAULT '{}',
  cloturee_par_chef BOOLEAN DEFAULT FALSE,
  commentaire_clot_chef TEXT,
  date_clot_chef TIMESTAMP,
  cloturee_definitive BOOLEAN DEFAULT FALSE,
  commentaire_clot_admin TEXT,
  date_clot_definitive TIMESTAMP
);

-- ENABLE RLS
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

-- CREATE RLS POLICIES (Allow all for now - secure later)
CREATE POLICY "Allow all operations on missions" ON missions
FOR ALL USING (true) WITH CHECK (true);
```

---

### Step 3: Verify Table Creation

In Supabase:
1. Go to **Table Editor**
2. Look for **missions** table in left panel
3. Should show columns: id, prospect_id, titre, description, statut, budget_alloue, date_debut, date_fin_prevue, chef_mission_id, accompagnateurs_ids, etc.

---

### Step 4: Check RLS Policies

**Supabase Dashboard**:
1. Click **"missions"** table
2. Click **"Authentication"** tab
3. Verify policies exist or disable RLS temporarily:
   - Go to **"RLS"** toggle
   - Turn **OFF** temporarily (⚠️ for development only)
   - Or create allow-all policy above

---

### Step 5: Restart App

```powershell
# Stop current npm run dev (Ctrl+C)
# Restart
npm run dev
```

---

## 🧪 How to Verify Fix

### Test 1: Browser Console
Open DevTools (F12) and check console:

**Before Fix**:
```
Table access error: Object
Erreur lors du chargement des missions: Error
```

**After Fix**:
```
Table access successful: { dataCount: 0, status: 200 }
Users loaded: X users [...]
Missions transformed: []
```

### Test 2: Create a Mission
1. Click "Nouvelle Mission"
2. Fill form and click "Enregistrer"
3. Should see success notification
4. Mission appears in list

---

## 📋 Files Involved

- **Frontend**: `src/services/missionService.js` - Connects to Supabase
- **Database**: `MIGRATION_WILAYA_MISSIONS.sql` - Table schema
- **Config**: `.env.local` - Supabase credentials

---

## 🚨 Common Issues

| Problem | Solution |
|---------|----------|
| 400 error persists | Check RLS policies - disable temporarily |
| "Table doesn't exist" error | Run migration SQL in Supabase |
| Empty missions list | Table exists but is empty - create a mission |
| "Unauthorized" error | Check `.env.local` - verify API keys correct |
| Wrong URL shown in error | Check if correct Supabase project selected |

---

## 📝 Enhanced Error Logging

**File**: `src/services/missionService.js`

I've added better error logging:
- Line 14: Now shows detailed error object with code/message/details
- Line 31: Logs number of missions loaded
- Line 14: TestTableAccess now returns precise data

---

## 🎯 Next Actions

1. **Execute SQL** to create missions table in Supabase
2. **Refresh page** and check console for success messages
3. **Test mission creation** to verify everything works
4. **Check Supabase** → Table Editor to see created mission records

---

## ❓ Still Failing?

If you see the error after following these steps:

1. **Check Supabase Status**:
   - Go to: https://status.supabase.com/
   - Verify platform is running

2. **Verify Credentials**:
   - Supabase Dashboard → Settings → API
   - Copy exact URL and ANON KEY
   - Update `.env.local`
   - Restart dev server

3. **Check RLS**:
   - Table Editor → missions → Authentication
   - Disable RLS toggle OR
   - Create policy: "Allow all operations"

4. **Contact Supabase Support** if 400 persists (indicates server-side issue)

