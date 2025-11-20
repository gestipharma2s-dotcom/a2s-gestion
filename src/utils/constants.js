export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  TECHNICIEN: 'technicien',
  COMMERCIAL: 'commercial',
  SUPPORT: 'support'
};

// Permissions par rôle - Définit ce que chaque rôle peut faire
export const ROLE_PERMISSIONS = {
  super_admin: {
    label: 'Super Administrateur',
    canManageUsers: true,
    canManageRoles: true,
    canManageApplications: true,
    canViewAll: true,
    canEditAll: true,
    canDeleteAll: true,
    allPages: true
  },
  admin: {
    label: 'Administrateur',
    canManageUsers: true,
    canManageRoles: false,
    canManageApplications: true,
    canViewAll: true,
    canEditAll: true,
    canDeleteAll: true,
    allPages: true
  },
  technicien: {
    label: 'Technicien',
    canManageUsers: false,
    canManageRoles: false,
    canManageApplications: false,
    canViewAll: false,
    canEditAll: false,
    canDeleteAll: false,
    allPages: false,
    defaultPages: [
      'dashboard',
      'installations',
      'abonnements',
      'support',
      'interventions'
    ]
  },
  commercial: {
    label: 'Commercial',
    canManageUsers: false,
    canManageRoles: false,
    canManageApplications: false,
    canViewAll: false,
    canEditAll: false,
    canDeleteAll: false,
    allPages: false,
    defaultPages: [
      'dashboard',
      'prospects',
      'clients',
      'installations',
      'abonnements',
      'paiements',
      'alertes'
    ]
  },
  support: {
    label: 'Support',
    canManageUsers: false,
    canManageRoles: false,
    canManageApplications: false,
    canViewAll: false,
    canEditAll: false,
    canDeleteAll: false,
    allPages: false,
    defaultPages: [
      'dashboard',
      'support',
      'interventions',
      'clients'
    ]
  }
};

export const STATUTS_PROSPECT = {
  PROSPECT: 'prospect',
  ACTIF: 'actif',
  INACTIF: 'inactif'
};

export const STATUTS_INSTALLATION = {
  EN_COURS: 'en_cours',
  TERMINEE: 'terminee'
};

export const STATUTS_ABONNEMENT = {
  ACTIF: 'actif',
  EN_ALERTE: 'en_alerte',
  EXPIRE: 'expire'
};

export const STATUTS_INTERVENTION = {
  EN_COURS: 'en_cours',
  CLOTUREE: 'cloturee'
};

export const PRIORITES = {
  NORMALE: 'normale',
  HAUTE: 'haute'
};

export const MODES_INTERVENTION = {
  SUR_SITE: 'sur_site',
  A_DISTANCE: 'a_distance'
};

export const TYPES_INTERVENTION = {
  MAINTENANCE: 'maintenance',
  FORMATION: 'formation',
  AUTRE: 'autre'
};

export const MODES_PAIEMENT = {
  ESPECES: 'especes',
  VIREMENT: 'virement',
  CHEQUE: 'cheque',
  AUTRE: 'autre'
};

export const TYPES_PAIEMENT = {
  ACQUISITION: 'acquisition',
  ABONNEMENT: 'abonnement'
};

export const TYPES_ACTION = {
  APPEL: 'appel',
  RELANCE: 'relance',
  EMAIL: 'email',
  RDV: 'rdv',
  DEMO: 'demo',
  OFFRE: 'offre_envoyee',
  CREATION: 'creation',
  MODIFICATION: 'modification',
  CONVERSION: 'conversion',
  INSTALLATION: 'installation'
};

export const PAGES = {
  DASHBOARD: 'dashboard',
  PROSPECTS: 'prospects',
  CLIENTS: 'clients',
  INSTALLATIONS: 'installations',
  ABONNEMENTS: 'abonnements',
  PAIEMENTS: 'paiements',
  SUPPORT: 'support',
  INTERVENTIONS: 'interventions',
  ALERTES: 'alertes',
  APPLICATIONS: 'applications',
  UTILISATEURS: 'utilisateurs'
};