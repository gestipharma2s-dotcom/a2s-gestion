// Formater une date
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Formater une date et heure
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Formater un montant en DA
export const formatMontant = (montant) => {
  if (!montant && montant !== 0) return '0 DA';
  return new Intl.NumberFormat('fr-DZ', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(montant) + ' DA';
};

// ✅ NOUVEAU: Déterminer le statut de paiement (0, 1, 2)
export const getStatutPaiementCode = (montantTotal, montantPaye) => {
  const montantRestant = Math.max(0, montantTotal - montantPaye);
  
  if (montantRestant === montantTotal) {
    // 0 = Aucun paiement effectué
    return {
      code: 0,
      statut: 'AUCUN PAIEMENT',
      couleur: 'bg-red-100 text-red-700',
      badge: 'bg-red-500 text-white',
      icon: '🔴',
      pourcentage: 0
    };
  } else if (montantRestant > 0) {
    // 1 = Paiement partiel
    const pourcentage = Math.round((montantPaye / montantTotal) * 100);
    return {
      code: 1,
      statut: 'PARTIELLEMENT PAYÉ',
      couleur: 'bg-orange-100 text-orange-700',
      badge: 'bg-orange-500 text-white',
      icon: '🟠',
      pourcentage: pourcentage
    };
  } else {
    // 2 = Entièrement payé
    return {
      code: 2,
      statut: 'TOTALEMENT PAYÉ',
      couleur: 'bg-green-100 text-green-700',
      badge: 'bg-green-500 text-white',
      icon: '🟢',
      pourcentage: 100
    };
  }
};

// ✅ ANCIEN: Déterminer le statut de paiement (AUCUN, PARTIELLEMENT, TOTALEMENT)
export const getStatutPaiement = (montantTotal, montantPaye) => {
  return getStatutPaiementCode(montantTotal, montantPaye);
};

// ✅ NOUVEAU: Déterminer si les prix réels doivent être affichés
// Affiche les codes 0, 1, 2 pour les administrateurs seulement
export const shouldShowRealPrices = (userRole) => {
  return userRole === 'admin' || userRole === 'super_admin';
};

// ✅ NOUVEAU: Formater l'affichage du prix selon le rôle de l'utilisateur
export const formatPriceDisplay = (realPrice, userRole, hideLabel = false) => {
  if (shouldShowRealPrices(userRole)) {
    // Afficher le code 🔐 pour les administrateurs
    return hideLabel ? '🔐' : 'Code';
  } else {
    // Afficher le prix réel pour les autres utilisateurs
    return formatMontant(realPrice);
  }
};

// Calculer les jours restants
export const joursRestants = (dateFin) => {
  if (!dateFin) return 0;
  const maintenant = new Date();
  const fin = new Date(dateFin);
  const diff = fin - maintenant;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Obtenir la classe CSS selon le statut
export const getStatutClass = (statut) => {
  const classes = {
    actif: 'badge-success',
    prospect: 'badge-info',
    inactif: 'badge-danger',
    en_cours: 'badge-warning',
    terminee: 'badge-success',
    en_alerte: 'badge-warning',
    expire: 'badge-danger',
    cloturee: 'badge-success',
    normale: 'badge-info',
    haute: 'badge-danger'
  };
  return classes[statut] || 'badge-info';
};

// Obtenir le label français du statut
export const getStatutLabel = (statut) => {
  const labels = {
    actif: 'Actif',
    prospect: 'Prospect',
    inactif: 'Inactif',
    en_cours: 'En Cours',
    terminee: 'Terminée',
    en_alerte: 'En Alerte',
    expire: 'Expiré',
    cloturee: 'Clôturée',
    normale: 'Normale',
    haute: 'Haute',
    sur_site: 'Sur Site',
    a_distance: 'À Distance',
    maintenance: 'Maintenance',
    formation: 'Formation',
    autre: 'Autre',
    especes: 'Espèces',
    virement: 'Virement',
    cheque: 'Chèque',
    acquisition: 'Acquisition',
    abonnement: 'Abonnement'
  };
  return labels[statut] || statut;
};

// Calculer le taux de conversion
export const calculerTauxConversion = (prospects, clients) => {
  if (prospects === 0) return 0;
  return ((clients / prospects) * 100).toFixed(1);
};

// Générer un ID unique
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Valider un email
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Valider un numéro de téléphone algérien
export const isValidPhone = (phone) => {
  const regex = /^(0)(5|6|7)[0-9]{8}$/;
  return regex.test(phone.replace(/\s/g, ''));
};

// Tronquer un texte
export const truncate = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Obtenir les initiales
export const getInitials = (name) => {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};