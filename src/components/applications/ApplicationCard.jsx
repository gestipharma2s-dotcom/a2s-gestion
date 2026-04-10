import React, { useState } from 'react';
import { Edit2, Trash2, Package, Lock, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { formatMontant } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const ApplicationCard = ({ application, modules = [], onEdit, onDelete, onAddModule, onDeleteModule, hasEditPermission = true, hasDeletePermission = true }) => {
  const { profile } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

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
            {modules.length > 0 && (
              <span className="text-xs text-purple-600 font-medium">{modules.length} module(s)</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(application)}
            disabled={!hasEditPermission}
            className={`p-2 rounded-lg transition-colors ${hasEditPermission
                ? 'text-blue-600 hover:bg-blue-50'
                : 'text-gray-400 cursor-not-allowed'
              }`}
            title={!hasEditPermission ? 'Permission refusée' : 'Modifier'}
          >
            {hasEditPermission ? <Edit2 size={18} /> : <Lock size={18} />}
          </button>
          <button
            onClick={() => onDelete(application.id)}
            disabled={!hasDeletePermission}
            className={`p-2 rounded-lg transition-colors ${hasDeletePermission
                ? 'text-red-600 hover:bg-red-50'
                : 'text-gray-400 cursor-not-allowed'
              }`}
            title={!hasDeletePermission ? 'Permission refusée' : 'Supprimer'}
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

      {/* Prix Application */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <p className="text-xs text-green-600 mb-1 font-semibold">PRIX ACQUISITION</p>
          <p className="text-xl font-bold text-green-700">
            {isAdmin ? formatMontant(application.prix_acquisition || application.prix || 0) : '🔐'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <p className="text-xs text-blue-600 mb-1 font-semibold">PRIX ABONNEMENT</p>
          <p className="text-xl font-bold text-blue-700">
            {isAdmin ? formatMontant(application.prix_abonnement || application.prix || 0) : '🔐'}
          </p>
        </div>
      </div>

      {/* Section Modules */}
      <div className="border-t border-gray-200 pt-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between w-full text-sm font-semibold text-purple-700 hover:text-purple-900 transition-colors py-1"
        >
          <span>📦 Modules ({modules.length})</span>
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {expanded && (
          <div className="mt-3 space-y-2">
            {modules.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-2">Aucun module ajouté</p>
            ) : (
              modules.map((mod) => (
                <div key={mod.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 group hover:border-purple-200 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{mod.nom}</p>
                    {isAdmin && (mod.prix_acquisition > 0 || mod.prix_abonnement > 0) && (
                      <div className="flex gap-3 mt-1">
                        {mod.prix_acquisition > 0 && (
                          <span className="text-xs text-green-600">Acq: {formatMontant(mod.prix_acquisition)}</span>
                        )}
                        {mod.prix_abonnement > 0 && (
                          <span className="text-xs text-blue-600">Abo: {formatMontant(mod.prix_abonnement)}</span>
                        )}
                      </div>
                    )}
                  </div>
                  {hasDeletePermission && (
                    <button
                      onClick={() => onDeleteModule && onDeleteModule(mod.id)}
                      className="p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Supprimer ce module"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))
            )}

            {/* Bouton Ajouter Module */}
            {hasEditPermission && (
              <button
                onClick={() => onAddModule && onAddModule(application)}
                className="flex items-center gap-2 w-full justify-center py-2 mt-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg border border-dashed border-purple-300 transition-colors"
              >
                <Plus size={16} />
                Ajouter un module
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationCard;