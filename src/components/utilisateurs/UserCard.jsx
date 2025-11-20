import React from 'react';
import { Edit2, Trash2, Shield, User, Mail } from 'lucide-react';
import { getInitials } from '../../utils/helpers';
import { ROLE_PERMISSIONS } from '../../utils/constants';

const UserCard = ({ user, onEdit, onDelete, canManage = false }) => {
  const getRoleColor = () => {
    const colors = {
      super_admin: 'bg-red-100 text-red-800 border-red-200',
      admin: 'bg-orange-100 text-orange-800 border-orange-200',
      technicien: 'bg-green-100 text-green-800 border-green-200',
      commercial: 'bg-blue-100 text-blue-800 border-blue-200',
      support: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };
    return colors[user.role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRoleLabel = () => {
    const permissions = ROLE_PERMISSIONS[user.role];
    return permissions?.label || user.role;
  };

  const getRoleIcon = () => {
    if (user.role === 'super_admin' || user.role === 'admin') {
      return <Shield className="text-red-600" size={32} />;
    }
    return <User className="text-primary" size={32} />;
  };

  const getRoleEmoji = () => {
    const emojis = {
      super_admin: '👑',
      admin: '🔐',
      technicien: '🔧',
      commercial: '💼',
      support: '🎧'
    };
    return emojis[user.role] || '👤';
  };

  const permissions = ROLE_PERMISSIONS[user.role];

  return (
    <div className="card hover:shadow-xl transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white text-xl font-bold">
            {getInitials(user.nom)}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800">{user.nom}</h3>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor()} mt-1`}>
              {getRoleEmoji()} {getRoleLabel()}
            </span>
          </div>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(user)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Modifier"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => onDelete(user.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Supprimer"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Email */}
      <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
        <Mail size={16} />
        <span className="truncate">{user.email}</span>
      </div>

      {/* Pages Accessibles */}
      {permissions && !permissions.allPages && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <p className="text-xs text-gray-600 mb-2 font-medium">📄 Pages accessibles:</p>
          {user.pages_visibles && user.pages_visibles.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {user.pages_visibles.slice(0, 3).map((page, index) => (
                <span key={index} className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
                  {page}
                </span>
              ))}
              {user.pages_visibles.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{user.pages_visibles.length - 3}
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-500">Aucune page assignée</p>
          )}
        </div>
      )}

      {/* Permissions */}
      {permissions && (
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-blue-600 font-medium mb-2">🔑 Permissions:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {permissions.allPages && (
              <span className="text-blue-700">✅ Toutes les pages</span>
            )}
            {permissions.canManageUsers && (
              <span className="text-blue-700">✅ Gérer utilisateurs</span>
            )}
            {permissions.canViewAll && (
              <span className="text-blue-700">✅ Voir toutes données</span>
            )}
            {permissions.canEditAll && (
              <span className="text-blue-700">✅ Éditer tout</span>
            )}
            {permissions.canDeleteAll && (
              <span className="text-blue-700">✅ Supprimer tout</span>
            )}
            {!permissions.allPages && !permissions.canManageUsers && 
             !permissions.canViewAll && (
              <span className="text-gray-500">Accès limité</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCard;