-- 📋 MIGRATION SQL POUR LES MODULES D'APPLICATIONS 📋
-- À exécuter dans le SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS public.application_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  prix_acquisition NUMERIC DEFAULT 0,
  prix_abonnement NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour les requêtes rapides
CREATE INDEX IF NOT EXISTS idx_app_modules_app_id ON public.application_modules(application_id);

-- Permissions RLS
ALTER TABLE public.application_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON public.application_modules
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
