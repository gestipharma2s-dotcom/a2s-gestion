import React from 'react';
import { X, User, Calendar, Clock, AlertCircle, CheckCircle, MapPin, Wrench, Edit2, Trash2 } from 'lucide-react';
import { formatDate, formatDateTime, getStatutLabel } from '../../utils/helpers';
import Button from '../common/Button';

const InterventionDetails = ({ intervention, onClose, onEdit, onDelete, onCloturer }) => {
  if (!intervention) return null;

  const getPriorityColor = () => {
    return intervention.priorite === 'haute' 
      ? 'bg-red-100 text-red-800 border-red-200' 
      : 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="space-y-6">
      {/* Header avec boutons */}
      <div className="flex items-start justify-between pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              intervention.statut === 'cloturee' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
            }`}>
              {getStatutLabel(intervention.statut)}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor()}`}>
              {intervention.priorite === 'haute' ? '🔴 Haute Priorité' : '🟢 Normale'}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">
            {getStatutLabel(intervention.type_intervention)}
          </h3>
        </div>
        
        {/* Boutons d'action */}
        <div className="flex gap-2">
          {intervention.statut === 'en_cours' && (
            <button
              onClick={() => onCloturer(intervention)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="Clôturer cette intervention"
            >
              <CheckCircle size={18} />
              Clôturer
            </button>
          )}
          <button
            onClick={() => onEdit(intervention)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Modifier"
          >
            <Edit2 size={18} />
            Modifier
          </button>
          <button
            onClick={() => onDelete(intervention.id)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            title="Supprimer"
          >
            <Trash2 size={18} />
            Supprimer
          </button>
        </div>
      </div>

      {/* Informations Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="text-blue-600" size={20} />
            <h4 className="font-semibold text-blue-900">Client</h4>
          </div>
          <p className="text-lg font-bold text-blue-800">{intervention.client?.raison_sociale}</p>
          <p className="text-sm text-blue-600">{intervention.client?.contact}</p>
          <p className="text-sm text-blue-600">{intervention.client?.telephone}</p>
        </div>

        {/* Technicien */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="text-purple-600" size={20} />
            <h4 className="font-semibold text-purple-900">Technicien</h4>
          </div>
          <p className="text-lg font-bold text-purple-800">{intervention.technicien?.nom}</p>
          <p className="text-sm text-purple-600">{intervention.technicien?.email}</p>
        </div>

        {/* Date & Durée */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-green-600" size={20} />
            <h4 className="font-semibold text-green-900">Date & Heure</h4>
          </div>
          <p className="text-lg font-bold text-green-800">{formatDate(intervention.date_intervention)}</p>
          <div className="flex items-center gap-2 mt-1">
            <Clock size={16} className="text-green-600" />
            <p className="text-sm text-green-600">{intervention.duree} minutes</p>
          </div>
        </div>

        {/* Mode */}
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="text-orange-600" size={20} />
            <h4 className="font-semibold text-orange-900">Mode</h4>
          </div>
          <p className="text-lg font-bold text-orange-800">
            {getStatutLabel(intervention.mode_intervention)}
          </p>
        </div>
      </div>

      {/* Problème */}
      <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="text-red-600" size={20} />
          <h4 className="font-semibold text-red-900">Problème Rencontré</h4>
        </div>
        <p className="text-gray-700 leading-relaxed">{intervention.resume_probleme}</p>
      </div>

      {/* Action Entreprise */}
      {intervention.action_entreprise && (
        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="text-green-600" size={20} />
            <h4 className="font-semibold text-green-900">Action Entreprise</h4>
          </div>
          <p className="text-gray-700 leading-relaxed">{intervention.action_entreprise}</p>
        </div>
      )}

      {/* Commentaires */}
      {intervention.commentaires && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Commentaires</h4>
          <p className="text-gray-700 leading-relaxed">{intervention.commentaires}</p>
        </div>
      )}

      {/* Date de clôture */}
      {intervention.date_fin && (
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <p className="text-sm text-blue-600">
            Intervention clôturée le <span className="font-semibold">{formatDateTime(intervention.date_fin)}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default InterventionDetails;