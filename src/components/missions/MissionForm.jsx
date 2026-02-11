import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import Select from '../common/Select';
import { X, MapPin } from 'lucide-react';
import { getWilayaName } from '../../utils/wilayasConstants';

const MissionForm = ({ mission, initialData, onSave, onSubmit, onCancel, missionTypes = [], clients = [], users = [], isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    clientId: '',
    lieu: '',
    wilaya: '',
    dateDebut: '',
    dateFin: '',
    budgetInitial: '',
    type: '',
    priorite: 'moyenne',
    chefMissionId: '',
    accompagnateurIds: [],
    commentaireCreation: ''
  });

  const [selectedAccompagnateurs, setSelectedAccompagnateurs] = useState([]);

  const [errors, setErrors] = useState({});

  // Valeurs par défaut si pas fourni
  const defaultMissionTypes = ['Installation', 'Formation', 'Support', 'Maintenance', 'Audit'];
  const typesArray = missionTypes && missionTypes.length > 0 ? missionTypes : defaultMissionTypes;

  useEffect(() => {
    // Mode ÉDITION : on charge la mission existante
    if (mission) {
      setFormData({
        titre: mission.titre || '',
        description: mission.description || '',
        clientId: mission.client?.id || mission.prospect_id || mission.clientId || '',
        lieu: mission.lieu || '',
        wilaya: mission.wilaya || mission.lieu || '',
        dateDebut: mission.dateDebut || mission.date_debut || '',
        dateFin: mission.dateFin || mission.date_fin_prevue || '',
        budgetInitial: mission.budgetInitial || mission.budget_alloue || '',
        type: mission.type || mission.type_mission || '',
        priorite: mission.priorite || 'moyenne',
        chefMissionId: mission.chefMissionId || mission.chef_mission_id || '',
        accompagnateurIds: mission.accompagnateurIds || mission.accompagnateurs_ids || [],
        commentaireCreation: mission.commentaireCreation || ''
      });
      setSelectedAccompagnateurs(mission.accompagnateurIds || mission.accompagnateurs_ids || []);
    }
    // Mode CRÉATION avec PRÉ-REMPLISSAGE
    else if (initialData) {
      setFormData(prev => ({
        ...prev,
        titre: initialData.titre || '',
        description: initialData.description || '',
        clientId: initialData.clientId || '',
        wilaya: initialData.wilaya || '',
        lieu: initialData.wilaya || '', // Le lieu est souvent la wilaya par défaut
        dateDebut: initialData.dateDebut || '',
        dateFin: initialData.dateFin || '',
        type: initialData.type || 'Installation',
        chefMissionId: initialData.chefMissionId || '',
        // On garde les autres champs par défaut
      }));
    }
  }, [mission, initialData]);

  // Mettre à jour la wilaya automatiquement quand le client change
  useEffect(() => {
    if (formData.clientId) {
      const selectedClient = clients.find(c => c.id === formData.clientId);
      // La wilaya du client peut être stockée dans différents champs
      const clientWilaya = selectedClient?.wilaya || selectedClient?.lieu || '';
      if (clientWilaya) {
        setFormData(prev => ({
          ...prev,
          wilaya: clientWilaya,
          lieu: clientWilaya
        }));
      }
    }
  }, [formData.clientId, clients]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titre.trim()) {
      newErrors.titre = 'Le titre est requis';
    }
    if (!formData.clientId) {
      newErrors.clientId = 'Le client est requis';
    }
    if (!formData.chefMissionId) {
      newErrors.chefMissionId = 'Le Chef de Mission est requis';
    }
    if (!formData.dateDebut) {
      newErrors.dateDebut = 'La date de début est requise';
    }
    if (!formData.dateFin) {
      newErrors.dateFin = 'La date de fin est requise';
    }
    if (new Date(formData.dateDebut) > new Date(formData.dateFin)) {
      newErrors.dateFin = 'La date de fin doit être après la date de début';
    }
    if (!formData.budgetInitial || formData.budgetInitial <= 0) {
      newErrors.budgetInitial = 'Le budget doit être supérieur à 0';
    }
    if (!formData.type) {
      newErrors.type = 'Le type de mission est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addAccompagnateur = (userId) => {
    if (!selectedAccompagnateurs.includes(userId)) {
      setSelectedAccompagnateurs([...selectedAccompagnateurs, userId]);
      setFormData(prev => ({
        ...prev,
        accompagnateurIds: [...prev.accompagnateurIds, userId]
      }));
    }
  };

  const removeAccompagnateur = (userId) => {
    const updated = selectedAccompagnateurs.filter(id => id !== userId);
    setSelectedAccompagnateurs(updated);
    setFormData(prev => ({
      ...prev,
      accompagnateurIds: updated
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Supporter les deux noms de fonction (onSave ou onSubmit)
      const callback = onSubmit || onSave;
      if (callback) callback(formData);
    }
  };

  // Créer options des clients
  const clientOptions = clients.map(c => ({
    value: c.id,
    label: c.raison_sociale || 'Sans nom'
  }));

  const chefMissionOptions = users.map(u => ({
    value: u.id,
    label: u.full_name || u.email
  }));

  const accompagnateurOptions = users
    .filter(u => u.id !== formData.chefMissionId && !selectedAccompagnateurs.includes(u.id))
    .map(u => ({
      value: u.id,
      label: u.full_name || u.email
    }));

  const selectedAccompagnateursData = users.filter(u => selectedAccompagnateurs.includes(u.id));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Info: Création seulement par admins */}
      {!mission && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800 font-medium">
            ℹ️ Création de mission réservée aux administrateurs
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Sélectionnez le Chef de Mission qui sera responsable de cette mission
          </p>
        </div>
      )}

      {/* Titre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la Mission *</label>
        <Input
          type="text"
          name="titre"
          value={formData.titre}
          onChange={handleChange}
          placeholder="Exemple: Installation ERP ABC"
          error={errors.titre}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Décrivez la mission en détail..."
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Client et Type */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
          <Select
            name="clientId"
            value={formData.clientId}
            onChange={handleChange}
            options={[
              { value: '', label: 'Sélectionner un client...' },
              ...clientOptions.map(c => {
                const client = clients.find(cl => cl.id === c.value);
                const clientLocation = client?.wilaya || client?.lieu || '';
                return {
                  value: c.value,
                  label: clientLocation ? `${c.label} (📍 ${clientLocation})` : c.label
                };
              })
            ]}
            error={errors.clientId}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type de Mission *</label>
          <Select
            name="type"
            value={formData.type}
            onChange={handleChange}
            options={typesArray.map(t => ({ value: t, label: t }))}
            error={errors.type}
          />
        </div>
      </div>

      {/* Wilaya/Lieu et Priorité */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">📍 Wilaya / Lieu</label>
          {formData.wilaya ? (
            <div className="w-full px-3 py-2 border border-green-300 rounded-lg bg-green-50 flex items-center gap-2">
              <MapPin className="text-green-600" size={18} />
              <div>
                <p className="font-semibold text-green-900">{getWilayaName(formData.wilaya) || formData.wilaya}</p>
                <p className="text-xs text-green-700">Auto-rempli depuis la fiche client</p>
              </div>
            </div>
          ) : (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
              (Sélectionner un client d'abord)
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
          <Select
            name="priorite"
            value={formData.priorite}
            onChange={handleChange}
            options={[
              { value: 'faible', label: '⬜ Faible' },
              { value: 'moyenne', label: '🟡 Moyenne' },
              { value: 'haute', label: '🟠 Haute' },
              { value: 'critique', label: '🔴 Critique' }
            ]}
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date de Début *</label>
          <Input
            type="date"
            name="dateDebut"
            value={formData.dateDebut}
            onChange={handleChange}
            error={errors.dateDebut}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date de Fin *</label>
          <Input
            type="date"
            name="dateFin"
            value={formData.dateFin}
            onChange={handleChange}
            error={errors.dateFin}
          />
        </div>
      </div>

      {/* Budget */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Budget Initial (€) *</label>
        <Input
          type="number"
          name="budgetInitial"
          value={formData.budgetInitial}
          onChange={handleChange}
          placeholder="0.00"
          min="0"
          step="0.01"
          error={errors.budgetInitial}
        />
      </div>

      {/* SECTION RÔLES - CHEF DE MISSION */}
      <div className={`border-l-4 p-4 rounded ${mission ? 'bg-gray-100 border-gray-400' : 'bg-blue-50 border-blue-500'}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className={`font-semibold ${mission ? 'text-gray-700' : 'text-blue-900'}`}>👨‍💼 Chef de Mission *</h3>
          {mission && (
            <span className="text-xs px-2 py-1 bg-gray-400 text-white rounded">
              🔒 Figé à la création
            </span>
          )}
        </div>

        {mission ? (
          // Mode affichage (mission existante - FIGÉ)
          <div className="bg-white p-3 rounded border border-gray-300">
            {formData.chefMissionId ? (
              (() => {
                const chef = users.find(u => u.id === formData.chefMissionId);
                const chefName = chef?.full_name || 'Chef inconnu';
                const chefEmail = chef?.email;
                const firstInitial = (chef?.full_name || chefEmail || '?').charAt(0).toUpperCase();

                return (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-sm font-semibold text-blue-800">
                      {firstInitial}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{chefName}</p>
                      {chefEmail && <p className="text-xs text-gray-500">{chefEmail}</p>}
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className="text-gray-500 text-sm">❌ Aucun Chef de Mission assigné</p>
            )}
          </div>
        ) : (
          // Mode édition (nouvelle mission - MODIFIABLE)
          <Select
            name="chefMissionId"
            value={formData.chefMissionId}
            onChange={handleChange}
            options={[
              { value: '', label: 'Sélectionner le Chef de Mission...' },
              ...chefMissionOptions
            ]}
            error={errors.chefMissionId}
          />
        )}

        <p className={`text-xs mt-2 ${mission ? 'text-gray-600' : 'text-blue-700'}`}>
          {mission
            ? '✓ Le Chef de Mission ne peut pas être modifié après la création'
            : 'Le Chef de Mission sera responsable de la clôture de la mission'
          }
        </p>
      </div>

      {/* SECTION ACCOMPAGNATEURS */}
      <div className={`border-l-4 p-4 rounded ${mission ? 'bg-gray-100 border-gray-400' : 'bg-green-50 border-green-500'}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-semibold ${mission ? 'text-gray-700' : 'text-green-900'}`}>👥 Accompagnateurs</h3>
          {mission && (
            <span className="text-xs px-2 py-1 bg-gray-400 text-white rounded">
              🔒 Figé à la création
            </span>
          )}
        </div>

        {!mission && accompagnateurOptions.length > 0 && (
          <div className="mb-3">
            <Select
              options={[
                { value: '', label: '+ Ajouter un accompagnateur...' },
                ...accompagnateurOptions
              ]}
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  addAccompagnateur(e.target.value);
                }
              }}
            />
          </div>
        )}

        {/* Liste accompagnateurs sélectionnés */}
        <div className="space-y-2">
          {selectedAccompagnateursData.map(user => (
            <div
              key={user.id}
              className={`flex items-center justify-between p-2 rounded border ${mission ? 'bg-gray-50 border-gray-300' : 'bg-white border-green-200'}`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${mission ? 'bg-gray-300 text-gray-700' : 'bg-green-200 text-green-800'}`}>
                  {user.full_name?.charAt(0) || user.email?.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-900">{user.full_name || user.email}</span>
              </div>
              {!mission && (
                <button
                  type="button"
                  onClick={() => removeAccompagnateur(user.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        {selectedAccompagnateursData.length === 0 && (
          <p className={`text-xs font-medium ${mission ? 'text-gray-500' : 'text-gray-500'}`}>
            {mission ? '❌ Aucun accompagnateur assigné' : '➕ Aucun accompagnateur sélectionné'}
          </p>
        )}

        {mission && (
          <p className="text-xs text-gray-600 mt-2">
            ✓ Les accompagnateurs ne peuvent pas être modifiés après la création
          </p>
        )}
      </div>

      {/* Information: Statut initial */}
      {!mission && (
        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
          <p className="text-sm font-semibold text-blue-900 mb-2">📋 Statut Initial à la Création</p>
          <p className="text-sm text-blue-800">
            La mission sera créée avec le statut <strong>"Planifiée"</strong> (mission future, avant démarrage).
          </p>
          <p className="text-xs text-blue-700 mt-2">
            ➜ Cliquez sur "▶️ Démarrer la Mission" pour passer au statut "En cours"
          </p>
        </div>
      )}

      {/* Commentaire création */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Commentaire Initial (Admin)</label>
        <textarea
          name="commentaireCreation"
          value={formData.commentaireCreation}
          onChange={handleChange}
          placeholder="Contexte ou remarques à la création de la mission..."
          rows="2"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className={`flex-1 ${isSubmitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className={`flex-1 ${isSubmitting ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-dark'}`}
        >
          {isSubmitting ? '⏳ Sauvegarde...' : (mission ? 'Mettre à jour' : 'Créer la Mission')}
        </Button>
      </div>
    </form>
  );
};

export default MissionForm;
