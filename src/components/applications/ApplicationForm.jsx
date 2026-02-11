import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { validators } from '../../utils/validators';

const ApplicationForm = ({ application, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix_acquisition: '',
    prix_abonnement: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (application) {
      setFormData({
        nom: application.nom || '',
        description: application.description || '',
        prix_acquisition: application.prix_acquisition || application.prix || '',
        prix_abonnement: application.prix_abonnement || application.prix || ''
      });
    }
  }, [application]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const validation = validators.validateApplication(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nom de l'Application"
        value={formData.nom}
        onChange={(e) => handleChange('nom', e.target.value)}
        error={errors.nom}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows="4"
          className="input-field"
          placeholder="Description de l'application..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Prix Acquisition (DA)"
          type="number"
          value={formData.prix_acquisition}
          onChange={(e) => handleChange('prix_acquisition', e.target.value)}
          error={errors.prix_acquisition}
          required
        />

        <Input
          label="Prix Abonnement (DA)"
          type="number"
          value={formData.prix_abonnement}
          onChange={(e) => handleChange('prix_abonnement', e.target.value)}
          error={errors.prix_abonnement}
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" variant="primary">
          {application ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};

export default ApplicationForm;