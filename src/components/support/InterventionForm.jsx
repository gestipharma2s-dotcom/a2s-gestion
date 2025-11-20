import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { prospectService } from '../../services/prospectService';
import { abonnementService } from '../../services/abonnementService';
import { useAuth } from '../../context/AuthContext';
import { validators } from '../../utils/validators';

const InterventionForm = ({ intervention, onSubmit, onCancel }) => {
  const { user, profile } = useAuth(); // Récupérer l'utilisateur connecté
  
  const [formData, setFormData] = useState({
    client_id: '',
    priorite: 'normale',
    mode_intervention: 'sur_site',
    type_intervention: 'accompagnement',
    statut: 'en_cours',
    date_intervention: new Date().toISOString().split('T')[0],
    duree: '60',
    resume_probleme: '',
    action_entreprise: '',
    commentaires: ''
  });
  const [errors, setErrors] = useState({});
  const [clients, setClients] = useState([]);
  const [abonnementInfo, setAbonnementInfo] = useState(null);
  const [selectedClientName, setSelectedClientName] = useState('');

  // Valid intervention types
  const validTypes = [
    'accompagnement', 'adaptation', 'assistance', 'blocage', 'correction',
    'fonctionnalite', 'erreur', 'formation', 'integration', 'mise_a_jour',
    'parametrage', 'impression', 'reseau', 'question', 'suivi'
  ];

  const normalizeType = (type) => {
    if (!type) return 'accompagnement';
    const normalized = type.toLowerCase().replace(/\s+/g, '_');
    return validTypes.includes(normalized) ? normalized : 'accompagnement';
  };

  // ✅ Charger les infos d'abonnement du client
  const loadAbonnementInfo = async (clientId) => {
    if (!clientId) {
      setAbonnementInfo(null);
      return;
    }

    try {
      // Récupérer tous les abonnements
      const allAbonnements = await abonnementService.getAll();
      
      // Chercher les abonnements du client
      // Les abonnements sont liés via installation.client_id
      const clientAbonnements = allAbonnements.filter(abo => 
        abo.installation?.client_id === clientId || abo.client_id === clientId
      );
      
      if (clientAbonnements.length === 0) {
        // Pas d'abonnement pour ce client
        setAbonnementInfo({ noAbonnement: true });
        return;
      }

      // Prendre l'abonnement le plus récent/important
      const latestAbonnement = clientAbonnements[0];
      
      // Vérifier l'état de l'abonnement
      const dateExpiration = new Date(latestAbonnement.date_fin);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateExpiration.setHours(0, 0, 0, 0);
      
      const daysLeft = Math.floor((dateExpiration - today) / (1000 * 60 * 60 * 24));
      
      // Déterminer le statut
      let status = latestAbonnement.statut || 'actif';
      if (daysLeft < 0) status = 'expire';
      else if (daysLeft <= 30) status = 'en_alerte';
      else status = 'actif';
      
      setAbonnementInfo({
        ...latestAbonnement,
        daysLeft,
        statut: status,
        isExpired: status === 'expire',
        isExpiring: status === 'en_alerte',
        application: latestAbonnement.application || 'Non spécifiée',
        type: latestAbonnement.type || 'standard'
      });
    } catch (error) {
      console.error('Erreur chargement abonnement:', error);
      setAbonnementInfo({ error: true, message: error.message });
    }
  };

  useEffect(() => {
    loadClients();
    if (intervention) {
      setFormData({
        client_id: intervention.client_id || '',
        priorite: intervention.priorite || 'normale',
        mode_intervention: intervention.mode_intervention || 'sur_site',
        type_intervention: normalizeType(intervention.type_intervention),
        statut: intervention.statut || 'en_cours',
        date_intervention: intervention.date_intervention?.split('T')[0] || '',
        duree: intervention.duree || '60',
        resume_probleme: intervention.resume_probleme || '',
        action_entreprise: intervention.action_entreprise || '',
        commentaires: intervention.commentaires || ''
      });
    }
  }, [intervention]);

  const loadClients = async () => {
    try {
      const data = await prospectService.getAll();
      const activeClients = data.filter(p => p.statut === 'actif');
      setClients(activeClients);
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // ✅ Charger les infos d'abonnement si le client change
    if (field === 'client_id') {
      loadAbonnementInfo(value);
      const selectedClient = clients.find(c => c.id === value);
      setSelectedClientName(selectedClient?.raison_sociale || '');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Ajouter le technicien_id (utilisateur connecté) et normaliser le type
    const dataToSubmit = {
      ...formData,
      technicien_id: user.id, // Utilisateur connecté
      type_intervention: normalizeType(formData.type_intervention) // Normaliser le type
    };
    
    const validation = validators.validateIntervention(dataToSubmit);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Afficher l'utilisateur connecté */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Technicien:</span> {profile?.nom || 'Utilisateur'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Client"
          value={formData.client_id}
          onChange={(e) => handleChange('client_id', e.target.value)}
          options={clients.map(c => ({ 
            value: c.id, 
            label: `${c.raison_sociale} (${c.contact})` 
          }))}
          error={errors.client_id}
          required
        />

        <Select
          label="Priorité"
          value={formData.priorite}
          onChange={(e) => handleChange('priorite', e.target.value)}
          options={[
            { value: 'normale', label: 'Normale' },
            { value: 'haute', label: 'Haute' }
          ]}
          required
        />
      </div>

      {/* ✅ AFFICHAGE DE L'ÉTAT DE L'ABONNEMENT */}
      {abonnementInfo && (
        <div className={`rounded-lg p-4 flex items-start gap-3 ${
          abonnementInfo.noAbonnement ? 'bg-yellow-50 border border-yellow-200' :
          abonnementInfo.error ? 'bg-red-50 border border-red-200' :
          abonnementInfo.isExpired ? 'bg-red-50 border border-red-200' :
          abonnementInfo.isExpiring ? 'bg-orange-50 border border-orange-200' :
          'bg-green-50 border border-green-200'
        }`}>
          <div className="flex-shrink-0 mt-0.5">
            {abonnementInfo.noAbonnement ? (
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            ) : abonnementInfo.error ? (
              <AlertCircle className="w-5 h-5 text-red-600" />
            ) : abonnementInfo.isExpired ? (
              <AlertCircle className="w-5 h-5 text-red-600" />
            ) : abonnementInfo.isExpiring ? (
              <Clock className="w-5 h-5 text-orange-600" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
          </div>
          <div className="flex-1">
            {abonnementInfo.noAbonnement ? (
              <div>
                <p className="font-semibold text-yellow-800">⚠️ Pas d'abonnement actif</p>
                <p className="text-sm text-yellow-700">{selectedClientName} - Aucun abonnement trouvé</p>
              </div>
            ) : abonnementInfo.error ? (
              <div>
                <p className="font-semibold text-red-800">❌ Erreur</p>
                <p className="text-sm text-red-700">Impossible de charger les infos d'abonnement</p>
              </div>
            ) : abonnementInfo.isExpired ? (
              <div>
                <p className="font-semibold text-red-800">🔴 ABONNEMENT EXPIRÉ</p>
                <p className="text-sm text-red-700">
                  Application: {abonnementInfo.application}
                </p>
                <p className="text-sm text-red-700">
                  Expiré depuis le {new Date(abonnementInfo.date_fin).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-xs text-red-600 mt-1">⚠️ URGENT: Contacter le client pour renouvellement</p>
              </div>
            ) : abonnementInfo.isExpiring ? (
              <div>
                <p className="font-semibold text-orange-800">🟡 ABONNEMENT EXPIRE BIENTÔT</p>
                <p className="text-sm text-orange-700">
                  Application: {abonnementInfo.application}
                </p>
                <p className="text-sm text-orange-700">
                  Expire dans {abonnementInfo.daysLeft} jour{abonnementInfo.daysLeft > 1 ? 's' : ''} 
                  ({new Date(abonnementInfo.date_fin).toLocaleDateString('fr-FR')})
                </p>
                <p className="text-xs text-orange-600 mt-1">⚠️ À renouveler rapidement</p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-green-800">✅ ABONNEMENT ACTIF</p>
                <p className="text-sm text-green-700">
                  Application: {abonnementInfo.application}
                </p>
                <p className="text-sm text-green-700">
                  Valide jusqu'au {new Date(abonnementInfo.date_fin).toLocaleDateString('fr-FR')}
                  ({abonnementInfo.daysLeft} jours restants)
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Mode d'Intervention"
          value={formData.mode_intervention}
          onChange={(e) => handleChange('mode_intervention', e.target.value)}
          options={[
            { value: 'sur_site', label: 'Sur Site' },
            { value: 'a_distance', label: 'À Distance' }
          ]}
          error={errors.mode_intervention}
          required
        />

        <Select
          label="Type d'Intervention"
          value={formData.type_intervention}
          onChange={(e) => handleChange('type_intervention', e.target.value)}
          options={[
            { value: 'accompagnement', label: 'Accompagnement utilisateur (prise en main)' },
            { value: 'adaptation', label: 'Adaptation d\'un état / rapport / modèle d\'impression' },
            { value: 'assistance', label: 'Assistance sur une opération exceptionnelle' },
            { value: 'blocage', label: 'Blocage d\'accès / authentification' },
            { value: 'correction', label: 'Correction de bug / anomalie' },
            { value: 'fonctionnalite', label: 'Demande de nouvelle fonctionnalité' },
            { value: 'erreur', label: 'Erreur système (plantage, message d\'erreur critique)' },
            { value: 'formation', label: 'Formation' },
            { value: 'integration', label: 'Intégration avec un autre outil ou API' },
            { value: 'mise_a_jour', label: 'Mise à jour' },
            { value: 'parametrage', label: 'Paramétrage' },
            { value: 'impression', label: 'Problème d\'impression ou de génération de documents' },
            { value: 'reseau', label: 'Problème réseau ou de connection (accès distant, VPN)' },
            { value: 'question', label: 'Réponse à une question métier' },
            { value: 'suivi', label: 'Suivi après une mise à jour majeure' }
          ]}
          error={errors.type_intervention}
          required
        />

        <Input
          label="Date d'Intervention"
          type="date"
          value={formData.date_intervention}
          onChange={(e) => handleChange('date_intervention', e.target.value)}
          error={errors.date_intervention}
          required
        />

        <Input
          label="Durée (minutes)"
          type="number"
          value={formData.duree}
          onChange={(e) => handleChange('duree', e.target.value)}
          error={errors.duree}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Résumé du Problème <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.resume_probleme}
          onChange={(e) => handleChange('resume_probleme', e.target.value)}
          rows="4"
          className="input-field"
          placeholder="Décrivez le problème rencontré..."
        />
        {errors.resume_probleme && (
          <p className="mt-1 text-sm text-red-600">{errors.resume_probleme}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Action Entreprise
        </label>
        <textarea
          value={formData.action_entreprise}
          onChange={(e) => handleChange('action_entreprise', e.target.value)}
          rows="3"
          className="input-field"
          placeholder="Action entreprise pour résoudre le problème..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Commentaires
        </label>
        <textarea
          value={formData.commentaires}
          onChange={(e) => handleChange('commentaires', e.target.value)}
          rows="3"
          className="input-field"
          placeholder="Commentaires additionnels..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" variant="primary">
          {intervention ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};

export default InterventionForm;