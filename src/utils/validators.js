// src/utils/validators.js
export const validators = {
  // Valider un prospect
  validateProspect: (data) => {
    const errors = {};
    
    if (!data.raison_sociale || data.raison_sociale.trim() === '') {
      errors.raison_sociale = 'La raison sociale est obligatoire';
    }
    
    if (!data.contact || data.contact.trim() === '') {
      errors.contact = 'Le contact est obligatoire';
    }
    
    if (!data.telephone || data.telephone.trim() === '') {
      errors.telephone = 'Le téléphone est obligatoire';
    } else if (!/^(0)(5|6|7)[0-9]{8}$/.test(data.telephone.replace(/\s/g, ''))) {
      errors.telephone = 'Format de téléphone invalide (ex: 0555123456)';
    }
    
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Valider une installation
  validateInstallation: (data) => {
    const errors = {};
    
    if (!data.client_id) {
      errors.client_id = 'Le client est obligatoire';
    }
    
    if (!data.application_installee || data.application_installee.trim() === '') {
      errors.application_installee = 'L\'application est obligatoire';
    }
    
    if (!data.montant || data.montant <= 0) {
      errors.montant = 'Le montant doit être supérieur à 0';
    }
    
    if (!data.date_installation) {
      errors.date_installation = 'La date d\'installation est obligatoire';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Valider un paiement
  validatePaiement: (data) => {
    const errors = {};
    
    if (!data.client_id) {
      errors.client_id = 'Le client est obligatoire';
    }
    
    if (!data.type) {
      errors.type = 'Le type de paiement est obligatoire';
    }
    
    if (!data.montant || data.montant <= 0) {
      errors.montant = 'Le montant doit être supérieur à 0';
    }
    
    if (!data.mode_paiement) {
      errors.mode_paiement = 'Le mode de paiement est obligatoire';
    }
    
    if (!data.date_paiement) {
      errors.date_paiement = 'La date de paiement est obligatoire';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Valider une intervention
  validateIntervention: (data) => {
    const errors = {};
    
    if (!data.client_id) {
      errors.client_id = 'Le client est obligatoire';
    }
    
    if (!data.technicien_id) {
      errors.technicien_id = 'Le technicien est obligatoire';
    }
    
    if (!data.mode_intervention) {
      errors.mode_intervention = 'Le mode d\'intervention est obligatoire';
    }
    
    if (!data.type_intervention) {
      errors.type_intervention = 'Le type d\'intervention est obligatoire';
    }
    
    if (!data.duree || data.duree <= 0) {
      errors.duree = 'La durée doit être supérieure à 0';
    }
    
    if (!data.resume_probleme || data.resume_probleme.trim() === '') {
      errors.resume_probleme = 'Le résumé du problème est obligatoire';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Valider une application
  validateApplication: (data) => {
    const errors = {};
    
    if (!data.nom || data.nom.trim() === '') {
      errors.nom = 'Le nom de l\'application est obligatoire';
    }
    
    if (!data.prix || data.prix <= 0) {
      errors.prix = 'Le prix doit être supérieur à 0';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Valider un utilisateur
  validateUser: (data) => {
    const errors = {};
    
    if (!data.nom || data.nom.trim() === '') {
      errors.nom = 'Le nom est obligatoire';
    }
    
    if (!data.email || data.email.trim() === '') {
      errors.email = 'L\'email est obligatoire';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    if (!data.role) {
      errors.role = 'Le rôle est obligatoire';
    }
    
    if (!data.password || data.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};
