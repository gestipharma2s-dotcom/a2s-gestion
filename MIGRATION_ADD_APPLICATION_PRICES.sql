-- Migration: Ajouter les colonnes prix_acquisition et prix_abonnement à la table applications
-- Date: 2025-11-25

-- Ajouter les colonnes si elles n'existent pas
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS prix_acquisition NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS prix_abonnement NUMERIC DEFAULT 0;

-- Migrer les données existantes (si la colonne prix existe)
UPDATE applications 
SET prix_acquisition = COALESCE(prix, 0),
    prix_abonnement = COALESCE(prix, 0)
WHERE (prix_acquisition = 0 OR prix_acquisition IS NULL)
  AND (prix_abonnement = 0 OR prix_abonnement IS NULL);

