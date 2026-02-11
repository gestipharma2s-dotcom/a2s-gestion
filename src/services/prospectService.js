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
        wilaya: prospectData.wilaya || '',
        statut: 'prospect',
        created_by: prospectData.created_by || null
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
        email: prospectData.email || '',
        wilaya: prospectData.wilaya || ''
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

  // ✅ NOUVEAU: Ajouter une action dans l'historique (stocké dans le champ JSON et la table prospect_history)
  async addHistorique(prospectId, action, details, metadata = {}) {
    try {
      // 1. Récupérer le prospect/client pour vérifier le statut
      const { data: prospect, error: fetchError } = await supabase
        .from(TABLES.PROSPECTS)
        .select('statut, historique_actions')
        .eq('id', prospectId)
        .single();

      if (fetchError) throw fetchError;

      // 2. Vérifier les autorisations selon le statut (Clients actifs)
      if (prospect && prospect.statut === 'actif') {
        const actionsAutorisees = ['abonnement_acquisition', 'abonnement_auto_renew', 'installation', 'conversion'];
        if (!actionsAutorisees.includes(action)) {
          console.log(`⏭️ Action '${action}' skippée après conversion - Client actif uniquement`);
          return;
        }
      }

      const now = new Date().toISOString();

      // 3. Préparer l'objet pour l'historique JSON
      const newAction = {
        action: action,
        details: details,
        created_at: now,
        ...metadata
      };

      // 4. Mettre à jour le champ JSON historique_actions dans la table prospects
      let historique = [];
      try {
        historique = prospect.historique_actions ? JSON.parse(prospect.historique_actions) : [];
      } catch (e) {
        historique = [];
      }
      historique.push(newAction);

      await supabase
        .from(TABLES.PROSPECTS)
        .update({ historique_actions: JSON.stringify(historique) })
        .eq('id', prospectId);

      // 5. NOUVEAU: Insérer dans la table structurée prospect_history
      console.log('📌 Tentative insertion prospect_history:', { action, metadata });

      // SI C'EST UNE INSTALLATION : On passe automatiquement le prospect en "Client Actif"
      if (action === 'installation') {
        console.log('🔄 Passage automatique du prospect en statut ACTIF (Client)...');
        await supabase
          .from('prospects')
          .update({ statut: 'actif' }) // Conversion en client
          .eq('id', prospectId);
      }

      const structuredData = {
        prospect_id: prospectId,
        type_action: action,
        description: details,
        application: metadata.application || null,
        chef_mission: metadata.chef_mission ? String(metadata.chef_mission) : null, // S'assurer que c'est une string
        date_debut: metadata.date_debut || null,
        date_fin: metadata.date_fin || null,
        conversion: metadata.conversion || 'non',
        anciens_logiciels: metadata.anciens_logiciels || [],
        created_at: now
      };

      console.log('📦 Données à insérer:', structuredData); // LOG DEBUG

      // CORRECTION: On envoie "action" ET "type_action" pour être sûr (la table a une colonne "action" obligatoire)
      const dataToInsert = {
        ...structuredData,
        action: action // Ajout crucial pour la compatibilité
      };

      const { data: insertedData, error: historyTableError } = await supabase
        .from('prospect_history')
        .insert([dataToInsert])
        .select();

      if (historyTableError) {
        console.error('❌ Erreur CRITIQUE insertion prospect_history:', historyTableError);
        console.error('Message:', historyTableError.message);
        console.error('Détails:', historyTableError.details);
      } else {
        console.log('✅ Succès insertion prospect_history:', insertedData);
      }

    } catch (error) {
      console.error('❌ Erreur GLOBALE addHistorique:', error);
      // Fallback LocalStorage si tout échoue
      this._addHistoriqueLocalStorage(prospectId, action, details, metadata);
    }
  },

  // ✅ Supprimer une action spécifique de l'historique (Table ou JSON)
  async deleteAction(prospectId, item) {
    try {
      console.log('🗑️ Début suppression action:', { prospectId, actionId: item.id, action: item.action });

      // 1. Si l'item a un ID, on le supprime de la table prospect_history
      if (item.id) {
        console.log('🗑️ Suppression de la table prospect_history (ID:', item.id, ')');
        const { error } = await supabase
          .from('prospect_history')
          .delete()
          .eq('id', item.id);

        if (error) throw error;
      }

      // 2. Supprimer du JSON historique (legacy ou doublon)
      // C'EST CRUCIAL car getHistorique fusionne les deux sources.
      // Si on ne supprime pas du JSON, l'élément "revit" sans ID au prochain chargement.
      try {
        if (!prospectId) throw new Error("ID prospect manquant pour le nettoyage JSON");

        const jsonHistory = await this._getHistoriqueJSON(prospectId);
        const initialCount = jsonHistory.length;

        // Filtrage intelligent pour description/details et tolérance temporelle
        const itemDate = new Date(item.created_at).getTime();

        const newJsonHistory = jsonHistory.filter(h => {
          const hDate = new Date(h.created_at).getTime();

          const sameAction = (h.action === item.action || h.action === item.type_action);

          // Tolérance de 10 secondes pour les micro-décalages de addHistorique
          const closeDate = Math.abs(hDate - itemDate) < 10000;

          const sameContent = (
            h.details === item.details ||
            h.details === item.description ||
            h.description === item.details ||
            h.description === item.description ||
            (!h.details && !item.description) // Si les deux sont vides
          );

          // Si c'est le même, on le retire
          const isSame = sameAction && (closeDate || sameContent);
          return !isSame;
        });

        if (newJsonHistory.length !== initialCount) {
          console.log(`🗑️ Nettoyage JSON legacy: ${initialCount - newJsonHistory.length} entrée(s) retirée(s)`);
          const { error: updateError } = await supabase
            .from(TABLES.PROSPECTS)
            .update({ historique_actions: JSON.stringify(newJsonHistory) })
            .eq('id', prospectId);

          if (updateError) throw updateError;
        } else {
          console.log('ℹ️ Aucune entrée correspondante trouvée dans le JSON legacy.');
        }
      } catch (jsonError) {
        console.warn('⚠️ Erreur nettoyage JSON:', jsonError.message);
      }

      // 3. Vérifier s'il reste des installations pour ce prospect
      // Si on vient de supprimer une installation, on doit vérifier si c'était la dernière
      if (item.action === 'installation' || item.type_action === 'installation') {
        await this.checkAndFixProspectStatus(prospectId);
      }

      return true;
    } catch (error) {
      console.error('❌ Erreur suppression action:', error);
      throw error;
    }
  },

  // ✅ Vérifie si le prospect a encore des installations, sinon le repasse en 'prospect'
  async checkAndFixProspectStatus(prospectId) {
    try {
      if (!prospectId) return;

      console.log('🔍 Vérification du reliquat d\'installations pour le statut...');

      // Check SQL Table
      const { data: remainingTable } = await supabase
        .from('prospect_history')
        .select('id')
        .eq('prospect_id', prospectId)
        .eq('type_action', 'installation');

      // Check JSON Legacy
      const remainingJson = (await this._getHistoriqueJSON(prospectId))
        .filter(h => h.action === 'installation');

      const totalRemaining = (remainingTable?.length || 0) + remainingJson.length;

      if (totalRemaining === 0) {
        console.log('📉 Plus d\'installation trouvée. Retour au statut PROSPECT.');
        await supabase
          .from('prospects')
          .update({ statut: 'prospect' })
          .eq('id', prospectId);
        return 'prospect';
      } else {
        console.log(`✅ Il reste encore ${totalRemaining} installation(s).`);
        return 'actif';
      }
    } catch (e) {
      console.error('❌ Erreur checkAndFixProspectStatus:', e);
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

  // ✅ NOUVEAU: Récupérer l'historique complet (fusionne JSON et table prospect_history)
  async getHistorique(prospectId) {
    try {
      // 1. Récupérer l'historique depuis le champ JSON (contient tout, même les vieux suivis)
      const jsonHistory = await this._getHistoriqueJSON(prospectId);

      // 2. Récupérer l'historique structuré (pour les IDs de modification/suppression)
      const { data: tableHistory, error } = await supabase
        .from('prospect_history')
        .select('*')
        .eq('prospect_id', prospectId);

      if (error) {
        console.warn('⚠️ Erreur récupération prospect_history:', error.message);
        return jsonHistory;
      }

      if (!tableHistory || tableHistory.length === 0) {
        return jsonHistory;
      }

      // 3. FUSIONNER les deux sources intelligemment
      // On commence par les données de la TABLE (qui ont les IDs et sont plus fraîches)
      const finalHistory = tableHistory.map(item => ({
        ...item,
        action: item.type_action || item.action // Normalisation
      }));

      // On ajoute le JSON seulement si l'entrée n'est pas déjà présente (doublon SQL/JSON)
      jsonHistory.forEach(jItem => {
        const jDate = new Date(jItem.created_at).getTime();

        const isDuplicate = finalHistory.find(tItem => {
          const tDate = new Date(tItem.created_at).getTime();
          const sameAction = (tItem.action === jItem.action || tItem.type_action === jItem.action);

          // Tolérance de 30 secondes pour les décalages de synchro ou legacy
          const closeDate = Math.abs(tDate - jDate) < 30000;

          const sameContent = (
            (tItem.description && jItem.details && tItem.description === jItem.details) ||
            (tItem.details && jItem.details && tItem.details === jItem.details) ||
            (tItem.description && jItem.description && tItem.description === jItem.description)
          );

          return sameAction && (closeDate || sameContent);
        });

        if (!isDuplicate) {
          finalHistory.push(jItem);
        }
      });

      // Trier par date décroissante
      return finalHistory.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    } catch (error) {
      console.warn('⚠️ Erreur globale historique:', error);
      return this._getHistoriqueJSON(prospectId);
    }
  },

  // ✅ PRIVÉ: Fallback sur le champ JSON historique_actions
  async _getHistoriqueJSON(prospectId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.PROSPECTS)
        .select('historique_actions')
        .eq('id', prospectId)
        .single();

      if (error) return [];

      try {
        const historique = data.historique_actions ? JSON.parse(data.historique_actions) : [];
        return historique.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } catch (e) {
        return [];
      }
    } catch (e) {
      return [];
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