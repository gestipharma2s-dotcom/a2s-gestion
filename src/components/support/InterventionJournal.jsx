import React, { useState, useEffect } from 'react';
import { interventionService } from '../../services/interventionService';
import { formatDateTime, getStatutLabel } from '../../utils/helpers';
import { Calendar, User, Filter, Download, Edit2, Trash2 } from 'lucide-react';

const InterventionJournal = ({ onEdit, onDelete, onCloturer, onViewDetails }) => {
  const [interventions, setInterventions] = useState([]);
  const [filteredInterventions, setFilteredInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('all');
  const [filterTechnicien, setFilterTechnicien] = useState('all');

  useEffect(() => {
    loadInterventions();
  }, []);

  useEffect(() => {
    filterData();
  }, [interventions, filterDate, filterTechnicien]);

  const loadInterventions = async () => {
    try {
      const data = await interventionService.getAll();
      setInterventions(data);
    } catch (error) {
      console.error('Erreur chargement interventions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = [...interventions];

    // Filtre par date
    if (filterDate !== 'all') {
      const today = new Date();
      filtered = filtered.filter(i => {
        const date = new Date(i.date_intervention);
        if (filterDate === 'today') {
          return date.toDateString() === today.toDateString();
        } else if (filterDate === 'week') {
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return date >= weekAgo;
        } else if (filterDate === 'month') {
          return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
        }
        return true;
      });
    }

    // Filtre par technicien - comparer avec technicien.id ou technicien_id
    if (filterTechnicien !== 'all') {
      filtered = filtered.filter(i => {
        const techId = i.technicien?.id || i.technicien_id;
        return techId === filterTechnicien;
      });
    }

    setFilteredInterventions(filtered);
  };

  // Extraire les techniciens uniques avec leurs IDs
  const techniciens = [...new Map(
    interventions
      .filter(i => i.technicien)
      .map(i => [i.technicien.id, i.technicien])
  ).values()];

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-gray-500" />
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <User size={20} className="text-gray-500" />
            <select
              value={filterTechnicien}
              onChange={(e) => setFilterTechnicien(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Tous les techniciens</option>
              {techniciens.map((tech, index) => (
                <option key={index} value={tech.id}>{tech.nom}</option>
              ))}
            </select>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors ml-auto">
            <Download size={18} />
            Exporter
          </button>
        </div>
      </div>

      {/* Journal */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Journal des Interventions</h3>
        <div className="space-y-3">
          {filteredInterventions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Aucune intervention trouvée</p>
          ) : (
            filteredInterventions.map((intervention) => (
              <div
                key={intervention.id}
                className="border-l-4 border-primary bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 cursor-pointer" onClick={() => onViewDetails && onViewDetails(intervention)}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        intervention.statut === 'cloturee' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {getStatutLabel(intervention.statut)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(intervention.date_intervention)}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-800">
                      {intervention.client?.raison_sociale}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{intervention.resume_probleme}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{intervention.technicien?.nom}</p>
                      <p className="text-xs text-gray-500">{intervention.duree} min</p>
                    </div>
                    <div className="flex gap-2">
                      {intervention.statut === 'en_cours' && onCloturer && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCloturer(intervention);
                          }}
                          className="p-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold text-xs"
                          title="Clôturer"
                        >
                          ✓
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(intervention);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit2 size={18} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(intervention.id);
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {intervention.action_entreprise && (
                  <div className="mt-2 bg-white rounded p-2">
                    <p className="text-xs text-gray-500 mb-1">Action:</p>
                    <p className="text-sm text-gray-700">{intervention.action_entreprise}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default InterventionJournal;