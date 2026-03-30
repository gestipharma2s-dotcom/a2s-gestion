import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { Plus, X } from 'lucide-react';
import { applicationService } from '../../services/applicationService';
import { userService } from '../../services/userService';
import InstallationForm from '../installations/InstallationForm';

const ProspectActionForm = ({ prospect, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    type_action: 'appel',
    date_action: new Date().toISOString().split('T')[0],
    date_debut: '',
    date_fin: '',
    description: '',
    details: '',
    conversion: 'non',
    application: '',
    chef_mission: ''
  });
  const [nouveauLogiciel, setNouveauLogiciel] = useState('');
  const [logicielsStockes, setLogicielsStockes] = useState([]); // Liste des logiciels créés

  const [logicielsSelectionnes, setLogicielsSelectionnes] = useState([]); // Logiciels sélectionnés pour ce prospect
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les applications et utilisateurs au montage du composant
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingApplications(true);
      const apps = await applicationService.getAll();
      setApplications(apps);

      setLoadingUsers(true);
      const usersData = await userService.getAll();
      setUsers(usersData);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoadingApplications(false);
      setLoadingUsers(false);
    }
  };

  const typeActions = [
    { value: 'appel', label: '📞 Appel Téléphonique' },
    { value: 'email', label: '📧 Email' },
    { value: 'suivi', label: '🔄 Suivi / Relance' },
    { value: 'rdv', label: '📅 Rendez-vous' },
    { value: 'visite', label: '🏢 Visite Bureau' },
    { value: 'demo', label: '💻 Démonstration' },
    { value: 'negociation', label: '⚖️ Négociation' },
    { value: 'offre_envoyee', label: '📄 Offre Envoyée' },
    { value: 'contrat_signe', label: '✍️ Contrat Signé' },
    { value: 'installation', label: '⚙️ Installation' }
  ];

  // Ajouter un nouveau logiciel
  const handleAjouterLogiciel = () => {
    const nouveau = nouveauLogiciel.trim();
    if (nouveau) {
      if (!logicielsSelectionnes.includes(nouveau)) {
        setLogicielsSelectionnes([...logicielsSelectionnes, nouveau]);
      }
      if (!logicielsStockes.includes(nouveau)) {
        setLogicielsStockes([...logicielsStockes, nouveau]);
      }
      setNouveauLogiciel('');
    }
  };

  // Retirer un logiciel sélectionné
  const handleRetirerLogiciel = (index) => {
    setLogicielsSelectionnes(logicielsSelectionnes.filter((_, i) => i !== index));
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

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
      // Ajouter les logiciels sélectionnés au formData
      const dataToSubmit = {
        ...formData,
        anciens_logiciels: logicielsSelectionnes
      };
      await onSubmit(dataToSubmit);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Si type_action === 'installation', utiliser le formulaire complet d'installation
  if (formData.type_action === 'installation') {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-2">
          <Select
            label="Type d'Action"
            value={formData.type_action}
            onChange={(e) => handleChange('type_action', e.target.value)}
            options={typeActions}
            error={errors.type_action}
            required
            disabled={isSubmitting}
          />
          <p className="mt-2 text-xs text-blue-600 italic">
            💡 En choisissant "Installation", vous allez utiliser le formulaire complet qui générera également une nouvelle installation dans la liste globale.
          </p>
        </div>

        <InstallationForm
          installation={{ client_id: prospect.id }}
          onSubmit={(installationData) => {
            // Fusionner avec le type d'action pour le parent
            return onSubmit({
              ...installationData,
              type_action: 'installation',
              // Champs requis pour l'historique mapping
              description: installationData.resume_action,
              details: installationData.details_action,
              date_action: installationData.date_installation
            });
          }}
          onCancel={onCancel}
        />
      </div>
    );
  }

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