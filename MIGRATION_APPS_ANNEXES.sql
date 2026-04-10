-- 📋 MIGRATION SQL POUR LES APPLICATIONS ANNEXES (INSTALLATIONS) 📋
-- À exécuter dans le SQL Editor de Supabase

-- Ajouter une colonne JSONB pour stocker les applications annexes d'une installation
ALTER TABLE public.installations
ADD COLUMN IF NOT EXISTS applications_annexes JSONB DEFAULT '[]'::jsonb;

-- Format attendu (tableau d'objets) :
-- [
--   { "app_id": "uuid", "nom": "COMPTABILITE SCF", "montant": 500000 },
--   { "app_id": "uuid", "nom": "CRM MOBILE", "montant": 200000 }
-- ]
