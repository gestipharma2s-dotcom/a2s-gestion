/**
 * SYSTEM DE PERMISSIONS GRANULAIRES
 * 
 * CONSULTATION (Lecture):
 * - Tous les utilisateurs ayant accès à la page 'support' peuvent VOIR TOUTES les interventions
 * - Aucun filtrage par créateur - chacun peut consulter le travail de tous
 * - Cela permet le suivi en cas d'absence du créateur
 * 
 * ACTIONS (Créer, Modifier, Supprimer):
 * - Les permissions granulaires sont assignées individuellement par l'admin
 * - Contrôlent les actions spécifiques que chaque utilisateur peut effectuer
 * 
 * Exemple User quelconque (Technicien, Commercial, Support):
 * - Peut VOIR toutes les interventions (pas filtrage par créateur)
 * - Peut CRÉER une intervention SEULEMENT si 'create' lui est attribué
 * - Peut MODIFIER une intervention SEULEMENT si 'edit' lui est attribué
 * - Peut SUPPRIMER une intervention SEULEMENT si 'delete' lui est attribué
 */

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
      'missions'
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
      'alertes',
      'missions'
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
      'missions',
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
  MISSIONS: 'missions',
  ALERTES: 'alertes',
  APPLICATIONS: 'applications',
  UTILISATEURS: 'utilisateurs'
};

// Configuration des permissions par page
export const PAGE_PERMISSIONS = {
  prospects: {
    label: '📋 Prospects',
    icon: '📋',
    permissions: ['create', 'edit', 'delete']
  },
  clients: {
    label: '👥 Clients',
    icon: '👥',
    permissions: ['create', 'edit', 'delete']
  },
  installations: {
    label: '🔧 Installations',
    icon: '🔧',
    permissions: ['create', 'edit', 'delete']
  },
  abonnements: {
    label: '📅 Abonnements',
    icon: '📅',
    permissions: ['create', 'edit', 'delete']
  },
  paiements: {
    label: '💰 Paiements',
    icon: '💰',
    permissions: ['create', 'edit', 'delete']
  },
  support: {
    label: '🎧 Support',
    icon: '🎧',
    permissions: ['view', 'create', 'edit', 'delete']
  },
  missions: {
    label: '🎯 Missions',
    icon: '🎯',
    permissions: ['create', 'edit', 'delete', 'close', 'validate']
  },
  alertes: {
    label: '🔔 Alertes',
    icon: '🔔',
    permissions: ['create', 'edit', 'delete']
  },
  applications: {
    label: '📱 Applications',
    icon: '📱',
    permissions: ['create', 'edit', 'delete']
  }
};

export const PERMISSION_LABELS = {
  view: '👁️ Consulter',
  create: '➕ Créer',
  edit: '✏️ Modifier',
  delete: '🗑️ Supprimer',
  close: '🔴 Clôturer',
  validate: '✅ Valider'
};