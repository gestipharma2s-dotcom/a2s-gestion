import { supabase } from './supabaseClient';

export const installationPlanningService = {
    // Récupérer toutes les installations prévues (type_action = 'installation')
    async getAllPlanned() {
        try {
            console.log('🔄 Chargement des installations planifiées (prospect_history)...');

            const { data, error } = await supabase
                .from('prospect_history')
                .select(`
    *,
    prospect: prospects(
        id,
        raison_sociale,
        contact,
        telephone,
        email,
        wilaya,
        secteur,
        statut
    )
        `)
                .eq('type_action', 'installation')
                .order('date_debut', { ascending: true });

            if (error) {
                console.error('❌ Erreur récupération installations (prospect_history table manquante ?):', error);
                console.error('Détails erreur:', error.details, error.message);
                throw error;
            }

            console.log('✅ Installations chargées:', data?.length || 0, 'installations trouvées');
            if (data && data.length > 0) {
                console.log('🔍 Exemple 1er élément:', data[0]);
            } else {
                console.warn('⚠️ Aucune installation trouvée dans la table prospect_history.');
            }

            return data || [];
        } catch (error) {
            console.error('❌ Erreur CRITIQUE service installations:', error);
            return [];
        }
    },

    // Récupérer les installations d'un prospect spécifique
    async getByProspect(prospectId) {
        try {
            const { data, error } = await supabase
                .from('prospect_history')
                .select('*')
                .eq('prospect_id', prospectId)
                .eq('type_action', 'installation')
                .order('date_debut', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erreur récupération installations prospect:', error);
            return [];
        }
    },

    // Récupérer les installations par période
    async getByDateRange(dateDebut, dateFin) {
        try {
            const { data, error } = await supabase
                .from('prospect_history')
                .select(`
        *,
        prospect: prospects(
            id,
            raison_sociale,
            contact,
            telephone,
            email,
            wilaya,
            secteur,
            statut
        )
            `)
                .eq('type_action', 'installation')
                .gte('date_debut', dateDebut)
                .lte('date_fin', dateFin)
                .order('date_debut', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erreur récupération installations par période:', error);
            return [];
        }
    },

    // Récupérer les statistiques des installations
    async getStats() {
        try {
            const { data, error } = await supabase
                .from('prospect_history')
                .select('*')
                .eq('type_action', 'installation');

            if (error) throw error;

            const now = new Date();
            const installations = data || [];

            return {
                total: installations.length,
                aVenir: installations.filter(i => new Date(i.date_debut) > now).length,
                enCours: installations.filter(i => {
                    const debut = new Date(i.date_debut);
                    const fin = new Date(i.date_fin);
                    return debut <= now && fin >= now;
                }).length,
                terminees: installations.filter(i => new Date(i.date_fin) < now).length
            };
        } catch (error) {
            console.error('Erreur statistiques installations:', error);
            return { total: 0, aVenir: 0, enCours: 0, terminees: 0 };
        }
    },

    // Mettre à jour une action du planning (ex: lier une mission)
    async update(id, updateData) {
        try {
            const { data, error } = await supabase
                .from('prospect_history')
                .update(updateData)
                .eq('id', id)
                .select();

            if (error) throw error;
            return data && data.length > 0 ? data[0] : null;
        } catch (error) {
            console.error('Erreur mise à jour planning service:', error);
            throw error;
        }
    },

    // Supprimer une action du planning
    async delete(id) {
        try {
            const { error } = await supabase
                .from('prospect_history')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Erreur suppression planning service:', error);
            throw error;
        }
    }
};
