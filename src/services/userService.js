import { supabase } from './supabaseClient';
import { TABLES } from './supabaseClient';
import { authService } from './authService';
import { ROLES } from '../utils/constants';

export const userService = {
  // ============================================
  // VÉRIFICATION DES PERMISSIONS
  // ============================================

  // Vérifier si l'utilisateur peut créer un utilisateur
  async canCreate(currentUserProfile) {
    return authService.canManageUsers(currentUserProfile);
  },

  // Vérifier si l'utilisateur peut modifier un utilisateur
  async canUpdate(currentUserProfile, targetUserId) {
    if (!authService.canManageUsers(currentUserProfile)) {
      return false;
    }
    
    // Un admin ne peut pas modifier un super_admin
    if (currentUserProfile?.role === 'admin') {
      try {
        const targetUser = await this.getById(targetUserId);
        if (targetUser?.role === 'super_admin') {
          return false;
        }
      } catch (error) {
        console.error('Erreur vérification permission update:', error);
        return false;
      }
    }
    
    return true;
  },

  // Vérifier si l'utilisateur peut supprimer un utilisateur
  async canDelete(currentUserProfile, targetUserId) {
    if (!authService.canManageUsers(currentUserProfile)) {
      return false;
    }
    
    // Récupérer l'utilisateur cible
    try {
      const targetUser = await this.getById(targetUserId);
      
      // Seul un super_admin peut supprimer un super_admin
      if (targetUser?.role === 'super_admin') {
        return currentUserProfile?.role === 'super_admin';
      }
      
      // Un admin peut supprimer n'importe qui sauf un super_admin
      return true;
    } catch (error) {
      console.error('Erreur vérification permission delete:', error);
      return false;
    }
  },

  // ============================================
  // OPÉRATIONS CRUD
  // ============================================

  // Récupérer tous les utilisateurs
  async getAll() {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .order('nom', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur récupération utilisateurs:', error);
      throw error;
    }
  },

  // Récupérer un utilisateur par ID
  async getById(id) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error);
      throw error;
    }
  },

  // Récupérer les utilisateurs par rôle
  async getByRole(role) {
    try {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('role', role)
        .order('nom', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur récupération utilisateurs par rôle:', error);
      throw error;
    }
  },

  // Récupérer les commerciaux
  async getCommerciaux() {
    return this.getByRole('commercial');
  },

  // Récupérer les techniciens
  async getTechniciens() {
    return this.getByRole('technicien');
  },

  // Créer un utilisateur
  async create(userData, currentUserProfile) {
    try {
      // Vérifier les permissions
      if (!await this.canCreate(currentUserProfile)) {
        const error = new Error('Vous n\'avez pas la permission de créer des utilisateurs');
        error.code = 'PERMISSION_DENIED';
        throw error;
      }

      // ✅ Vérifier que l'email n'existe pas déjà
      const { data: existingUser, error: checkError } = await supabase
        .from(TABLES.USERS)
        .select('id, email')
        .ilike('email', userData.email);
      
      if (existingUser && existingUser.length > 0) {
        const error = new Error(`Un utilisateur avec l'email ${userData.email} existe déjà`);
        error.code = 'DUPLICATE_EMAIL';
        throw error;
      }

      // Valider que le rôle est un rôle valide
      const validRoles = Object.values(ROLES);
      const trimmedRole = userData.role?.trim().toLowerCase();
      
      if (!trimmedRole || !validRoles.includes(trimmedRole)) {
        const error = new Error(`Rôle invalide: "${userData.role}". Rôles valides: ${validRoles.join(', ')}`);
        error.code = 'INVALID_ROLE';
        throw error;
      }
      
      // Utiliser le rôle nettoyé et validé
      userData.role = trimmedRole;

      // 🔐 Créer l'utilisateur avec authentification locale via la fonction SQL
      // IMPORTANT: Cette nouvelle approche ne passe plus par Supabase Auth
      // On utilise la fonction create_user_local() qui gère tout
      
      let userId = null;
      let createdUser = null;

      try {
        console.log(`🔐 Création d'utilisateur locale avec email: ${userData.email}`);
        
        // Appeler la fonction SQL create_user_local()
        const { data: createResult, error: createError } = await supabase
          .rpc('create_user_local', {
            p_email: userData.email,
            p_password: userData.password,
            p_nom: userData.nom,
            p_role: userData.role,
            p_pages_visibles: Array.isArray(userData.pages_visibles) ? userData.pages_visibles : []
          });
        
        if (createError) {
          console.error('❌ Erreur création authentification locale:', createError);
          if (createError.message?.includes('duplicate') || createError.message?.includes('existe')) {
            const error = new Error(`Un utilisateur avec l'email ${userData.email} existe déjà`);
            error.code = 'DUPLICATE_EMAIL';
            throw error;
          }
          throw createError;
        }

        // Le résultat contient: user_id, email, nom, role, message
        if (createResult && createResult.length > 0) {
          const result = createResult[0];
          userId = result.user_id;
          createdUser = {
            id: result.user_id,
            email: result.email,
            nom: result.nom,
            role: result.role,
            pages_visibles: Array.isArray(userData.pages_visibles) ? userData.pages_visibles : []
          };
          
          console.log('✅ Utilisateur créé avec authentification locale:', { 
            userId, 
            email: userData.email,
            nom: userData.nom,
            role: userData.role 
          });
          
          return createdUser;
        } else {
          throw new Error('Impossible de créer l\'utilisateur - pas de réponse du serveur');
        }
      } catch (error) {
        console.error('❌ Erreur création utilisateur:', error);
        throw error;
      }
    } catch (error) {
      console.error('❌ Erreur création utilisateur:', error);
      throw error;
    }
  },

  // Mettre à jour un utilisateur
  async update(id, userData, currentUserProfile) {
    try {
      // Vérifier les permissions
      const canUpdate = await this.canUpdate(currentUserProfile, id);
      if (!canUpdate) {
        const error = new Error('Vous n\'avez pas la permission de modifier cet utilisateur');
        error.code = 'PERMISSION_DENIED';
        throw error;
      }

      // Préparer les données à mettre à jour
      // ⚠️ NE mettre à jour QUE les champs essentiels
      const dataToUpdate = {};
      
      // Ajouter uniquement les champs qui doivent être modifiés
      if (userData.nom) dataToUpdate.nom = userData.nom;
      if (userData.email) dataToUpdate.email = userData.email;
      
      // Gérer le rôle
      if (userData.role) {
        const trimmedRole = userData.role.trim().toLowerCase();
        const validRoles = Object.values(ROLES);
        
        if (!validRoles.includes(trimmedRole)) {
          const error = new Error(`Rôle invalide: "${userData.role}". Rôles valides: ${validRoles.join(', ')}`);
          error.code = 'INVALID_ROLE';
          throw error;
        }
        dataToUpdate.role = trimmedRole;
      }
      
      // Gérer pages_visibles - s'assurer que c'est un tableau
      if (userData.pages_visibles) {
        if (Array.isArray(userData.pages_visibles)) {
          dataToUpdate.pages_visibles = userData.pages_visibles;
        } else if (typeof userData.pages_visibles === 'object') {
          // Si c'est un objet, extraire les clés où la valeur est true
          dataToUpdate.pages_visibles = Object.keys(userData.pages_visibles).filter(
            key => userData.pages_visibles[key] === true
          );
        }
      }
      
      console.log('dataToUpdate final:', JSON.stringify(dataToUpdate, null, 2));

      // Mettre à jour le profil utilisateur
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Erreur détaillée Supabase:', error);
        console.error('Données envoyées:', dataToUpdate);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Erreur mise à jour utilisateur:', error);
      throw error;
    }
  },

  // Supprimer un utilisateur
  async delete(id, currentUserProfile) {
    try {
      // Vérifier les permissions
      const canDelete = await this.canDelete(currentUserProfile, id);
      if (!canDelete) {
        const error = new Error('Vous n\'avez pas la permission de supprimer cet utilisateur');
        error.code = 'PERMISSION_DENIED';
        throw error;
      }

      // ✅ VÉRIFIER LES RÉFÉRENCES avant suppression
      const referencesFound = await this.checkUserReferences(id);
      
      if (referencesFound.hasReferences) {
        const error = new Error(
          `❌ Impossible de supprimer cet utilisateur.\n\n` +
          `L'utilisateur est lié à:\n` +
          `${referencesFound.details.join('\n')}\n\n` +
          `Supprimez d'abord ces enregistrements ou contactez un administrateur.`
        );
        error.code = 'USER_HAS_REFERENCES';
        error.details = referencesFound.details;
        throw error;
      }

      // 1️⃣ Supprimer l'utilisateur de la table users (PostgreSQL)
      const { error: deleteUserError } = await supabase
        .from(TABLES.USERS)
        .delete()
        .eq('id', id);
      
      if (deleteUserError) {
        console.error('Erreur suppression table users:', deleteUserError);
        throw deleteUserError;
      }

      // 2️⃣ Supprimer l'authentification locale (la cascade ON DELETE CASCADE de la FK devrait faire ça)
      // Mais on peut aussi le faire explicitement si nécessaire:
      try {
        // On n'a pas besoin de supprimer de users_auth explicitement 
        // car la FK a ON DELETE CASCADE
        console.log('✅ Authentification locale supprimée (cascade FK)');
      } catch (localAuthError) {
        console.warn('Note: Authentification locale déjà supprimée ou inexistante');
      }

      console.log('✅ Utilisateur supprimé avec succès (BDD + authentification locale)');
      return true;
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error);
      throw error;
    }
  },

  // ✅ Vérifier si l'utilisateur est référencé quelque part
  async checkUserReferences(userId) {
    try {
      const details = [];
      let hasReferences = false;

      // 1. Vérifier les interventions (technicien_id)
      const { data: interventions, error: err1 } = await supabase
        .from(TABLES.INTERVENTIONS)
        .select('id', { count: 'exact', head: false })
        .eq('technicien_id', userId)
        .limit(5);
      
      if (!err1 && interventions?.length > 0) {
        hasReferences = true;
        details.push(`• ${interventions.length} intervention(s) assignée(s)`);
      }

      return { hasReferences, details };
    } catch (error) {
      console.error('Erreur vérification références utilisateur:', error);
      // En cas d'erreur, laisser continuer mais avec précaution
      return { hasReferences: false, details: [] };
    }
  }
};