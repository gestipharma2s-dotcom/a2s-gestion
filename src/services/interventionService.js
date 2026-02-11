import { supabase } from './supabaseClient';
import { TABLES } from './supabaseClient';

// Calculer la durée en minutes entre deux dates
const calculateDuration = (dateDebut, dateFin, dureeStockee) => {
  // Si la durée est déjà stockée dans la base de données (colonne 'duree'), l'utiliser
  if (dureeStockee && dureeStockee > 0) {
    return dureeStockee;
  }
  
  if (!dateDebut || !dateFin) return null;
  
  // Convertir les dates en objets Date
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);
  
  // Valider les dates
  if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
    return null;
  }
  
  // Calculer la différence en minutes
  const differenceMs = fin.getTime() - debut.getTime();
  const differenceMinutes = Math.round(differenceMs / (1000 * 60));
  
  // Retourner la durée (au minimum 0 minutes)
  return Math.max(0, differenceMinutes);
};

// Ajouter la durée calculée à une intervention
const addDurationToIntervention = (intervention) => {
  if (!intervention) return intervention;
  return {
    ...intervention,
    // Afficher la durée stockée en base (duree), ou la calculer si absent
    duree_minutes: intervention.duree && intervention.duree > 0 
      ? intervention.duree 
      : calculateDuration(intervention.time_creation || intervention.created_at || intervention.date_intervention, intervention.date_fin, intervention.duree)
  };
};

// Ajouter la durée calculée à un tableau d'interventions
const addDurationToInterventions = (interventions) => {
  if (!Array.isArray(interventions)) return interventions;
  return interventions.map(addDurationToIntervention);
};

