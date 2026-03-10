-- Ajout de la colonne solde_initial à la table prospects
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS solde_initial NUMERIC DEFAULT 0;

-- Commentaire pour expliquer la colonne
COMMENT ON COLUMN prospects.solde_initial IS 'Solde initial du client lors de son importation ou création (dette historique)';
