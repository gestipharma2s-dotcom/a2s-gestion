import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import SearchableSelect from '../common/SearchableSelect';
import Button from '../common/Button';
import { prospectService } from '../../services/prospectService';
import { applicationService } from '../../services/applicationService';

const InstallationForm = ({ installation, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    client_id: '',
    application_installee: '',
    montant: '',
    montant_abonnement: '',
    date_installation: '',
    type: 'acquisition',
    statut: 'en_cours'
  });
  const [selectedApplicationId, setSelectedApplicationId] = useState(''); // ✅ NOUVEAU: Tracker l'ID de l'application sélectionnée
  const [errors, setErrors] = useState({});
  const [clients, setClients] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadClients();
    loadApplications();
  }, []);

  // ✅ Charger les données initiales de l'installation SEULEMENT au montage ou si installation change
  useEffect(() => {
    if (installation) {
      setFormData({
        client_id: installation.client_id || '',
        application_installee: installation.application_installee || '',
        montant: installation.montant || '',
        montant_abonnement: installation.montant_abonnement || '',
        date_installation: installation.date_installation?.split('T')[0] || '',
        type: installation.type || 'acquisition',
        statut: installation.statut || 'en_cours'
      });
      // ✅ Trouver et pré-sélectionner l'application
      if (installation.application_installee && applications.length > 0) {
        const app = applications.find(a => a.nom === installation.application_installee);
        if (app) {
          setSelectedApplicationId(app.id);
        }
      }
    }
  }, [installation]);

  const loadClients = async () => {
    try {
      const data = await prospectService.getAll();
      setClients(data);
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    }
  };

  const loadApplications = async () => {
    try {
      const data = await applicationService.getAll();
      setApplications(data);
    } catch (error) {
      console.error('Erreur chargement applications:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleApplicationSelect = (appId) => {
    const app = applications.find(a => a.id === appId);
    if (app) {
      // ✅ NOUVEAU: Utiliser le bon prix selon le type d'installation COURANT
      // Si type='abonnement' -> prix_abonnement
      // Si type='acquisition' -> prix_acquisition
      const prixApplicable = formData.type === 'abonnement'
        ? (app.prix_abonnement || app.prix_acquisition || app.prix || 0)
        : (app.prix_acquisition || app.prix_abonnement || app.prix || 0);

      setFormData(prev => ({
        ...prev,
        application_installee: app.nom,
        montant: prixApplicable
      }));

      console.log(`✅ Application sélectionnée: ${app.nom}, Type: ${formData.type}, Prix: ${prixApplicable}`);
    }
  };

  const handleTypeChange = (type) => {
    // ✅ NOUVEAU: Quand on change le type, recalculer automatiquement le montant
    const appName = formData.application_installee;

    if (appName) {
      const app = applications.find(a => a.nom === appName);
      if (app) {
        // Utiliser le bon prix selon le nouveau type
        const prixApplicable = type === 'abonnement'
          ? (app.prix_abonnement || app.prix_acquisition || app.prix || 0)
          : (app.prix_acquisition || app.prix_abonnement || app.prix || 0);

        setFormData(prev => ({
          ...prev,
          type: type,
          montant: prixApplicable
        }));

        console.log(`✅ Type changé: ${type}, Montant recalculé: ${prixApplicable}`);
        return;
      }
    }

    // Si pas d'application sélectionnée, just changer le type
    handleChange('type', type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    // Validation
    const newErrors = {};

    if (!formData.client_id) {
      newErrors.client_id = 'Client requis';
    }
    if (!formData.application_installee) {
      newErrors.application_installee = 'Application requise';
    }
    if (!formData.montant) {
      newErrors.montant = 'Montant requis';
    }
    if (!formData.montant_abonnement) {
      newErrors.montant_abonnement = 'Montant d\'abonnement requis';
    }
    if (!formData.date_installation) {
      newErrors.date_installation = 'Date requise';
    }
    if (!formData.type) {
      newErrors.type = 'Type requis';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);

      // Convertir la date au format correct (YYYY-MM-DD)
      const dateObj = new Date(formData.date_installation);
      const dateFormatted = dateObj.toISOString().split('T')[0];

      // Préparer les données à envoyer
      const dataToSubmit = {
        client_id: formData.client_id,
        application_installee: formData.application_installee,
        montant: parseFloat(formData.montant),
        montant_abonnement: parseFloat(formData.montant_abonnement),
        date_installation: dateFormatted,
        type: formData.type,
        statut: formData.statut
      };

      await onSubmit(dataToSubmit);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <SearchableSelect
        label="Client"
        value={formData.client_id}
        onChange={(e) => handleChange('client_id', e.target.value)}
        options={clients.map(c => ({
          value: c.id,
          label: c.raison_sociale,
          description: `${c.ville || ''} ${c.wilaya ? `(${c.wilaya})` : ''} - ${c.contact || ''}`.trim().replace(/^ - /, '')
        }))}
        placeholder="Rechercher un client..."
        error={errors.client_id}
        required
        disabled={isSubmitting}
      />

      <Select
        label="Application"
        value={selectedApplicationId}
        onChange={(e) => {
          setSelectedApplicationId(e.target.value);
          handleApplicationSelect(e.target.value);
        }}
        options={[
          { value: '', label: 'Sélectionner une application...' },
          ...applications.map(a => {
            const acq = a.prix_acquisition || a.prix;
            const abo = a.prix_abonnement || a.prix;
            return {
              value: a.id,
              label: `${a.nom} - ACQ: ${acq} DA / ABO: ${abo} DA`
            };
          })
        ]}
        disabled={isSubmitting}
      />

      <Input
        label="Application Installée"
        value={formData.application_installee}
        onChange={(e) => handleChange('application_installee', e.target.value)}
        placeholder="Nom de l'application"
        error={errors.application_installee}
        required
        disabled={isSubmitting}
      />

      <Input
        label="Montant (DA)"
        type="number"
        step="0.01"
        value={formData.montant}
        onChange={(e) => handleChange('montant', e.target.value)}
        placeholder="0.00"
        error={errors.montant}
        required
        disabled={isSubmitting}
      />

      <Input
        label="Montant d'Abonnement (DA)"
        type="number"
        step="0.01"
        value={formData.montant_abonnement}
        onChange={(e) => handleChange('montant_abonnement', e.target.value)}
        placeholder="0.00"
        error={errors.montant_abonnement}
        required
        disabled={isSubmitting}
      />

      <Input
        label="Date d'Installation"
        type="date"
        value={formData.date_installation}
        onChange={(e) => handleChange('date_installation', e.target.value)}
        error={errors.date_installation}
        required
        disabled={isSubmitting}
      />

      <Select
        label="Type"
        value={formData.type}
        onChange={(e) => handleTypeChange(e.target.value)}
        options={[
          { value: 'acquisition', label: 'Acquisition' },
          { value: 'abonnement', label: 'Abonnement' }
        ]}
        error={errors.type}
        required
        disabled={isSubmitting}
      />

      <Select
        label="Statut"
        value={formData.statut}
        onChange={(e) => handleChange('statut', e.target.value)}
        options={[
          { value: 'en_cours', label: 'En Cours' },
          { value: 'terminee', label: 'Terminée' }
        ]}
        required
        disabled={isSubmitting}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'En cours...' : (installation ? 'Modifier' : 'Créer')}
        </Button>
      </div>
    </form>
  );
};

export default InstallationForm;