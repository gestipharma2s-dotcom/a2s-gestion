-- 1. Création de la table pour l'historique détaillé et la planification
CREATE TABLE IF NOT EXISTS public.prospect_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    prospect_id UUID REFERENCES public.prospects(id) ON DELETE CASCADE,
    type_action TEXT NOT NULL,
    description TEXT,
    details TEXT,
    
    -- Colonnes spécifiques pour l'installation
    application TEXT,
    chef_mission TEXT, -- On garde en TEXT pour la flexibilité (stocke l'UUID de l'user)
    date_debut TIMESTAMP WITH TIME ZONE,
    date_fin TIMESTAMP WITH TIME ZONE,
    conversion TEXT DEFAULT 'non',
    anciens_logiciels TEXT[], -- Tableau de texte pour stocker plusieurs logiciels
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID
);

-- 2. Activer la sécurité (RLS)
ALTER TABLE public.prospect_history ENABLE ROW LEVEL SECURITY;

-- 3. Créer les politiques de sécurité (Pour permettre la lecture/écriture)
-- Lecture pour tous les authentifiés
CREATE POLICY "Lecture prospect_history pour tous" 
ON public.prospect_history FOR SELECT 
USING (true);

-- Insertion pour tous les authentifiés
CREATE POLICY "Insertion prospect_history pour tous" 
ON public.prospect_history FOR INSERT 
WITH CHECK (true);

-- Modification pour tous les authentifiés
CREATE POLICY "Modification prospect_history pour tous" 
ON public.prospect_history FOR UPDATE 
USING (true);

-- Suppression pour tous les authentifiés
CREATE POLICY "Suppression prospect_history pour tous" 
ON public.prospect_history FOR DELETE 
USING (true);

-- 4. Accorder les permissions
GRANT ALL ON public.prospect_history TO authenticated;
GRANT ALL ON public.prospect_history TO service_role;
