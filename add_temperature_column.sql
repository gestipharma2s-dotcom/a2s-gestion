-- Ajout de la colonne temperature à la table prospects
IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prospects' AND column_name = 'temperature') THEN
    ALTER TABLE prospects ADD COLUMN temperature VARCHAR(20) DEFAULT 'froid';
END IF;

-- Commentaire pour expliquer les valeurs possibles
COMMENT ON COLUMN prospects.temperature IS 'Niveau d''intérêt du prospect : froid, tiede, chaud, brulant';
