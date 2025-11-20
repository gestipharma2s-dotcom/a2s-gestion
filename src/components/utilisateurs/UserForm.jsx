import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Button from '../common/Button';
import { validators } from '../../utils/validators';
import { PAGES, ROLE_PERMISSIONS } from '../../utils/constants';

const UserForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    password: '',
    role: 'commercial',
    pages_visibles: []
  });
  const [errors, setErrors] = useState({});

  const availablePages = [
    { value: PAGES.DASHBOARD, label: 'Tableau de Bord' },
    { value: PAGES.PROSPECTS, label: 'Prospects' },
    { value: PAGES.CLIENTS, label: 'Clients' },
    { value: PAGES.INSTALLATIONS, label: 'Installations' },
    { value: PAGES.ABONNEMENTS, label: 'Abonnements' },
    { value: PAGES.PAIEMENTS, label: 'Paiements' },
    { value: PAGES.SUPPORT, label: 'Support' },
    { value: PAGES.ALERTES, label: 'Alertes' },
    { value: PAGES.APPLICATIONS, label: 'Applications' },
    { value: PAGES.UTILISATEURS, label: 'Utilisateurs' }
  ];

  const roleOptions = [
    { value: 'super_admin', label: '👑 Super Administrateur' },
    { value: 'admin', label: '🔐 Administrateur' },
    { value: 'technicien', label: '🔧 Technicien' },
    { value: 'commercial', label: '💼 Commercial' },
    { value: 'support', label: '🎧 Support' }
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || '',
        email: user.email || '',
        password: '',
        role: user.role || 'commercial',
        pages_visibles: user.pages_visibles || []
      });
    }
  }, [user]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Si c'est le changement de rôle et que c'est un rôle avec accès complet,
    // appliquer les pages par défaut
    if (field === 'role' && ROLE_PERMISSIONS[value]?.allPages) {
      setFormData(prev => ({
        ...prev,
        pages_visibles: []
      }));
    }
  };

  const handlePageToggle = (pageName) => {
    setFormData(prev => {
      const pages = [...prev.pages_visibles];
      const index = pages.indexOf(pageName);
      
      if (index > -1) {
        pages.splice(index, 1);
      } else {
        pages.push(pageName);
      }
      
      return { ...prev, pages_visibles: pages };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Ne valider le mot de passe que lors de la création
    if (!user) {
      const validation = validators.validateUser(formData);
      if (!validation.isValid) {
        setErrors(validation.errors);
        return;
      }
      onSubmit(formData);
    } else {
      // En mode édition, ne pas envoyer le mot de passe
      // (les utilisateurs changeront leur mot de passe via email ou un formulaire sécurisé)
      const dataToSubmit = { ...formData };
      delete dataToSubmit.password; // Toujours supprimer le password en édition
      onSubmit(dataToSubmit);
    }
  };

  const currentRolePermissions = ROLE_PERMISSIONS[formData.role];
  const isAdminRole = formData.role === 'super_admin' || formData.role === 'admin';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nom Complet"
        value={formData.nom}
        onChange={(e) => handleChange('nom', e.target.value)}
        error={errors.nom}
        required
      />

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        error={errors.email}
        required
      />

      <Input
        label={user ? 'Nouveau Mot de Passe (laisser vide pour ne pas changer)' : 'Mot de Passe'}
        type="password"
        value={formData.password}
        onChange={(e) => handleChange('password', e.target.value)}
        error={errors.password}
        required={!user}
      />

      <Select
        label="Rôle"
        value={formData.role}
        onChange={(e) => handleChange('role', e.target.value)}
        options={roleOptions}
        required
      />

      {/* Afficher les permissions du rôle sélectionné */}
      {currentRolePermissions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm font-semibold text-blue-900 mb-2">📋 Permissions du rôle:</p>
          <ul className="text-xs text-blue-800 space-y-1">
            {currentRolePermissions.canManageUsers && <li>✅ Gestion des utilisateurs</li>}
            {currentRolePermissions.canManageRoles && <li>✅ Gestion des rôles</li>}
            {currentRolePermissions.canManageApplications && <li>✅ Gestion des applications</li>}
            {currentRolePermissions.canViewAll && <li>✅ Voir toutes les données</li>}
            {currentRolePermissions.canEditAll && <li>✅ Éditer toutes les données</li>}
            {currentRolePermissions.canDeleteAll && <li>✅ Supprimer toutes les données</li>}
            {currentRolePermissions.allPages && <li>✅ Accès à toutes les pages</li>}
          </ul>
        </div>
      )}

      {/* Pages Visibles - seulement pour les rôles non-admin */}
      {!isAdminRole && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Pages Accessibles
          </label>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto border border-gray-200">
            {availablePages.map((page) => (
              <label key={page.value} className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={formData.pages_visibles.includes(page.value)}
                  onChange={() => handlePageToggle(page.value)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">{page.label}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Sélectionnez au minimum une page pour ce rôle
          </p>
        </div>
      )}

      {isAdminRole && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800">
            ⚠️ <strong>Accès complet:</strong> Les administrateurs ont automatiquement accès à toutes les pages et toutes les fonctionnalités.
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" variant="primary">
          {user ? 'Modifier' : 'Créer'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;