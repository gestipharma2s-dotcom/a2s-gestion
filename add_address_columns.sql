-- Ajout de colonnes adresse et ville à la table prospects
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS adresse TEXT;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS ville TEXT;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS forme_juridique TEXT;

-- Rechargement du cache postgrest
NOTIFY pgrst, 'reload config';
