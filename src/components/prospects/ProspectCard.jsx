import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Phone, Mail, MapPin, User, History, Plus, Lock } from 'lucide-react';
import { getStatutClass, getStatutLabel } from '../../utils/helpers';
import { getWilayaName } from '../../utils/wilayasConstants';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';

const ProspectCard = ({ prospect, onEdit, onDelete, onConvertToClient, onViewHistory, onAddAction }) => {
  const { profile, user } = useAuth();
  const [createdByUser, setCreatedByUser] = useState(null);
  const [loadingCreator, setLoadingCreator] = useState(false);
  const [hasCreatePermission, setHasCreatePermission] = useState(false);
  const [hasEditPermission, setHasEditPermission] = useState(false);
  const [hasDeletePermission, setHasDeletePermission] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);

  // Charger les informations du créateur et les permissions
  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger le créateur si admin
        if (prospect?.created_by && (profile?.role === 'admin' || profile?.role === 'super_admin')) {
          setLoadingCreator(true);
          const creator = await userService.getById(prospect.created_by);
          setCreatedByUser(creator);
        }

        // Vérifier les permissions
        if (user?.id && profile) {
          setLoadingPermissions(true);
          const canCreate = profile?.role === 'admin' || profile?.role === 'super_admin' || 
                           await userService.hasCreatePermission(user.id, 'prospects');
          const canEdit = profile?.role === 'admin' || profile?.role === 'super_admin' || 
                         await userService.hasEditPermission(user.id, 'prospects');
          const canDelete = profile?.role === 'admin' || profile?.role === 'super_admin' || 
                           await userService.hasDeletePermission(user.id, 'prospects');
          setHasCreatePermission(canCreate);
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
  }, [prospect?.created_by, profile?.role, user?.id, profile]);

  // Vérifier que prospect existe
  if (!prospect) {
    return null;
  }

  const getSourceBadgeColor = (source) => {
    const colors = {
      'prospection': 'bg-blue-100 text-blue-800 border-blue-200',
      'referral': 'bg-green-100 text-green-800 border-green-200',
      'site_web': 'bg-purple-100 text-purple-800 border-purple-200',
      'partenaire': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'autre': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[source] || colors['autre'];
  };

  return (
    <div className="card hover:shadow-xl transition-shadow duration-200 border-l-4 border-primary">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`${getStatutClass(prospect.statut)} text-xs font-semibold px-2 py-1 rounded`}>
              {getStatutLabel(prospect.statut)}
            </span>
            {prospect.source && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getSourceBadgeColor(prospect.source)}`}>
                {prospect.source}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-800">
            {prospect.raison_sociale}
          </h3>
          <p className="text-sm text-gray-600">{prospect.secteur_activite || 'N/A'}</p>
        </div>
        <div className="flex gap-2">
          {prospect.statut === 'prospect' && (
            <button
              onClick={() => onConvertToClient && onConvertToClient(prospect)}
              className="px-3 py-2 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              title="Convertir en client"
            >
              Convertir
            </button>
          )}
          <button
            onClick={() => onAddAction && onAddAction(prospect)}
            disabled={prospect.statut === 'actif'}
            className={`p-2 rounded-lg transition-colors ${
              prospect.statut === 'actif'
                ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                : 'text-green-600 hover:bg-green-50'
            }`}
            title={prospect.statut === 'actif' ? 'Actions non disponibles pour les clients' : 'Ajouter une action'}
          >
            <Plus size={18} />
          </button>
          <button
            onClick={() => onViewHistory && onViewHistory(prospect)}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Voir l'historique"
          >
            <History size={18} />
          </button>
          <button
            onClick={() => onEdit(prospect)}
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
            onClick={() => onDelete(prospect.id)}
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

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-gray-700 text-sm">
          <User size={16} className="text-primary flex-shrink-0" />
          <span className="font-medium">{prospect.contact}</span>
        </div>
        
        {prospect.telephone && (
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Phone size={16} className="text-primary flex-shrink-0" />
            <a href={`tel:${prospect.telephone}`} className="hover:text-blue-600">
              {prospect.telephone}
            </a>
          </div>
        )}
        
        {prospect.email && (
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Mail size={16} className="text-primary flex-shrink-0" />
            <a href={`mailto:${prospect.email}`} className="hover:text-blue-600">
              {prospect.email}
            </a>
          </div>
        )}

        {prospect.wilaya && (
          <div className="flex items-center gap-2 text-gray-600 text-sm bg-blue-50 p-2 rounded border border-blue-100">
            <MapPin size={16} className="text-blue-600 flex-shrink-0" />
            <span className="font-medium text-blue-900">📍 {getWilayaName(prospect.wilaya)}</span>
          </div>
        )}
        
        {prospect.adresse && (
          <div className="flex items-start gap-2 text-gray-600 text-sm">
            <MapPin size={16} className="text-primary flex-shrink-0 mt-0.5" />
            <span>{prospect.adresse}</span>
          </div>
        )}
      </div>

      {/* Info Box */}
      {prospect.notes && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-700 font-medium mb-1">Notes:</p>
          <p className="text-xs text-gray-600 line-clamp-2">
            {prospect.notes}
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

export default ProspectCard;