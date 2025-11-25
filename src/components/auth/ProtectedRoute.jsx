import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle } from 'lucide-react';

const ProtectedRoute = ({ children, requiredPage }) => {
  const { isAuthenticated, loading, hasAccess, profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Vérifier l'accès à la page
  if (requiredPage && !hasAccess(requiredPage)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full text-center bg-white rounded-lg shadow p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">🔒 Accès Refusé</h2>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas accès à cette page. 
          </p>
          <p className="text-sm text-gray-500 mb-6">
            <strong>Rôle actuel:</strong> {profile?.role || 'Non défini'}
          </p>
          <p className="text-xs text-gray-400 mb-6">
            Demandez à un administrateur pour accorder l'accès à cette page.
          </p>
          <a 
            href="/" 
            className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Retour au Tableau de Bord
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;