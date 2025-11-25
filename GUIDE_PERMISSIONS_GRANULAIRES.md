# 📋 Mise en place des Permissions Granulaires

## ⚠️ ÉTAPES OBLIGATOIRES

### 1️⃣ Exécuter la Migration SQL dans Supabase

Pour que le système de permissions granulaires fonctionne, vous **DEVEZ** d'abord ajouter les colonnes à la table `users` dans Supabase.

**Étapes :**

1. Allez sur [console Supabase](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans **SQL Editor**
4. Cliquez sur **New Query** ou **New SQL query**
5. Copiez le contenu de `MIGRATION_ADD_GRANULAR_PERMISSIONS.sql`
6. Collez-le dans l'éditeur SQL
7. Cliquez sur **Run** ou appuyez sur `Ctrl+Enter`

**Le script ajoutera automatiquement :**
- ✅ `can_create_*` (pouvoir créer)
- ✅ `can_edit_*` (pouvoir modifier)
- ✅ `can_delete_*` (pouvoir supprimer)

Pour chaque page :
- Prospects
- Clients
- Installations
- Abonnements
- Paiements
- Support
- Missions (+ close, validate)
- Alertes
- Applications

### 2️⃣ Vérifier que les colonnes existent

Après avoir exécuté la migration, vous pouvez vérifier que tout fonctionne :

1. Allez dans **Table Editor** > **users**
2. Vous devriez voir les nouvelles colonnes à la fin du tableau
3. Elles sont toutes définies à `false` par défaut

### 3️⃣ Utiliser les permissions dans l'application

Une fois la migration exécutée :

1. Ouvrez l'application
2. Allez dans **Utilisateurs** > **Créer/Modifier un utilisateur**
3. Vous verrez une section **"🔐 Permissions Granulaires (Créer, Modifier, Supprimer...)"**
4. Cochez les permissions souhaitées pour chaque page
5. Cliquez sur **Créer** ou **Modifier**

### 4️⃣ Comment fonctionnent les permissions

**Pour chaque page (Prospects, Clients, etc.) :**

- ✅ **Créer** : Peut créer de nouveaux enregistrements
- ✅ **Modifier** : Peut éditer les enregistrements
- ✅ **Supprimer** : Peut supprimer les enregistrements

**Note importante :**
- **Voir** : Pas nécessaire - si une page est cochée, l'utilisateur peut la voir
- Les **Administrateurs** ont toujours accès à tout
- Les permissions ne s'appliquent que pour les rôles non-administrateurs

### 5️⃣ Dépannage

**Problème:** "Erreur 400" lors de la modification d'un utilisateur
**Solution:** Vérifiez que la migration SQL a été exécutée correctement

**Problème:** Les permissions ne s'appliquent pas
**Solution:** 
1. Vérifiez que l'utilisateur n'est pas administrateur
2. Vérifiez que la permission a bien été cochée dans le formulaire
3. Rechargez la page de l'utilisateur concerné

---

## 📊 Exemple de Table Users Après Migration

| id | email | nom | role | can_create_prospects | can_edit_prospects | can_delete_prospects | ... |
|----|-------|-----|------|----------------------|-------------------|----------------------|-----|
| uuid1 | user@example.com | John Doe | commercial | true | true | false | ... |
| uuid2 | admin@example.com | Admin User | admin | true | true | true | ... |

---

## 🔄 Flux Complet

```
1. Créer/Modifier utilisateur (UserForm)
   ↓
2. Convertir permissions objet en format plat
   ↓
3. Envoyer à userService.create() ou update()
   ↓
4. Sauvegarder dans la table users (colonnes can_*)
   ↓
5. Lors de l'utilisation, vérifier les permissions avec userService.hasCreatePermission(), etc.
   ↓
6. Désactiver les boutons/actions si l'utilisateur n'a pas la permission
```

---

**✅ Une fois la migration exécutée, tout devrait fonctionner !**
