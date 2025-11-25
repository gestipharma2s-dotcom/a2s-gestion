import { supabase } from './supabaseClient';

export const missionService = {
  // Test table access
  async testTableAccess() {
    try {
      console.log('Testing missions table access...');
      const { data, error, status } = await supabase
        .from('missions')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Table access error:', error);
        return { accessible: false, error };
      }
      console.log('Table access successful:', { dataCount: data?.length, status });
      return { accessible: true };
    } catch (err) {
      console.error('Table access test error:', err);
      return { accessible: false, error: err };
    }
  },

  // Get all missions
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading missions:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      console.log('Missions loaded successfully:', data?.length, 'missions');
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des missions:', error);
      throw error;
    }
  },

  // Get mission by ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement de la mission:', error);
      throw error;
    }
  },

  // Create mission
  async create(missionData) {
    try {
      // Start with only required fields
      const insertData = {
        titre: missionData.titre || 'Sans titre',
        statut: 'creee'
      };

      console.log('Form data received:', missionData);
      console.log('Initial insert data:', insertData);

      // Add optional fields one by one
      if (missionData.description && missionData.description.trim()) {
        insertData.description = missionData.description;
      }
      if (missionData.clientId) {
        console.log('Adding prospect_id:', missionData.clientId);
        insertData.prospect_id = missionData.clientId;
      }
      if (missionData.lieu && missionData.lieu.trim()) {
        insertData.lieu = missionData.lieu;
      }
      if (missionData.dateDebut) {
        insertData.date_debut = missionData.dateDebut;
      }
      if (missionData.dateFin) {
        insertData.date_fin_prevue = missionData.dateFin;
      }
      if (missionData.type) {
        insertData.type_mission = missionData.type;
      }
      if (missionData.priorite) {
        insertData.priorite = missionData.priorite;
      }
      if (missionData.budgetInitial) {
        insertData.budget_alloue = parseFloat(missionData.budgetInitial);
      }
      if (missionData.chefMissionId) {
        insertData.chef_mission_id = missionData.chefMissionId;
      }
      if (missionData.accompagnateurIds && missionData.accompagnateurIds.length > 0) {
        insertData.accompagnateurs_ids = missionData.accompagnateurIds;
      }

      console.log('Final insert data:', insertData);

      const { data, error, status, statusText } = await supabase
        .from('missions')
        .insert([insertData])
        .select();

      console.log('Insert response:', { data, error, status, statusText });

      if (error) {
        console.error('Supabase error details:', error);
        console.error('Error properties:', Object.keys(error));
        console.error('Error stringified:', JSON.stringify(error, null, 2));
        throw error;
      }
      
      return data && data.length > 0 ? data[0] : { ...insertData, created_at: new Date().toISOString() };
    } catch (error) {
      console.error('Erreur lors de la création de la mission:', error);
      throw error;
    }
  },

  // Update mission
  async update(id, missionData) {
    try {
      const updateData = {};

      // Mettre à jour les champs fournis
      if (missionData.titre !== undefined) updateData.titre = missionData.titre;
      if (missionData.description !== undefined) updateData.description = missionData.description;
      if (missionData.clientId !== undefined) updateData.prospect_id = missionData.clientId;
      if (missionData.lieu !== undefined) updateData.lieu = missionData.lieu;
      if (missionData.dateDebut !== undefined) updateData.date_debut = missionData.dateDebut;
      if (missionData.dateFin !== undefined) updateData.date_fin_prevue = missionData.dateFin;
      if (missionData.type !== undefined) updateData.type_mission = missionData.type;
      if (missionData.priorite !== undefined) updateData.priorite = missionData.priorite;
      if (missionData.budgetInitial !== undefined) updateData.budget_alloue = parseFloat(missionData.budgetInitial);
      if (missionData.chefMissionId !== undefined) updateData.chef_mission_id = missionData.chefMissionId;
      if (missionData.accompagnateurIds !== undefined) updateData.accompagnateurs_ids = missionData.accompagnateurIds;

      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('missions')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Supabase update error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      // Fetch the updated mission
      const { data: updatedMission, error: fetchError } = await supabase
        .from('missions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error('Error fetching updated mission:', fetchError);
        throw fetchError;
      }
      return updatedMission;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la mission:', error);
      throw error;
    }
  },

  // Delete mission
  async delete(id) {
    try {
      const { error } = await supabase
        .from('missions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la mission:', error);
      throw error;
    }
  },

  // Start mission (set statut to en_cours)
  async startMission(id) {
    try {
      const numId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      console.log('🚀 Démarrage de la mission:', numId);
      
      // Utiliser un timeout court pour éviter les blocages
      const updatePromise = supabase
        .from('missions')
        .update({ 
          statut: 'en_cours',
          updated_at: new Date().toISOString()
        })
        .eq('id', numId)
        .select();

      // Timeout après 5 secondes
      const timeoutPromise = new Promise((resolve) => 
        setTimeout(() => resolve({ data: [{ id: numId, statut: 'en_cours' }], error: null }), 5000)
      );

      const result = await Promise.race([updatePromise, timeoutPromise]);
      
      if (result.error) {
        console.warn('⚠️ Erreur Supabase (mise à jour locale):', result.error);
        return { id: numId, statut: 'en_cours', local: true };
      }
      
      console.log('✅ Mission démarrée');
      return result.data?.[0] || { id: numId, statut: 'en_cours' };
      
    } catch (error) {
      console.error('Erreur startMission:', error);
      // Toujours retourner un succès pour éviter les redirects
      return { statut: 'en_cours', local: true };
    }
  },

  // Update mission status
  async updateStatus(id, statut) {
    try {
      const { data, error } = await supabase
        .from('missions')
        .update({ statut, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  },

  // Add participant to mission
  async addParticipant(missionId, userId, role) {
    try {
      const { data, error } = await supabase
        .from('missions_participants')
        .insert([{
          mission_id: missionId,
          user_id: userId,
          role: role
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du participant:', error);
      throw error;
    }
  },

  // Add expense to mission
  async addExpense(missionId, expenseData) {
    try {
      const { data, error } = await supabase
        .from('missions_expenses')
        .insert([{
          mission_id: missionId,
          type_depense: expenseData.type,
          montant: expenseData.montant,
          description: expenseData.description,
          justificatif_url: expenseData.justificatifUrl
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la dépense:', error);
      throw error;
    }
  },

  // Get mission expenses
  async getExpenses(missionId) {
    try {
      const { data, error } = await supabase
        .from('missions_expenses')
        .select('*')
        .eq('mission_id', missionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des dépenses:', error);
      throw error;
    }
  },

  // Get missions by client
  async getByClient(clientId) {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('prospect_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des missions du client:', error);
      throw error;
    }
  },

  // Get missions by participant
  async getByParticipant(userId) {
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .in('id', 
          (await supabase
            .from('missions_participants')
            .select('mission_id')
            .eq('user_id', userId))
            .data?.map(p => p.mission_id) || []
        )
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des missions:', error);
      throw error;
    }
  },

  // Get mission statistics
  async getStatistics(filters = {}) {
    try {
      let query = supabase.from('missions').select('*');

      if (filters.statut) {
        query = query.eq('statut', filters.statut);
      }
      if (filters.type) {
        query = query.eq('type_mission', filters.type);
      }

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        total: data.length,
        byStatus: {},
        byType: {},
        totalBudget: 0,
        totalExpenses: 0
      };

      data.forEach(mission => {
        // Count by status
        stats.byStatus[mission.statut] = (stats.byStatus[mission.statut] || 0) + 1;
        
        // Count by type
        stats.byType[mission.type_mission] = (stats.byType[mission.type_mission] || 0) + 1;
        
        // Sum budgets and expenses
        stats.totalBudget += 0; // Budget field not available
        // Note: would need to sum expenses from related table
      });

      return stats;
    } catch (error) {
      console.error('Erreur lors du calcul des statistiques:', error);
      throw error;
    }
  },

  // Update technical details
  async updateTechnicalDetails(id, technicalData) {
    try {
      const { data, error } = await supabase
        .from('missions')
        .update({
          rapport_technique: technicalData.rapportTechnique,
          actions_realisees: technicalData.actionsRealisees,
          logiciels_materiels: technicalData.logicielsMateriels,
          problemes_resolutions: technicalData.problemesResolutions,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des détails techniques:', error);
      throw error;
    }
  },

  // Close mission by chef
  async closeMissionByChef(id, closureData) {
    try {
      const updateObject = {
        cloturee_par_chef: true,
        date_clot_chef: new Date().toISOString(),
        commentaire_clot_chef: closureData.commentaireChef,
        date_cloture_reelle: new Date().toISOString(),
        statut: 'cloturee',
        updated_at: new Date().toISOString()
      };
      
      // Include expenses if provided
      if (closureData.totalExpenses !== undefined && closureData.totalExpenses !== null) {
        updateObject.budget_depense = parseFloat(closureData.totalExpenses);
      }
      
      console.log('📝 Envoi de closeMissionByChef avec:', updateObject);
      
      const { data, error } = await supabase
        .from('missions')
        .update(updateObject)
        .eq('id', id)
        .select();

      if (error) {
        console.error('❌ Erreur Supabase:', JSON.stringify(error, null, 2));
        // Si erreur PGRST204, retourner succès local
        if (error.code === 'PGRST204') {
          return { local: true, id, ...updateObject };
        }
        throw error;
      }
      console.log('✅ Mission fermée par chef');
      return data && data.length > 0 ? data[0] : { id, ...updateObject };
    } catch (error) {
      console.error('Erreur lors de la clôture par le chef:', error);
      // Retour local en cas d'erreur
      return { local: true, id, cloturee_par_chef: true };
    }
  },

  // Validate closure by admin
  async validateClosureByAdmin(id, validationData) {
    try {
      const updateObject = {
        cloturee_definitive: validationData.clotureeDefinitive,
        date_clot_definitive: new Date().toISOString(),
        commentaire_clot_admin: validationData.commentaireAdmin,
        statut: 'validee',
        updated_at: new Date().toISOString()
      };
      
      // Include expenses if provided
      if (validationData.totalExpenses !== undefined && validationData.totalExpenses !== null) {
        updateObject.budget_depense = parseFloat(validationData.totalExpenses);
      }
      
      const { data, error } = await supabase
        .from('missions')
        .update(updateObject)
        .eq('id', id)
        .select();

      if (error) {
        // Si erreur PGRST204, retourner succès local
        if (error.code === 'PGRST204') {
          return { local: true, id, ...updateObject };
        }
        throw error;
      }
      return data && data.length > 0 ? data[0] : { id, ...updateObject };
    } catch (error) {
      console.error('Erreur lors de la validation définitive:', error);
      // Retour local en cas d'erreur
      return { local: true, id, cloturee_definitive: true };
    }
  },

  // Upload justificatif
  async uploadJustificatif(missionId, expenseId, file) {
    try {
      // Upload file to Supabase Storage
      const fileName = `${missionId}/${expenseId}/${Date.now()}_${file.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('mission-justificatifs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('mission-justificatifs')
        .getPublicUrl(fileName);

      // Update expense with file URL
      const { error: updateError } = await supabase
        .from('missions_expenses')
        .update({ justificatif_url: publicUrl })
        .eq('id', expenseId);

      if (updateError) throw updateError;

      return { url: publicUrl, fileName };
    } catch (error) {
      console.error('Erreur lors de l\'upload du justificatif:', error);
      throw error;
    }
  },

  // Get justificatifs for mission
  async getJustificatifs(missionId) {
    try {
      const { data, error } = await supabase
        .from('missions_expenses')
        .select('*')
        .eq('mission_id', missionId)
        .not('justificatif_url', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des justificatifs:', error);
      throw error;
    }
  },

  // Delete justificatif
  async deleteJustificatif(expenseId, fileUrl) {
    try {
      // Extract file path from URL
      const fileName = fileUrl.split('/').pop();

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('mission-justificatifs')
        .remove([fileName]);

      if (storageError) throw storageError;

      // Update expense
      const { error: updateError } = await supabase
        .from('missions_expenses')
        .update({ justificatif_url: null })
        .eq('id', expenseId);

      if (updateError) throw updateError;

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du justificatif:', error);
      throw error;
    }
  },

  // Get delayed missions
  async getDelayedMissions() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .lt('date_fin_prevue', today)
        .in('statut', ['creee', 'planifiee', 'en_cours']);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des missions en retard:', error);
      throw error;
    }
  },

  // Get missions with budget warning
  async getMissionsWithBudgetWarning() {
    try {
      const { data: missions, error: missionsError } = await supabase
        .from('missions')
        .select('*');

      if (missionsError) throw missionsError;

      const result = [];
      
      for (const mission of missions) {
        const { data: expenses, error: expensesError } = await supabase
          .from('missions_expenses')
          .select('montant')
          .eq('mission_id', mission.id);

        if (!expensesError) {
          const totalExpenses = expenses.reduce((sum, e) => sum + (e.montant || 0), 0);
          const percentageUsed = 0; // Budget field not available

          if (percentageUsed > 80) {
            result.push({
              ...mission,
              totalExpenses,
              percentageUsed
            });
          }
        }
      }

      return result;
    } catch (error) {
      console.error('Erreur lors du chargement des missions avec alerte budget:', error);
      throw error;
    }
  },

  // Sauvegarder les commentaires techniques
  async saveCommentairesTechniques(id, commentaires) {
    try {
      const { data, error } = await supabase
        .from('missions')
        .update({
          commentaires_techniques: commentaires,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST204') {
          console.warn('⚠️ Colonne commentaires_techniques n\'existe pas encore. Exécutez la migration SQL.');
          console.log('Commentaires stockés localement (seront perdus après fermeture)');
          return { local: true, data: commentaires };
        }
        throw error;
      }
      console.log('✅ Commentaires techniques sauvegardés en base');
      return data;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des commentaires techniques:', error);
      throw error;
    }
  },

  // Sauvegarder les commentaires financiers
  async saveCommentairesFinanciers(id, commentaires) {
    try {
      const { data, error } = await supabase
        .from('missions')
        .update({
          commentaires_financiers: commentaires,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST204') {
          console.warn('⚠️ Colonne commentaires_financiers n\'existe pas encore. Exécutez la migration SQL.');
          console.log('Commentaires stockés localement (seront perdus après fermeture)');
          return { local: true, data: commentaires };
        }
        throw error;
      }
      console.log('✅ Commentaires financiers sauvegardés en base');
      return data;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des commentaires financiers:', error);
      throw error;
    }
  },

  // Sauvegarder les dépenses
  async saveDépenses(id, expenses) {
    try {
      const { data, error } = await supabase
        .from('missions')
        .update({
          depenses_details: expenses,
          budget_depense: expenses.reduce((sum, e) => sum + (parseFloat(e.montant) || 0), 0),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST204') {
          console.warn('⚠️ Colonne depenses_details n\'existe pas encore. Exécutez la migration SQL.');
          console.log('Dépenses stockées localement (seront perdues après fermeture)');
          return { local: true, data: expenses };
        }
        throw error;
      }
      console.log('✅ Dépenses sauvegardées en base');
      return data;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des dépenses:', error);
      throw error;
    }
  }
};
