import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Lock, User, Calendar, Clock } from 'lucide-react';
import { formatDate, getStatutClass, getStatutLabel } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';

const InterventionCard = ({ intervention, onEdit, onDelete, onCloturer }) => {
  const { profile, user } = useAuth();
  const [createdByUser, setCreatedByUser] = useState(null);
  const [loadingCreator, setLoadingCreator] = useState(false);
  const [hasEditPermission, setHasEditPermission] = useState(false);
  const [hasDeletePermission, setHasDeletePermission] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // Charger les informations du créateur et les permissions
  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger le créateur si admin
        if (intervention?.created_by && (profile?.role === 'admin' || profile?.role === 'super_admin')) {
          setLoadingCreator(true);
          const creator = await userService.getById(intervention.created_by);
          setCreatedByUser(creator);
        }

        // Vérifier les permissions
        if (user?.id && profile) {
          setLoadingPermissions(true);
          const canEdit = profile?.role === 'admin' || profile?.role === 'super_admin' || 
                         await userService.hasEditPermission(user.id, 'support');
          const canDelete = profile?.role === 'admin' || profile?.role === 'super_admin' || 
                           await userService.hasDeletePermission(user.id, 'support');
          setHasEditPermission(canEdit);
          setHasDeletePermission(canDelete);
        }
      } catch (err) {
        console.error('Erreur chargement données:', err);
      } finally {
        setLoadingCreator(false);
        setLoadingPermissions(false);
      }
    };

    loadData();
  }, [intervention?.created_by, profile?.role, user?.id, profile]);
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
          <button
            onClick={() => onEdit(intervention)}
            disabled={!hasEditPermission && !(profile?.role === 'admin' || profile?.role === 'super_admin')}
            className={`p-2 rounded-lg transition-colors ${
              !hasEditPermission && !(profile?.role === 'admin' || profile?.role === 'super_admin')
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:bg-blue-50'
            }`}
            title={!hasEditPermission && !(profile?.role === 'admin' || profile?.role === 'super_admin') ? 'Permission refusée' : 'Modifier'}
          >
            {!hasEditPermission && !(profile?.role === 'admin' || profile?.role === 'super_admin') ? (
              <Lock size={18} />
            ) : (
              <Edit2 size={18} />
            )}
          </button>
          <button
            onClick={() => onDelete(intervention.id)}
            disabled={!hasDeletePermission && !(profile?.role === 'admin' || profile?.role === 'super_admin')}
            className={`p-2 rounded-lg transition-colors ${
              !hasDeletePermission && !(profile?.role === 'admin' || profile?.role === 'super_admin')
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-red-600 hover:bg-red-50'
            }`}
            title={!hasDeletePermission && !(profile?.role === 'admin' || profile?.role === 'super_admin') ? 'Permission refusée' : 'Supprimer'}
          >
            {!hasDeletePermission && !(profile?.role === 'admin' || profile?.role === 'super_admin') ? (
              <Lock size={18} />
            ) : (
              <Trash2 size={18} />
            )}
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
          <span>{intervention.duree_minutes || '-'} minutes</span>
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

      {/* Créateur (visible pour admins) */}
      {createdByUser && (profile?.role === 'admin' || profile?.role === 'super_admin') && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
          <p>Créé par: <span className="font-semibold text-gray-700">{createdByUser.nom || createdByUser.email}</span></p>
        </div>
      )}
    </div>
  );
};

export default InterventionCard;