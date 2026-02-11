import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabaseClient';

const InstallationJournal = ({ prospectId }) => {
  const [installations, setInstallations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    loadData();
  }, [prospectId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const usersData = await userService.getAll();
      setUsers(usersData || []);

      let query = supabase
        .from('prospect_history')
        .select(`
          *,
          prospect:prospects (
            raison_sociale,
            secteur,
            wilaya
          )
        `)
        .eq('type_action', 'installation')
        .order('date_debut', { ascending: false });

      if (prospectId) {
        query = query.eq('prospect_id', prospectId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setInstallations(data || []);
    } catch (error) {
      console.error('Erreur chargement journal installations:', error);
      setInstallations([]);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId) => {
    if (!userId) return '-';
    const user = users.find(u => u.id === userId);
    return user ? user.nom : 'Utilisateur inconnu';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (installations.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-12 text-center border border-gray-200">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-xl font-medium text-gray-600">Aucune installation planifiée</p>
        <p className="text-gray-500 mt-2">Les installations apparaîtront ici une fois créées depuis le formulaire d'action des prospects.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-gray-800">
          {prospectId ? 'Historique des Installations du Prospect' : 'Journal Global de Planification'}
        </h3>
        <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
          {installations.length} INSTALLATION{installations.length > 1 ? 'S' : ''}
        </span>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Prospect</th>
              <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Secteur</th>
              <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Wilaya</th>
              <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Application</th>
              <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Début</th>
              <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Fin</th>
              <th className="px-5 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Conversion</th>
              <th className="px-5 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider border-b">Chef de Mission</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {installations.map((action) => (
              <tr key={action.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="text-sm font-extrabold text-blue-900 uppercase">
                    {action.prospect?.raison_sociale || 'N/A'}
                  </div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                  {action.prospect?.secteur || '-'}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600 font-medium font-mono text-xs">
                  {action.prospect?.wilaya || '-'}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-md text-xs font-bold border border-indigo-200 uppercase">
                    {action.application || '-'}
                  </span>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                  {action.date_debut ? formatDate(action.date_debut) : '-'}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                  {action.date_fin ? formatDate(action.date_fin) : '-'}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${action.conversion === 'oui'
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-red-100 text-red-700 border border-red-300'
                    }`}>
                    {action.conversion === 'oui' ? 'OUI' : 'NON'}
                  </span>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[10px] font-black text-gray-600 border border-gray-300 shadow-sm">
                      {getUserName(action.chef_mission).substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-700 font-bold">{getUserName(action.chef_mission)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstallationJournal;
