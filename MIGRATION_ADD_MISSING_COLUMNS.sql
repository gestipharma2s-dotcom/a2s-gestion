-- ============================================
-- MIGRATION: Add missing columns to missions table
-- ============================================
-- Date: 22 novembre 2025
-- Description: Add columns that are referenced in the application but missing from schema

-- Add missing columns to missions table
DO $$ 
BEGIN
  -- Add lieu (location) column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'missions' AND column_name = 'lieu') THEN
    ALTER TABLE missions ADD COLUMN lieu VARCHAR(100);
    COMMENT ON COLUMN missions.lieu IS 'Lieu de la mission - où la mission se déroulera';
  END IF;

  -- Add type_mission column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'missions' AND column_name = 'type_mission') THEN
    ALTER TABLE missions ADD COLUMN type_mission VARCHAR(50);
    COMMENT ON COLUMN missions.type_mission IS 'Type de mission (Installation, Formation, Support, etc)';
  END IF;

  -- Add priorite column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'missions' AND column_name = 'priorite') THEN
    ALTER TABLE missions ADD COLUMN priorite VARCHAR(50) DEFAULT 'moyenne';
    COMMENT ON COLUMN missions.priorite IS 'Priorité de la mission (faible, moyenne, haute, critique)';
  END IF;

  -- Add description column if it doesn't exist (might be missing)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'missions' AND column_name = 'description') THEN
    ALTER TABLE missions ADD COLUMN description TEXT;
    COMMENT ON COLUMN missions.description IS 'Description détaillée de la mission';
  END IF;

END $$;

-- ============================================
-- Create indexes for better query performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_missions_lieu ON missions(lieu);
CREATE INDEX IF NOT EXISTS idx_missions_type ON missions(type_mission);
CREATE INDEX IF NOT EXISTS idx_missions_priorite ON missions(priorite);

-- ============================================
-- Verify the changes
-- ============================================
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'missions'
-- ORDER BY ordinal_position;
