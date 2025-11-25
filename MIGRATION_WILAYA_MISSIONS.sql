-- ============================================
-- MIGRATION: Ajouter champ WILAYA
-- ============================================
-- Date: 21 novembre 2025
-- Version: 2.2.0

-- 1️⃣ AJOUTER WILAYA À TABLE PROSPECTS
ALTER TABLE prospects
ADD COLUMN IF NOT EXISTS wilaya VARCHAR(100);

-- Commentaire
COMMENT ON COLUMN prospects.wilaya IS 'Wilaya/Région du prospect - utilisée auto pour missions';

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_prospects_wilaya ON prospects(wilaya);

-- ============================================

-- ⚠️ NOTE: Table "clients" n'existe pas - on utilise "prospects" comme client source
-- Si besoin de table séparée, créer d'abord la table clients avec structure adéquate

-- ============================================

-- 3️⃣ CRÉER TABLE MISSIONS si elle n'existe pas
CREATE TABLE IF NOT EXISTS missions (
  id BIGSERIAL PRIMARY KEY,
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

-- ⚠️ OU SI TABLE MISSIONS EXISTE DÉJÀ: AJOUTER LES COLONNES MANQUANTES
-- Décommenter les lignes ci-dessous si la table missions existe déjà
/*
ALTER TABLE missions
ADD COLUMN IF NOT EXISTS lieu VARCHAR(100),
ADD COLUMN IF NOT EXISTS type_mission VARCHAR(50),
ADD COLUMN IF NOT EXISTS priorite VARCHAR(50) DEFAULT 'moyenne',
ADD COLUMN IF NOT EXISTS wilaya VARCHAR(100),
ADD COLUMN IF NOT EXISTS chef_mission_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS accompagnateurs_ids TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cloturee_par_chef BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS commentaire_clot_chef TEXT,
ADD COLUMN IF NOT EXISTS date_clot_chef TIMESTAMP,
ADD COLUMN IF NOT EXISTS cloturee_definitive BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS commentaire_clot_admin TEXT,
ADD COLUMN IF NOT EXISTS date_clot_definitive TIMESTAMP;

-- Commentaires
COMMENT ON COLUMN missions.lieu IS 'Lieu de la mission - où la mission se déroulera';
COMMENT ON COLUMN missions.type_mission IS 'Type de mission (Installation, Formation, Support, etc)';
COMMENT ON COLUMN missions.priorite IS 'Priorité de la mission (faible, moyenne, haute, critique)';
COMMENT ON COLUMN missions.wilaya IS 'Wilaya de la mission - remplie auto depuis client';
COMMENT ON COLUMN missions.chef_mission_id IS 'Chef de Mission responsable (from auth.users)';
COMMENT ON COLUMN missions.accompagnateurs_ids IS 'Liste IDs accompagnateurs (multi-select)';
COMMENT ON COLUMN missions.cloturee_par_chef IS 'Clôture étape 1 par chef de mission';
COMMENT ON COLUMN missions.commentaire_clot_chef IS 'Commentaire du chef à la clôture';
COMMENT ON COLUMN missions.date_clot_chef IS 'Date clôture par chef';
COMMENT ON COLUMN missions.cloturee_definitive IS 'Clôture définitive par admin';
COMMENT ON COLUMN missions.commentaire_clot_admin IS 'Commentaire final admin';
COMMENT ON COLUMN missions.date_clot_definitive IS 'Date validation définitive admin';

-- Index pour recherche
CREATE INDEX IF NOT EXISTS idx_missions_lieu ON missions(lieu);
CREATE INDEX IF NOT EXISTS idx_missions_type ON missions(type_mission);
CREATE INDEX IF NOT EXISTS idx_missions_priorite ON missions(priorite);
CREATE INDEX IF NOT EXISTS idx_missions_wilaya ON missions(wilaya);
CREATE INDEX IF NOT EXISTS idx_missions_chef ON missions(chef_mission_id);
CREATE INDEX IF NOT EXISTS idx_missions_statut_clot ON missions(cloturee_par_chef, cloturee_definitive);
*/

-- ============================================

-- 4️⃣ AJOUTER COLONNES MANQUANTES À TABLE MISSIONS (si elle existe)
-- Ces colonnes seront créées automatiquement par le CREATE TABLE IF NOT EXISTS ci-dessus
-- mais ce bloc ajoute un support pour les colonnes optionnelles

DO $$ 
BEGIN
  -- Ajouter colonne lieu si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'missions' AND column_name = 'lieu') THEN
    ALTER TABLE missions ADD COLUMN lieu VARCHAR(100);
  END IF;

  -- Ajouter colonne type_mission si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'missions' AND column_name = 'type_mission') THEN
    ALTER TABLE missions ADD COLUMN type_mission VARCHAR(50);
  END IF;

  -- Ajouter colonne priorite si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'missions' AND column_name = 'priorite') THEN
    ALTER TABLE missions ADD COLUMN priorite VARCHAR(50) DEFAULT 'moyenne';
  END IF;

  -- Ajouter colonne wilaya si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'missions' AND column_name = 'wilaya') THEN
    ALTER TABLE missions ADD COLUMN wilaya VARCHAR(100);
  END IF;
  
  -- Ajouter colonne chef_mission_id si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'missions' AND column_name = 'chef_mission_id') THEN
    ALTER TABLE missions ADD COLUMN chef_mission_id UUID REFERENCES auth.users(id);
  END IF;
  
  -- Ajouter colonne accompagnateurs_ids si elle n'existe pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'missions' AND column_name = 'accompagnateurs_ids') THEN
    ALTER TABLE missions ADD COLUMN accompagnateurs_ids TEXT[] DEFAULT '{}';
  END IF;

  -- Ajouter colonnes de clôture si elles n'existent pas
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'missions' AND column_name = 'cloturee_par_chef') THEN
    ALTER TABLE missions ADD COLUMN cloturee_par_chef BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'missions' AND column_name = 'commentaire_clot_chef') THEN
    ALTER TABLE missions ADD COLUMN commentaire_clot_chef TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'missions' AND column_name = 'date_clot_chef') THEN
    ALTER TABLE missions ADD COLUMN date_clot_chef TIMESTAMP;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'missions' AND column_name = 'cloturee_definitive') THEN
    ALTER TABLE missions ADD COLUMN cloturee_definitive BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'missions' AND column_name = 'commentaire_clot_admin') THEN
    ALTER TABLE missions ADD COLUMN commentaire_clot_admin TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'missions' AND column_name = 'date_clot_definitive') THEN
    ALTER TABLE missions ADD COLUMN date_clot_definitive TIMESTAMP;
  END IF;
