import React from 'react';
import { Calendar, Building, RefreshCw, AlertCircle } from 'lucide-react';
import { formatDate, joursRestants } from '../../utils/helpers';

const AlerteCard = ({ alerte, type, onRenouveler }) => {
  const jours = joursRestants(alerte.date_fin);
  
  const getBorderColor = () => {
    if (type === 'danger') return 'border-red-500';
    if (type === 'warning') return 'border-orange-500';
    return 'border-blue-500';
  };

  const getBgColor = () => {
    if (type === 'danger') return 'bg-red-50';
    if (type === 'warning') return 'bg-orange-50';
    return 'bg-blue-50';
  };

  const getTextColor = () => {
    if (type === 'danger') return 'text-red-700';
    if (type === 'warning') return 'text-orange-700';
    return 'text-blue-700';
  };

  return (
    <div className={`card hover:shadow-xl transition-shadow duration-200 border-l-4 ${getBorderColor()}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {alerte.installation?.application_installee}
          </h3>
          {type === 'danger' && (
            <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
              <AlertCircle size={16} />
              <span>EXPIRÉ</span>
            </div>
          )}
          {type === 'warning' && (
            <div className="flex items-center gap-2 text-orange-600 text-sm font-medium">
              <AlertCircle size={16} />
              <span>{jours} JOURS RESTANTS</span>
            </div>
          )}
        </div>
      </div>

      {/* Client */}
      <div className="flex items-center gap-2 text-gray-700 mb-4">
        <Building size={18} />
        <span className="font-medium">
          {alerte.installation?.client?.raison_sociale}
        </span>
      </div>

      {/* Dates */}
      <div className={`${getBgColor()} rounded-lg p-3 mb-4`}>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Date de fin:</span>
          <span className={`font-bold ${getTextColor()}`}>
            {formatDate(alerte.date_fin)}
          </span>
        </div>
        {alerte.installation?.client?.commercial_assigne && (
          <div className="text-xs text-gray-600 mt-2">
            Commercial: {alerte.installation.client.commercial_assigne}
          </div>
        )}
      </div>

      {/* Action Button */}
      <button
        onClick={() => onRenouveler(alerte.id)}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
          type === 'danger'
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-orange-600 hover:bg-orange-700 text-white'
        }`}
      >
        <RefreshCw size={18} />
        Renouveler Maintenant
      </button>
    </div>
  );
};

export default AlerteCard;