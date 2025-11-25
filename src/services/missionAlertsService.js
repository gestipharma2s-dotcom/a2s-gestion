/**
 * Service d'alertes email pour les missions
 * Envoie des notifications lors de changements de statut
 */

export const missionAlertsService = {
  /**
   * Types d'alertes disponibles
   */
  alertTypes: {
    MISSION_CREATED: 'mission_created',
    MISSION_STARTED: 'mission_started',
    MISSION_COMPLETED: 'mission_completed',
    MISSION_DELAYED: 'mission_delayed',
    MISSION_BUDGET_WARNING: 'mission_budget_warning',
    MISSION_CLOSED: 'mission_closed',
    MISSION_VALIDATED: 'mission_validated',
    MISSION_MODIFIED: 'mission_modified'
  },

  /**
   * Envoie une alerte email
   */
  sendAlert: async (alertType, mission, recipients, message) => {
    try {
      console.log(`📧 Alerte Email: ${alertType}`);
      console.log(`📋 Mission: ${mission.titre}`);
      console.log(`👥 Destinataires: ${recipients.join(', ')}`);
      console.log(`📝 Message: ${message}`);

      // Simuler l'envoi (en production, utiliser SendGrid, Resend, ou autre)
      const emailPayload = {
        type: alertType,
        mission: {
          id: mission.id,
          titre: mission.titre,
          client: mission.client?.raison_sociale,
          statut: mission.statut,
          dateFin: mission.dateFin,
          budgetInitial: mission.budgetInitial,
          depenses: mission.depenses
        },
        recipients,
        message,
        timestamp: new Date().toISOString()
      };

      // Log le payload (à remplacer par vrai service email)
      console.log('📤 Payload Email:', emailPayload);

      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        success: true,
        message: `✅ Alerte envoyée à ${recipients.length} destinataire(s)`,
        emailPayload
      };
    } catch (error) {
      console.error('Erreur envoi email:', error);
      throw error;
    }
  },

  /**
   * Alerte - Mission créée
   */
  onMissionCreated: async (mission, recipients) => {
    const message = `
      Nouvelle mission créée:
      
      📋 ${mission.titre}
      👤 Client: ${mission.client?.raison_sociale}
      📅 Du ${new Date(mission.dateDebut).toLocaleDateString('fr-FR')} au ${new Date(mission.dateFin).toLocaleDateString('fr-FR')}
      💰 Budget: ${mission.budgetInitial}€
      
      Cliquez pour voir les détails...
    `;

    return this.sendAlert(
      this.alertTypes.MISSION_CREATED,
      mission,
      recipients,
      message
    );
  },

  /**
   * Alerte - Mission démarrée
   */
  onMissionStarted: async (mission, recipients) => {
    const message = `
      Mission en cours:
      
      📋 ${mission.titre}
      👤 Client: ${mission.client?.raison_sociale}
      📅 À terminer le ${new Date(mission.dateFin).toLocaleDateString('fr-FR')}
      👨‍💼 Chef: ${mission.chefMission?.full_name || 'Non assigné'}
    `;

    return this.sendAlert(
      this.alertTypes.MISSION_STARTED,
      mission,
      recipients,
      message
    );
  },

  /**
   * Alerte - Mission complétée
   */
  onMissionCompleted: async (mission, recipients) => {
    const message = `
      Mission complétée:
      
      ✅ ${mission.titre}
      👤 Client: ${mission.client?.raison_sociale}
      📈 Avancement: ${mission.avancement}%
      💰 Dépenses: ${mission.depenses}€ / ${mission.budgetInitial}€
    `;

    return this.sendAlert(
      this.alertTypes.MISSION_COMPLETED,
      mission,
      recipients,
      message
    );
  },

  /**
   * Alerte - Mission en retard
   */
  onMissionDelayed: async (mission, recipients) => {
    const today = new Date();
    const endDate = new Date(mission.dateFin);
    const daysLate = Math.floor((today - endDate) / (1000 * 60 * 60 * 24));

    const message = `
      ⚠️ ALERTE RETARD ⚠️
      
      Mission en retard:
      
      📋 ${mission.titre}
      👤 Client: ${mission.client?.raison_sociale}
      ❌ Retard: ${daysLate} jour(s)
      📅 Date prévue: ${new Date(mission.dateFin).toLocaleDateString('fr-FR')}
      📈 Avancement: ${mission.avancement}%
    `;

    return this.sendAlert(
      this.alertTypes.MISSION_DELAYED,
      mission,
      recipients,
      message
    );
  },

  /**
   * Alerte - Budget dépassé
   */
  onMissionBudgetWarning: async (mission, recipients) => {
    const remainingBudget = mission.budgetInitial - (mission.depenses || 0);
    const percentageUsed = Math.round(((mission.depenses || 0) / mission.budgetInitial) * 100);

    const message = `
      ⚠️ ALERTE BUDGET ⚠️
      
      Dépassement de budget:
      
      📋 ${mission.titre}
      👤 Client: ${mission.client?.raison_sociale}
      💰 Budget initial: ${mission.budgetInitial}€
      💰 Dépenses: ${mission.depenses}€
      💰 Reste: ${remainingBudget}€
      📊 Utilisation: ${percentageUsed}%
    `;

    return this.sendAlert(
      this.alertTypes.MISSION_BUDGET_WARNING,
      mission,
      recipients,
      message
    );
  },

  /**
   * Alerte - Mission clôturée
   */
  onMissionClosed: async (mission, recipients, commentaire) => {
    const message = `
      Mission clôturée par le Chef:
      
      📋 ${mission.titre}
      👤 Client: ${mission.client?.raison_sociale}
      👨‍💼 Chef: ${mission.chefMission?.full_name}
      📝 Commentaire: ${commentaire}
      
      Validation Admin en attente...
    `;

    return this.sendAlert(
      this.alertTypes.MISSION_CLOSED,
      mission,
      recipients,
      message
    );
  },

  /**
   * Alerte - Mission validée (Admin)
   */
  onMissionValidated: async (mission, recipients, commentaire) => {
    const message = `
      ✅ Mission validée définitivement:
      
      📋 ${mission.titre}
      👤 Client: ${mission.client?.raison_sociale}
      💰 Montant final: ${mission.depenses}€
      📝 Commentaire Admin: ${commentaire}
    `;

    return this.sendAlert(
      this.alertTypes.MISSION_VALIDATED,
      mission,
      recipients,
      message
    );
  },

  /**
   * Alerte - Mission modifiée
   */
  onMissionModified: async (mission, recipients, modifications) => {
    const modsList = Object.entries(modifications)
      .map(([key, value]) => `• ${key}: ${value}`)
      .join('\n');

    const message = `
      Mission modifiée:
      
      📋 ${mission.titre}
      👤 Client: ${mission.client?.raison_sociale}
      
      Modifications:
      ${modsList}
    `;

    return this.sendAlert(
      this.alertTypes.MISSION_MODIFIED,
      mission,
      recipients,
      message
    );
  },

  /**
   * Récupère les destinataires selon le type d'alerte
   */
  getRecipients: (mission, alertType, allUsers = []) => {
    const recipients = [];

    // Chef de Mission
    if (mission.chefMission?.email) {
      recipients.push(mission.chefMission.email);
    }

    // Admin (pour certaines alertes)
    if (
      alertType === this.alertTypes.MISSION_DELAYED ||
      alertType === this.alertTypes.MISSION_BUDGET_WARNING ||
      alertType === this.alertTypes.MISSION_CLOSED
    ) {
      const admins = allUsers.filter(u => u.role === 'admin' || u.role === 'super_admin');
      recipients.push(...admins.map(a => a.email));
    }

    // Client (optionnel)
    if (mission.client?.email) {
      // recipients.push(mission.client.email);
    }

    return [...new Set(recipients)]; // Déduplique
  },

  /**
   * Vérifie les alertes nécessaires pour une mission
   */
  checkAndSendAlerts: async (mission, previousMission, allUsers = []) => {
    const alertsSent = [];

    try {
      // Vérifier si statut a changé
      if (previousMission?.statut !== mission.statut) {
        const recipients = this.getRecipients(mission, null, allUsers);

        if (mission.statut === 'en_cours') {
          await this.onMissionStarted(mission, recipients);
          alertsSent.push('Mission démarrée');
        }

        if (mission.statut === 'cloturee') {
          await this.onMissionClosed(mission, recipients, mission.commentaire_clot_chef);
          alertsSent.push('Mission clôturée');
        }

        if (mission.statut === 'validee') {
          await this.onMissionValidated(mission, recipients, mission.commentaire_clot_admin);
          alertsSent.push('Mission validée');
        }
      }

      // Vérifier si budget dépassé
      const budgetUsagePercent = (mission.depenses || 0) / mission.budgetInitial * 100;
      if (budgetUsagePercent > 90) {
        const recipients = this.getRecipients(mission, this.alertTypes.MISSION_BUDGET_WARNING, allUsers);
        await this.onMissionBudgetWarning(mission, recipients);
        alertsSent.push('Alerte budget');
      }

      // Vérifier si en retard
      if (new Date(mission.dateFin) < new Date() && mission.statut !== 'cloturee' && mission.statut !== 'validee') {
        const recipients = this.getRecipients(mission, this.alertTypes.MISSION_DELAYED, allUsers);
        await this.onMissionDelayed(mission, recipients);
        alertsSent.push('Alerte retard');
      }

      return alertsSent;
    } catch (error) {
      console.error('Erreur dans checkAndSendAlerts:', error);
      throw error;
    }
  },

  /**
   * Template d'email
   */
  getEmailTemplate: (alertType, mission, additionalData = {}) => {
    const templates = {
      [this.alertTypes.MISSION_CREATED]: {
        subject: `🎯 Nouvelle mission: ${mission.titre}`,
        body: `Une nouvelle mission a été créée pour ${mission.client?.raison_sociale}`
      },
      [this.alertTypes.MISSION_STARTED]: {
        subject: `⏱️ Mission en cours: ${mission.titre}`,
        body: `La mission ${mission.titre} a démarré`
      },
      [this.alertTypes.MISSION_DELAYED]: {
        subject: `⚠️ RETARD - ${mission.titre}`,
        body: `La mission ${mission.titre} est en retard`
      },
      [this.alertTypes.MISSION_BUDGET_WARNING]: {
        subject: `💰 ALERTE BUDGET - ${mission.titre}`,
        body: `Le budget de la mission ${mission.titre} approche de son limite`
      },
      [this.alertTypes.MISSION_CLOSED]: {
        subject: `🔴 Clôture en attente de validation: ${mission.titre}`,
        body: `La mission ${mission.titre} a été clôturée par le chef. En attente de validation admin.`
      },
      [this.alertTypes.MISSION_VALIDATED]: {
        subject: `✅ Mission validée: ${mission.titre}`,
        body: `La mission ${mission.titre} a été validée définitivement`
      }
    };

    return templates[alertType] || { subject: 'Alerte Mission', body: 'Nouvelle alerte' };
  }
};

export default missionAlertsService;
