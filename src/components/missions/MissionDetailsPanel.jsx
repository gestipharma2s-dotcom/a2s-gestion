import React, { useState } from 'react';
import {
  X, MapPin, Calendar, DollarSign, Users, Briefcase, AlertCircle,
  CheckCircle, Clock, TrendingUp, FileText, Edit2, Trash2, Download
} from 'lucide-react';
import Button from '../common/Button';
import { getWilayaName } from '../../utils/wilayasConstants';

const MissionDetailsPanel = ({ mission, onClose, onEdit, onDelete }) => {
  const [activeTab, setActiveTab] = useState('general');

  if (!mission) return null;

  const getStatusColor = (statut) => {
    const colors = {
      creee: 'bg-gray-100 text-gray-800',
      planifiee: 'bg-blue-100 text-blue-800',
      en_cours: 'bg-amber-100 text-amber-800',
      cloturee: 'bg-green-100 text-green-800',
      validee: 'bg-emerald-100 text-emerald-800'
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (statut) => {
    const labels = {
      creee: 'Créée',
      planifiee: 'Planifiée',
      en_cours: 'En cours',
      cloturee: 'Clôturée',
      validee: 'Validée'
    };
    return labels[statut] || statut;
  };

  const getPriorityIcon = (priorite) => {
    const icons = {
      faible: '⬜',
      moyenne: '🟡',
      haute: '🟠',
      critique: '🔴'
    };
    return icons[priorite] || '◼️';
  };

  const budgetUtilise = mission.budgetInitial > 0 
    ? Math.round((mission.depenses / mission.budgetInitial) * 100)
    : 0;

  const budgetRestant = mission.budgetInitial - mission.depenses;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-96 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 flex items-center justify-between sticky top-0">
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{mission.titre}</h2>
            <p className="text-primary-light text-sm mt-1">{mission.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 flex gap-4 px-6 bg-gray-50">
          {[
            { id: 'general', label: '📋 Général' },
            { id: 'finances', label: '💰 Finances' },
            { id: 'equipe', label: '👥 Équipe' },
            { id: 'timeline', label: '📅 Timeline' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-sm font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {/* Tab: Général */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Status et Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Statut</label>
                  <div className={`mt-2 px-3 py-2 rounded-lg inline-block ${getStatusColor(mission.statut)}`}>
                    {getStatusLabel(mission.statut)}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Type</label>
                  <p className="mt-2 text-lg font-semibold text-gray-900">🎯 {mission.type}</p>
                </div>
              </div>

              {/* Client et Wilaya */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Client</label>
                  <p className="mt-2 text-lg font-semibold text-gray-900">{mission.client?.raison_sociale || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">📍 Wilaya</label>
                  <div className="mt-2 flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                    <MapPin size={16} className="text-blue-600" />
                    <span className="font-semibold text-blue-900">
                      {getWilayaName(mission.wilaya) || mission.wilaya}
                    </span>
                  </div>
                </div>
              </div>

              {/* Priorité et Avancement */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Priorité</label>
                  <p className="mt-2 text-lg">
                    {getPriorityIcon(mission.priorite)} {mission.priorite?.charAt(0).toUpperCase() + mission.priorite?.slice(1)}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Avancement</label>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full transition-all"
                        style={{ width: `${mission.avancement || 0}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-gray-900">{mission.avancement || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Détails supplémentaires */}
              {mission.commentaireCreation && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-900 uppercase mb-1">Notes à la création</p>
                  <p className="text-sm text-blue-800">{mission.commentaireCreation}</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Finances */}
          {activeTab === 'finances' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Budget Initial */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <label className="text-xs font-semibold text-blue-600 uppercase mb-2 block">Budget Initial</label>
                  <p className="text-2xl font-bold text-blue-900">
                    {(mission.budgetInitial || 0).toLocaleString('fr-DZ')} DA
                  </p>
                </div>

                {/* Dépenses */}
                <div className={`p-4 rounded-lg border ${budgetUtilise > 80 ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}`}>
                  <label className={`text-xs font-semibold ${budgetUtilise > 80 ? 'text-red-600' : 'text-orange-600'} uppercase mb-2 block`}>
                    Dépenses
                  </label>
                  <p className={`text-2xl font-bold ${budgetUtilise > 80 ? 'text-red-900' : 'text-orange-900'}`}>
                    {(mission.depenses || 0).toLocaleString('fr-DZ')} DA
                  </p>
                </div>

                {/* Budget Restant */}
                <div className={`p-4 rounded-lg border ${budgetRestant < 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <label className={`text-xs font-semibold ${budgetRestant < 0 ? 'text-red-600' : 'text-green-600'} uppercase mb-2 block`}>
                    Budget Restant
                  </label>
                  <p className={`text-2xl font-bold ${budgetRestant < 0 ? 'text-red-900' : 'text-green-900'}`}>
                    {budgetRestant.toLocaleString('fr-DZ')} DA
                  </p>
                </div>

                {/* Taux Utilisation */}
                <div className={`p-4 rounded-lg border ${budgetUtilise > 80 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <label className={`text-xs font-semibold ${budgetUtilise > 80 ? 'text-red-600' : 'text-yellow-600'} uppercase mb-2 block`}>
                    Utilisation
                  </label>
                  <p className={`text-2xl font-bold ${budgetUtilise > 80 ? 'text-red-900' : 'text-yellow-900'}`}>
                    {budgetUtilise}%
                  </p>
                </div>
              </div>

              {/* Alerte budget */}
              {budgetUtilise > 80 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold text-red-900">⚠️ Dépassement budgétaire!</p>
                    <p className="text-sm text-red-800 mt-1">
                      Le budget est utilisé à {budgetUtilise}%. Attention à ne pas dépasser la limite.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab: Équipe */}
          {activeTab === 'equipe' && (
            <div className="space-y-4">
              {mission.chefMissionId && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs font-semibold text-purple-600 uppercase mb-2">Chef de Mission</p>
                  <div className="flex items-center gap-2">
                    <Users className="text-purple-600" size={18} />
                    <span className="font-semibold text-purple-900">{mission.chefMissionId}</span>
                  </div>
                </div>
              )}

              {mission.participants && mission.participants.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase mb-3">Participants</p>
                  <div className="grid grid-cols-2 gap-3">
                    {mission.participants.map((p, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="font-semibold text-gray-900">{p.nom || 'N/A'}</p>
                        <p className="text-xs text-gray-600">{p.role || 'Rôle non défini'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!mission.participants || mission.participants.length === 0 && !mission.chefMissionId && (
                <p className="text-center text-gray-500 py-4">Aucune équipe assignée</p>
              )}
            </div>
          )}

          {/* Tab: Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <label className="text-xs font-semibold text-indigo-600 uppercase mb-2 block">Début Prévu</label>
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-indigo-600" />
                    <span className="font-semibold text-indigo-900">
                      {new Date(mission.dateDebut).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <label className="text-xs font-semibold text-red-600 uppercase mb-2 block">Fin Prévue</label>
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-red-600" />
                    <span className="font-semibold text-red-900">
                      {new Date(mission.dateFin).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>

              {mission.durationReelle && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <label className="text-xs font-semibold text-green-600 uppercase mb-2 block">Durée Réelle</label>
                  <p className="font-semibold text-green-900">{mission.durationReelle} jour(s)</p>
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">Créée le</label>
                <p className="font-semibold text-gray-900">
                  {new Date(mission.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3 justify-end">
          <Button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800"
          >
            Fermer
          </Button>
          {onEdit && (
            <Button
              onClick={onEdit}
              className="bg-primary hover:bg-primary-dark text-white flex items-center gap-2"
            >
              <Edit2 size={16} />
              Modifier
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={onDelete}
              className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
            >
              <Trash2 size={16} />
              Supprimer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MissionDetailsPanel;
