# 🚀 QUICK FIX: Copy-Paste SQL to Fix 400 Error

**⏱️ Time to Fix**: 2 minutes

---

## 1️⃣ Open Supabase SQL Editor

Go to: https://app.supabase.com
→ Your Project
→ SQL Editor
→ Click "New Query"

---

## 2️⃣ Copy-Paste This SQL

```sql
-- ============================================
-- CREATE MISSIONS TABLE
-- ============================================

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

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE missions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RLS POLICY (Allow all for dev)
-- ============================================

DROP POLICY IF EXISTS "Allow all operations on missions" ON missions;

CREATE POLICY "Allow all operations on missions" ON missions
FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- VERIFY TABLE CREATED
-- ============================================

SELECT 
  table_name, 
  column_name, 
  data_type
FROM 
  information_schema.columns
WHERE 
  table_name = 'missions'
ORDER BY 
  ordinal_position;
```

---

## 3️⃣ Click "Run" Button

Wait for success message:
```
✅ Query executed successfully
```

---

## 4️⃣ Refresh App

```powershell
# In Terminal
# Stop: Ctrl+C
# Restart:
npm run dev
```

---

## 5️⃣ Check Browser Console (F12)

Should now show:
```
✅ Table access successful: { dataCount: 0, status: 200 }
✅ Missions loaded successfully: 0 missions
✅ Users loaded: X users
```

---

## ✅ Done!

The 400 error should be fixed. Try creating a mission!

---

## 🔍 If Still Not Working

### Check 1: Verify Table Exists

In Supabase SQL Editor, run:
```sql
SELECT * FROM missions LIMIT 1;
```

Should return: ✅ empty table (0 rows) OR ❌ error (table missing)

### Check 2: Check RLS Policy

In Supabase:
- Table Editor
- missions table
- Authentication tab
- Policy should exist: "Allow all operations on missions"

### Check 3: Restart Everything

```powershell
# Kill dev server (Ctrl+C)
# Hard refresh browser (Ctrl+Shift+R)
npm run dev
```

---

## 📝 Reference

- **SQL File**: MIGRATION_WILAYA_MISSIONS.sql
- **Error Guide**: FIX_DATABASE_400_ERROR.md
- **Supabase Docs**: https://supabase.com/docs/guides/database

