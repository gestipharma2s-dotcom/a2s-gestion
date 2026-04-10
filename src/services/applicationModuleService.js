import { supabase } from './supabaseClient';

const TABLE = 'application_modules';

export const applicationModuleService = {
    // Récupérer les modules d'une application
    async getByApplication(applicationId) {
        try {
            const { data, error } = await supabase
                .from(TABLE)
                .select('*')
                .eq('application_id', applicationId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erreur récupération modules:', error);
            return [];
        }
    },

    // Récupérer tous les modules (pour toutes les applications)
    async getAll() {
        try {
            const { data, error } = await supabase
                .from(TABLE)
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Erreur récupération tous les modules:', error);
            return [];
        }
    },

    // Créer un module
    async create(moduleData) {
        try {
            const { data, error } = await supabase
                .from(TABLE)
                .insert([{
                    application_id: moduleData.application_id,
                    nom: moduleData.nom,
                    prix_acquisition: parseFloat(moduleData.prix_acquisition) || 0,
                    prix_abonnement: parseFloat(moduleData.prix_abonnement) || 0
                }])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erreur création module:', error);
            throw error;
        }
    },

    // Modifier un module
    async update(id, moduleData) {
        try {
            const updateData = {};
            if (moduleData.nom !== undefined) updateData.nom = moduleData.nom;
            if (moduleData.prix_acquisition !== undefined) updateData.prix_acquisition = parseFloat(moduleData.prix_acquisition) || 0;
            if (moduleData.prix_abonnement !== undefined) updateData.prix_abonnement = parseFloat(moduleData.prix_abonnement) || 0;

            const { data, error } = await supabase
                .from(TABLE)
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Erreur mise à jour module:', error);
            throw error;
        }
    },

    // Supprimer un module
    async delete(id) {
        try {
            const { error } = await supabase
                .from(TABLE)
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Erreur suppression module:', error);
            throw error;
        }
    }
};
