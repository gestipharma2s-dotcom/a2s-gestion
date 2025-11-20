import { supabase } from './supabaseClient';
import { ROLE_PERMISSIONS } from '../utils/constants';

export const authService = {
  // Connexion avec authentification locale (sans Supabase Auth)
  async signIn(email, password) {
    try {
      // Vérifier le mot de passe localement
      const { data: verifyResult, error: verifyError } = await supabase
        .rpc('verify_user_password', {
          p_email: email.toLowerCase(),
          p_password: password
        });
      
      if (verifyError) {
        console.error('Erreur vérification mot de passe:', verifyError);
        throw new Error('Email ou mot de passe incorrect');
      }

      if (!verifyResult || verifyResult.length === 0) {
        console.warn('Utilisateur non trouvé:', email);
        throw new Error('Email ou mot de passe incorrect');
      }

      const userResult = verifyResult[0];

      // Vérifier que le mot de passe est valide
      if (!userResult.is_valid) {
        console.warn('Mot de passe incorrect pour:', email);
        throw new Error('Email ou mot de passe incorrect');
      }

      // Mettre à jour le dernier login (en arrière-plan, sans bloquer)
      try {
        await supabase.rpc('update_last_login', {
          p_email: email.toLowerCase()
        });
      } catch (err) {
        console.warn('Note: update_last_login échouée (non-bloquant):', err);
      }

      // Retourner l'utilisateur authentifié
      const profile = {
        id: userResult.user_id,
        email: userResult.email,
        nom: userResult.nom,
        role: userResult.role,
        pages_visibles: [] // À charger depuis la BDD
      };

      // Charger les pages visibles
      const { data: fullUser, error: userError } = await supabase
        .from('users')
        .select('pages_visibles')
        .eq('id', userResult.user_id)
        .single();

      if (!userError && fullUser) {
        profile.pages_visibles = fullUser.pages_visibles || [];
      }

      console.log('✅ Connexion réussie (authentification locale):', { email, role: profile.role });
      
      // 💾 Sauvegarder l'utilisateur dans le localStorage
      localStorage.setItem('currentUser', JSON.stringify(profile));
      
      return { user: { id: userResult.user_id }, profile };
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      throw error;
    }
  },

  // Déconnexion
  async signOut() {
    try {
      // Supprimer l'utilisateur du localStorage
      localStorage.removeItem('currentUser');
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      throw error;
    }
  },

  // Obtenir l'utilisateur actuel
  // ⚠️ On n'utilise PLUS Supabase Auth - cette fonction est appellée par AuthContext
  // mais on stocke l'utilisateur dans le localStorage après connexion
  async getCurrentUser() {
    try {
      // Récupérer l'utilisateur depuis le localStorage (stocké lors du login)
      const userJSON = localStorage.getItem('currentUser');
      if (!userJSON) {
        console.log('ℹ️ Pas d\'utilisateur en session');
        return null;
      }

      const user = JSON.parse(userJSON);
      console.log('✅ Utilisateur récupéré du localStorage:', user.email);
      return user;
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error);
      return null;
    }
  },

  // Vérifier si l'utilisateur a accès à une page
  hasPageAccess(userProfile, pageName) {
    if (!userProfile) return false;
    
    const role = userProfile.role || 'commercial';
    const permissions = ROLE_PERMISSIONS[role];
    
    if (!permissions) {
      console.warn(`Rôle inconnu: ${role}`);
      return false;
    }
    
    // Les super_admin et admin ont accès à tout
    if (permissions.allPages) return true;
    
    // Vérifier les pages visibles spécifiques
    const pagesVisibles = userProfile.pages_visibles || [];
    return pagesVisibles.includes(pageName);
  },

  // Vérifier les permissions de l'utilisateur
  hasPermission(userProfile, permission) {
    if (!userProfile) return false;
    
    const role = userProfile.role || 'commercial';
    const permissions = ROLE_PERMISSIONS[role];
    
    if (!permissions) {
      console.warn(`Rôle inconnu: ${role}`);
      return false;
    }
    
    return permissions[permission] === true;
  },

  // Vérifier si l'utilisateur peut gérer les utilisateurs
  canManageUsers(userProfile) {
    return this.hasPermission(userProfile, 'canManageUsers');
  },

  // Vérifier si l'utilisateur peut gérer les rôles
  canManageRoles(userProfile) {
    return this.hasPermission(userProfile, 'canManageRoles');
  },

  // Vérifier si l'utilisateur peut gérer les applications
  canManageApplications(userProfile) {
    return this.hasPermission(userProfile, 'canManageApplications');
  },

  // Vérifier si l'utilisateur peut voir toutes les données
  canViewAll(userProfile) {
    return this.hasPermission(userProfile, 'canViewAll');
  },

  // Vérifier si l'utilisateur peut éditer toutes les données
  canEditAll(userProfile) {
    return this.hasPermission(userProfile, 'canEditAll');
  },

  // Vérifier si l'utilisateur peut supprimer
  canDeleteAll(userProfile) {
    return this.hasPermission(userProfile, 'canDeleteAll');
  },

  // Obtenir les pages par défaut pour un rôle
  getDefaultPages(role) {
    const permissions = ROLE_PERMISSIONS[role];
    if (permissions?.allPages) {
      return [
        'dashboard',
        'prospects',
        'clients',
        'installations',
        'abonnements',
        'paiements',
        'support',
        'applications',
        'utilisateurs'
      ];
    }
    return permissions?.defaultPages || [];
  }
};