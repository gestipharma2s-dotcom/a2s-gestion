import { supabase } from './supabaseClient';
import { TABLES } from './supabaseClient';

export const interventionService = {
  // Récupérer toutes les interventions
  async getAll() {
    try {
      const { data, error } = await supabase
        .from(TABLES.INTERVENTIONS)
        .select(`
          *,
          client:prospects!client_id(raison_sociale, contact, telephone),
          technicien:users!technicien_id(id, nom, email)
        `)
        .order('date_intervention', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur récupération interventions:', error);
      throw error;
    }
  },

  // Récupérer les interventions d'un client
  async getByClient(clientId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.INTERVENTIONS)
        .select(`
          *,
          technicien:users!technicien_id(id, nom, email)
        `)
        .eq('client_id', clientId)
        .order('date_intervention', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur récupération interventions client:', error);
      throw error;
    }
  },

  // Récupérer les interventions d'un technicien
  async getByTechnicien(technicienId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.INTERVENTIONS)
        .select(`
          *,
          client:prospects!client_id(raison_sociale, contact, telephone),
          technicien:users!technicien_id(id, nom, email)
        `)
        .eq('technicien_id', technicienId)
        .order('date_intervention', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur récupération interventions technicien:', error);
      throw error;
    }
  },

  // Créer une intervention
  async create(interventionData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.INTERVENTIONS)
        .insert([{
          ...interventionData,
          statut: interventionData.statut || 'en_cours',
          date_intervention: interventionData.date_intervention || new Date().toISOString()
        }])
        .select(`
          *,
          client:prospects!client_id(raison_sociale, contact, telephone),
          technicien:users!technicien_id(id, nom, email)
        `)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur création intervention:', error);
      throw error;
    }
  },

  // Mettre à jour une intervention
  async update(id, interventionData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.INTERVENTIONS)
        .update(interventionData)
        .eq('id', id)
        .select(`
          *,
          client:prospects!client_id(raison_sociale, contact, telephone),
          technicien:users!technicien_id(id, nom, email)
        `)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur mise à jour intervention:', error);
      throw error;
    }
  },

  // Clôturer une intervention
  async cloturer(id, actionEntreprise, commentaires) {
    try {
      const dateFin = new Date();
      
      const { data, error } = await supabase
        .from(TABLES.INTERVENTIONS)
        .update({
          statut: 'cloturee',
          action_entreprise: actionEntreprise,
          commentaires: commentaires,
          date_fin: dateFin.toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          client:prospects!client_id(raison_sociale, contact, telephone),
          technicien:users!technicien_id(id, nom, email)
        `)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur clôture intervention:', error);
      throw error;
    }
  },

  // Supprimer une intervention
  async delete(id) {
    try {
      const { error } = await supabase
        .from(TABLES.INTERVENTIONS)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur suppression intervention:', error);
      throw error;
    }
  },

  // Statistiques des interventions
  async getStats() {
    try {
      const { data, error } = await supabase
        .from(TABLES.INTERVENTIONS)
        .select('statut, priorite, type_intervention, duree');
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        enCours: data.filter(i => i.statut === 'en_cours').length,
        cloturees: data.filter(i => i.statut === 'cloturee').length,
        hautesPriorites: data.filter(i => i.priorite === 'haute').length,
        dureeMoyenne: data.reduce((sum, i) => sum + (i.duree || 0), 0) / data.length || 0
      };
      
      return stats;
    } catch (error) {
      console.error('Erreur statistiques interventions:', error);
      throw error;
    }
  }
};