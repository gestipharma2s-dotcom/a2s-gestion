import { supabase } from './supabaseClient';
import { TABLES } from './supabaseClient';

export const paiementService = {
  // Récupérer tous les paiements avec reste à payer
  async getAll() {
    try {
      const { data, error } = await supabase
        .from(TABLES.PAIEMENTS)
        .select(`
          *,
          client:prospects!client_id(raison_sociale, contact),
          installation:installations(application_installee, montant)
        `)
        .order('date_paiement', { ascending: false });
      
      if (error) throw error;

      // Calculer le reste à payer pour chaque paiement
      const dataWithReste = data.map(paiement => {
        const montantInstallation = paiement.installation?.montant || 0;
        const montantPaye = paiement.montant || 0;
        const resteAPayer = Math.max(0, montantInstallation - montantPaye);

        return {
          ...paiement,
          resteAPayer: resteAPayer
        };
      });

      return dataWithReste;
    } catch (error) {
      console.error('Erreur récupération paiements:', error);
      throw error;
    }
  },

  // Récupérer les paiements d'un client avec installation_id
  async getByClient(clientId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PAIEMENTS)
        .select(`
          id,
          installation_id,
          client_id,
          montant,
          mode_paiement,
          type,
          date_paiement,
          installation:installations(montant)
        `)
        .eq('client_id', clientId)
        .order('date_paiement', { ascending: false });
      
      if (error) throw error;

      // Calculer le reste à payer pour chaque paiement
      const dataWithReste = data.map(paiement => {
        const montantInstallation = paiement.installation?.montant || 0;
        const montantPaye = paiement.montant || 0;
        const resteAPayer = Math.max(0, montantInstallation - montantPaye);

        return {
          ...paiement,
          resteAPayer: resteAPayer
        };
      });

      return dataWithReste;
    } catch (error) {
      console.error('Erreur récupération paiements client:', error);
      throw error;
    }
  },

  // Calculer le reste total à payer pour un client
  async getResteTotalClient(clientId) {
    try {
      // Récupérer les installations du client
      const { data: installations, error: instError } = await supabase
        .from(TABLES.INSTALLATIONS)
        .select('id, montant')
        .eq('client_id', clientId);

      if (instError) throw instError;

      const totalMontantInstallations = installations.reduce((sum, inst) => sum + (inst.montant || 0), 0);

      // Récupérer les paiements du client
      const { data: paiements, error: paiError } = await supabase
        .from(TABLES.PAIEMENTS)
        .select('montant')
        .eq('client_id', clientId);

      if (paiError) throw paiError;

      const totalPaye = paiements.reduce((sum, p) => sum + (p.montant || 0), 0);
      const resteTotal = Math.max(0, totalMontantInstallations - totalPaye);

      return {
        totalInstallations: totalMontantInstallations,
        totalPaye: totalPaye,
        resteAPayer: resteTotal
      };
    } catch (error) {
      console.error('Erreur calcul reste total:', error);
      throw error;
    }
  },

  // Créer un paiement
  async create(paiementData) {
    try {
      // Nettoyer les données - ne garder que les colonnes valides
      const cleanData = {
        client_id: paiementData.client_id,
        installation_id: paiementData.installation_id,
        type: paiementData.type,
        montant: paiementData.montant,
        mode_paiement: paiementData.mode_paiement,
        date_paiement: paiementData.date_paiement || new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(TABLES.PAIEMENTS)
        .insert([cleanData])
        .select('*');
      
      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Erreur création paiement:', error);
      throw error;
    }
  },

  // Mettre à jour un paiement
  async update(id, paiementData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PAIEMENTS)
        .update(paiementData)
        .eq('id', id)
        .select(`
          *,
          client:prospects!client_id(raison_sociale, contact),
          installation:installations(application_installee, montant)
        `)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur mise à jour paiement:', error);
      throw error;
    }
  },

  // Supprimer un paiement
  async delete(id) {
    try {
      const { error } = await supabase
        .from(TABLES.PAIEMENTS)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur suppression paiement:', error);
      throw error;
    }
  },

  // Statistiques des paiements
  async getStats(moisDebut = null, moisFin = null) {
    try {
      let query = supabase
        .from(TABLES.PAIEMENTS)
        .select('montant, type, mode_paiement, date_paiement');
      
      if (moisDebut && moisFin) {
        query = query
          .gte('date_paiement', moisDebut)
          .lte('date_paiement', moisFin);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        revenuTotal: data.reduce((sum, p) => sum + (p.montant || 0), 0),
        acquisitions: data.filter(p => p.type === 'acquisition').length,
        abonnements: data.filter(p => p.type === 'abonnement').length,
        parMode: {
          especes: data.filter(p => p.mode_paiement === 'especes').length,
          virement: data.filter(p => p.mode_paiement === 'virement').length,
          cheque: data.filter(p => p.mode_paiement === 'cheque').length,
          autre: data.filter(p => p.mode_paiement === 'autre').length
        }
      };
      
      return stats;
    } catch (error) {
      console.error('Erreur statistiques paiements:', error);
      throw error;
    }
  },

  // Revenus mensuels pour graphique
  async getRevenusMensuels(annee = new Date().getFullYear()) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PAIEMENTS)
        .select('montant, date_paiement')
        .gte('date_paiement', `${annee}-01-01`)
        .lte('date_paiement', `${annee}-12-31`);
      
      if (error) throw error;
      
      const revenus = Array(12).fill(0);
      
      data.forEach(paiement => {
        const mois = new Date(paiement.date_paiement).getMonth();
        revenus[mois] += paiement.montant || 0;
      });
      
      return revenus.map((montant, index) => ({
        mois: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'][index],
        montant
      }));
    } catch (error) {
      console.error('Erreur revenus mensuels:', error);
      throw error;
    }
  }
};