export const interventionService = {
  // Récupérer toutes les interventions
  async getAll() {
    try {
      const { data, error } = await supabase
        .from(TABLES.INTERVENTIONS)
        .select(`
          *,
          client:prospects!client_id(raison_sociale, contact, telephone, wilaya),
          technicien:users!technicien_id(id, nom, email)
        `)
        .order('date_intervention', { ascending: false });
      
      if (error) throw error;
      return addDurationToInterventions(data);
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
      return addDurationToInterventions(data);
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
          client:prospects!client_id(raison_sociale, contact, telephone, wilaya),
          technicien:users!technicien_id(id, nom, email)
        `)
        .eq('technicien_id', technicienId)
        .order('date_intervention', { ascending: false });
      
      if (error) throw error;
      return addDurationToInterventions(data);
    } catch (error) {
      console.error('Erreur récupération interventions technicien:', error);
      throw error;
    }
  },

  // Créer une intervention
  async create(interventionData) {
    try {
      // Capturer le timestamp exact de création côté client EN UTC
      const creationTime = new Date().toISOString();
      
      console.log('DEBUG create: creationTime (UTC):', creationTime);
      
      const { data, error } = await supabase
        .from(TABLES.INTERVENTIONS)
        .insert([{
          ...interventionData,
          statut: interventionData.statut || 'en_cours',
          date_intervention: interventionData.date_intervention || new Date().toISOString(),
          duree: 0, // Durée calculée à la clôture
          time_creation: creationTime, // Stocker le timestamp exact UTC
          created_by: interventionData.created_by || null
        }])
        .select(`
          *,
          client:prospects!client_id(raison_sociale, contact, telephone, wilaya),
          technicien:users!technicien_id(id, nom, email)
        `)
        .single();
      
      if (error) throw error;
      console.log('DEBUG create: intervention créée avec time_creation =', data.time_creation);
      return addDurationToIntervention(data);
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
          client:prospects!client_id(raison_sociale, contact, telephone, wilaya),
          technicien:users!technicien_id(id, nom, email)
        `)
        .single();
      
      if (error) throw error;
      return addDurationToIntervention(data);
    } catch (error) {
      console.error('Erreur mise à jour intervention:', error);
      throw error;
    }
  },

  // Clôturer une intervention
  async cloturer(id, actionEntreprise, commentaires) {
    try {
      // Récupérer l'intervention avec time_creation
      const { data: intervention, error: fetchError } = await supabase
        .from(TABLES.INTERVENTIONS)
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Date de clôture = NOW en UTC
      const now = new Date();
      const dateFinISO = now.toISOString();
      
      console.log('DEBUG cloturer:');
      console.log('  intervention id:', id);
      console.log('  time_creation:', intervention.time_creation);
      console.log('  dateFin (UTC):', dateFinISO);
      
      // Calculer la durée : (maintenant - time_creation) / 60000 ms
      let dateDebut;
      let source = 'UNKNOWN';
      
      console.log('  DEBUG: Checking time_creation...');
      console.log('  type of time_creation:', typeof intervention.time_creation);
      console.log('  time_creation is null:', intervention.time_creation === null);
      console.log('  time_creation is undefined:', intervention.time_creation === undefined);
      
      if (intervention.time_creation) {
        // IMPORTANT: Supabase returns timestamp WITHOUT 'Z' timezone indicator
        // If we don't add 'Z', JavaScript treats it as LOCAL TIME instead of UTC!
        // This causes a 60-minute offset (UTC+1)
        const timeCreationUTC = intervention.time_creation.endsWith('Z') 
          ? intervention.time_creation 
          : intervention.time_creation + 'Z';
        dateDebut = new Date(timeCreationUTC);
        source = 'time_creation';
        console.log('  Raw time_creation from DB:', intervention.time_creation);
        console.log('  With Z added:', timeCreationUTC);
        console.log('  Using time_creation - parsed as:', dateDebut.toISOString());
      } else if (intervention.date_intervention) {
        // Fallback: Si time_creation est NULL, utiliser date_intervention avec l'heure actuelle
        // C'est une estimation car on n'a pas l'heure exacte
        const dateStr = intervention.date_intervention;
        const now = new Date();
        const currentHour = now.getHours().toString().padStart(2, '0');
        const currentMin = now.getMinutes().toString().padStart(2, '0');
        const currentSec = now.getSeconds().toString().padStart(2, '0');
        
        dateDebut = new Date(dateStr + 'T' + currentHour + ':' + currentMin + ':' + currentSec + 'Z');
        source = 'date_intervention with current time (fallback - NO EXACT TIME)';
        console.log('  Using date_intervention fallback with current time - parsed as:', dateDebut.toISOString());
        console.log('  WARNING: time_creation was NULL - using current time as estimate!');
      } else {
        // Dernier fallback: utiliser maintenant
        dateDebut = new Date();
        source = 'NOW (last resort)';
        console.log('  Using NOW fallback');
      }
      
      if (isNaN(dateDebut.getTime())) {
        throw new Error('Impossible de calculer la date de début. time_creation: ' + intervention.time_creation + ', date_intervention: ' + intervention.date_intervention);
      }
      
      
      const dateFin = new Date(dateFinISO);
      const timeDiffMs = dateFin.getTime() - dateDebut.getTime();
      const durationMinutes = Math.max(0, Math.round(timeDiffMs / (1000 * 60)));
      
      console.log('  ');
      console.log('  === DURATION CALCULATION ===');
      console.log('  source:', source);
      console.log('  dateDebut (ISO):', dateDebut.toISOString());
      console.log('  dateDebut (getTime):', dateDebut.getTime());
      console.log('  dateFin (ISO):', dateFin.toISOString());
      console.log('  dateFin (getTime):', dateFin.getTime());
      console.log('  timeDiffMs:', timeDiffMs);
      console.log('  durationMinutes:', durationMinutes);
      console.log('  durationHeures:', (durationMinutes / 60).toFixed(2));
      console.log('  ===========================');;
      
      const { data, error } = await supabase
        .from(TABLES.INTERVENTIONS)
        .update({
          statut: 'cloturee',
          action_entreprise: actionEntreprise,
          commentaires: commentaires,
          date_fin: dateFinISO,
          duree: durationMinutes
        })
        .eq('id', id)
        .select(`
          *,
          client:prospects!client_id(raison_sociale, contact, telephone, wilaya),
          technicien:users!technicien_id(id, nom, email)
        `)
        .single();
      
      if (error) throw error;
      
      console.log('  Clôture OK - duree enregistrée:', data.duree);
      return addDurationToIntervention(data);
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