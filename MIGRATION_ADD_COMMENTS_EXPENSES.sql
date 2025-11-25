-- ============================================
-- MIGRATION: Ajouter colonnes pour commentaires et dépenses
-- ============================================

-- Ajouter les colonnes à la table missions
ALTER TABLE missions
ADD COLUMN IF NOT EXISTS commentaires_techniques JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS commentaires_financiers JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS depenses_details JSONB DEFAULT '[]'::jsonb;

-- Vérifier que les colonnes ont été ajoutées
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'missions'
AND column_name IN ('commentaires_techniques', 'commentaires_financiers', 'depenses_details')
ORDER BY ordinal_position;

-- ============================================
-- Si les colonnes existent, on peut aussi ajouter des index pour performance
-- ============================================
-- CREATE INDEX IF NOT EXISTS idx_missions_commentaires_tech ON missions USING GIN (commentaires_techniques);
-- CREATE INDEX IF NOT EXISTS idx_missions_commentaires_fin ON missions USING GIN (commentaires_financiers);
-- CREATE INDEX IF NOT EXISTS idx_missions_depenses ON missions USING GIN (depenses_details);
