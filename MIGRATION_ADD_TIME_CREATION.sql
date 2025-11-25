-- Migration: Ajouter le champ time_creation pour stocker l'heure précise de création
-- Date: 2025-11-24
-- Raison: Calculer correctement la durée des interventions en minutes

-- 1. Supprimer la colonne si elle existe déjà (pour repartir de zéro)
ALTER TABLE public.interventions
DROP COLUMN IF EXISTS time_creation;

-- 2. Ajouter la colonne time_creation SANS défaut (on l'envoie manuellement depuis le client)
ALTER TABLE public.interventions
ADD COLUMN time_creation TIMESTAMP;

-- 3. Ajouter un commentaire
COMMENT ON COLUMN public.interventions.time_creation IS 'Timestamp précis de création de l''intervention (stocké côté client)';

-- 4. Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_interventions_time_creation ON public.interventions(time_creation);
