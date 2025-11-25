-- ============================================
-- QUICK FIX: Add Missing Columns to Missions
-- ============================================
-- Copy and paste this into Supabase SQL Editor
-- Then click "Run" button

-- Add missing columns that are preventing mission creation
ALTER TABLE missions
ADD COLUMN IF NOT EXISTS lieu VARCHAR(100),
ADD COLUMN IF NOT EXISTS type_mission VARCHAR(50),
ADD COLUMN IF NOT EXISTS priorite VARCHAR(50) DEFAULT 'moyenne';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_missions_lieu ON missions(lieu);
CREATE INDEX IF NOT EXISTS idx_missions_type ON missions(type_mission);
CREATE INDEX IF NOT EXISTS idx_missions_priorite ON missions(priorite);

-- Add comments for clarity
COMMENT ON COLUMN missions.lieu IS 'Lieu de la mission - où la mission se déroulera';
COMMENT ON COLUMN missions.type_mission IS 'Type de mission (Installation, Formation, Support, Maintenance, Audit)';
COMMENT ON COLUMN missions.priorite IS 'Priorité de la mission (faible, moyenne, haute, critique)';

-- ============================================
-- Verify the changes
-- ============================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'missions'
ORDER BY ordinal_position;
