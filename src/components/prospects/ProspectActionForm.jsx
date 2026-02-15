import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { Plus, X } from 'lucide-react';
import { applicationService } from '../../services/applicationService';
import { userService } from '../../services/userService';

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
    e.preventDefault();

    const newErrors = {};

    if (!formData.type_action) {
      newErrors.type_action = 'Type d\'action requis';
    }

    // Validation conditionnelle selon le type
    if (formData.type_action === 'installation') {
      if (!formData.date_debut) {
        newErrors.date_debut = 'Date de début requise';
      }
      if (!formData.date_fin) {
        newErrors.date_fin = 'Date de fin requise';
      }
    } else {
      if (!formData.date_action) {
        newErrors.date_action = 'Date requise';
      }
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

      {/* Champs de date conditionnels selon le type d'action */}
      {formData.type_action === 'installation' ? (
        <div className="space-y-4">
          {/* Application - Uniquement pour Installation */}
          <Select
            label="Application"
            value={formData.application}
            onChange={(e) => handleChange('application', e.target.value)}
            options={[
              { value: '', label: '-- Sélectionner une application --' },
              ...applications.map(app => ({ value: app.nom, label: app.nom }))
            ]}
            disabled={isSubmitting || loadingApplications}
            required
          />

          {/* Chef de Mission - Uniquement pour Installation */}
          <Select
            label="Chef de Mission"
            value={formData.chef_mission}
            onChange={(e) => handleChange('chef_mission', e.target.value)}
            options={[
              { value: '', label: '-- Sélectionner un chef de mission --' },
              ...users.map(u => ({ value: u.id, label: u.nom }))
            ]}
            disabled={isSubmitting || loadingUsers}
            required
          />

          <Input
            label="Date de Début d'Installation"
            type="date"
            value={formData.date_debut}
            onChange={(e) => handleChange('date_debut', e.target.value)}
            error={errors.date_debut}
            required
            disabled={isSubmitting}
          />
          <Input
            label="Date de Fin d'Installation"
            type="date"
            value={formData.date_fin}
            onChange={(e) => handleChange('date_fin', e.target.value)}
            error={errors.date_fin}
            required
            disabled={isSubmitting}
          />


          {/* Anciens Logiciels - Uniquement pour Installation */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Anciens Logiciels Utilisés
            </label>

            {/* Champ unifié : Saisie et Sélection combinées */}
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <Input
                  type="text"
                  list="suggested-softwares" // Lier à la datalist
                  value={nouveauLogiciel}
                  onChange={(e) => setNouveauLogiciel(e.target.value)}
                  placeholder="Saisir ou sélectionner un logiciel..."
                  disabled={isSubmitting}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAjouterLogiciel();
                    }
                  }}
                />
                <datalist id="suggested-softwares">
                  {[...new Set(logicielsStockes)].sort().map(log => (
                    <option key={log} value={log} />
                  ))}
                </datalist>
              </div>

              <button
                type="button"
                onClick={handleAjouterLogiciel}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center h-[42px]"
                disabled={isSubmitting || !nouveauLogiciel.trim()}
                title="Ajouter ce logiciel"
              >
                <Plus size={20} />
              </button>
            </div>



            {/* Affichage des logiciels sélectionnés */}
            {logicielsSelectionnes.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                {logicielsSelectionnes.map((logiciel, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    <span>{logiciel}</span>
                    <button
                      type="button"
                      onClick={() => handleRetirerLogiciel(index)}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                      disabled={isSubmitting}
                      title="Retirer ce logiciel"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>


          {/* Conversion BDD - Uniquement pour Installation */}
          <Select
            label="Conversion BDD"
            value={formData.conversion}
            onChange={(e) => handleChange('conversion', e.target.value)}
            options={[
              { value: 'non', label: 'Non' },
              { value: 'oui', label: 'Oui' }
            ]}
            disabled={isSubmitting}
          />
        </div>
      ) : (
        <Input
          label="Date de l'Action"
          type="date"
          value={formData.date_action}
          onChange={(e) => handleChange('date_action', e.target.value)}
          error={errors.date_action}
          required
          disabled={isSubmitting}
        />
      )}

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