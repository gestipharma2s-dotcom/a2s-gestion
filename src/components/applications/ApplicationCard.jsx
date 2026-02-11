import React from 'react';
import { Edit2, Trash2, Package, Lock } from 'lucide-react';
import { formatMontant, formatPriceDisplay } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const ApplicationCard = ({ application, onEdit, onDelete, hasEditPermission = true, hasDeletePermission = true }) => {
  const { profile } = useAuth();
  return (
    <div className="card hover:shadow-xl transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Package className="text-purple-600" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{application.nom}</h3>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(application)}
            disabled={!hasEditPermission}
            className={`p-2 rounded-lg transition-colors ${
              hasEditPermission 
                ? 'text-blue-600 hover:bg-blue-50' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title={!hasEditPermission ? 'Permission refusée: Modifier' : 'Modifier cette application'}
          >
            {hasEditPermission ? <Edit2 size={18} /> : <Lock size={18} />}
          </button>
          <button
            onClick={() => onDelete(application.id)}
            disabled={!hasDeletePermission}
            className={`p-2 rounded-lg transition-colors ${
              hasDeletePermission 
                ? 'text-red-600 hover:bg-red-50' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title={!hasDeletePermission ? 'Permission refusée: Supprimer' : 'Supprimer cette application'}
          >
            {hasDeletePermission ? <Trash2 size={18} /> : <Lock size={18} />}
          </button>
        </div>
      </div>

      {/* Description */}
      {application.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {application.description}
        </p>
      )}

      {/* Prix - Admins voient prix réels, autres voient codes */}
      <div className="grid grid-cols-2 gap-3 mt-auto">
        {/* Prix Acquisition */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <p className="text-xs text-green-600 mb-1 font-semibold">PRIX ACQUISITION</p>
          <p className="text-xl font-bold text-green-700">
            {profile?.role === 'admin' || profile?.role === 'super_admin' ? (
              formatMontant(application.prix_acquisition || application.prix || 0)
            ) : (
              '🔐'
            )}
          </p>
        </div>
        
        {/* Prix Abonnement */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <p className="text-xs text-blue-600 mb-1 font-semibold">PRIX ABONNEMENT</p>
          <p className="text-xl font-bold text-blue-700">
            {profile?.role === 'admin' || profile?.role === 'super_admin' ? (
              formatMontant(application.prix_abonnement || application.prix || 0)
            ) : (
              '🔐'
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;