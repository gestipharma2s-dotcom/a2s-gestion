import React from 'react';
import { Calendar, AlertCircle, Building, RefreshCw, Trash2, CreditCard } from 'lucide-react';
import { formatDate, getStatutClass, getStatutLabel, joursRestants } from '../../utils/helpers';

const AbonnementCard = ({ abonnement, onRenouveler, onDelete, onPayment }) => {
  const jours = joursRestants(abonnement.date_fin);
  
  const getCardStyle = () => {
    if (abonnement.statut === 'expire') {
      return 'border-l-4 border-red-500 bg-red-50 hover:shadow-xl transition-shadow';
    }
    if (abonnement.statut === 'en_alerte') {
      return 'border-l-4 border-orange-500 bg-orange-50 hover:shadow-xl transition-shadow';
    }
    return 'border-l-4 border-green-500 bg-green-50 hover:shadow-xl transition-shadow';
  };

  const getAlertColor = () => {
    if (abonnement.statut === 'expire') return 'text-red-700 bg-red-100 border-l-4 border-red-500';
    if (abonnement.statut === 'en_alerte') return 'text-orange-700 bg-orange-100 border-l-4 border-orange-500';
    return 'text-green-700 bg-green-100';
  };

  const getButtonColor = () => {
    if (abonnement.statut === 'expire') return 'bg-red-600 hover:bg-red-700 text-white';
    if (abonnement.statut === 'en_alerte') return 'bg-orange-600 hover:bg-orange-700 text-white';
    return 'bg-primary hover:bg-primary/90 text-white';
  };

  return (
    <div className={`card ${getCardStyle()}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-1">
            {abonnement.installation?.application_installee}
          </h3>
          <span className={`${getStatutClass(abonnement.statut)} text-xs`}>
            {getStatutLabel(abonnement.statut)}
          </span>
        </div>
        <div className="flex gap-2">
          {abonnement.statut === 'expire' && (
            <AlertCircle className="text-red-600" size={24} />
          )}
          {abonnement.statut === 'en_alerte' && (
            <AlertCircle className="text-orange-600" size={24} />
          )}
        </div>
      </div>

      {/* Client Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Building size={16} />
          <span className="font-medium">
            {abonnement.installation?.client?.raison_sociale}
          </span>
        </div>
      </div>

      {/* Dates */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Début:</span>
          <span className="font-medium text-gray-800">
            {formatDate(abonnement.date_debut)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Fin:</span>
          <span className="font-medium text-gray-800">
            {formatDate(abonnement.date_fin)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {abonnement.statut === 'expire' && onPayment && (
          <button
            onClick={() => onPayment(abonnement)}
            className={`flex-1 btn flex items-center justify-center gap-2 ${getButtonColor()}`}
          >
            <CreditCard size={18} />
            Enregistrer Paiement
          </button>
        )}
        {abonnement.statut === 'expire' && onRenouveler && (
          <button
            onClick={() => onRenouveler(abonnement.id)}
            className={`flex-1 btn flex items-center justify-center gap-2 ${getButtonColor()}`}
          >
            <RefreshCw size={18} />
            Renouveler
          </button>
        )}
        <button
          disabled
          className="p-2 text-gray-400 bg-gray-100 rounded transition-colors cursor-not-allowed"
          title="Un abonnement ne peut être supprimé que si son installation est supprimée"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default AbonnementCard;