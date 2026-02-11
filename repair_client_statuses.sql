-- SCRIPT DE RÉPARATION DES STATUTS CLIENTS
-- Objectif : Repasser en statut 'prospect' tous les clients 'actifs' 
-- qui n'ont aucune installation enregistrée (ni SQL, ni JSON).

UPDATE prospects
SET statut = 'prospect'
WHERE statut = 'actif'
  -- 1. Pas d'installation dans la table structurée
  AND id NOT IN (
    SELECT DISTINCT prospect_id 
    FROM prospect_history 
    WHERE type_action = 'installation'
  )
  -- 2. Pas d'installation dans le champ JSON legacy
  AND (
    historique_actions IS NULL 
    OR historique_actions::text = '[]'
    OR id NOT IN (
        SELECT id 
        FROM prospects 
        WHERE historique_actions::text LIKE '%"action":"installation"%'
    )
  );

-- Vérification après exécution
-- SELECT count(*) FROM prospects WHERE statut = 'actif';
