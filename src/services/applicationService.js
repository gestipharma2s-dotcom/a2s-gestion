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
      // ✅ NOUVEAU: Normaliser les données pour supporter les 2 prix
      const normalizedData = {
        nom: applicationData.nom,
        description: applicationData.description || '',
        prix_acquisition: parseFloat(applicationData.prix_acquisition) || parseFloat(applicationData.prix) || 0,
        prix_abonnement: parseFloat(applicationData.prix_abonnement) || parseFloat(applicationData.prix) || 0,
        // Garder aussi le champ 'prix' pour compatibilité
        prix: parseFloat(applicationData.prix_acquisition) || parseFloat(applicationData.prix) || 0
      };

      const { data, error } = await supabase
        .from('applications')
        .insert([normalizedData])
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
      // ✅ NOUVEAU: Normaliser les données pour supporter les 2 prix
      const normalizedData = {
        nom: applicationData.nom || undefined,
        description: applicationData.description || undefined,
        prix_acquisition: applicationData.prix_acquisition ? parseFloat(applicationData.prix_acquisition) : undefined,
        prix_abonnement: applicationData.prix_abonnement ? parseFloat(applicationData.prix_abonnement) : undefined
      };

      // Supprimer les undefined
      Object.keys(normalizedData).forEach(key => 
        normalizedData[key] === undefined && delete normalizedData[key]
      );

      // Mettre aussi à jour le champ 'prix' pour compatibilité (utiliser prix_acquisition)
      if (normalizedData.prix_acquisition) {
        normalizedData.prix = normalizedData.prix_acquisition;
      }

      const { data, error } = await supabase
        .from('applications')
        .update(normalizedData)
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