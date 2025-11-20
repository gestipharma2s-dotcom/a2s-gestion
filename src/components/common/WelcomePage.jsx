import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2, Heart } from 'lucide-react';

const WelcomePage = () => {
  const { profile } = useAuth();

  const getRoleLabel = (role) => {
    const roleLabels = {
      super_admin: '👑 Super Administrateur',
      admin: '🔐 Administrateur',
      technicien: '🔧 Technicien',
      commercial: '💼 Commercial',
      support: '🎧 Support'
    };
    return roleLabels[role] || role;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      {/* En-tête avec logo */}
      <div className="mb-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Building2 className="w-12 h-12 text-indigo-600" />
          <h1 className="text-4xl font-bold text-indigo-900">SARL A2S</h1>
        </div>
        <p className="text-indigo-600 text-sm tracking-widest">Gestion d'Entreprise</p>
      </div>

      {/* Carte de bienvenue */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        {/* Message de bienvenue */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Bienvenue! 👋
          </h2>
          <p className="text-xl text-indigo-600 font-semibold">
            {profile?.nom || 'Utilisateur'}
          </p>
        </div>

        {/* Rôle */}
        <div className="bg-indigo-50 rounded-lg p-4 mb-6">
          <p className="text-gray-600 text-sm mb-1">Votre Rôle:</p>
          <p className="text-lg font-semibold text-indigo-600">
            {getRoleLabel(profile?.role)}
          </p>
        </div>

        {/* Pages accessibles */}
        {profile?.pages_visibles && profile.pages_visibles.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-600 text-sm mb-3">Pages Accessibles:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {profile.pages_visibles.map((page, index) => (
                <span
                  key={index}
                  className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full"
                >
                  {page.charAt(0).toUpperCase() + page.slice(1)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Message personnalisé selon le rôle */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            {profile?.role === 'technicien' && 
              "🔧 Accédez à vos interventions et installations depuis le menu"}
            {profile?.role === 'commercial' && 
              "💼 Gérez vos prospects et clients depuis le menu"}
            {profile?.role === 'support' && 
              "🎧 Consultez et répondez aux tickets de support"}
            {!['technicien', 'commercial', 'support'].includes(profile?.role) && 
              "📊 Consultez le menu latéral pour accéder à toutes les fonctionnalités"}
          </p>
        </div>

        {/* Info */}
        <div className="text-gray-500 text-xs flex items-center justify-center gap-1">
          <Heart className="w-3 h-3" />
          <span>Connecté au système de gestion A2S</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-600 text-sm">
        <p>© 2025 SARL A2S - Tous droits réservés</p>
      </div>
    </div>
  );
};

export default WelcomePage;
