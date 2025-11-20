import React from 'react';
import { Edit2, Trash2, Lock, User, Calendar, Clock } from 'lucide-react';
import { formatDate, getStatutClass, getStatutLabel } from '../../utils/helpers';

const InterventionCard = ({ intervention, onEdit, onDelete, onCloturer }) => {
  const getPriorityColor = () => {
    return intervention.priorite === 'haute' 
      ? 'bg-red-100 text-red-800 border-red-200' 
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="card hover:shadow-xl transition-shadow duration-200 border-l-4 border-primary">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`${getStatutClass(intervention.statut)} text-xs`}>
              {getStatutLabel(intervention.statut)}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor()}`}>
              {intervention.priorite === 'haute' ? 'Haute Priorité' : 'Normale'}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-gray-600">
            {getStatutLabel(intervention.type_intervention)} - {getStatutLabel(intervention.mode_intervention)}
          </h3>
        </div>
        <div className="flex gap-2">
          {intervention.statut === 'en_cours' && (
            <button
              onClick={() => onCloturer(intervention)}
              className="p-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold text-xs"
              title="Clôturer"
            >
              ✓ CLÔTURER
            </button>
          )}
          <button
            onClick={() => onEdit(intervention)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(intervention.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-gray-700 text-sm">
          <User size={16} className="text-primary" />
          <span className="font-medium">{intervention.client?.raison_sociale}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <User size={16} />
          <span>Tech: {intervention.technicien?.nom}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Calendar size={16} />
          <span>{formatDate(intervention.date_intervention)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Clock size={16} />
          <span>{intervention.duree} minutes</span>
        </div>
      </div>

      {/* Problème */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <p className="text-sm text-gray-700 font-medium mb-1">Problème:</p>
        <p className="text-sm text-gray-600 line-clamp-3">
          {intervention.resume_probleme}
        </p>
      </div>

      {/* Actions */}
      {intervention.action_entreprise && (
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-sm text-green-700 font-medium mb-1">Action:</p>
          <p className="text-sm text-green-600 line-clamp-2">
            {intervention.action_entreprise}
          </p>
        </div>
      )}
    </div>
  );
};

export default InterventionCard;