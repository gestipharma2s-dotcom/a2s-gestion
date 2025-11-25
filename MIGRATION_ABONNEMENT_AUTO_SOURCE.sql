-- Migration: Ajouter les champs source et auto_generated à la table abonnements
-- Date: 2025-11-25
-- Raison: Tracer les abonnements générés automatiquement à partir d'acquisitions

-- 1. Ajouter colonne 'source' pour tracer l'origine (ex: ABONNEMENT (ACQUISITION))
ALTER TABLE public.abonnements
ADD COLUMN IF NOT EXISTS source VARCHAR(100);

-- 2. Ajouter colonne 'auto_generated' pour marquer les abonnements auto-générés
ALTER TABLE public.abonnements
ADD COLUMN IF NOT EXISTS auto_generated BOOLEAN DEFAULT false;

-- 3. Ajouter un commentaire
COMMENT ON COLUMN public.abonnements.source IS 'Source de création de l''abonnement (ex: ABONNEMENT (ACQUISITION) pour les renouvellements auto)';
COMMENT ON COLUMN public.abonnements.auto_generated IS 'True si l''abonnement a été généré automatiquement par le système';

-- 4. Créer un index sur source pour les recherches
CREATE INDEX IF NOT EXISTS idx_abonnements_source ON public.abonnements(source);
CREATE INDEX IF NOT EXISTS idx_abonnements_auto_generated ON public.abonnements(auto_generated);
