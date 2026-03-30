-- Permettre le statut 'archive' dans la table prospects
ALTER TABLE prospects DROP CONSTRAINT IF EXISTS prospects_statut_check;
ALTER TABLE prospects ADD CONSTRAINT prospects_statut_check CHECK (statut IN ('prospect', 'actif', 'inactif', 'archive'));
