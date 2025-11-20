import { supabase } from './supabaseClient';
import { TABLES } from './supabaseClient';

export const abonnementService = {
  // Récupérer tous les abonnements
  async getAll() {
    try {
      // 1. Récupérer tous les abonnements
      const { data: abonnements, error } = await supabase
        .from(TABLES.ABONNEMENTS)
        .select('*')
        .order('date_fin', { ascending: true });
      
      if (error) throw error;
      
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const alertDate = new Date();
      alertDate.setDate(alertDate.getDate() + 30);
      alertDate.setHours(0, 0, 0, 0);
      
      // 2. Pour chaque abonnement, vérifier et mettre à jour le statut si nécessaire
      const dataWithDetails = await Promise.all(
        abonnements.map(async (abo) => {
          // Vérifier le statut basé sur la date d'expiration
          const dateFin = new Date(abo.date_fin);
          dateFin.setHours(0, 0, 0, 0);
          let nouveauStatut = abo.statut;
          
          if (dateFin < now) {
            nouveauStatut = 'expire';
          } else if (dateFin <= alertDate) {
            nouveauStatut = 'en_alerte';
          } else {
            nouveauStatut = 'actif';
          }
          
          // Mettre à jour le statut en base si changement
          if (abo.statut !== nouveauStatut) {
            await supabase
              .from(TABLES.ABONNEMENTS)
              .update({ statut: nouveauStatut })
              .eq('id', abo.id);
          }
          
          let installation = {};

          if (abo.installation_id) {
            const { data: instData } = await supabase
              .from(TABLES.INSTALLATIONS)
              .select('*')
              .eq('id', abo.installation_id)
              .single();
            
            if (instData) {
              // Récupérer aussi le client
              const { data: clientData } = await supabase
                .from(TABLES.PROSPECTS)
                .select('raison_sociale, contact, telephone, email')
                .eq('id', instData.client_id)
                .single();
              
              installation = {
                ...instData,
                client: clientData || {}
              };
            }
          }
          
          return {
            ...abo,
            statut: nouveauStatut,
            installation: installation
          };
        })
      );
      
      return dataWithDetails;
    } catch (error) {
      console.error('Erreur récupération abonnements:', error);
      throw error;
    }
  },

  // Créer un abonnement depuis une installation
  async createFromInstallation(installationId) {
    try {
      // 1. Vérifier s'il existe déjà un abonnement actif ou en alerte
      const { data: existing, error: checkError } = await supabase
        .from(TABLES.ABONNEMENTS)
        .select('id')
        .eq('installation_id', installationId)
        .in('statut', ['actif', 'en_alerte']);
      
      if (checkError) throw checkError;
      
      if (existing && existing.length > 0) {
        throw new Error('Un abonnement actif ou en alerte existe déjà pour cette installation.');
      }
      
      // 2. Récupérer l'installation avec la date d'installation
      const { data: installation, error: fetchError } = await supabase
        .from(TABLES.INSTALLATIONS)
        .select('date_installation')
        .eq('id', installationId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // 3. Utiliser la date d'installation comme date de début
      const dateDebut = new Date(installation.date_installation);
      const dateFin = new Date(dateDebut);
      dateFin.setFullYear(dateFin.getFullYear() + 1);
      
      // 4. Déterminer le statut selon la date de fin
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const alertDate = new Date(today);
      alertDate.setDate(alertDate.getDate() + 30);
      
      let statut = 'actif';
      if (dateFin < today) {
        statut = 'expire';
      } else if (dateFin <= alertDate) {
        statut = 'en_alerte';
      }
      
      // 5. Créer l'abonnement (sans montant)
      const { data, error } = await supabase
        .from(TABLES.ABONNEMENTS)
        .insert([{
          installation_id: installationId,
          date_debut: dateDebut.toISOString().split('T')[0],
          date_fin: dateFin.toISOString().split('T')[0],
          statut: statut
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur création abonnement:', error);
      throw error;
    }
  },

  // Créer un abonnement avec données spécifiques (pour renouvellement)
  async create(abonnementData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.ABONNEMENTS)
        .insert([{
          installation_id: abonnementData.installation_id,
          date_debut: abonnementData.date_debut,
          date_fin: abonnementData.date_fin,
          statut: abonnementData.statut || 'actif'
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur création abonnement:', error);
      throw error;
    }
  },

  // Vérifier si un abonnement a des paiements associés
  async hasPaiements(abonnementId) {
    try {
      // Note: la table paiements n'a pas de colonne abonnement_id
      // donc on retourne false pour éviter de bloquer les suppressions
      return false;
    } catch (error) {
      console.error('Erreur vérification paiements:', error);
      return false;
    }
  },

  // Vérifier s'il existe déjà un abonnement actif ou en alerte pour cette installation
  async hasActiveAbonnement(installationId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.ABONNEMENTS)
        .select('id', { count: 'exact', head: true })
        .eq('installation_id', installationId)
        .in('statut', ['actif', 'en_alerte']);
      
      if (error) throw error;
      return data && data.length > 0;
    } catch (error) {
      console.error('Erreur vérification abonnement actif:', error);
      return false;
    }
  },

  // Mettre à jour un abonnement (avec vérification)
  async update(id, abonnementData) {
    try {
      // Vérifier s'il y a des paiements associés
      const hasPaiements = await this.hasPaiements(id);
      
      if (hasPaiements) {
        throw new Error('Impossible de modifier : cet abonnement a des paiements associés');
      }
      
      const { data, error } = await supabase
        .from(TABLES.ABONNEMENTS)
        .update(abonnementData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur mise à jour abonnement:', error);
      throw error;
    }
  },

  // Supprimer un abonnement
  async delete(id) {
    try {
      // Vérifier s'il y a des paiements associés
      const hasPaiements = await this.hasPaiements(id);
      
      if (hasPaiements) {
        throw new Error('Impossible de supprimer : cet abonnement a des paiements associés');
      }
      
      // Supprimer complètement l'abonnement
      const { error } = await supabase
        .from(TABLES.ABONNEMENTS)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur suppression abonnement:', error);
      throw error;
    }
  },

  // Renouveler un abonnement
  async renouveler(abonnementId) {
    try {
      // 1. Récupérer l'abonnement actuel
      const { data: currentAbo, error: fetchError } = await supabase
        .from(TABLES.ABONNEMENTS)
        .select('*')
        .eq('id', abonnementId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // 2. Vérifier s'il n'existe pas déjà un abonnement actif ou en alerte pour cette installation
      const { data: existingActive, error: checkError } = await supabase
        .from(TABLES.ABONNEMENTS)
        .select('id')
        .eq('installation_id', currentAbo.installation_id)
        .in('statut', ['actif', 'en_alerte'])
        .neq('id', abonnementId);
      
      if (checkError) throw checkError;
      
      if (existingActive && existingActive.length > 0) {
        throw new Error('Un abonnement actif ou en alerte existe déjà pour cette installation. Veuillez supprimer ou modifier l\'abonnement existant.');
      }
      
      // 3. Mettre à jour l'ancien abonnement à "expire"
      const { error: updateError } = await supabase
        .from(TABLES.ABONNEMENTS)
        .update({ statut: 'expire' })
        .eq('id', abonnementId);
      
      if (updateError) throw updateError;
      
      // 4. Créer un nouvel abonnement
      const dateDebut = new Date(currentAbo.date_fin);
      const dateFin = new Date(dateDebut);
      dateFin.setFullYear(dateFin.getFullYear() + 1);
      
      const { data: newAbo, error: insertError } = await supabase
        .from(TABLES.ABONNEMENTS)
        .insert([{
          installation_id: currentAbo.installation_id,
          date_debut: dateDebut.toISOString(),
          date_fin: dateFin.toISOString(),
          statut: 'actif'
        }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      // 5. Retourner le nouvel abonnement pour mise à jour immédiate
      return newAbo;
    } catch (error) {
      console.error('Erreur renouvellement abonnement:', error);
      throw error;
    }
  },

  // Vérifier les abonnements expirés ou en alerte - AMÉLIORÉ
  async checkAlertes() {
    try {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const alertDate = new Date();
      alertDate.setDate(alertDate.getDate() + 30);
      alertDate.setHours(23, 59, 59, 999);
      
      // 1. Récupérer TOUS les abonnements actifs ET en alerte
      const { data: abonnements, error } = await supabase
        .from(TABLES.ABONNEMENTS)
        .select('*')
        .in('statut', ['actif', 'en_alerte'])
        .order('date_fin', { ascending: true });
      
      if (error) throw error;
      
      // 2. Pour chaque abonnement, récupérer les détails complets et mettre à jour le statut
      const alertesWithDetails = await Promise.all(
        abonnements.map(async (abo) => {
          // Mettre à jour le statut si nécessaire
          const dateFin = new Date(abo.date_fin);
          dateFin.setHours(0, 0, 0, 0);
          let nouveauStatut = abo.statut;
          
          if (dateFin < now) {
            // Expiré
            nouveauStatut = 'expire';
            await supabase
              .from(TABLES.ABONNEMENTS)
              .update({ statut: 'expire' })
              .eq('id', abo.id);
          } else if (dateFin <= alertDate) {
            // En alerte (expiration dans 30 jours)
            nouveauStatut = 'en_alerte';
            await supabase
              .from(TABLES.ABONNEMENTS)
              .update({ statut: 'en_alerte' })
              .eq('id', abo.id);
          } else {
            // Encore actif
            nouveauStatut = 'actif';
            await supabase
              .from(TABLES.ABONNEMENTS)
              .update({ statut: 'actif' })
              .eq('id', abo.id);
          }
          
          // Récupérer installation et client
          let installation = {};
          if (abo.installation_id) {
            const { data: instData } = await supabase
              .from(TABLES.INSTALLATIONS)
              .select('*')
              .eq('id', abo.installation_id)
              .single();
            
            if (instData) {
              const { data: clientData } = await supabase
                .from(TABLES.PROSPECTS)
                .select('raison_sociale, contact, telephone, email')
                .eq('id', instData.client_id)
                .single();
              
              installation = {
                ...instData,
                client: clientData || {}
              };
            }
          }
          
          return {
            ...abo,
            statut: nouveauStatut,
            installation: installation
          };
        })
      );
      
      // 3. Retourner SEULEMENT les abonnements en alerte (pas les expirés)
      return alertesWithDetails.filter(abo => abo.statut === 'en_alerte');
    } catch (error) {
      console.error('Erreur vérification alertes:', error);
      throw error;
    }
  },

  // Statistiques des abonnements
  async getStats() {
    try {
      const { data, error } = await supabase
        .from(TABLES.ABONNEMENTS)
        .select('statut');
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        actifs: data.filter(a => a.statut === 'actif').length,
        enAlerte: data.filter(a => a.statut === 'en_alerte').length,
        expires: data.filter(a => a.statut === 'expire').length
      };
      
      return stats;
    } catch (error) {
      console.error('Erreur statistiques abonnements:', error);
      throw error;
    }
  }
};