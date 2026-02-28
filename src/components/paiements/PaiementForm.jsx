import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import SearchableSelect from '../common/SearchableSelect';
import Button from '../common/Button';
import { prospectService } from '../../services/prospectService';
import { installationService } from '../../services/installationService';
import { paiementService } from '../../services/paiementService';
import { validators } from '../../utils/validators';
import { formatMontant, getStatutPaiement, formatPriceDisplay } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const PaiementForm = ({ paiement, onSubmit, onCancel, isAbonnement = false, isSubmitting = false }) => {
  const { profile } = useAuth();
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
  const [abonnementResteAPayer, setAbonnementResteAPayer] = useState(0);
  const [montantInstallation, setMontantInstallation] = useState(0);
  const [restAPayer, setRestAPayer] = useState(0);
  const [paiementsExistants, setPaiementsExistants] = useState(0);
  const [montantInstallationCalcule, setMontantInstallationCalcule] = useState(false);

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

      // Si c'est un paiement d'abonnement, récupérer le montant et calculer le reste
      if (isAbonnement && paiement.abonnement_montant) {
        setAbonnementMontant(paiement.abonnement_montant);

        // ✅ Calculer le reste à payer pour l'abonnement
        const calculerResteAbonnement = async () => {
          try {
            if (paiement.installation_id) {
              const paiements = await paiementService.getByInstallation(paiement.installation_id);
              const totalPaye = paiements.reduce((sum, p) => sum + (p.montant || 0), 0);
              const reste = Math.max(0, paiement.abonnement_montant - totalPaye);
              setAbonnementResteAPayer(reste);
              console.log(`✅ Abonnement - Montant: ${paiement.abonnement_montant}, Payé: ${totalPaye}, Reste: ${reste}`);
            } else {
              setAbonnementResteAPayer(paiement.abonnement_montant);
            }
          } catch (error) {
            console.error('Erreur calcul reste abonnement:', error);
            setAbonnementResteAPayer(paiement.abonnement_montant);
          }
        };
        calculerResteAbonnement();
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

    // Si une installation est choisie, pré-remplir le type et calculer le reste à payer
    if (field === 'installation_id' && value) {
      const inst = installations.find(i => String(i.id) === String(value));
      if (inst) {
        setFormData(prev => ({
          ...prev,
          type: inst.type || 'acquisition'
        }));

        // ✅ Récupérer les paiements existants pour cette installation
        const calculerRestAPayer = async () => {
          try {
            const paiements = await paiementService.getByInstallation(value);
            const totalPaye = paiements.reduce((sum, p) => sum + (p.montant || 0), 0);
            setPaiementsExistants(totalPaye);

            setMontantInstallation(inst.montant || 0);
            const reste = Math.max(0, (inst.montant || 0) - totalPaye);
            setRestAPayer(reste);
            setMontantInstallationCalcule(true);

            console.log(`✅ Installation: ${inst.application_installee}, Montant: ${inst.montant}, Payé: ${totalPaye}, Reste: ${reste}`);
          } catch (error) {
            console.error('Erreur calcul reste à payer:', error);
            // Fallback: calculer sans paiements
            setMontantInstallation(inst.montant || 0);
            setRestAPayer(inst.montant || 0);
            setMontantInstallationCalcule(true);
          }
        };
        calculerRestAPayer();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let validationErrors = {};

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
      <SearchableSelect
        label="Client"
        value={formData.client_id}
        onChange={(e) => handleChange('client_id', e.target.value)}
        disabled={isAbonnement}
        options={clients.map(c => ({
          value: c.id,
          label: c.raison_sociale,
          description: `${c.ville || ''} ${c.wilaya ? `(${c.wilaya})` : ''} - ${c.contact || ''}`.trim().replace(/^ - /, '')
        }))}
        placeholder="Rechercher un client..."
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

      {/* ✅ NOUVEAU: Afficher le statut et le code de l'installation */}
      {formData.installation_id && !isAbonnement && (montantInstallation > 0 || montantInstallationCalcule) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-blue-600 uppercase font-semibold">Statut</p>
              <p className={`text-3xl font-bold ${getStatutPaiement(montantInstallation, montantInstallation - restAPayer).couleur}`}>
                {getStatutPaiement(montantInstallation, montantInstallation - restAPayer).code}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-600 uppercase font-semibold">Montant</p>
              <p className="text-lg font-bold text-gray-600">
                {profile?.role === 'admin' || profile?.role === 'super_admin' ? (
                  formatMontant(montantInstallation)
                ) : (
                  '🔐'
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-600 uppercase font-semibold">Pourcentage</p>
              <p className="text-lg font-bold text-blue-600">
                {((montantInstallation - restAPayer) / montantInstallation * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
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
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-blue-600 uppercase font-semibold">Statut</p>
              <p className={`text-3xl font-bold ${getStatutPaiement(abonnementMontant, abonnementMontant - abonnementResteAPayer).couleur}`}>
                {getStatutPaiement(abonnementMontant, abonnementMontant - abonnementResteAPayer).code}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-600 uppercase font-semibold">Montant</p>
              <p className="text-lg font-bold text-gray-600">
                {profile?.role === 'admin' || profile?.role === 'super_admin' ? (
                  formatMontant(abonnementMontant)
                ) : (
                  '🔐'
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-600 uppercase font-semibold">Pourcentage</p>
              <p className="text-lg font-bold text-blue-600">
                {((abonnementMontant - abonnementResteAPayer) / abonnementMontant * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ NOUVEAU: Champ Montant Versé (montant réel au lieu de codes 0, 1, 2) */}
      <Input
        label="Montant Versé (DA)"
        type="number"
        step="0.01"
        value={formData.montant}
        onChange={(e) => handleChange('montant', e.target.value)}
        placeholder="Entrer le montant versé"
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