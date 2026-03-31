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

      // ✅ Vérifier si l'utilisateur a créé des pièces
      // Vérifier les prospects
      const { count: prospectCount } = await supabase
        .from(TABLES.PROSPECTS)
        .select('id', { count: 'exact', head: true })
        .eq('created_by', targetUserId);

      if (prospectCount > 0) {
        return false; // Ne pas supprimer s'il y a des prospects créés
      }

      // Vérifier les installations
      const { count: installationCount } = await supabase
        .from(TABLES.INSTALLATIONS)
        .select('id', { count: 'exact', head: true })
        .eq('created_by', targetUserId);

      if (installationCount > 0) {
        return false; // Ne pas supprimer s'il y a des installations créées
      }

      // Vérifier les paiements
      const { count: paiementCount } = await supabase
        .from(TABLES.PAIEMENTS)
        .select('id', { count: 'exact', head: true })
        .eq('created_by', targetUserId);

      if (paiementCount > 0) {
        return false; // Ne pas supprimer s'il y a des paiements créés
      }

      // Vérifier les interventions
      const { count: interventionCount } = await supabase
        .from(TABLES.INTERVENTIONS)
        .select('id', { count: 'exact', head: true })
        .eq('created_by', targetUserId);

      if (interventionCount > 0) {
        return false; // Ne pas supprimer s'il y a des interventions créées
      }

      // Un admin peut supprimer n'importe qui sauf un super_admin et sauf s'il a créé des pièces
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

          // ✅ Sauvegarder les permissions granulaires après création
          if (userId) {
            try {
              const permissionsToUpdate = {};

              // Lister les colonnes connues de permissions que la table supporte
              const validPermissionFields = [
                'can_create_prospects', 'can_edit_prospects', 'can_delete_prospects',
                'can_create_clients', 'can_edit_clients', 'can_delete_clients',
                'can_create_installations', 'can_edit_installations', 'can_delete_installations',
                'can_create_abonnements', 'can_edit_abonnements', 'can_delete_abonnements',
                'can_create_paiements', 'can_edit_paiements', 'can_delete_paiements',
                'can_create_support', 'can_edit_support', 'can_delete_support',
                'can_create_missions', 'can_edit_missions', 'can_delete_missions', 'can_close_missions', 'can_validate_missions',
                'can_create_alertes', 'can_edit_alertes', 'can_delete_alertes',
                'can_create_applications', 'can_edit_applications', 'can_delete_applications'
              ];

              // Ajouter uniquement les permissions qui existent dans userData et sont dans la liste des valides
              validPermissionFields.forEach(field => {
                if (userData.hasOwnProperty(field) && (userData[field] === true || userData[field] === false)) {
                  permissionsToUpdate[field] = userData[field];
                }
              });

              // Sauvegarder les permissions si non-vide
              if (Object.keys(permissionsToUpdate).length > 0) {
                const { error: permError } = await supabase
                  .from(TABLES.USERS)
                  .update(permissionsToUpdate)
                  .eq('id', userId);

                if (permError) {
                  console.error('Erreur sauvegarde permissions:', permError);
                } else {
                  console.log('✅ Permissions sauvegardées:', permissionsToUpdate);
                }
              }
            } catch (permErr) {
              console.error('Erreur lors de la sauvegarde des permissions:', permErr);
            }
          }

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

      // ✅ Ajouter les permissions granulaires SEULEMENT les champs valides
      // Lister les colonnes connues de permissions que la table supporte
      // ⚠️ NOTE: Si la table n'a pas ces colonnes, elles seront ignorées
      const validPermissionFields = [
        'can_create_prospects', 'can_edit_prospects', 'can_delete_prospects',
        'can_create_clients', 'can_edit_clients', 'can_delete_clients',
        'can_create_installations', 'can_edit_installations', 'can_delete_installations',
        'can_create_abonnements', 'can_edit_abonnements', 'can_delete_abonnements',
        'can_create_paiements', 'can_edit_paiements', 'can_delete_paiements',
        'can_create_support', 'can_edit_support', 'can_delete_support',
        'can_create_missions', 'can_edit_missions', 'can_delete_missions', 'can_close_missions', 'can_validate_missions',
        'can_create_alertes', 'can_edit_alertes', 'can_delete_alertes',
        'can_create_applications', 'can_edit_applications', 'can_delete_applications'
      ];

      // Ajouter uniquement les permissions qui existent dans userData et sont dans la liste des valides
      let permissionCount = 0;
      validPermissionFields.forEach(field => {
        if (userData.hasOwnProperty(field) && (userData[field] === true || userData[field] === false)) {
          dataToUpdate[field] = userData[field];
          permissionCount++;
        }
      });

      if (permissionCount > 0) {
        console.log(`✅ ${permissionCount} permission(s) sera(ont) mise(s) à jour`);
      }

      console.log('dataToUpdate final:', JSON.stringify(dataToUpdate, null, 2));

      // 🔐 Mise à jour du mot de passe si fourni
      if (userData.password) {
        console.log(`🔐 Mise à jour du mot de passe pour l'utilisateur ID: ${id}`);
        const { error: passError } = await supabase.rpc('update_user_password_local', {
          p_user_id: id,
          p_password: userData.password
        });

        if (passError) {
          console.error('❌ Erreur RPC mise à jour mot de passe:', passError);
          // On continue quand même la mise à jour du profil, ou on throw ? 
          // Généralement, si le mot de passe échoue, c'est une erreur critique.
          throw new Error(`Erreur lors de la mise à jour du mot de passe: ${passError.message}`);
        }
        console.log('✅ Mot de passe mis à jour avec succès');
      }

      // 🔐 Mise à jour du profil utilisateur
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

      // ✅ NOUVEAU: Si l'email a changé, le mettre à jour aussi dans la table users_auth
      // pour que l'utilisateur puisse se connecter avec son nouvel email.
      if (userData.email) {
        try {
          console.log(`🔐 Mise à jour de l'email d'authentification pour l'ID: ${id}`);
          const { error: authError } = await supabase
            .from('users_auth')
            .update({ email: userData.email.toLowerCase() })
            .eq('id', id);

          if (authError) {
            console.warn('⚠️ Impossible de mettre à jour l\'email dans users_auth (peut nécessiter des droits admin):', authError.message);
          }
        } catch (authErr) {
          console.warn('Erreur lors de la mise à jour de l\'email d\'authentification:', authErr);
        }
      }

      return data;
    } catch (error) {
      console.error('Erreur mise à jour utilisateur:', error);
      throw error;
    }
  },

  // ✅ Changer expressément UNIQUEMENT le mot de passe
  async updatePassword(id, newPassword) {
    try {
      const { error: passError } = await supabase.rpc('update_user_password_local', {
        p_user_id: id,
        p_password: newPassword
      });

      if (passError) {
        throw new Error(`Erreur lors de la mise à jour du mot de passe: ${passError.message}`);
      }
      return true;
    } catch (error) {
      console.error('Erreur mise à jour mot de passe:', error);
      throw error;
    }
  },

  // Supprimer un utilisateur
  async delete(id, currentUserProfile) {
    try {
      // ✅ Vérifier si l'utilisateur a créé des pièces (prospects, installations, paiements, interventions)
      const createdPieces = await this.getUserCreatedPieces(id);

      if (createdPieces.hasCreatedPieces) {
        const error = new Error(
          `❌ Impossible de supprimer cet utilisateur.\n\n` +
          `Cet utilisateur a créé les pièces suivantes:\n\n` +
          `${createdPieces.details.join('\n')}\n\n` +
          `Un utilisateur qui a créé au moins une pièce ne peut pas être supprimé.\n` +
          `Contactez un administrateur.`
        );
        error.code = 'USER_CREATED_PIECES';
        error.details = createdPieces.details;
        throw error;
      }

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

  // ✅ Vérifier si l'utilisateur a la permission de créer un type de pièce
  async hasCreatePermission(userId, pieceType) {
    try {
      const user = await this.getById(userId);
      if (!user) return false;

      // Les admins et super_admins ont toujours les permissions
      if (user.role === 'admin' || user.role === 'super_admin') {
        return true;
      }

      // Vérifier la permission basée sur le type de pièce
      const permissionField = `can_create_${pieceType}`;
      return user[permissionField] === true;
    } catch (error) {
      console.error(`Erreur vérification permission create ${pieceType}:`, error);
      return false;
    }
  },

  // ✅ Vérifier si l'utilisateur a la permission d'éditer un type de pièce
  async hasEditPermission(userId, pieceType) {
    try {
      const user = await this.getById(userId);
      if (!user) return false;

      // Les admins et super_admins ont toujours les permissions
      if (user.role === 'admin' || user.role === 'super_admin') {
        return true;
      }

      // Vérifier la permission basée sur le type de pièce
      const permissionField = `can_edit_${pieceType}`;
      return user[permissionField] === true;
    } catch (error) {
      console.error(`Erreur vérification permission edit ${pieceType}:`, error);
      return false;
    }
  },

  // ✅ Vérifier si l'utilisateur a la permission de supprimer un type de pièce
  async hasDeletePermission(userId, pieceType) {
    try {
      const user = await this.getById(userId);
      if (!user) return false;

      // Les admins et super_admins ont toujours les permissions
      if (user.role === 'admin' || user.role === 'super_admin') {
        return true;
      }

      // Vérifier la permission basée sur le type de pièce
      const permissionField = `can_delete_${pieceType}`;
      return user[permissionField] === true;
    } catch (error) {
      console.error(`Erreur vérification permission delete ${pieceType}:`, error);
      return false;
    }
  },

  // ✅ Vérifier si l'utilisateur a la permission de clôturer un type de pièce
  async hasClosePermission(userId, pieceType) {
    try {
      const user = await this.getById(userId);
      if (!user) return false;

      // Les admins et super_admins ont toujours les permissions
      if (user.role === 'admin' || user.role === 'super_admin') {
        return true;
      }

      // Vérifier la permission basée sur le type de pièce
      const permissionField = `can_close_${pieceType}`;
      return user[permissionField] === true;
    } catch (error) {
      console.error(`Erreur vérification permission close ${pieceType}:`, error);
      return false;
    }
  },

  // ✅ Vérifier les pièces créées par un utilisateur (prospects, installations, paiements, interventions)
  async getUserCreatedPieces(userId) {
    try {
      const details = [];
      let hasCreatedPieces = false;

      // 1. Vérifier les prospects créés
      const { data: prospects, error: err1 } = await supabase
        .from(TABLES.PROSPECTS)
        .select('id', { count: 'exact', head: false })
        .eq('created_by', userId)
        .limit(5);

      if (!err1 && prospects?.length > 0) {
        hasCreatedPieces = true;
        details.push(`• ${prospects.length} prospect(s) créé(s)`);
      }

      // 2. Vérifier les installations créées
      const { data: installations, error: err2 } = await supabase
        .from(TABLES.INSTALLATIONS)
        .select('id', { count: 'exact', head: false })
        .eq('created_by', userId)
        .limit(5);

      if (!err2 && installations?.length > 0) {
        hasCreatedPieces = true;
        details.push(`• ${installations.length} installation(s) créée(s)`);
      }

      // 3. Vérifier les paiements créés
      const { data: paiements, error: err3 } = await supabase
        .from(TABLES.PAIEMENTS)
        .select('id', { count: 'exact', head: false })
        .eq('created_by', userId)
        .limit(5);

      if (!err3 && paiements?.length > 0) {
        hasCreatedPieces = true;
        details.push(`• ${paiements.length} paiement(s) créé(s)`);
      }

      // 4. Vérifier les interventions créées
      const { data: interventions, error: err4 } = await supabase
        .from(TABLES.INTERVENTIONS)
        .select('id', { count: 'exact', head: false })
        .eq('created_by', userId)
        .limit(5);

      if (!err4 && interventions?.length > 0) {
        hasCreatedPieces = true;
        details.push(`• ${interventions.length} intervention(s) créée(s)`);
      }

      return { hasCreatedPieces, details };
    } catch (error) {
      console.error('Erreur vérification pièces créées:', error);
      // En cas d'erreur, laisser continuer mais avec précaution
      return { hasCreatedPieces: false, details: [] };
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