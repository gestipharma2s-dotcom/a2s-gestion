-- Ajout de TOUTES les colonnes une par une
ALTER TABLE public.prospect_history ADD COLUMN IF NOT EXISTS type_action TEXT;
ALTER TABLE public.prospect_history ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.prospect_history ADD COLUMN IF NOT EXISTS details TEXT;
ALTER TABLE public.prospect_history ADD COLUMN IF NOT EXISTS application TEXT;
ALTER TABLE public.prospect_history ADD COLUMN IF NOT EXISTS chef_mission TEXT;
ALTER TABLE public.prospect_history ADD COLUMN IF NOT EXISTS date_debut TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.prospect_history ADD COLUMN IF NOT EXISTS date_fin TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.prospect_history ADD COLUMN IF NOT EXISTS conversion TEXT DEFAULT 'non';
ALTER TABLE public.prospect_history ADD COLUMN IF NOT EXISTS anciens_logiciels TEXT[];
ALTER TABLE public.prospect_history ADD COLUMN IF NOT EXISTS prospect_id UUID REFERENCES public.prospects(id) ON DELETE CASCADE;
ALTER TABLE public.prospect_history ADD COLUMN IF NOT EXISTS created_by UUID;

-- Rechargement du cache
NOTIFY pgrst, 'reload config';
