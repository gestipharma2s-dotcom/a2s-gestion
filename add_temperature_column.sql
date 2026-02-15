-- SCRIPT DE MIGRATION : AJOUT DE LA COLONNE TEMPÉRATURE
-- Ce script ajoute le suivi du degré d'intérêt pour les prospects.

-- Ajout de la colonne temperature à la table prospects
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS temperature VARCHAR(20) DEFAULT 'froid';

-- Commentaire pour expliquer les valeurs possibles
COMMENT ON COLUMN prospects.temperature IS 'Niveau d''intérêt du prospect : froid, tiede, chaud, brulant';
