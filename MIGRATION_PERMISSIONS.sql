-- Migration: Ajouter colonnes de permissions pour les utilisateurs
-- Date: 2025-11-21
-- Description: Ajouter des permissions edit/delete pour chaque type de pièce

-- ⚠️ NOTA: Utilisation de DO $$ pour ajouter les colonnes de manière sécurisée
-- Ceci évite les erreurs si les colonnes existent déjà

DO $$ 
BEGIN
  -- Ajouter colonnes de permissions pour Prospects
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'can_edit_prospects') THEN
    ALTER TABLE public.users ADD COLUMN can_edit_prospects BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'can_delete_prospects') THEN
    ALTER TABLE public.users ADD COLUMN can_delete_prospects BOOLEAN DEFAULT false;
  END IF;

  -- Ajouter colonnes de permissions pour Installations
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'can_edit_installations') THEN
    ALTER TABLE public.users ADD COLUMN can_edit_installations BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'can_delete_installations') THEN
    ALTER TABLE public.users ADD COLUMN can_delete_installations BOOLEAN DEFAULT false;
  END IF;

  -- Ajouter colonnes de permissions pour Paiements
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'can_edit_paiements') THEN
    ALTER TABLE public.users ADD COLUMN can_edit_paiements BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'can_delete_paiements') THEN
    ALTER TABLE public.users ADD COLUMN can_delete_paiements BOOLEAN DEFAULT false;
  END IF;

  -- Ajouter colonnes de permissions pour Interventions
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'can_edit_interventions') THEN
    ALTER TABLE public.users ADD COLUMN can_edit_interventions BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'can_delete_interventions') THEN
    ALTER TABLE public.users ADD COLUMN can_delete_interventions BOOLEAN DEFAULT false;
  END IF;

  -- Ajouter colonnes de permissions pour Missions
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'can_create_missions') THEN
    ALTER TABLE public.users ADD COLUMN can_create_missions BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'can_edit_missions') THEN
    ALTER TABLE public.users ADD COLUMN can_edit_missions BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'can_delete_missions') THEN
    ALTER TABLE public.users ADD COLUMN can_delete_missions BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'can_close_missions') THEN
    ALTER TABLE public.users ADD COLUMN can_close_missions BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'can_validate_missions') THEN
    ALTER TABLE public.users ADD COLUMN can_validate_missions BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Donner toutes les permissions aux admins et super_admins par défaut
UPDATE public.users
SET 
  can_edit_prospects = true,
  can_delete_prospects = true,
  can_edit_installations = true,
  can_delete_installations = true,
  can_edit_paiements = true,
  can_delete_paiements = true,
  can_edit_interventions = true,
  can_delete_interventions = true,
  can_create_missions = true,
  can_edit_missions = true,
  can_delete_missions = true,
  can_close_missions = true,
  can_validate_missions = true
WHERE role IN ('admin', 'super_admin');

-- Créer des index pour les colonnes de permissions (si elles n'existent pas)
DO $$ 
BEGIN
  -- Index pour Prospects
  CREATE INDEX IF NOT EXISTS idx_users_can_edit_prospects ON public.users(can_edit_prospects);
  CREATE INDEX IF NOT EXISTS idx_users_can_delete_prospects ON public.users(can_delete_prospects);
  
  -- Index pour Installations
  CREATE INDEX IF NOT EXISTS idx_users_can_edit_installations ON public.users(can_edit_installations);
  CREATE INDEX IF NOT EXISTS idx_users_can_delete_installations ON public.users(can_delete_installations);
  
  -- Index pour Paiements
  CREATE INDEX IF NOT EXISTS idx_users_can_edit_paiements ON public.users(can_edit_paiements);
  CREATE INDEX IF NOT EXISTS idx_users_can_delete_paiements ON public.users(can_delete_paiements);
  
  -- Index pour Interventions
  CREATE INDEX IF NOT EXISTS idx_users_can_edit_interventions ON public.users(can_edit_interventions);
  CREATE INDEX IF NOT EXISTS idx_users_can_delete_interventions ON public.users(can_delete_interventions);
  
  -- Index pour Missions
  CREATE INDEX IF NOT EXISTS idx_users_can_create_missions ON public.users(can_create_missions);
  CREATE INDEX IF NOT EXISTS idx_users_can_edit_missions ON public.users(can_edit_missions);
  CREATE INDEX IF NOT EXISTS idx_users_can_delete_missions ON public.users(can_delete_missions);
  CREATE INDEX IF NOT EXISTS idx_users_can_close_missions ON public.users(can_close_missions);
  CREATE INDEX IF NOT EXISTS idx_users_can_validate_missions ON public.users(can_validate_missions);
EXCEPTION WHEN OTHERS THEN
  -- Ignorer les erreurs d'index
  NULL;
END $$;
