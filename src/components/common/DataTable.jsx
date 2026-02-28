import React from 'react';
import { Eye, Edit2, Trash2, Plus } from 'lucide-react';
import Button from './Button';

/**
 * Composant DataTable générique pour afficher les données en tableau
 * Accepte une configuration flexible des colonnes et des actions
 */
const DataTable = ({
  data = [],
  columns = [],
  actions = [],
  loading = false,
  emptyMessage = 'Aucune donnée trouvée',
  onAdd = null,
  addButtonLabel = 'Ajouter',
  title = 'Tableau de Données',
  rowClassName = null,
  rowStyle = null
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-600">{emptyMessage}</p>
        {onAdd && (
          <Button
            onClick={onAdd}
            className="mt-4 bg-primary hover:bg-primary-dark text-white flex items-center gap-2 mx-auto"
          >
            <Plus size={18} />
            {addButtonLabel}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-600"
                  style={{ width: col.width || 'auto' }}
                >
                  {col.label}
                </th>
              ))}
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row, idx) => {
              const customClass = typeof rowClassName === 'function' ? rowClassName(row) : rowClassName || '';
              const customStyle = typeof rowStyle === 'function' ? rowStyle(row) : rowStyle || {};
              return (
                <tr
                  key={row.id || idx}
                  className={`hover:bg-gray-50 transition-colors ${customClass}`}
                  style={customStyle}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-6 py-4 text-sm ${col.className || 'text-gray-600'}`}
                    >
                      {col.render ? col.render(row) : String(row[col.key] || '-')}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-center">
                    <div className="flex gap-2 justify-center flex-wrap">
                      {actions.map((action) => {
                        // Vérifier si le bouton doit être affiché selon la condition
                        if (action.condition && !action.condition(row)) {
                          return null;
                        }

                        // Évaluer disabled et title dynamiquement par ligne
                        const isDisabled = typeof action.disabled === 'function'
                          ? action.disabled(row)
                          : action.disabled || false;

                        const buttonTitle = typeof action.title === 'function'
                          ? action.title(row)
                          : action.title || action.label;

                        const buttonClassName = typeof action.className === 'function'
                          ? action.className(row)
                          : action.className || 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2';

                        return (
                          <Button
                            key={action.key}
                            onClick={() => action.onClick(row)}
                            disabled={isDisabled}
                            className={buttonClassName}
                            title={buttonTitle}
                          >
                            {action.icon ? action.icon : action.label}
                          </Button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
};

export default DataTable;