END $$;

-- ============================================

-- 5️⃣ AJOUTER COMMENTAIRES ET INDEX
-- Commentaires
COMMENT ON COLUMN missions.lieu IS 'Lieu de la mission - où la mission se déroulera';
COMMENT ON COLUMN missions.type_mission IS 'Type de mission (Installation, Formation, Support, etc)';
COMMENT ON COLUMN missions.priorite IS 'Priorité de la mission (faible, moyenne, haute, critique)';
COMMENT ON COLUMN missions.wilaya IS 'Wilaya de la mission - remplie auto depuis client';
COMMENT ON COLUMN missions.chef_mission_id IS 'Chef de Mission responsable (from auth.users)';
COMMENT ON COLUMN missions.accompagnateurs_ids IS 'Liste IDs accompagnateurs (multi-select)';
COMMENT ON COLUMN missions.cloturee_par_chef IS 'Clôture étape 1 par chef de mission';
COMMENT ON COLUMN missions.commentaire_clot_chef IS 'Commentaire du chef à la clôture';
COMMENT ON COLUMN missions.date_clot_chef IS 'Date clôture par chef';
COMMENT ON COLUMN missions.cloturee_definitive IS 'Clôture définitive par admin';
COMMENT ON COLUMN missions.commentaire_clot_admin IS 'Commentaire final admin';
COMMENT ON COLUMN missions.date_clot_definitive IS 'Date validation définitive admin';

-- Index pour recherche
CREATE INDEX IF NOT EXISTS idx_missions_wilaya ON missions(wilaya);
CREATE INDEX IF NOT EXISTS idx_missions_chef ON missions(chef_mission_id);
CREATE INDEX IF NOT EXISTS idx_missions_statut_clot ON missions(cloturee_par_chef, cloturee_definitive);

-- ============================================

-- 6️⃣ COMMIT DE LA TRANSACTION
COMMIT;

-- ============================================

-- 5️⃣ VÉRIFIER LES CHANGEMENTS

-- Afficher structure prospects
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'prospects';

-- Afficher structure missions
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'missions';

-- ============================================

-- 6️⃣ PERMISSIONS - Pour utilisateurs lecture missions
-- (À adapter selon votre système de permissions)

-- Les admins peuvent voir toutes les missions
-- Les chefs voient leurs missions via chef_mission_id
-- Les accompagnateurs voient missions où ils sont dans accompagnateurs_ids

-- ============================================
-- FIN MIGRATION
-- ============================================
