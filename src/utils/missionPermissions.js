/**
 * Utilitaires de gestion des permissions pour les missions
 * Centralise la logique de contrôle d'accès par rôle
 */

export const missionPermissions = {
  // Rôles disponibles
  roles: {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    CHEF_MISSION: 'chef_mission',
    TECHNICIEN: 'technicien',
    COMMERCIAL: 'commercial',
    COMPTABILITE: 'comptabilite',
    CLIENT: 'client'
  },

  /**
   * Vérifie si l'utilisateur peut créer une mission
   */
  canCreateMission: (userRole) => {
    const allowedRoles = ['super_admin', 'admin', 'chef_mission', 'commercial'];
    return allowedRoles.includes(userRole);
  },

  /**
   * Vérifie si l'utilisateur peut modifier une mission
   */
  canEditMission: (userRole, mission, userId) => {
    // Admin/Super Admin
    if (['super_admin', 'admin'].includes(userRole)) {
      return true;
    }

    // Chef de mission (sauf si clôturée)
    if (userRole === 'chef_mission' && mission.chefMissionId === userId) {
      return !mission.cloturee_par_chef;
    }

    return false;
  },

  /**
   * Vérifie si l'utilisateur peut supprimer une mission
   */
  canDeleteMission: (userRole, mission) => {
    // Seulement Admin/Super Admin
    if (['super_admin', 'admin'].includes(userRole)) {
      // Pas de suppression si clôturée
      return !mission.cloturee_par_chef;
    }

    return false;
  },

  /**
   * Vérifie si l'utilisateur peut clôturer une mission
   */
  canCloseMission: (userRole, mission, userId) => {
    // Chef de mission uniquement
    if (userRole === 'chef_mission' && mission.chefMissionId === userId) {
      return mission.statut === 'en_cours';
    }

    // Admin peut clôturer aussi
    if (['super_admin', 'admin'].includes(userRole)) {
      return mission.statut === 'en_cours';
    }

    return false;
  },

  /**
   * Vérifie si l'utilisateur peut valider (clôture définitive) une mission
   */
  canValidateMission: (userRole, mission) => {
    // Seulement Admin/Super Admin
    if (['super_admin', 'admin'].includes(userRole)) {
      return mission.cloturee_par_chef && !mission.cloturee_definitive;
    }

    return false;
  },

  /**
   * Vérifie si l'utilisateur peut voir les dépenses
   */
  canViewExpenses: (userRole, mission, userId) => {
    const allowedRoles = ['super_admin', 'admin', 'comptabilite'];

    if (allowedRoles.includes(userRole)) {
      return true;
    }

    // Chef de mission voit ses propres dépenses
    if (userRole === 'chef_mission' && mission.chefMissionId === userId) {
      return true;
    }

    return false;
  },

  /**
   * Vérifie si l'utilisateur peut ajouter des dépenses
   */
  canAddExpenses: (userRole, mission, userId) => {
    // Chef de mission et Admin
    if (userRole === 'chef_mission' && mission.chefMissionId === userId) {
      return true;
    }

    if (['super_admin', 'admin', 'comptabilite'].includes(userRole)) {
      return true;
    }

    return false;
  },

  /**
   * Vérifie si l'utilisateur peut modifier les dépenses
   */
  canEditExpenses: (userRole, mission, userId) => {
    // Chef de mission et Admin (pas si clôturée)
    if (userRole === 'chef_mission' && mission.chefMissionId === userId && !mission.cloturee_par_chef) {
      return true;
    }

    if (['super_admin', 'admin'].includes(userRole) && !mission.cloturee_definitive) {
      return true;
    }

    if (userRole === 'comptabilite' && !mission.cloturee_definitive) {
      return true;
    }

    return false;
  },

  /**
   * Vérifie si l'utilisateur peut voir les détails techniques
   */
  canViewTechnicalDetails: (userRole) => {
    // Tous les utilisateurs authentifiés
    return userRole !== undefined;
  },

  /**
   * Vérifie si l'utilisateur peut modifier les détails techniques
   */
  canEditTechnicalDetails: (userRole, mission, userId) => {
    // Chef de mission
    if (userRole === 'chef_mission' && mission.chefMissionId === userId) {
      return !mission.cloturee_par_chef;
    }

    // Technicien
    if (userRole === 'technicien') {
      return !mission.cloturee_par_chef;
    }

    // Admin
    if (['super_admin', 'admin'].includes(userRole)) {
      return !mission.cloturee_definitive;
    }

    return false;
  },

  /**
   * Vérifie si l'utilisateur peut télécharger les justificatifs
   */
  canDownloadJustificatifs: (userRole, mission, userId) => {
    const allowedRoles = ['super_admin', 'admin', 'comptabilite', 'chef_mission'];

    if (allowedRoles.includes(userRole)) {
      if (userRole === 'chef_mission') {
        return mission.chefMissionId === userId;
      }
      return true;
    }

    return false;
  },

  /**
   * Retourne la liste des actions disponibles pour l'utilisateur
   */
  getAvailableActions: (userRole, mission, userId) => {
    const actions = [];

    if (this.canEditMission(userRole, mission, userId)) {
      actions.push('edit');
    }

    if (this.canDeleteMission(userRole, mission)) {
      actions.push('delete');
    }

    if (this.canCloseMission(userRole, mission, userId)) {
      actions.push('close');
    }

    if (this.canValidateMission(userRole, mission)) {
      actions.push('validate');
    }

    if (this.canViewExpenses(userRole, mission, userId)) {
      actions.push('viewExpenses');
    }

    if (this.canAddExpenses(userRole, mission, userId)) {
      actions.push('addExpenses');
    }

    if (this.canEditTechnicalDetails(userRole, mission, userId)) {
      actions.push('editTechnical');
    }

    if (this.canDownloadJustificatifs(userRole, mission, userId)) {
      actions.push('downloadJustificatifs');
    }

    return actions;
  },

  /**
   * Messages d'erreur personnalisés
   */
  getErrorMessage: (action, userRole) => {
    const messages = {
      edit: 'Vous n\'avez pas la permission de modifier cette mission',
      delete: 'Vous n\'avez pas la permission de supprimer cette mission',
      close: 'Seul le Chef de Mission peut clôturer cette mission',
      validate: 'Seul un Administrateur peut valider la clôture',
      viewExpenses: 'Vous n\'avez pas accès aux dépenses de cette mission',
      addExpenses: 'Vous n\'avez pas la permission d\'ajouter des dépenses',
      editTechnical: 'Vous n\'avez pas la permission de modifier les détails techniques',
      downloadJustificatifs: 'Vous n\'avez pas accès aux justificatifs'
    };

    return messages[action] || 'Accès refusé';
  },

  /**
   * Matrice de permissions (pour documentation)
   */
  permissionMatrix: {
    'Super Admin': ['create', 'edit', 'delete', 'close', 'validate', 'viewExpenses', 'addExpenses', 'editTechnical', 'downloadJustificatifs'],
    'Admin': ['create', 'edit', 'delete', 'close', 'validate', 'viewExpenses', 'addExpenses', 'editTechnical', 'downloadJustificatifs'],
    'Chef Mission': ['viewExpenses', 'addExpenses', 'editTechnical', 'close'],
    'Technicien': ['viewExpenses', 'editTechnical'],
    'Commercial': ['create'],
    'Comptabilité': ['viewExpenses', 'addExpenses', 'downloadJustificatifs'],
    'Client': []
  }
};

export default missionPermissions;
