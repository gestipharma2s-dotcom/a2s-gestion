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
          created_by,
          client:prospects!client_id(raison_sociale, contact),
          installation:installations(application_installee, montant, montant_abonnement, type, created_by)
        `)
        .order('date_paiement', { ascending: false });

      if (error) throw error;

      // Calculer le reste à payer pour chaque paiement
      const dataWithReste = data.map(paiement => {
        // Le montant à payer dépend si c'est une acquisition ou un abonnement
        const montantDu = paiement.type === 'abonnement'
          ? (paiement.installation?.montant_abonnement || 0)
          : (paiement.installation?.montant || 0);

        const montantPaye = paiement.montant || 0;
        const resteAPayer = Math.max(0, montantDu - montantPaye);

        // Si created_by est NULL, utiliser le created_by de l'installation (fallback)
        const creator = paiement.created_by || paiement.installation?.created_by || null;

        return {
          ...paiement,
          created_by: creator,
          montantTotal: montantDu, // ✅ Ajouter le montant total réel attendu pour l'affichage
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
          created_by,
          installation:installations(montant, montant_abonnement, type, created_by, application_installee)
        `)
        .eq('client_id', clientId)
        .order('date_paiement', { ascending: false });

      if (error) throw error;

      // Calculer le reste à payer pour chaque paiement
      const dataWithReste = data.map(paiement => {
        const montantDu = paiement.type === 'abonnement'
          ? (paiement.installation?.montant_abonnement || 0)
          : (paiement.installation?.montant || 0);

        const montantPaye = paiement.montant || 0;
        const resteAPayer = Math.max(0, montantDu - montantPaye);

        // Si created_by est NULL, utiliser le created_by de l'installation (fallback)
        const creator = paiement.created_by || paiement.installation?.created_by || null;

        return {
          ...paiement,
          created_by: creator,
          montantTotal: montantDu,
          resteAPayer: resteAPayer
        };
      });

      return dataWithReste;
    } catch (error) {
      console.error('Erreur récupération paiements client:', error);
      throw error;
    }
  },

  // Récupérer les paiements d'une installation spécifique
  async getByInstallation(installationId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PAIEMENTS)
        .select('id, montant, type, date_paiement, mode_paiement')
        .eq('installation_id', installationId)
        .order('date_paiement', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération paiements installation:', error);
      return [];
    }
  },

  // Calculer le reste total à payer pour un client avec détail par installation
  async getResteTotalClient(clientId) {
    try {
      // 1. Récupérer le solde initial du client
      const { data: client, error: clientError } = await supabase
        .from(TABLES.PROSPECTS)
        .select('solde_initial')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;
      const soldeInitial = client?.solde_initial || 0;

      // 2. Récupérer les installations du client avec leur nom d'application
      const { data: installations, error: instError } = await supabase
        .from(TABLES.INSTALLATIONS)
        .select('id, montant, montant_abonnement, application_installee, date_installation, type')
        .eq('client_id', clientId)
        .order('date_installation', { ascending: true });

      if (instError) throw instError;

      const installationIds = installations.map(i => i.id);

      // 3. Récupérer TOUS les paiements du client avec le type et l'installation
      const { data: allPaiements, error: paiError } = await supabase
        .from(TABLES.PAIEMENTS)
        .select('montant, type, installation_id, date_paiement')
        .eq('client_id', clientId)
        .order('date_paiement', { ascending: true });

      if (paiError) throw paiError;

      // 4. Récupérer les abonnements actifs pour savoir quelle installation a des abonnements
      let abonnementsByInstallation = {};
      if (installationIds.length > 0) {
        const { data: abonnements } = await supabase
          .from(TABLES.ABONNEMENTS)
          .select('installation_id, statut, date_debut, date_fin')
          .in('installation_id', installationIds)
          .order('date_debut', { ascending: false });

        (abonnements || []).forEach(abo => {
          if (!abonnementsByInstallation[abo.installation_id]) {
            abonnementsByInstallation[abo.installation_id] = [];
          }
          abonnementsByInstallation[abo.installation_id].push(abo);
        });
      }

      // 5. Calculer le détail par installation
      const installationsDetail = installations.map(inst => {
        const paiementsAcq = (allPaiements || []).filter(p =>
          p.installation_id === inst.id && p.type === 'acquisition'
        );
        const paiementsAbo = (allPaiements || []).filter(p =>
          p.installation_id === inst.id && p.type === 'abonnement'
        );

        const totalPayeAcq = paiementsAcq.reduce((s, p) => s + (p.montant || 0), 0);
        const totalPayeAbo = paiementsAbo.reduce((s, p) => s + (p.montant || 0), 0);

        const abos = abonnementsByInstallation[inst.id] || [];
        const nbAbonnements = abos.length;
        // Montant total dû pour les abonnements = montant_abonnement * nombre de périodes facturées
        const montantAboDu = (inst.montant_abonnement || 0) * nbAbonnements;

        return {
          id: inst.id,
          application: inst.application_installee,
          date: inst.date_installation,
          montantAcquisition: inst.montant || 0,
          montantAbonnement: inst.montant_abonnement || 0,
          nbAbonnements: nbAbonnements,
          montantAboDu: montantAboDu,
          totalPayeAcq: totalPayeAcq,
          totalPayeAbo: totalPayeAbo,
          resteAcq: Math.max(0, (inst.montant || 0) - totalPayeAcq),
          resteAbo: Math.max(0, montantAboDu - totalPayeAbo),
          abonnements: abos
        };
      });

      // 6. Totaux globaux
      const totalMontantInstallations = installations.reduce((s, i) => s + (i.montant || 0), 0);
      const totalAbonnementsDu = installationsDetail.reduce((s, i) => s + i.montantAboDu, 0);
      const totalPaye = (allPaiements || []).reduce((s, p) => s + (p.montant || 0), 0);
      const totalPayeAcqGlobal = (allPaiements || []).filter(p => p.type === 'acquisition').reduce((s, p) => s + (p.montant || 0), 0);
      const totalPayeAboGlobal = (allPaiements || []).filter(p => p.type === 'abonnement').reduce((s, p) => s + (p.montant || 0), 0);
      const totalDu = totalMontantInstallations + soldeInitial + totalAbonnementsDu;
      const resteTotal = Math.max(0, totalDu - totalPaye);

      return {
        soldeInitial,
        totalInstallations: totalMontantInstallations,
        totalAbonnements: totalAbonnementsDu,
        totalPaye,
        totalPayeAcq: totalPayeAcqGlobal,
        totalPayeAbo: totalPayeAboGlobal,
        totalDu,
        resteAPayer: resteTotal,
        installationsDetail
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
        date_paiement: paiementData.date_paiement || new Date().toISOString(),
        created_by: paiementData.created_by || null
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