-- 🛠️ SCRIPT POUR RÉPARER LA SUPPRESSION DES UTILISATEURS (ORPHELINS) 🛠️

-- EXPLICATION : Actuellement, quand on supprime un utilisateur de l'application, 
-- son email reste bloqué dans la table secrète d'authentification (users_auth).
-- Cela empêche ensuite de recréer un utilisateur avec le même email !

-- =========================================================================
-- 1. NETTOYER LES COMPTES FANTÔMES (ORPHELINS) DÈS MAINTENANT
-- =========================================================================
-- Cette requête va supprimer TOUS les emails bloqués dans users_auth 
-- qui n'existent plus dans votre table principale "users".
DELETE FROM public.users_auth
WHERE lower(email) NOT IN (
    SELECT lower(email) FROM public.users
);


-- =========================================================================
-- 2. AUTOMATISER LA SUPPRESSION POUR L'AVENIR (DÉCLENCHEUR / TRIGGER)
-- =========================================================================
-- Ce trigger supprimera automatiquement la ligne de "users_auth" si vous supprimez
-- un compte de l'interface "Utilisateurs".

-- A. Créer la fonction déclencheur
CREATE OR REPLACE FUNCTION public.sync_delete_user_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.users_auth 
    WHERE lower(email) = lower(OLD.email);
    RETURN OLD;
END;
$$;

-- B. Attacher le déclencheur à la table users
DROP TRIGGER IF EXISTS trigger_sync_delete_user_auth ON public.users;
CREATE TRIGGER trigger_sync_delete_user_auth
AFTER DELETE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_delete_user_auth();
