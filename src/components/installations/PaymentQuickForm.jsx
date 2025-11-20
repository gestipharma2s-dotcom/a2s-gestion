import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { formatMontant } from '../../utils/helpers';
import { paiementService } from '../../services/paiementService';

const PaymentQuickForm = ({ installation, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    montant: '',
    mode_paiement: 'virement',
    type: 'acquisition',
    date_paiement: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});
  const [resteAPayer, setResteAPayer] = useState(0);
  const [totalPaye, setTotalPaye] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateReste();
  }, [installation?.id]); // ← Forcer recalcul si l'ID change

  // Pré-remplir et figer le type depuis l'installation si disponible
  useEffect(() => {
    if (installation && installation.type) {
      setFormData(prev => ({ ...prev, type: installation.type }));
    }
  }, [installation?.id, installation?.type]);

  const calculateReste = async () => {
    try {
      setLoading(true);
      
      // Sécurité: vérifier que l'installation existe
      if (!installation || !installation.id) {
        setResteAPayer(0);
        setTotalPaye(0);
        setLoading(false);
        return;
      }
      
      console.log('Installation sélectionnée:', installation.id);
      
      // Récupérer les paiements du client
      const paiements = await paiementService.getByClient(installation.client_id);
      
      console.log('Tous les paiements du client:', paiements);
      
      // Filtrer STRICTEMENT par installation_id
      const paiementsInstallation = paiements.filter(p => {
        console.log(`Comparaison: ${p.installation_id} === ${installation.id} => ${p.installation_id === installation.id}`);
        return p.installation_id === installation.id;
      });
      
      console.log('Paiements de CETTE installation:', paiementsInstallation);
      
      const totalPayeInstallation = paiementsInstallation.reduce((sum, p) => sum + (p.montant || 0), 0);
      
      console.log('Total payé:', totalPayeInstallation, 'Montant installation:', installation.montant);
      
      setTotalPaye(totalPayeInstallation);
      
      // Calculer le reste pour CETTE installation uniquement
      const reste = Math.max(0, installation.montant - totalPayeInstallation);
      setResteAPayer(reste);
      
      console.log('Reste à payer:', reste);
      
      // Pré-remplir le montant avec le reste à payer
      if (reste > 0) {
        setFormData(prev => ({
          ...prev,
          montant: reste.toString()
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          montant: ''
        }));
      }
    } catch (error) {
      console.error('Erreur calcul reste:', error);
      setResteAPayer(installation?.montant || 0);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    if (!formData.montant || parseFloat(formData.montant) <= 0) {
      newErrors.montant = 'Montant requis et > 0';
    }
    
    // Vérifier que le montant ne dépasse pas le reste à payer
    if (parseFloat(formData.montant) > resteAPayer) {
      newErrors.montant = `Le montant ne peut pas dépasser le reste à payer (${formatMontant(resteAPayer)})`;
    }
    
    if (!formData.mode_paiement) {
      newErrors.mode_paiement = 'Mode de paiement requis';
    }
    if (!formData.date_paiement) {
      newErrors.date_paiement = 'Date requise';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dataToSubmit = {
      montant: parseFloat(formData.montant),
      mode_paiement: formData.mode_paiement,
      type: formData.type,
      date_paiement: formData.date_paiement
    };

    onSubmit(dataToSubmit);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Infos Installation */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
        <div>
          <p className="text-xs text-blue-600 uppercase font-semibold">Installation</p>
          <p className="text-lg font-bold text-gray-800">{installation.application_installee}</p>
        </div>
        <div>
          <p className="text-xs text-blue-600 uppercase font-semibold">Client</p>
          <p className="text-gray-800">{installation.client?.raison_sociale}</p>
        </div>
        <div className="border-t border-blue-200 pt-3 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-blue-600 uppercase font-semibold">Montant Total</p>
            <p className="text-lg font-bold text-primary">{formatMontant(installation.montant)}</p>
          </div>
          <div>
            <p className="text-xs text-blue-600 uppercase font-semibold">Déjà Payé</p>
            <p className="text-lg font-bold text-green-600">{formatMontant(totalPaye)}</p>
          </div>
          <div>
            <p className="text-xs text-blue-600 uppercase font-semibold">Reste à Payer</p>
            <p className={`text-lg font-bold ${resteAPayer > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatMontant(resteAPayer)}
            </p>
          </div>
        </div>
      </div>

      {/* Message si tout est payé */}
      {resteAPayer === 0 && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-700 font-semibold">
            ✓ Cette installation est entièrement payée !
          </p>
        </div>
      )}

      {/* Montant Paiement */}
      <Input
        label="Montant à Payer (DA)"
        type="number"
        step="0.01"
        value={formData.montant}
        onChange={(e) => handleChange('montant', e.target.value)}
        placeholder="0.00"
        error={errors.montant}
        required
      />

      {/* Mode Paiement */}
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

      {/* Type - Figé depuis l'installation */}
      <Select
        label="Type de Paiement"
        value={formData.type}
        onChange={(e) => handleChange('type', e.target.value)}
        // Ce formulaire rapide est lié à une installation: figer le type
        disabled={true}
        options={[
          { value: 'acquisition', label: 'Acquisition' },
          { value: 'abonnement', label: 'Abonnement' }
        ]}
        error={errors.type}
        required
      />

      {/* Date Paiement */}
      <Input
        label="Date du Paiement"
        type="date"
        value={formData.date_paiement}
        onChange={(e) => handleChange('date_paiement', e.target.value)}
        error={errors.date_paiement}
        required
      />

      {/* Boutons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" disabled={resteAPayer === 0}>
          Enregistrer le Paiement
        </Button>
      </div>
    </form>
  );
};

export default PaymentQuickForm;