-- Ajout forcé des colonnes manquantes à la table existante
ALTER TABLE public.prospect_history ADD COLUMN IF NOT EXISTS anciens_logiciels TEXT[];
ALTER TABLE public.prospect_history ADD COLUMN IF NOT EXISTS application TEXT;
ALTER TABLE public.prospect_history ADD COLUMN IF NOT EXISTS chef_mission TEXT;
ALTER TABLE public.prospect_history ADD COLUMN IF NOT EXISTS date_debut TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.prospect_history ADD COLUMN IF NOT EXISTS date_fin TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.prospect_history ADD COLUMN IF NOT EXISTS conversion TEXT DEFAULT 'non';

-- Au cas où, on s'assure que les permissions sont bonnes
GRANT ALL ON public.prospect_history TO authenticated;
GRANT ALL ON public.prospect_history TO service_role;

-- Rechargement du cache de schéma (commande spéciale Supabase/PostgREST)
NOTIFY pgrst, 'reload config';
