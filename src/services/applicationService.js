import { supabase } from './supabaseClient';

export const applicationService = {
  // Récupérer toutes les applications
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('nom', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération applications:', error);
      throw error;
    }
  },

  // Récupérer une application par ID
  getById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur récupération application:', error);
      throw error;
    }
  },

  // Créer une nouvelle application
  create: async (applicationData) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert([applicationData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur création application:', error);
      throw error;
    }
  },

  // Mettre à jour une application
  update: async (id, applicationData) => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .update(applicationData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur mise à jour application:', error);
      throw error;
    }
  },

  // Supprimer une application
  delete: async (id) => {
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur suppression application:', error);
      throw error;
    }
  },

  // Récupérer les statistiques
  getStats: async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*');

      if (error) throw error;

      return {
        total: data.length,
        actives: data.filter(a => a.statut === 'actif').length,
        inactives: data.filter(a => a.statut === 'inactif').length
      };
    } catch (error) {
      console.error('Erreur récupération stats applications:', error);
      throw error;
    }
  
}
};