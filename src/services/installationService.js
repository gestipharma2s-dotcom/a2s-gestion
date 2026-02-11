import { supabase } from './supabaseClient';
import { TABLES } from './supabaseClient';
import { abonnementService } from './abonnementService';
import { prospectService } from './prospectService';
import { paiementService } from './paiementService';

export const installationService = {
  // Récupérer toutes les installations
  async getAll() {
    try {
      const { data, error } = await supabase
        .from(TABLES.INSTALLATIONS)
        .select('*')
        .order('date_installation', { ascending: false });

      if (error) throw error;

      const dataWithDetails = await Promise.all(
        data.map(async (inst) => {
          let prospect = {};

          if (inst.client_id) {
            const { data: prospectData } = await supabase
              .from(TABLES.PROSPECTS)
              .select('raison_sociale, contact, telephone, email, wilaya')
              .eq('id', inst.client_id)
              .single();
            prospect = prospectData || {};
          }

          return {
            ...inst,
            client: prospect,
            type: inst.type || 'acquisition',
            wilaya: prospect?.wilaya || 'Non spécifiée'
          };
        })
      );

      return dataWithDetails;
    } catch (error) {
      console.error('Erreur récupération installations:', error);
      throw error;
    }
  },

  // Récupérer les installations d'un client
  async getByClient(clientId) {
    try {
      const { data, error } = await supabase
        .from(TABLES.INSTALLATIONS)
        .select('*')
        .eq('client_id', clientId)
        .order('date_installation', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération installations client:', error);
      throw error;
    }
  },

  // Vérifier si une installation a des paiements
  async hasPaiements(installationId) {
    try {
      const { data, error, count } = await supabase
        .from(TABLES.PAIEMENTS)
        .select('id', { count: 'exact', head: true })
        .eq('installation_id', installationId);

      if (error) throw error;
      return count > 0;
    } catch (error) {
      console.error('Erreur vérification paiements:', error);
      return false;
    }
  },

  // Créer une installation
  async create(installationData) {
    try {
      const { data, error } = await supabase
        .from(TABLES.INSTALLATIONS)
        .insert([{
          client_id: installationData.client_id,
          application_installee: installationData.application_installee,
          montant: parseFloat(installationData.montant) || 0,
          montant_abonnement: parseFloat(installationData.montant_abonnement) || 0,
          date_installation: installationData.date_installation,
          type: installationData.type || 'acquisition',
          statut: installationData.statut || 'en cours',
          created_by: installationData.created_by || null
        }])
        .select();

      if (error) throw error;

      const installation = data[0];

      // ✅ NOUVEAU: Créer un abonnement SEULEMENT si type = 'abonnement'
      if (installation.type === 'abonnement' || installation.type?.toLowerCase() === 'abonnement') {
        await abonnementService.createFromInstallation(installation.id, installationData.montant_abonnement);
      }

      // Convertir le prospect en client actif
      await prospectService.convertToClient(installationData.client_id);

      // ✅ CORRIGÉ: addHistorique() prend 3 paramètres (prospectId, action, détails)
      await prospectService.addHistorique(
        installationData.client_id,
        'installation',
        `Installation créée: ${installationData.application_installee}`
      );

      return installation;
    } catch (error) {
      console.error('Erreur création installation:', error);
      throw error;
    }
  },

  // Mettre à jour une installation
  async update(id, installationData) {
    try {
      // Construire les données de mise à jour en excluant les valeurs undefined/null
      const updateData = {};

      if (installationData.application_installee !== undefined) {
        updateData.application_installee = installationData.application_installee;
      }
      if (installationData.montant !== undefined) {
        updateData.montant = parseFloat(installationData.montant);
      }
      if (installationData.type !== undefined) {
        updateData.type = installationData.type || 'acquisition';
      }
      if (installationData.statut !== undefined) {
        updateData.statut = installationData.statut;
      }
      if (installationData.date_installation !== undefined) {
        updateData.date_installation = installationData.date_installation;
      }
      // NOUVEAU: Lien Mission
      if (installationData.mission_id !== undefined) {
        updateData.mission_id = installationData.mission_id;
      }

      // Validation: vérifier que les champs critiques ne sont pas vides
      // Validation ajustée pour mises à jour partielles
      if (installationData.application_installee !== undefined && !updateData.application_installee) {
        throw new Error('application_installee est requis');
      }
      if (installationData.montant !== undefined && (!updateData.montant || isNaN(updateData.montant))) {
        throw new Error('montant est requis et doit être un nombre');
      }
      if (installationData.statut !== undefined && !updateData.statut) {
        throw new Error('statut est requis');
      }
      if (installationData.date_installation !== undefined && !updateData.date_installation) {
        throw new Error('date_installation est requis');
      }

      console.log('Données de mise à jour installation:', updateData);

      const { data, error } = await supabase
        .from(TABLES.INSTALLATIONS)
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Erreur détaillée Supabase:', error);
        throw error;
      }

      const installation = data && data.length > 0 ? data[0] : null;

      if (!installation) {
        throw new Error('Installation non trouvée après mise à jour');
      }

      // Mettre à jour l'abonnement lié
      try {
        console.log('Recherche abonnements pour installation:', id);

        const { data: abonnements, error: fetchError } = await supabase
          .from(TABLES.ABONNEMENTS)
          .select('*')
          .eq('installation_id', id);

        if (fetchError) {
          console.error('Erreur recherche abonnements:', fetchError);
          return installation;
        }

        console.log('Abonnements trouvés:', abonnements);

        if (abonnements && abonnements.length > 0) {
          // Mettre à jour les abonnements selon leur date d'expiration ET recalculer les dates
          for (const abo of abonnements) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const dateFin = new Date(abo.date_fin);
            dateFin.setHours(0, 0, 0, 0);

            const alertDate = new Date(today);
            alertDate.setDate(alertDate.getDate() + 30);

            // Déterminer le nouveau statut
            let newStatut = 'actif';
            if (dateFin < today) {
              newStatut = 'expire';
            } else if (dateFin <= alertDate) {
              newStatut = 'en_alerte';
            }

            // Recalculer les dates de l'abonnement si la date d'installation a changé
            const updateAboData = { statut: newStatut };

            if (installationData.date_installation) {
              const dateObj = new Date(installationData.date_installation);
              const dateDebut = dateObj.toISOString().split('T')[0];

              const dateFinAbonnement = new Date(dateObj);
              dateFinAbonnement.setFullYear(dateFinAbonnement.getFullYear() + 1);
              const dateFinFormatted = dateFinAbonnement.toISOString().split('T')[0];

              updateAboData.date_debut = dateDebut;
              updateAboData.date_fin = dateFinFormatted;
            }

            // Mettre à jour l'abonnement
            await supabase
              .from(TABLES.ABONNEMENTS)
              .update(updateAboData)
              .eq('id', abo.id);
          }

          console.log('Abonnements mis à jour');
        } else {
          console.log('Aucun abonnement trouvé pour cette installation');
        }
      } catch (aboError) {
        console.error('Erreur dans mise à jour abonnement:', aboError);
      }

      return installation;
    } catch (error) {
      console.error('Erreur mise à jour installation:', error);
      throw error;
    }
  },

  // Supprimer une installation (avec vérification paiements)
  async delete(id) {
    try {
      // Vérifier s'il y a des paiements liés
      const hasPaiements = await this.hasPaiements(id);

      if (hasPaiements) {
        const error = new Error(
          'Impossible de supprimer cette installation car elle a des paiements enregistrés. ' +
          'Supprimez d\'abord les paiements avant de supprimer l\'installation.'
        );
        error.code = 'INSTALLATION_HAS_PAIEMENTS';
        throw error;
      }

      // 1. Supprimer les abonnements liés à cette installation
      const { data: abonnements, error: aboFetchError } = await supabase
        .from(TABLES.ABONNEMENTS)
        .select('id')
        .eq('installation_id', id);

      if (aboFetchError) throw aboFetchError;

      // Supprimer chaque abonnement trouvé
      if (abonnements && abonnements.length > 0) {
        for (const abo of abonnements) {
          await abonnementService.delete(abo.id);
        }
      }

      // 2. Supprimer l'installation
      const { error } = await supabase
        .from(TABLES.INSTALLATIONS)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur suppression installation:', error);
      throw error;
    }
  },

  // Statistiques des installations
  async getStats() {
    try {
      const { data, error } = await supabase
        .from(TABLES.INSTALLATIONS)
        .select('statut, montant, date_installation');

      if (error) throw error;

      const stats = {
        total: data.length,
        enCours: data.filter(i => i.statut === 'en cours').length,
        terminees: data.filter(i => i.statut === 'terminee').length,
        revenuTotal: data.reduce((sum, i) => sum + (i.montant || 0), 0)
      };

      return stats;
    } catch (error) {
      console.error('Erreur statistiques installations:', error);
      throw error;
    }
  },

  // ✅ NOUVEAU: Renouveler automatiquement les installations de type ACQUISITION après 1 an
  async checkAndRenewAcquisitions() {
    try {
      // Récupérer toutes les installations de type "acquisition"
      const { data: acquisitions, error: fetchError } = await supabase
        .from(TABLES.INSTALLATIONS)
        .select('id, client_id, application_installee, montant, date_installation, type, statut, created_by')
        .eq('type', 'acquisition');

      if (fetchError) throw fetchError;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const renewedInstallations = [];

      // Parcourir chaque acquisition pour vérifier si elle a 1 an
      for (const installation of acquisitions) {
        const dateInstallation = new Date(installation.date_installation);
        dateInstallation.setHours(0, 0, 0, 0);
        const oneYearLater = new Date(dateInstallation);
        oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

        // Si la date d'installation + 1 an est AUJOURD'HUI ou avant, créer un nouvel abonnement
        if (today >= oneYearLater) {
          // Vérifier s'il existe déjà un abonnement actif ou en alerte pour cette installation
          const { data: existingAbonnements, error: checkError } = await supabase
            .from(TABLES.ABONNEMENTS)
            .select('id', { count: 'exact' })
            .eq('installation_id', installation.id)
            .in('statut', ['actif', 'en_alerte']);

          const hasActiveAbonnement = existingAbonnements && existingAbonnements.length > 0;

          if (!hasActiveAbonnement) {
            // ✅ Créer directement un nouvel abonnement pour l'installation originale
            try {
              console.log(`📋 Création d'abonnement renouvellement pour installation ${installation.id}`);

              // Créer les dates du nouvel abonnement
              const dateDebut = today;
              const dateFin = new Date(dateDebut);
              dateFin.setFullYear(dateFin.getFullYear() + 1);

              // Insérer le nouvel abonnement
              const { error: insertError } = await supabase
                .from(TABLES.ABONNEMENTS)
                .insert([{
                  installation_id: installation.id,
                  date_debut: dateDebut.toISOString().split('T')[0],
                  date_fin: dateFin.toISOString().split('T')[0],
                  statut: 'actif',
                  source: 'ABONNEMENT (ACQUISITION)',
                  auto_generated: true
                }]);

              if (insertError) {
                console.error(`Erreur création abonnement renouvellement pour ${installation.id}:`, insertError);
                continue;
              }

              // ✅ NOUVEAU: Enregistrer l'abonnement auto-renouvelé dans l'historique du prospect/client
              try {
                await prospectService.addHistorique(
                  installation.client_id,
                  'abonnement_auto_renew',
                  `Abonnement auto-renouvelé pour ${installation.application_installee}`,
                  {
                    installation_id: installation.id,
                    date_debut: dateDebut.toISOString().split('T')[0],
                    date_fin: dateFin.toISOString().split('T')[0],
                    montant: installation.montant,
                    source: 'ABONNEMENT (ACQUISITION)'
                  }
                );
                console.log(`✅ Action enregistrée dans l'historique du prospect/client ${installation.client_id}`);
              } catch (histErr) {
                console.warn(`⚠️ Impossible d'enregistrer dans l'historique:`, histErr);
              }

              renewedInstallations.push(installation);
              console.log(`✅ Abonnement renouvelé: ${installation.application_installee} (Installation ${installation.id}), Nouvel abonnement jusqu'au ${dateFin.toISOString().split('T')[0]}`);
            } catch (err) {
              console.error(`Erreur lors du renouvellement d'abonnement pour ${installation.id}:`, err);
            }
          }
        }
      }

      return {
        success: true,
        renewedCount: renewedInstallations.length,
        installations: renewedInstallations
      };
    } catch (error) {
      console.error('Erreur vérification renouvellement installations:', error);
      throw error;
    }
  }
};