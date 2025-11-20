import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      if (userData) {
        setUser(userData.user);
        setProfile(userData.profile);
      }
    } catch (error) {
      console.error('Erreur vérification utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      const { user, profile } = await authService.signIn(email, password);
      setUser(user);
      setProfile(profile);
      console.log('✅ Connexion réussie:', { email, role: profile?.role });
      return { user, profile };
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      // Nettoyer les données en cas d'erreur
      setUser(null);
      setProfile(null);
      throw error;
    }
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setProfile(null);
  };

  const hasAccess = (pageName) => {
    return authService.hasPageAccess(profile, pageName);
  };

  const canManageUsers = () => {
    return authService.canManageUsers(profile);
  };

  const canManageRoles = () => {
    return authService.canManageRoles(profile);
  };

  const canManageApplications = () => {
    return authService.canManageApplications(profile);
  };

  const canViewAll = () => {
    return authService.canViewAll(profile);
  };

  const canEditAll = () => {
    return authService.canEditAll(profile);
  };

  const canDeleteAll = () => {
    return authService.canDeleteAll(profile);
  };

  const hasPermission = (permission) => {
    return authService.hasPermission(profile, permission);
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    hasAccess,
    canManageUsers,
    canManageRoles,
    canManageApplications,
    canViewAll,
    canEditAll,
    canDeleteAll,
    hasPermission,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};