-- ⚠️ SCRIPT 3.0 FINAL DE CORRECTION DES MOTS DE PASSE A2S GESTION ⚠️

-- CORRECTION EXACTE : Les tables users et users_auth sont reliées par l'EMAIL, pas par l'ID !
-- On utilise l'ID pour trouver l'email dans users, puis on met à jour users_auth

CREATE OR REPLACE FUNCTION public.update_user_password_local(
    p_user_id UUID,
    p_password TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_email TEXT;
BEGIN
    -- 1. Obtenir l'email de la table users en utilisant l'ID
    SELECT email INTO v_email 
    FROM public.users 
    WHERE id = p_user_id;

    IF v_email IS NULL THEN
        RAISE EXCEPTION 'Utilisateur non trouvé dans la table principale (users)';
    END IF;

    -- 2. Mettre à jour le mot de passe dans users_auth en utilisant cet email
    UPDATE public.users_auth
    SET password_hash = crypt(p_password, gen_salt('bf'))
    WHERE lower(email) = lower(v_email);

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Utilisateur non trouvé dans la table d''authentification locale pour l''email %', v_email;
    END IF;
END;
$$;

-- Accorder les permissions d'exécution
GRANT EXECUTE ON FUNCTION public.update_user_password_local(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_password_local(UUID, TEXT) TO service_role;

-- 👉 Exécutez ce script intégralement dans le SQL Editor de Supabase.

-- =========================================================================
-- SI VOUS ÊTES BLOQUÉ ET DÉCONNECTÉ (MOT DE PASSE INVALIDE) :
-- Décommentez ces lignes (enlevez les "--" au début) et remplacez les valeurs 
-- par votre email et votre nouveau mot de passe désiré (ex: 123456)
/*
DO $$
BEGIN
    UPDATE public.users_auth 
    SET password_hash = crypt('123456', gen_salt('bf'))    -- 👈 Votre nouveau mot de passe
    WHERE lower(email) = lower('votre.email@a2s-dz.com');  -- 👈 Votre email exact
END $$;
*/
