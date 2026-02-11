-- AJOUT DE MISSION_ID ET IS_CANCELLED À PROSPECT_HISTORY POUR LE PLANNING
-- Indispensable pour la gestion complète de la planification

DO $$ 
BEGIN 
    -- 1. Ajout à la table prospect_history (Celle utilisée par le planning)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prospect_history' AND column_name = 'mission_id') THEN 
        ALTER TABLE prospect_history 
        ADD COLUMN mission_id BIGINT REFERENCES missions(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prospect_history' AND column_name = 'is_cancelled') THEN 
        ALTER TABLE prospect_history 
        ADD COLUMN is_cancelled BOOLEAN DEFAULT FALSE;
    END IF;

    -- 2. Ajout à la table installations
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'installations' AND column_name = 'mission_id') THEN 
        ALTER TABLE installations 
        ADD COLUMN mission_id BIGINT REFERENCES missions(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Index
CREATE INDEX IF NOT EXISTS idx_prospect_history_mission_id ON prospect_history(mission_id);
CREATE INDEX IF NOT EXISTS idx_prospect_history_is_cancelled ON prospect_history(is_cancelled);
