import React from 'react';
import { Edit, Trash2, Eye, AlertCircle, CheckCircle, Clock, DollarSign, Lock, Check, XCircle } from 'lucide-react';
import Button from '../common/Button';

const MissionCard = ({ mission, onEdit, onDelete, onDetails, onValidate, onClosure, onRemove, getStatusColor, getStatusLabel, hasEditPermission, hasDeletePermission, isAdmin }) => {
  const getDaysUntilDue = () => {
    const today = new Date();
    const dueDate = new Date(mission.dateFin);
    const diff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getDelayIndicator = () => {
    const daysLeft = getDaysUntilDue();
    if (daysLeft < 0) {
      return { color: 'bg-red-100 text-red-800', label: '🔴 Retard', icon: AlertCircle };
    } else if (daysLeft <= 3) {
      return { color: 'bg-amber-100 text-amber-800', label: '🟠 À risque', icon: AlertCircle };
    } else {
      return { color: 'bg-green-100 text-green-800', label: '🟢 Conforme', icon: CheckCircle };
    }
  };

  // Vérifier si la mission est clôturée
  const isMissionClosed = mission?.cloturee_definitive || mission?.cloturee_par_chef;
  
  const indicator = getDelayIndicator();
  const IndicatorIcon = indicator.icon;

  return (
    <div className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 ${isMissionClosed ? 'border-l-4 border-gray-400' : ''}`}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        {/* Left Section */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(mission.statut)}`}>
              {getStatusLabel(mission.statut)}
            </span>
            {isMissionClosed && (
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-200 text-gray-800 flex items-center gap-1">
                <Lock size={14} /> Clôturée
              </span>
            )}
            <span className="text-xs font-medium text-gray-600">ID: {mission.id}</span>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">{mission.titre}</h3>
          
          <p className="text-gray-600 mb-4">{mission.description}</p>

          {/* Mission Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div>
              <p className="text-xs text-gray-500">Client</p>
              <p className="font-semibold text-gray-900">{mission.client?.raison_sociale || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Type</p>
              <p className="font-semibold text-gray-900">{mission.type}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Lieu</p>
              <p className="font-semibold text-gray-900">{mission.lieu}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Priorité</p>
              <p className={`font-semibold ${
                mission.priorite === 'critique' ? 'text-red-600' :
                mission.priorite === 'haute' ? 'text-orange-600' :
                mission.priorite === 'moyenne' ? 'text-blue-600' :
                'text-green-600'
              }`}>
                {mission.priorite?.toUpperCase() || 'N/A'}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Avancement</p>
              <p className="text-sm font-bold text-primary">{mission.avancement}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${mission.avancement}%` }}
              ></div>
            </div>
          </div>

          {/* Dates and Budget */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-600">Début</p>
              <p className="font-semibold">{new Date(mission.dateDebut).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-600">Fin</p>
              <p className="font-semibold">{new Date(mission.dateFin).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-600">Budget</p>
              <p className="font-semibold">{mission.budgetInitial.toLocaleString('fr-FR')} €</p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <p className="text-gray-600">Dépensé</p>
              <p className={`font-semibold ${mission.dépenses > mission.budgetInitial ? 'text-red-600' : 'text-green-600'}`}>
                {mission.dépenses.toLocaleString('fr-FR')} €
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Delay Indicator & Actions */}
        <div className="flex flex-col items-end gap-4 md:w-48">
          {/* Delay Indicator */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${indicator.color}`}>
            <IndicatorIcon size={18} />
            <span className="text-sm font-semibold">{indicator.label}</span>
          </div>

          {/* Participants */}
          <div className="w-full">
            <p className="text-xs text-gray-500 mb-1">Participants</p>
            <div className="flex flex-wrap gap-1">
              {mission.participants?.map(p => (
                <span key={p.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {p.nom}
                </span>
              ))}
            </div>
          </div>

          {/* Budget Usage */}
          <div className="w-full">
            <p className="text-xs text-gray-500 mb-1">Utilisation Budget</p>
            <p className="text-lg font-bold text-gray-900">
              {mission.budgetInitial > 0 ? Math.round((mission.dépenses / mission.budgetInitial) * 100) : 0}%
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 w-full">
            <Button
              onClick={() => onDetails(mission)}
              className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center gap-2 py-2 rounded"
              size="sm"
            >
              <Eye size={16} />
              Détails
            </Button>
            
            {hasEditPermission && (isMissionClosed ? isAdmin : true) && (
              <Button
                onClick={() => onEdit(mission)}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded ${
                  isMissionClosed && !isAdmin
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                }`}
                size="sm"
                disabled={isMissionClosed && !isAdmin}
                title={isMissionClosed && !isAdmin ? 'Seuls les admins peuvent modifier une mission clôturée' : ''}
              >
                <Edit size={16} />
                Modifier
              </Button>
            )}
            
            {/* ✅ NOUVEAU: Boutons ADMIN - Valider, Clôturer, Supprimer */}
            {isAdmin && onRemove && (
              <>
                {mission.statut !== 'validee' && onValidate && (
                  <Button
                    onClick={() => onValidate(mission)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded bg-green-50 text-green-600 hover:bg-green-100"
                    size="sm"
                    title="Valider cette mission (Admin)"
                  >
                    <Check size={16} />
                    Valider
                  </Button>
                )}
                
                {mission.statut !== 'cloturee' && onClosure && (
                  <Button
                    onClick={() => onClosure(mission)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded bg-orange-50 text-orange-600 hover:bg-orange-100"
                    size="sm"
                    title="Clôturer cette mission (Admin)"
                  >
                    <XCircle size={16} />
                    Clôturer
                  </Button>
                )}
                
                <Button
                  onClick={() => onRemove(mission)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded bg-red-50 text-red-600 hover:bg-red-100"
                  size="sm"
                  title="Supprimer cette mission (Admin - Irréversible)"
                >
                  <Trash2 size={16} />
                  Supprimer
                </Button>
              </>
            )}
            
            {!isAdmin && hasDeletePermission && (
              <Button
                onClick={() => onDelete(mission)}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded ${
                  isMissionClosed && !isAdmin
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                }`}
                size="sm"
                disabled={isMissionClosed && !isAdmin}
                title={isMissionClosed && !isAdmin ? 'Seuls les admins peuvent supprimer une mission clôturée' : ''}
              >
                <Trash2 size={16} />
                Supprimer
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionCard;
