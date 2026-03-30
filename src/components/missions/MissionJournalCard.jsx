import React from 'react';
import { ChevronDown, ChevronUp, Eye, Edit, AlertCircle, CheckCircle, Clock, Printer } from 'lucide-react';
import Button from '../common/Button';
import { missionExportService } from '../../services/missionExportService';
import { formatWilaya } from '../../constants/wilayas';

const MissionJournalCard = ({ mission, onDetails, onEdit, onClosure, getStatusColor, getStatusLabel, hasEditPermission, isChef, isAdmin, isAccompagnateur }) => {
  const getDaysUntilDue = () => {
    const today = new Date();
    const dueDate = new Date(mission.dateFin || mission.date_fin_prevue);
    const diff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getDelayIndicator = () => {
    const daysLeft = getDaysUntilDue();
    if (daysLeft < 0) {
      return { color: 'bg-red-100 border-red-500 text-red-800', label: '🔴 Retard', icon: AlertCircle };
    } else if (daysLeft <= 3) {
      return { color: 'bg-amber-100 border-amber-500 text-amber-800', label: '🟠 À risque', icon: AlertCircle };
    } else {
      return { color: 'bg-green-100 border-green-500 text-green-800', label: '🟢 Conforme', icon: CheckCircle };
    }
  };

  const indicator = getDelayIndicator();
  const IndicatorIcon = indicator.icon;

  return (
    <div className="bg-white rounded-lg shadow-md border-l-4 border-primary hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* En-tête */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(mission.statut)}`}>
                {getStatusLabel(mission.statut)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${indicator.color}`}>
                {indicator.label}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{mission.titre}</h3>
            <p className="text-sm text-gray-600 mt-1">{mission.description}</p>
          </div>
          <div className="text-right ml-4">
            <p className="text-xs text-gray-500">ID: {mission.id}</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{mission.client?.raison_sociale}</p>
            <p className="text-xs text-blue-600 font-bold uppercase">{formatWilaya(mission.client?.wilaya)}</p>
            <p className="text-xs text-gray-600">{mission.type}</p>
          </div>
        </div>

        {/* Barre d'avancement */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Avancement</p>
            <p className="text-sm font-bold text-primary">{mission.avancement}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary to-primary-dark h-2 rounded-full transition-all"
              style={{ width: `${mission.avancement}%` }}
            ></div>
          </div>
        </div>

        {/* Infos principales - 2 lignes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-gray-600 text-xs">Lieu</p>
            <p className="font-semibold text-gray-900">{mission.lieu}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-gray-600 text-xs">Début</p>
            <p className="font-semibold">{new Date(mission.dateDebut || mission.date_debut).toLocaleDateString('fr-FR')}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-gray-600 text-xs">Fin</p>
            <p className="font-semibold">{new Date(mission.dateFin || mission.date_fin_prevue).toLocaleDateString('fr-FR')}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-gray-600 text-xs">Priorité</p>
            <p className={`font-semibold ${mission.priorite === 'critique' ? 'text-red-600' :
              mission.priorite === 'haute' ? 'text-orange-600' :
                mission.priorite === 'moyenne' ? 'text-blue-600' :
                  'text-green-600'
              }`}>
              {mission.priorite?.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Budget et Dépenses */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded">
            <p className="text-xs text-blue-600 font-semibold">Budget</p>
            <p className="text-lg font-bold text-blue-900">{(mission.budgetInitial || mission.budget_alloue || 0).toLocaleString('fr-FR')} €</p>
          </div>
          <div className={`${(mission.dépenses || mission.budget_depense || 0) > (mission.budgetInitial || mission.budget_alloue || 0) ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'} border p-3 rounded`}>
            <p className={`text-xs font-semibold ${(mission.dépenses || mission.budget_depense || 0) > (mission.budgetInitial || mission.budget_alloue || 0) ? 'text-red-600' : 'text-green-600'}`}>
              Dépensé
            </p>
            <p className={`text-lg font-bold ${(mission.dépenses || mission.budget_depense || 0) > (mission.budgetInitial || mission.budget_alloue || 0) ? 'text-red-900' : 'text-green-900'}`}>
              {(mission.dépenses || mission.budget_depense || 0).toLocaleString('fr-FR')} €
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 p-3 rounded">
            <p className="text-xs text-purple-600 font-semibold">Utilisation</p>
            <p className="text-lg font-bold text-purple-900">
              {(mission.budgetInitial || mission.budget_alloue || 0) > 0 ? Math.round(((mission.dépenses || mission.budget_depense || 0) / (mission.budgetInitial || mission.budget_alloue || 0)) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {/* Détails Technique - Uniquement Chef de Mission et Admin (PAS accompagnateurs) */}
          {(isChef || isAdmin) && (
            <Button
              onClick={() => onDetails(mission, 'technique')}
              className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 flex items-center justify-center gap-2 py-2 rounded font-medium min-w-[120px]"
            >
              <Eye size={16} />
              Détails Technique
            </Button>
          )}

          {/* Détails Financier - Uniquement Chef de Mission et Admin (PAS accompagnateurs) */}
          {(isChef || isAdmin) && (
            <Button
              onClick={() => onDetails(mission, 'financier')}
              className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 flex items-center justify-center gap-2 py-2 rounded font-medium min-w-[120px]"
            >
              <Eye size={16} />
              Détails Financier
            </Button>
          )}

          {/* Bouton clôture - Chef de Mission ou Admin */}
          {(isChef || isAdmin) && !mission?.cloturee_definitive && (
            <Button
              onClick={() => onClosure(mission)}
              className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 flex items-center justify-center gap-2 py-2 rounded font-medium min-w-[120px]"
            >
              🔴 Clôturer
            </Button>
          )}

          {hasEditPermission && !mission?.cloturee_par_chef && (
            <Button
              onClick={() => onEdit(mission)}
              className="bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200 px-4 py-2 rounded font-medium"
              title="Modifier"
            >
              <Edit size={16} />
            </Button>
          )}

          {/* Bouton Impression Ordre Mission */}
          <Button
            onClick={() => missionExportService.printMission(mission)}
            className="bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 px-4 py-2 rounded font-medium flex items-center gap-2"
            title="Imprimer Ordre de Mission"
          >
            <Printer size={16} />
            <span className="hidden sm:inline">Ordre Mission</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MissionJournalCard;
