-- SCRIPT DE NETTOYAGE DES MISSIONS TERMINÉES
-- Ce script supprime toutes les missions ayant le statut 'cloturee' ou 'validee'
-- Il nettoie également les références dans le planning pour éviter les erreurs.

DO $$ 
DECLARE 
    m_record RECORD;
BEGIN 
    -- On boucle sur toutes les missions qui sont clôturées ou validées
    FOR m_record IN (SELECT id, titre FROM missions WHERE statut IN ('cloturee', 'validee', 'terminée', 'terminé')) 
    LOOP
        RAISE NOTICE 'Traitement de la mission : % (ID: %)', m_record.titre, m_record.id;

        -- 1. Nettoyage du planning (Table prospect_history)
        -- On met mission_id à NULL pour que l'installation reste tracée mais sans lien vers une mission supprimée
        UPDATE prospect_history SET mission_id = NULL WHERE mission_id = m_record.id;
        
        -- 2. Nettoyage de la table installations (si elle existe)
        BEGIN
            UPDATE installations SET mission_id = NULL WHERE mission_id = m_record.id;
        EXCEPTION WHEN others THEN NULL; -- Ignore si la table n'existe pas
        END;

        -- 3. Suppression des dépenses liées (si table existe)
        BEGIN
            DELETE FROM missions_expenses WHERE mission_id = m_record.id;
        EXCEPTION WHEN others THEN NULL;
        END;

        -- 4. Suppression des participants liés (si table existe)
        BEGIN
            DELETE FROM missions_participants WHERE mission_id = m_record.id;
        EXCEPTION WHEN others THEN NULL;
        END;

        -- 5. Suppression de la mission elle-même
        DELETE FROM missions WHERE id = m_record.id;

        RAISE NOTICE 'Mission % supprimée.', m_record.id;
    END LOOP;

    RAISE NOTICE 'Opération terminée : Toutes les missions terminées ont été nettoyées.';
END $$;
