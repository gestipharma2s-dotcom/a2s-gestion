import React, { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';

const ProspectActionForm = ({ prospect, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    type_action: 'appel',
    date_action: new Date().toISOString().split('T')[0],
    description: '',
    details: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const typeActions = [
    { value: 'appel', label: 'Appel Téléphonique' },
    { value: 'email', label: 'Email' },
    { value: 'rdv', label: 'Rendez-vous' },
    { value: 'demo', label: 'Démonstration' },
    { value: 'offre_envoyee', label: 'Offre Envoyée' },
    { value: 'suivi', label: 'Suivi' },
    { value: 'visite', label: 'Visite' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.type_action) {
      newErrors.type_action = 'Type d\'action requis';
    }
    if (!formData.date_action) {
      newErrors.date_action = 'Date requise';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description requise';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg mb-4">
        <p className="text-sm font-medium text-blue-900">
          Prospect : <span className="font-bold">{prospect.raison_sociale}</span>
        </p>
        <p className="text-sm text-blue-700">{prospect.contact}</p>
      </div>

      <Select
        label="Type d'Action"
        value={formData.type_action}
        onChange={(e) => handleChange('type_action', e.target.value)}
        options={typeActions}
        error={errors.type_action}
        required
        disabled={isSubmitting}
      />

      <Input
        label="Date de l'Action"
        type="date"
        value={formData.date_action}
        onChange={(e) => handleChange('date_action', e.target.value)}
        error={errors.date_action}
        required
        disabled={isSubmitting}
      />

      <Input
        label="Résumé de l'Action"
        type="textarea"
        rows="3"
        value={formData.description}
        onChange={(e) => handleChange('description', e.target.value)}
        placeholder="Décrivez brièvement l'action effectuée..."
        error={errors.description}
        required
        disabled={isSubmitting}
      />

      <Input
        label="Détails (Optionnel)"
        type="textarea"
        rows="4"
        value={formData.details}
        onChange={(e) => handleChange('details', e.target.value)}
        placeholder="Ajoutez des détails supplémentaires si nécessaire..."
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
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer l\'Action'}
        </Button>
      </div>
    </form>
  );
};

export default ProspectActionForm;