import React, { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

const MissionClosureModal = ({ mission, isChef, isAdmin, onCloseChef, onValidateAdmin, onCancel }) => {
  const [closureData, setClosureData] = useState({
    commentaireChef: '',
    dateClotureReeelle: null,
    avancements: mission?.avancement || 100
  });

  const [validationData, setValidationData] = useState({
    commentaireAdmin: '',
    clotureeDefinitive: false
  });

  const [step, setStep] = useState('chef'); // 'chef' -> 'admin' -> 'complete'

  const handleChefSubmit = () => {
    if (!closureData.commentaireChef.trim()) {
      alert('Le commentaire du chef est requis');
      return;
    }
    if (onCloseChef) {
      const timestamp = new Date().toISOString();
      const dataWithTimestamp = { ...closureData, dateClotureReeelle: timestamp };
      setClosureData(dataWithTimestamp);
      onCloseChef(dataWithTimestamp);
      setStep('admin');
    }
  };

  const handleAdminValidate = () => {
    if (!validationData.commentaireAdmin.trim()) {
      alert('Le commentaire du responsable est requis');
      return;
    }
    if (onValidateAdmin) {
      onValidateAdmin(validationData);
      setStep('complete');
    }
  };

  if (step === 'complete') {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-green-700 mb-2">Mission Clôturée ✓</h3>
        <p className="text-gray-600 mb-6">
          La mission <strong>{mission?.titre}</strong> a été clôturée avec succès et validée par l'administrateur.
        </p>
        <Button
          onClick={onCancel}
          className="bg-green-500 text-white hover:bg-green-600"
        >
          Fermer
        </Button>
      </div>
    );
  }

  if (step === 'admin' && isAdmin) {
    return (
      <div className="space-y-6">
        {/* En-tête */}
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
          <h3 className="font-bold text-purple-900 text-lg mb-2">
            👨‍💼 Validation Admin - Clôture Définitive
          </h3>
          <p className="text-sm text-purple-700">
            Mission: <strong>{mission?.titre}</strong>
          </p>
          <p className="text-sm text-purple-700">
            Chef de Mission: <strong>{mission?.chefMission?.full_name || 'N/A'}</strong>
          </p>
        </div>

        {/* Commentaire du Chef (affichage) */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded">
          <label className="block text-sm font-semibold text-blue-900 mb-2">
            💬 Commentaire du Chef de Mission
          </label>
          <div className="bg-white p-3 rounded border border-blue-200 text-gray-700 min-h-20">
            {closureData.commentaireChef}
          </div>
        </div>

        {/* Avancement final (affichage) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 p-4 rounded">
            <label className="block text-sm font-semibold text-green-900 mb-2">
              📊 Avancement Final
            </label>
            <div className="text-3xl font-bold text-green-600">
              {closureData.avancements}%
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 p-4 rounded">
            <label className="block text-sm font-semibold text-orange-900 mb-2">
              📅 Date & Heure Clôture
            </label>
            <div className="text-lg font-medium text-orange-700">
              {closureData.dateClotureReeelle
                ? new Date(closureData.dateClotureReeelle).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
                : new Date().toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
              }
            </div>
          </div>
        </div>

        {/* Commentaire Admin (saisie) */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📝 Commentaire de Clôture (Admin) *
          </label>
          <textarea
            value={validationData.commentaireAdmin}
            onChange={(e) => setValidationData(prev => ({ ...prev, commentaireAdmin: e.target.value }))}
            placeholder="Remarques finales, observations, résumé de la mission..."
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Checkbox clôture définitive */}
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={validationData.clotureeDefinitive}
              onChange={(e) => setValidationData(prev => ({ ...prev, clotureeDefinitive: e.target.checked }))}
              className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
            />
            <span className="text-sm font-semibold text-red-900">
              ✓ Clôturer définitivement cette mission (action irréversible)
            </span>
          </label>
          {!validationData.clotureeDefinitive && (
            <p className="text-xs text-red-700 mt-2 ml-8">
              Vous devez cocher cette case pour confirmer la clôture définitive
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={() => setStep('chef')}
            className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            Retour
          </Button>
          <Button
            onClick={handleAdminValidate}
            disabled={!validationData.clotureeDefinitive}
            className="flex-1 bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-400"
          >
            ✓ Clôturer Définitivement
          </Button>
        </div>
      </div>
    );
  }

  // Étape Chef de Mission
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h3 className="font-bold text-blue-900 text-lg mb-2">
          👨‍💼 Clôture de Mission par Chef de Mission
        </h3>
        <p className="text-sm text-blue-700">
          Mission: <strong>{mission?.titre}</strong>
        </p>
      </div>

      {/* Infos mission */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 border border-gray-200 p-3 rounded">
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Client</label>
          <p className="font-medium text-gray-800">{mission?.client?.raison_sociale}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 p-3 rounded">
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Type</label>
          <p className="font-medium text-gray-800">{mission?.type}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 p-3 rounded">
          <label className="text-xs font-semibold text-gray-600 mb-1 block">Budget</label>
          <p className="font-medium text-gray-800">{mission?.budgetInitial}€</p>
        </div>
      </div>

      {/* Date clôture réelle (timestamp automatique) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          📅 Date & Heure de Clôture
        </label>
        <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium">
          🕐 Le timestamp sera capturé automatiquement au moment de la clôture :
          <span className="ml-2 text-blue-700 font-bold">
            {new Date().toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Avancement final */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          📊 Avancement Final (%)
        </label>
        <Input
          type="number"
          min="0"
          max="100"
          value={closureData.avancements}
          onChange={(e) => setClosureData(prev => ({ ...prev, avancements: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) }))}
          className="w-full"
        />
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${closureData.avancements}%` }}
          />
        </div>
      </div>

      {/* Commentaire Chef */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          💬 Commentaire de Clôture *
        </label>
        <textarea
          value={closureData.commentaireChef}
          onChange={(e) => setClosureData(prev => ({ ...prev, commentaireChef: e.target.value }))}
          placeholder="Décrivez comment s'est déroulée la mission, les obstacles rencontrés, les succès..."
          rows="5"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          {closureData.commentaireChef.length} caractères
        </p>
      </div>

      {/* Info admin validation */}
      {isAdmin && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded flex gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0" />
          <p className="text-sm text-yellow-700">
            <strong>À la suite:</strong> Un responsable/admin devra valider cette clôture et ajouter un commentaire final.
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          Annuler
        </Button>
        <Button
          onClick={handleChefSubmit}
          className="flex-1 bg-blue-500 text-white hover:bg-blue-600"
        >
          → Soumettre pour Validation Admin
        </Button>
      </div>
    </div>
  );
};

export default MissionClosureModal;
