import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import { useAuth } from './context/AuthContext';
import { autoRenewalService } from './services/autoRenewalService';

const AppRoutes = () => {
  const { isAuthenticated, loading, profile } = useAuth();

  // 📋 Afficher les permissions dans la console
  React.useEffect(() => {
    if (profile) {
      console.log('👤 Utilisateur connecté:', {
        id: profile.id,
        nom: profile.nom,
        email: profile.email,
        role: profile.role,
        pages_visibles: profile.pages_visibles,
      });
    }
  }, [profile]);

  // ✅ NOUVEAU: Démarrer le service de renouvellement automatique des installations
  React.useEffect(() => {
    if (isAuthenticated) {
      // Vérifier et renouveler les installations toutes les 4 heures (14400000ms)
      autoRenewalService.startAutoRenewal(14400000);
      
      return () => {
        autoRenewalService.stopAutoRenewal();
      };
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;