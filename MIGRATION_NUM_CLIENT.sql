-- MIGRATION: Ajouter la colonne num_client à la table prospects
-- Exécuter ce SQL dans Supabase SQL Editor
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS num_client TEXT;

-- Ajout d'index pour accélérer la recherche par numéro client
CREATE INDEX IF NOT EXISTS idx_prospects_num_client ON public.prospects(num_client);
