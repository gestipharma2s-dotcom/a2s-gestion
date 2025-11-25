# 🔧 URGENT: Database Schema Fix Required

## Problem Identified
The missions table is missing critical columns that the application is trying to use:
- ❌ `lieu` (location)
- ❌ `type_mission` (mission type)
- ❌ `priorite` (priority)

Error: `"Could not find the 'lieu' column of 'missions' in the schema cache"`

## Solution

### Step 1: Run Migration in Supabase
Execute the updated migration file in your Supabase SQL editor:

**File:** `MIGRATION_WILAYA_MISSIONS.sql`

This migration now includes:
- ✅ Creating missions table with all required columns (if it doesn't exist)
- ✅ Adding missing columns if table already exists:
  - `lieu VARCHAR(100)`
  - `type_mission VARCHAR(50)`
  - `priorite VARCHAR(50) DEFAULT 'moyenne'`
- ✅ Proper foreign key references
- ✅ All indexes for performance

### Step 2: Alternative Single Migration
If you want a standalone migration for just the missing columns:

**File:** `MIGRATION_ADD_MISSING_COLUMNS.sql`

### Step 3: Verify Success
After running the migration, check that all columns exist:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'missions'
ORDER BY ordinal_position;
```

Expected columns:
- id (bigint)
- prospect_id (uuid) - FK to prospects
- titre (varchar)
- description (text)
- statut (varchar)
- **lieu (varchar)** ← Was missing
- **type_mission (varchar)** ← Was missing
- **priorite (varchar)** ← Was missing
- budget_alloue (numeric)
- budget_depense (numeric)
- date_debut (date)
- date_fin_prevue (date)
- date_fin_reelle (date)
- created_at (timestamp)
- updated_at (timestamp)
- created_by (uuid)
- wilaya (varchar)
- chef_mission_id (uuid) - FK to auth.users
- accompagnateurs_ids (text array)
- cloturee_par_chef (boolean)
- commentaire_clot_chef (text)
- date_clot_chef (timestamp)
- cloturee_definitive (boolean)
- commentaire_clot_admin (text)
- date_clot_definitive (timestamp)

## After Migration

Once the database is fixed, the application will work correctly:
1. Try creating a mission again
2. All fields should save properly
3. No more schema cache errors

## Files Updated
- ✅ `MIGRATION_WILAYA_MISSIONS.sql` - Now includes all missing columns
- ✅ `MIGRATION_ADD_MISSING_COLUMNS.sql` - Standalone migration for quick fix
- ✅ `MIGRATION_RLS_MISSIONS.sql` - RLS policy management (if needed)

## Application Status
- Frontend: ✅ Ready (with diagnostics)
- Backend Logic: ✅ Ready (fixed field mappings)
- Database: ❌ **Needs migration** (missing columns)

**Next: Run the migration in Supabase SQL editor → Refresh the app → Try creating a mission again**
