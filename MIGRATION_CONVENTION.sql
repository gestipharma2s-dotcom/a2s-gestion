-- 📋 MIGRATION SQL POUR LA CONVENTION LOGIPHARM 📋
-- À exécuter dans le SQL Editor de Supabase

-- Ajout des colonnes légales à la table prospects
ALTER TABLE public.prospects 
ADD COLUMN IF NOT EXISTS rc TEXT, -- Registre de Commerce
ADD COLUMN IF NOT EXISTS nif TEXT, -- Identifiant Fiscal
ADD COLUMN IF NOT EXISTS ai TEXT, -- Article d'Imposition
ADD COLUMN IF NOT EXISTS nis TEXT; -- Numéro d'Identification Statistique

-- NOTE : Une fois exécuté, vous pourrez saisir ces informations dans la fiche client.
-- La convention les récupérera automatiquement.
