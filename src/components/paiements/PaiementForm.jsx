import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { prospectService } from '../../services/prospectService';
import { installationService } from '../../services/installationService';
import { validators } from '../../utils/validators';

const PaiementForm = ({ paiement, onSubmit, onCancel, isAbonnement = false, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    client_id: '',
    installation_id: '',
    type: 'acquisition',
    montant: '',
    mode_paiement: 'especes',
    date_paiement: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});
  const [clients, setClients] = useState([]);
  const [installations, setInstallations] = useState([]);
  const [abonnementMontant, setAbonnementMontant] = useState(0);

  useEffect(() => {
    loadClients();
    if (paiement) {
      setFormData({
        client_id: paiement.client_id || '',
        installation_id: paiement.installation_id || '',
        type: paiement.type || 'acquisition',
        montant: paiement.montant || '',
        mode_paiement: paiement.mode_paiement || 'especes',
        date_paiement: paiement.date_paiement?.split('T')[0] || ''
      });
      // Si c'est un paiement d'abonnement, récupérer le montant
      if (isAbonnement && paiement.abonnement_montant) {
        setAbonnementMontant(paiement.abonnement_montant);
      }
    }
  }, [paiement, isAbonnement]);

  const loadClients = async () => {
    try {
      const data = await prospectService.getAll();
      const activeClients = data.filter(p => p.statut === 'actif');
      setClients(activeClients);
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    }
  };

  const loadInstallations = async (clientId) => {
    try {
      const data = await installationService.getByClient(clientId);
      setInstallations(data);
    } catch (error) {
      console.error('Erreur chargement installations:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Charger les installations quand un client est sélectionné
    if (field === 'client_id' && value) {
      loadInstallations(value);
    }
    // Si une installation est choisie, pré-remplir et figer le type depuis l'installation
    if (field === 'installation_id' && value) {
      const inst = installations.find(i => String(i.id) === String(value));
      if (inst && inst.type) {
        setFormData(prev => ({ ...prev, type: inst.type }));
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let validationErrors = {};
    
    // Validation si c'est un paiement d'abonnement
    if (isAbonnement && abonnementMontant > 0) {
      const montantSaisi = parseFloat(formData.montant) || 0;
      if (montantSaisi > abonnementMontant) {
        validationErrors.montant = `Le montant du paiement ne peut pas dépasser ${abonnementMontant.toLocaleString('fr-DZ')} DA`;
      }
    }
    
    const validation = validators.validatePaiement(formData);
    if (!validation.isValid) {
      setErrors({ ...validation.errors, ...validationErrors });
      return;
    }
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Client"
        value={formData.client_id}
        onChange={(e) => handleChange('client_id', e.target.value)}
        disabled={isAbonnement}
        options={clients.map(c => ({ 
          value: c.id, 
          label: `${c.raison_sociale} (${c.contact})` 
        }))}
        error={errors.client_id}
        required
      />

      {installations.length > 0 && (
        <Select
          label="Installation (optionnel)"
          value={formData.installation_id}
          onChange={(e) => handleChange('installation_id', e.target.value)}
          disabled={isAbonnement}
          options={installations.map(i => ({ 
            value: i.id, 
            label: i.application_installee
          }))}
        />
      )}

      <Select
        label="Type de Paiement"
        value={formData.type}
        onChange={(e) => handleChange('type', e.target.value)}
        // Figer si une installation est sélectionnée OU si c'est un paiement d'abonnement
        disabled={!!formData.installation_id || isAbonnement}
        options={[
          { value: 'acquisition', label: 'Acquisition' },
          { value: 'abonnement', label: 'Abonnement' }
        ]}
        error={errors.type}
        required
      />

      {isAbonnement && abonnementMontant > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-blue-900">
            Montant de l'abonnement: <span className="text-lg text-blue-700">{abonnementMontant.toLocaleString('fr-DZ')} DA</span>
          </p>
          <p className="text-xs text-blue-600 mt-1">Le montant du paiement ne peut pas dépasser ce montant</p>
        </div>
      )}

      <Input
        label="Montant (DA)"
        type="number"
        value={formData.montant}
        onChange={(e) => handleChange('montant', e.target.value)}
        error={errors.montant}
        required
      />

      <Select
        label="Mode de Paiement"
        value={formData.mode_paiement}
        onChange={(e) => handleChange('mode_paiement', e.target.value)}
        options={[
          { value: 'especes', label: 'Espèces' },
          { value: 'virement', label: 'Virement' },
          { value: 'cheque', label: 'Chèque' },
          { value: 'autre', label: 'Autre' }
        ]}
        error={errors.mode_paiement}
        required
      />

      <Input
        label="Date de Paiement"
        type="date"
        value={formData.date_paiement}
        onChange={(e) => handleChange('date_paiement', e.target.value)}
        error={errors.date_paiement}
        required
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? '⏳ Enregistrement...' : (paiement ? 'Modifier' : 'Enregistrer')}
        </Button>
      </div>
    </form>
  );
};

export default PaiementForm;