import { supabase } from './supabaseClient';
import { TABLES } from './supabaseClient';

export const prospectService = {
  // Récupérer tous les prospects
  // ✅ CORRIGÉ: Tri en JavaScript au lieu de SQL pour éviter les erreurs
  async getAll() {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROSPECTS)
        .select('*');
      
      if (error) throw error;
      
      // ✅ Tri en JavaScript (évite les problèmes de syntaxe SQL)
      const sorted = (data || []).sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
      return sorted;
    } catch (error) {
      console.error('Erreur récupération prospects:', error);
      throw error;
    }
  },

  // Récupérer un prospect par ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROSPECTS)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur récupération prospect:', error);
      throw error;
    }
  },

  // Créer un prospect
  async create(prospectData) {
    try {
      // ✅ Valider le secteur (doit être une des 5 valeurs)
      const secteursValides = ['GROSSISTE PHARM', 'GROSSISTE PARA', 'PARA SUPER GROS', 'LABO PROD', 'AUTRE'];
      const secteur = prospectData.secteur && secteursValides.includes(prospectData.secteur) 
        ? prospectData.secteur 
        : 'AUTRE';
      
      // ✅ Champs minimums SANS historique_actions (pour compatibilité)
      const cleanData = {
        raison_sociale: prospectData.raison_sociale || '',
        contact: prospectData.contact || '',
        secteur: secteur,
        telephone: prospectData.telephone || '',
        email: prospectData.email || '',
        statut: 'prospect'
      };

      const { data, error } = await supabase
        .from(TABLES.PROSPECTS)
        .insert([cleanData])
        .select();
      
      if (error) throw error;
      
      const prospect = data && data.length > 0 ? data[0] : cleanData;
      
      // ✅ Mettre à jour le commercial APRÈS création
      if (prospectData.commercial_assigned && prospectData.commercial_assigned.trim()) {
        try {
          await supabase
            .from(TABLES.PROSPECTS)
            .update({ commercial_assigned: prospectData.commercial_assigned })
            .eq('id', prospect.id);
        } catch (e) {
          console.warn('⚠️ Commercial non assigné:', e);
        }
      }
      
      // ✅ Initialiser l'historique APRÈS création (ne bloque pas si colonne n'existe pas)
      try {
        const historiqueInit = JSON.stringify([{
          action: 'creation',
          details: 'Prospect créé',
          created_at: new Date().toISOString(),
          created_by: prospectData.created_by || 'system'
        }]);
        
        await supabase
          .from(TABLES.PROSPECTS)
          .update({ historique_actions: historiqueInit })
          .eq('id', prospect.id);
      } catch (e) {
        console.warn('⚠️ Historique non disponible - Exécutez la migration SQL:', e.message);
      }
      
      return prospect;
    } catch (error) {
      console.error('Erreur création prospect:', error);
      throw error;
    }
  },

  // Mettre à jour un prospect
  async update(id, prospectData) {
    try {
      // ✅ Valider le secteur
      const secteursValides = ['GROSSISTE PHARM', 'GROSSISTE PARA', 'PARA SUPER GROS', 'LABO PROD', 'AUTRE'];
      const secteur = prospectData.secteur && secteursValides.includes(prospectData.secteur) 
        ? prospectData.secteur 
        : 'AUTRE';
      
      // ✅ CORRIGÉ: N'envoyer que les champs minimums
      const cleanData = {
        raison_sociale: prospectData.raison_sociale || '',
        contact: prospectData.contact || '',
        secteur: secteur,
        telephone: prospectData.telephone || '',
        email: prospectData.email || ''
      };

      const { data, error } = await supabase
        .from(TABLES.PROSPECTS)
        .update(cleanData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      
      // ✅ Mettre à jour le commercial SÉPARÉMENT
      if (prospectData.commercial_assigned && prospectData.commercial_assigned.trim()) {
        try {
          await supabase
            .from(TABLES.PROSPECTS)
            .update({ commercial_assigned: prospectData.commercial_assigned })
            .eq('id', id);
        } catch (e) {
          console.warn('⚠️ Commercial non assigné:', e);
        }
      }
      
      // Ajouter dans l'historique
      await this.addHistorique(id, 'modification', 'Prospect modifié');
      
      return data && data.length > 0 ? data[0] : cleanData;
    } catch (error) {
      console.error('Erreur mise à jour prospect:', error);
      throw error;
    }
  },

  // Supprimer un prospect
  async delete(id) {
    try {
      const { error } = await supabase
        .from(TABLES.PROSPECTS)
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur suppression prospect:', error);
      throw error;
    }
  },

  // Convertir en client (passe à actif) - CONSERVE L'HISTORIQUE
  async convertToClient(prospectId) {
    try {
      // ✅ Ajouter l'action de conversion dans l'historique AVANT de changer le statut
      await this.addHistorique(prospectId, 'conversion', 'Converti en client actif');
      
      // ✅ Passer le statut à actif (CONSERVE l'historique_actions)
      const { data, error } = await supabase
        .from(TABLES.PROSPECTS)
        .update({ statut: 'actif' })
        .eq('id', prospectId)
        .select();
      
      if (error) throw error;
      
      return data && data.length > 0 ? data[0] : { id: prospectId, statut: 'actif' };
    } catch (error) {
      console.error('Erreur conversion prospect:', error);
      throw error;
    }
  },

  // ✅ NOUVEAU: Ajouter une action dans l'historique (stocké dans le champ JSON)
  async addHistorique(prospectId, action, details, metadata = {}) {
    try {
      // Récupérer le prospect
      const { data: prospect, error: fetchError } = await supabase
        .from(TABLES.PROSPECTS)
        .select('historique_actions')
        .eq('id', prospectId)
        .single();
      
      if (fetchError) {
        console.warn('⚠️ Colonne historique_actions manquante - Utilisation LocalStorage temporaire');
        // ✅ FALLBACK: Utiliser LocalStorage si la colonne n'existe pas
        this._addHistoriqueLocalStorage(prospectId, action, details, metadata);
        return;
      }
      
      // Parser l'historique existant
      let historique = [];
      try {
        historique = prospect.historique_actions ? JSON.parse(prospect.historique_actions) : [];
      } catch (e) {
        historique = [];
      }
      
      // Ajouter la nouvelle action
      historique.push({
        action: action,
        details: details,
        created_at: new Date().toISOString(),
        ...metadata
      });
      
      // Mettre à jour l'historique
      const { error: updateError } = await supabase
        .from(TABLES.PROSPECTS)
        .update({ historique_actions: JSON.stringify(historique) })
        .eq('id', prospectId);
      
      if (updateError) {
        console.warn('⚠️ Impossible de mettre à jour l\'historique:', updateError);
        // ✅ FALLBACK: Utiliser LocalStorage
        this._addHistoriqueLocalStorage(prospectId, action, details, metadata);
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors de l\'ajout à l\'historique:', error);
      // ✅ FALLBACK: Utiliser LocalStorage
      this._addHistoriqueLocalStorage(prospectId, action, details, metadata);
    }
  },

  // ✅ FALLBACK: Stockage temporaire dans LocalStorage
  _addHistoriqueLocalStorage(prospectId, action, details, metadata = {}) {
    try {
      const key = `prospect_history_${prospectId}`;
      const existing = localStorage.getItem(key);
      let historique = existing ? JSON.parse(existing) : [];
      
      historique.push({
        action: action,
        details: details,
        created_at: new Date().toISOString(),
        ...metadata
      });
      
      localStorage.setItem(key, JSON.stringify(historique));
      console.log('✅ Historique enregistré dans LocalStorage (temporaire)');
    } catch (e) {
      console.error('❌ Impossible d\'enregistrer dans LocalStorage:', e);
    }
  },

  // ✅ NOUVEAU: Récupérer l'historique d'un prospect (depuis le champ JSON)
  async getHistorique(prospectId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROSPECTS)
        .select('historique_actions')
        .eq('id', prospectId)
        .single();
      
      if (error) {
        console.warn('⚠️ Colonne historique_actions manquante - Utilisation LocalStorage temporaire');
        // ✅ FALLBACK: Récupérer depuis LocalStorage
        return this._getHistoriqueLocalStorage(prospectId);
      }
      
      // Parser l'historique
      try {
        const historique = data.historique_actions ? JSON.parse(data.historique_actions) : [];
        // Trier par date décroissante
        return historique.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } catch (e) {
        console.warn('⚠️ Erreur parsing historique:', e);
        return this._getHistoriqueLocalStorage(prospectId);
      }
    } catch (error) {
      console.warn('⚠️ Erreur récupération historique:', error);
      return this._getHistoriqueLocalStorage(prospectId);
    }
  },

  // ✅ FALLBACK: Récupérer depuis LocalStorage
  _getHistoriqueLocalStorage(prospectId) {
    try {
      const key = `prospect_history_${prospectId}`;
      const existing = localStorage.getItem(key);
      if (existing) {
        const historique = JSON.parse(existing);
        return historique.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      }
      return [];
    } catch (e) {
      console.error('❌ Impossible de lire LocalStorage:', e);
      return [];
    }
  },

  // Statistiques des prospects
  async getStats() {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROSPECTS)
        .select('statut');
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        prospects: data.filter(p => p.statut === 'prospect').length,
        actifs: data.filter(p => p.statut === 'actif').length,
        inactifs: data.filter(p => p.statut === 'inactif').length
      };
      
      return stats;
    } catch (error) {
      console.error('Erreur statistiques prospects:', error);
      throw error;
    }
  }
};