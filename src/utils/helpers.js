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