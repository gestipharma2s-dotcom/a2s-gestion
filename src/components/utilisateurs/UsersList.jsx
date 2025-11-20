import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, User, Shield, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import UserForm from './UserForm';
import UserCard from './UserCard';
import { userService } from '../../services/userService';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { ROLE_PERMISSIONS } from '../../utils/constants';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const { addNotification } = useApp();
  const { canManageUsers, profile } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur lors du chargement des utilisateurs'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (filterRole !== 'all') {
      filtered = filtered.filter(u => u.role === filterRole);
    }

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const handleCreate = () => {
    if (!canManageUsers()) {
      addNotification({
        type: 'error',
        message: '🔒 Vous n\'avez pas la permission de créer des utilisateurs'
      });
      return;
    }

    setSelectedUser(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (user) => {
    if (!canManageUsers()) {
      addNotification({
        type: 'error',
        message: '🔒 Vous n\'avez pas la permission de modifier des utilisateurs'
      });
      return;
    }

    setSelectedUser(user);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (!canManageUsers()) {
      addNotification({
        type: 'error',
        message: '🔒 Vous n\'avez pas la permission de supprimer des utilisateurs'
      });
      return;
    }

    const userToDelete = users.find(u => u.id === userId);
    
    // Empêcher la suppression d'un super_admin par un admin
    if (userToDelete?.role === 'super_admin' && profile?.role !== 'super_admin') {
      addNotification({
        type: 'error',
        message: '🔒 Seul un Super Admin peut supprimer un autre Super Admin'
      });
      return;
    }

    const confirmMessage = `⚠️ ATTENTION ⚠️

Êtes-vous absolument sûr de vouloir supprimer cet utilisateur ?

${userToDelete?.nom}
${userToDelete?.email}

Cette action est IRRÉVERSIBLE !`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    const finalConfirm = window.prompt(
      'Pour confirmer la suppression, tapez "SUPPRIMER" en majuscules:'
    );

    if (finalConfirm !== 'SUPPRIMER') {
      addNotification({
        type: 'info',
        message: 'Suppression annulée'
      });
      return;
    }

    try {
      await userService.delete(userId, profile);
      addNotification({
        type: 'success',
        message: 'Utilisateur supprimé avec succès'
      });
      loadUsers();
    } catch (error) {
      if (error.code === 'PERMISSION_DENIED') {
        addNotification({
          type: 'error',
          message: '🔒 ' + error.message
        });
      } else if (error.code === 'USER_HAS_REFERENCES') {
        // Afficher les références trouvées
        addNotification({
          type: 'error',
          title: '❌ Impossible de supprimer cet utilisateur',
          message: error.message,
          duration: 10000 // Garder plus longtemps
        });
      } else {
        addNotification({
          type: 'error',
          message: error.message || 'Erreur lors de la suppression'
        });
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (modalMode === 'create') {
        const newUser = await userService.create(formData, profile);
        
        // Vérifier si Auth a échoué
        if (newUser?._authCreationFailed) {
          addNotification({
            type: 'warning',
            title: '⚠️ Utilisateur créé partiellement',
            message: newUser._message || 'Utilisateur créé en BDD mais Auth rate limitée. L\'utilisateur pourra se connecter normalement.',
            duration: 8000
          });
        } else {
          addNotification({
            type: 'success',
            message: 'Utilisateur créé avec succès'
          });
        }
      } else {
        await userService.update(selectedUser.id, formData, profile);
        addNotification({
          type: 'success',
          message: 'Utilisateur modifié avec succès'
        });
      }
      setShowModal(false);
      loadUsers();
    } catch (error) {
      if (error.code === 'PERMISSION_DENIED') {
        addNotification({
          type: 'error',
          message: '🔒 ' + error.message
        });
      } else if (error.code === 'DUPLICATE_EMAIL') {
        addNotification({
          type: 'error',
          title: '⚠️ Email déjà utilisé',
          message: error.message,
          duration: 6000
        });
      } else if (error.code === 'INVALID_ROLE') {
        addNotification({
          type: 'error',
          title: '❌ Rôle invalide',
          message: error.message,
          duration: 6000
        });
      } else if (error.message?.includes('rate limit')) {
        addNotification({
          type: 'warning',
          title: '⏳ Trop de requêtes',
          message: 'Supabase Auth a atteint sa limite. L\'utilisateur a été créé en BDD et pourra se connecter.',
          duration: 10000
        });
      } else if (error.message?.includes('password')) {
        addNotification({
          type: 'error',
          title: '🔐 Mot de passe trop faible',
          message: 'Le mot de passe doit contenir au moins 6 caractères.',
          duration: 6000
        });
      } else {
        addNotification({
          type: 'error',
          message: error.message || 'Erreur lors de l\'enregistrement'
        });
      }
    }
  };

  const stats = {
    total: users.length,
    superAdmin: users.filter(u => u.role === 'super_admin').length,
    admin: users.filter(u => u.role === 'admin').length,
    technicien: users.filter(u => u.role === 'technicien').length,
    commercial: users.filter(u => u.role === 'commercial').length,
    support: users.filter(u => u.role === 'support').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Gestion des Utilisateurs</h2>
            <p className="text-white opacity-90">
              {users.length} utilisateur(s) enregistré(s)
            </p>
          </div>
          <Shield size={64} className="opacity-50" />
        </div>
      </div>

      {/* Avertissement si pas de permissions */}
      {!canManageUsers() && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="text-amber-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-amber-900">⚠️ Accès Limité</p>
            <p className="text-sm text-amber-800">
              Vous n'avez pas les permissions pour gérer les utilisateurs. Seuls les administrateurs peuvent créer, modifier ou supprimer des utilisateurs.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-sm opacity-90 mb-1">Total</p>
          <h3 className="text-3xl font-bold">{stats.total}</h3>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <p className="text-sm opacity-90 mb-1">Super Admin</p>
          <h3 className="text-3xl font-bold">{stats.superAdmin}</h3>
        </div>
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <p className="text-sm opacity-90 mb-1">Admin</p>
          <h3 className="text-3xl font-bold">{stats.admin}</h3>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90 mb-1">Techniciens</p>
          <h3 className="text-3xl font-bold">{stats.technicien}</h3>
        </div>
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-sm opacity-90 mb-1">Commerciaux</p>
          <h3 className="text-3xl font-bold">{stats.commercial}</h3>
        </div>
        <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <p className="text-sm opacity-90 mb-1">Support</p>
          <h3 className="text-3xl font-bold">{stats.support}</h3>
        </div>
      </div>

      {/* Filtres */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Rechercher un utilisateur..."
            />
          </div>
          <Button 
            variant="primary" 
            icon={Plus} 
            onClick={handleCreate}
            disabled={!canManageUsers()}
            title={!canManageUsers() ? 'Vous n\'avez pas la permission de créer des utilisateurs' : ''}
          >
            Ajouter Utilisateur
          </Button>
        </div>
        <div className="flex gap-2 mt-4 flex-wrap">
          <button
            onClick={() => setFilterRole('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterRole === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilterRole('super_admin')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterRole === 'super_admin'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Super Admin
          </button>
          <button
            onClick={() => setFilterRole('admin')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterRole === 'admin'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => setFilterRole('technicien')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterRole === 'technicien'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Technicien
          </button>
          <button
            onClick={() => setFilterRole('commercial')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterRole === 'commercial'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Commercial
          </button>
          <button
            onClick={() => setFilterRole('support')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterRole === 'support'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Support
          </button>
        </div>
      </div>

      {/* Liste */}
      {filteredUsers.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canManage={canManageUsers()}
            />
          ))}
        </div>
      )}

      {/* Modal Formulaire */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'create' ? 'Nouvel Utilisateur' : 'Modifier Utilisateur'}
      >
        <UserForm
          user={selectedUser}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};

export default UsersList;