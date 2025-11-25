import React, { useState, useEffect } from 'react';
import { Search, Calendar, User, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';

const FilterBar = ({ 
  onSearchChange, 
  onDateStartChange, 
  onDateEndChange,
  onCreatorChange,
  searchValue = '',
  dateStart = '',
  dateEnd = '',
  creatorId = ''
}) => {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [localCreatorId, setLocalCreatorId] = useState(creatorId);
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  // Charger la liste des utilisateurs pour le filtre (pour tous les utilisateurs)
  useEffect(() => {
    loadUsers();
  }, []);

  // Synchroniser le state local avec la prop quand elle change
  useEffect(() => {
    setLocalCreatorId(creatorId);
  }, [creatorId]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const allUsers = await userService.getAll();
      setUsers(allUsers || []);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleClearFilters = () => {
    onSearchChange('');
    onDateStartChange('');
    onDateEndChange('');
    onCreatorChange('');
  };

  const hasActiveFilters = searchValue || dateStart || dateEnd || creatorId;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recherche générale */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtre date de début */}
        <div className="relative">
          <Calendar size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="date"
            value={dateStart}
            onChange={(e) => onDateStartChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtre date de fin */}
        <div className="relative">
          <Calendar size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="date"
            value={dateEnd}
            onChange={(e) => onDateEndChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtre utilisateur (pour tous les utilisateurs) */}
        <div className="relative">
          <User size={18} className="absolute left-3 top-3 text-gray-400" />
          <select
            value={localCreatorId || ''}
            onChange={(e) => {
              const newValue = e.target.value;
              console.log(`👤 Sélection créateur dans FilterBar: ${newValue}`);
              setLocalCreatorId(newValue);
              onCreatorChange(newValue);
            }}
            disabled={loadingUsers || users.length === 0}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            title={users.length === 0 ? `Chargement des utilisateurs (${users.length})` : ''}
          >
            <option value="">{loadingUsers ? 'Chargement...' : `Tous les créateurs (${users.length})`}</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.nom || user.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bouton Effacer les filtres */}
      {hasActiveFilters && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={16} />
            Effacer les filtres
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
