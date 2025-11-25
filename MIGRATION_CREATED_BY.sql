-- ============================================
-- MIGRATION: Ajouter le champ created_by à toutes les tables de pièces
-- ============================================
-- Date: 2025-11-21
-- Description: Identifie qui a créé chaque pièce (prospect, installation, paiement, intervention)
--              Et empêche la suppression d'utilisateurs qui ont créé des pièces

-- ============================================
-- 1. Ajouter la colonne created_by à la table prospects
-- ============================================
ALTER TABLE public.prospects
ADD COLUMN created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- ============================================
-- 2. Ajouter la colonne created_by à la table installations
-- ============================================
ALTER TABLE public.installations
ADD COLUMN created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- ============================================
-- 3. Ajouter la colonne created_by à la table paiements
-- ============================================
ALTER TABLE public.paiements
ADD COLUMN created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- ============================================
-- 4. Ajouter la colonne created_by à la table interventions
-- ============================================
ALTER TABLE public.interventions
ADD COLUMN created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- ============================================
-- Commentaires pour documentation
-- ============================================

COMMENT ON COLUMN public.prospects.created_by IS 'L''utilisateur qui a créé ce prospect';
COMMENT ON COLUMN public.installations.created_by IS 'L''utilisateur qui a créé cette installation';
COMMENT ON COLUMN public.paiements.created_by IS 'L''utilisateur qui a créé ce paiement';
COMMENT ON COLUMN public.interventions.created_by IS 'L''utilisateur qui a créé cette intervention';

-- ============================================
-- Index pour améliorer les performances des requêtes
-- ============================================

CREATE INDEX idx_prospects_created_by ON public.prospects(created_by);
CREATE INDEX idx_installations_created_by ON public.installations(created_by);
CREATE INDEX idx_paiements_created_by ON public.paiements(created_by);
CREATE INDEX idx_interventions_created_by ON public.interventions(created_by);
