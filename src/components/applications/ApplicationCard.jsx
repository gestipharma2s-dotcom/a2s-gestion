import React from 'react';
import { Edit2, Trash2, Package } from 'lucide-react';
import { formatMontant } from '../../utils/helpers';

const ApplicationCard = ({ application, onEdit, onDelete }) => {
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
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(application.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Description */}
      {application.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {application.description}
        </p>
      )}

      {/* Prix */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 mt-auto">
        <p className="text-sm text-purple-600 mb-1">Prix</p>
        <p className="text-2xl font-bold text-purple-700">
          {formatMontant(application.prix)}
        </p>
      </div>
    </div>
  );
};

export default ApplicationCard;