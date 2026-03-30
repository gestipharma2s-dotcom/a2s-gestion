import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import SearchableSelect from '../common/SearchableSelect';
import Button from '../common/Button';
import { prospectService } from '../../services/prospectService';
import { applicationService } from '../../services/applicationService';
import { userService } from '../../services/userService';
import { Plus, X } from 'lucide-react';

const InstallationForm = ({ installation, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    // Champs installation existants
    client_id: '',
    application_installee: '',
    montant: '',
    montant_abonnement: '',
    date_installation: '',      // = date_debut de la mission
    date_fin_installation: '',  // = date_fin de la mission
    type: 'acquisition',
    statut: 'en_cours',
    // Champs mission (nouveaux)
    chef_mission_id: '',
    accompagnateurs_ids: [],
    anciens_logiciels: [],
    conversion_bdd: 'non',
    resume_action: '',
    details_action: '',
    budget_mission: '',      // Budget alloué à la mission
    // Flag pour créer ou non la mission
    creer_mission: true
  });
  const [selectedApplicationId, setSelectedApplicationId] = useState('');
  const [errors, setErrors] = useState({});
  const [clients, setClients] = useState([]);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Pour "Anciens Logiciels" saisie libre
  const [logicielInput, setLogicielInput] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (installation) {
      setFormData({
        client_id: installation.client_id || '',
        application_installee: installation.application_installee || '',
        montant: installation.montant || '',
        montant_abonnement: installation.montant_abonnement || '',
        date_installation: installation.date_installation?.split('T')[0] || '',
        date_fin_installation: installation.date_fin_installation?.split('T')[0] || '',
        type: installation.type || 'acquisition',
        statut: installation.statut || 'en_cours',
        chef_mission_id: installation.chef_mission_id || '',
        accompagnateurs_ids: installation.accompagnateurs_ids || [],
        anciens_logiciels: installation.anciens_logiciels || [],
        conversion_bdd: installation.conversion_bdd || 'non',
        resume_action: installation.resume_action || '',
        details_action: installation.details_action || '',
        budget_mission: installation.budget_mission || '',
        creer_mission: !installation.id
      });
      if (installation.application_installee && applications.length > 0) {
        const app = applications.find(a => a.nom === installation.application_installee);
        if (app) setSelectedApplicationId(app.id);
      }
    }
  }, [installation]);

  const loadData = async () => {
    try {
      const [clientsData, appsData, usersData] = await Promise.all([
        prospectService.getAll(),
        applicationService.getAll(),
        userService.getAll()
      ]);
      setClients(clientsData);
      setApplications(appsData);
      // Filtrer les utilisateurs actifs uniquement
      setUsers(usersData.filter(u => u.statut !== 'inactif'));
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleApplicationSelect = (appId) => {
    const app = applications.find(a => a.id === appId);
    if (app) {
      const prixApplicable = formData.type === 'abonnement'
        ? (app.prix_abonnement || app.prix_acquisition || app.prix || 0)
        : (app.prix_acquisition || app.prix_abonnement || app.prix || 0);
      setFormData(prev => ({
        ...prev,
        application_installee: app.nom,
        montant: prixApplicable
      }));
    }
  };

  const handleTypeChange = (type) => {
    const appName = formData.application_installee;
    if (appName) {
      const app = applications.find(a => a.nom === appName);
      if (app) {
        const prixApplicable = type === 'abonnement'
          ? (app.prix_abonnement || app.prix_acquisition || app.prix || 0)
          : (app.prix_acquisition || app.prix_abonnement || app.prix || 0);
        setFormData(prev => ({ ...prev, type, montant: prixApplicable }));
        return;
      }
    }
    handleChange('type', type);
  };

  const toggleAccompagnateur = (userId) => {
    setFormData(prev => {
      const ids = prev.accompagnateurs_ids.includes(userId)
        ? prev.accompagnateurs_ids.filter(id => id !== userId)
        : [...prev.accompagnateurs_ids, userId];
      return { ...prev, accompagnateurs_ids: ids };
    });
  };

  const addLogiciel = () => {
    const val = logicielInput.trim();
    if (val && !formData.anciens_logiciels.includes(val)) {
      setFormData(prev => ({ ...prev, anciens_logiciels: [...prev.anciens_logiciels, val] }));
    }
    setLogicielInput('');
  };

  const removeLogiciel = (logiciel) => {
    setFormData(prev => ({
      ...prev,
      anciens_logiciels: prev.anciens_logiciels.filter(l => l !== logiciel)
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.client_id) newErrors.client_id = 'Client requis';
    if (!formData.application_installee) newErrors.application_installee = 'Application requise';
    if (!formData.montant) newErrors.montant = 'Montant requis';
    if (!formData.montant_abonnement) newErrors.montant_abonnement = "Montant d'abonnement requis";
    if (!formData.date_installation) newErrors.date_installation = 'Date de début requise';
    if (!formData.type) newErrors.type = 'Type requis';
    if (formData.creer_mission) {
      if (!formData.chef_mission_id) newErrors.chef_mission_id = 'Chef de mission requis';
      if (!formData.date_fin_installation) newErrors.date_fin_installation = 'Date de fin requise';
      if (!formData.resume_action) newErrors.resume_action = 'Résumé requis';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);

      const dataToSubmit = {
        // Données installation
        client_id: formData.client_id,
        application_installee: formData.application_installee,
        montant: parseFloat(formData.montant),
        montant_abonnement: parseFloat(formData.montant_abonnement),
        date_installation: formData.date_installation,
        type: formData.type,
        statut: formData.statut,
        // Données mission (transmises au parent pour créer la mission automatiquement)
        chef_mission_id: formData.chef_mission_id,
        accompagnateurs_ids: formData.accompagnateurs_ids,
        date_fin_installation: formData.date_fin_installation,
        anciens_logiciels: formData.anciens_logiciels,
        conversion_bdd: formData.conversion_bdd,
        resume_action: formData.resume_action,
        details_action: formData.details_action,
        budget_mission: formData.budget_mission,
        creer_mission: formData.creer_mission
      };

      await onSubmit(dataToSubmit);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditMode = !!installation?.id;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ───────── SECTION INSTALLATION ───────── */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-3">📦 Informations Installation</h3>
        <div className="space-y-3">
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
                return { value: a.id, label: `${a.nom} - ACQ: ${acq} DA / ABO: ${abo} DA` };
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

          <div className="grid grid-cols-2 gap-3">
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
          </div>

          <div className="grid grid-cols-2 gap-3">
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
          </div>
        </div>
      </div>

      {/* ───────── SECTION MISSION ───────── */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider">🎯 Ordre de Mission (Auto-généré)</h3>
          {!isEditMode && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.creer_mission}
                onChange={(e) => handleChange('creer_mission', e.target.checked)}
                className="w-4 h-4 accent-amber-600"
              />
              <span className="text-xs font-medium text-amber-700">Créer la mission</span>
            </label>
          )}
        </div>

        {(formData.creer_mission || isEditMode) && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Date de Début (= Date d'Installation)"
                type="date"
                value={formData.date_installation}
                onChange={(e) => handleChange('date_installation', e.target.value)}
                error={errors.date_installation}
                required
                disabled={isSubmitting}
              />
              <Input
                label="Date de Fin d'Installation"
                type="date"
                value={formData.date_fin_installation}
                onChange={(e) => handleChange('date_fin_installation', e.target.value)}
                error={errors.date_fin_installation}
                required={formData.creer_mission}
                disabled={isSubmitting}
              />
            </div>

            <Select
              label="Chef de Mission"
              value={formData.chef_mission_id}
              onChange={(e) => handleChange('chef_mission_id', e.target.value)}
              options={[
                { value: '', label: 'Sélectionner le chef de mission...' },
                ...users.map(u => ({ value: u.id, label: u.nom || u.email }))
              ]}
              error={errors.chef_mission_id}
              required={formData.creer_mission}
              disabled={isSubmitting}
            />

            <Input
              label="Budget Mission (DA)"
              type="number"
              step="100"
              value={formData.budget_mission}
              onChange={(e) => handleChange('budget_mission', e.target.value)}
              placeholder="0.00"
              disabled={isSubmitting}
            />

            {/* Accompagnateurs (multi-select) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accompagnateurs</label>
              <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-lg bg-white max-h-36 overflow-y-auto">
                {users
                  .filter(u => u.id !== formData.chef_mission_id)
                  .map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggleAccompagnateur(u.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${formData.accompagnateurs_ids.includes(u.id)
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {u.nom || u.email}
                    </button>
                  ))}
              </div>
            </div>

            {/* Anciens Logiciels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Anciens Logiciels Utilisés</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={logicielInput}
                  onChange={(e) => setLogicielInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLogiciel())}
                  placeholder="Saisir ou sélectionner un logiciel..."
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-300 focus:border-amber-400 outline-none"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={addLogiciel}
                  className="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-lg transition-colors"
                  disabled={isSubmitting}
                >
                  <Plus size={18} />
                </button>
              </div>
              {formData.anciens_logiciels.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.anciens_logiciels.map((l, i) => (
                    <span key={i} className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium">
                      {l}
                      <button type="button" onClick={() => removeLogiciel(l)} className="hover:text-red-600">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <Select
              label="Conversion BDD"
              value={formData.conversion_bdd}
              onChange={(e) => handleChange('conversion_bdd', e.target.value)}
              options={[
                { value: 'non', label: 'Non' },
                { value: 'oui', label: 'Oui' }
              ]}
              disabled={isSubmitting}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Résumé de l'Action <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.resume_action}
                onChange={(e) => handleChange('resume_action', e.target.value)}
                placeholder="Décrivez brièvement l'action effectuée..."
                rows={2}
                className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-300 outline-none resize-none ${errors.resume_action ? 'border-red-400' : 'border-gray-200'
                  }`}
                disabled={isSubmitting}
              />
              {errors.resume_action && <p className="text-red-500 text-xs mt-1">{errors.resume_action}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Détails (Optionnel)</label>
              <textarea
                value={formData.details_action}
                onChange={(e) => handleChange('details_action', e.target.value)}
                placeholder="Ajoutez des détails supplémentaires si nécessaire..."
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-300 outline-none resize-none"
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}

        {!formData.creer_mission && !isEditMode && (
          <p className="text-xs text-amber-600 italic">
            ⚠️ Aucune mission ne sera créée automatiquement. Vous pourrez en créer une manuellement depuis la page Missions.
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'En cours...' : (isEditMode ? 'Modifier' : 'Créer + Générer Mission')}
        </Button>
      </div>
    </form>
  );
};

export default InstallationForm;