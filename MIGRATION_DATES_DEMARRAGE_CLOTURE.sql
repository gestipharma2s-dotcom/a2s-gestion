-- ============================================
-- MIGRATION: Ajouter dates démarrage et clôture
-- ============================================
-- Date: 22 novembre 2025
-- Description: Ajouter colonnes pour tracer quand une mission démarre et se clôture

-- Ajouter colonnes si elles n'existent pas
ALTER TABLE missions
ADD COLUMN IF NOT EXISTS date_demarrage TIMESTAMP,
ADD COLUMN IF NOT EXISTS date_cloture_reelle TIMESTAMP;

-- Ajouter des commentaires explicatifs
COMMENT ON COLUMN missions.date_demarrage IS 'Date/heure réelle du démarrage de la mission par le chef';
COMMENT ON COLUMN missions.date_cloture_reelle IS 'Date/heure réelle de la clôture de la mission';

-- Créer des index pour recherche
CREATE INDEX IF NOT EXISTS idx_missions_date_demarrage ON missions(date_demarrage);
CREATE INDEX IF NOT EXISTS idx_missions_date_cloture ON missions(date_cloture_reelle);

-- Vérification
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'missions'
AND column_name IN ('date_demarrage', 'date_cloture_reelle')
ORDER BY ordinal_position;
