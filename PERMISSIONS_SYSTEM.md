# 🔐 Système de Permissions Granulaires

## Vue d'ensemble
Un nouveau système de permissions granulaires a été implémenté pour permettre aux administrateurs de contrôler précisément qui peut **modifier** et **supprimer** les prospects, installations, paiements et interventions.

## Nouvelle Structure

### 1. Colonnes de Base de Données (SQL)
Ajoutées à la table `users`:
```
can_edit_prospects (BOOLEAN) - Modifier les prospects
can_delete_prospects (BOOLEAN) - Supprimer les prospects
can_edit_installations (BOOLEAN) - Modifier les installations
can_delete_installations (BOOLEAN) - Supprimer les installations
can_edit_paiements (BOOLEAN) - Modifier les paiements
can_delete_paiements (BOOLEAN) - Supprimer les paiements
can_edit_interventions (BOOLEAN) - Modifier les interventions
can_delete_interventions (BOOLEAN) - Supprimer les interventions
```

**Script SQL**: Voir `MIGRATION_PERMISSIONS.sql`

### 2. Comportement par Défaut
- **Admin & Super Admin**: Ont TOUTES les permissions (pas besoin de coches)
- **Autres rôles**: Les permissions doivent être explicitement cochées

### 3. Interface UserForm

#### Avant
- Seulement: Nom, Email, Mot de passe, Rôle, Pages Accessibles

#### Après
- Ajoute une nouvelle section: **🔐 Permissions Granulaires (Modifier et Supprimer)**
- Pour chaque type de pièce (Prospects, Installations, Paiements, Interventions):
  - ✏️ **Modifier** (checkbox)
  - 🗑️ **Supprimer** (checkbox)

```jsx
// Exemple de checkbox
<input
  type="checkbox"
  checked={formData.can_edit_prospects}
  onChange={(e) => handleChange('can_edit_prospects', e.target.checked)}
/>
<span>✏️ Modifier</span>
```

### 4. Services Backend

#### `userService.js` - Nouvelles Méthodes

**`hasEditPermission(userId, pieceType)`**
```javascript
// Vérifie si l'utilisateur peut éditer un type de pièce
// Parameters:
//   - userId: ID de l'utilisateur
//   - pieceType: 'prospects', 'installations', 'paiements', 'interventions'
// Returns: boolean
```

**`hasDeletePermission(userId, pieceType)`**
```javascript
// Vérifie si l'utilisateur peut supprimer un type de pièce
// Parameters:
//   - userId: ID de l'utilisateur
//   - pieceType: 'prospects', 'installations', 'paiements', 'interventions'
// Returns: boolean
```

### 5. Composants Frontend Modifiés

#### A. ProspectCard.jsx
```javascript
// Charge les permissions au chargement
useEffect(() => {
  const canEdit = await userService.hasEditPermission(user.id, 'prospects');
  const canDelete = await userService.hasDeletePermission(user.id, 'prospects');
  setHasEditPermission(canEdit);
  setHasDeletePermission(canDelete);
}, [user?.id, profile]);

// Affiche un cadenas 🔒 si pas de permission
{!hasEditPermission && !(profile?.role === 'admin' || profile?.role === 'super_admin') ? (
  <Lock size={18} />
) : (
  <Edit2 size={18} />
)}
```

#### B. InstallationCard.jsx
- Même pattern que ProspectCard
- Permissions: `can_edit_installations`, `can_delete_installations`

#### C. PaiementsList.jsx
- Même pattern que ProspectCard
- Permissions: `can_edit_paiements`, `can_delete_paiements`

#### D. InterventionsList.jsx & InterventionCard.jsx
- Même pattern que ProspectCard
- Permissions: `can_edit_interventions`, `can_delete_interventions`

## Logique de Permission

### 1. Affichage des Boutons
```javascript
// Admin/Super Admin: Toujours voir le bouton actif
if (profile?.role === 'admin' || profile?.role === 'super_admin') {
  // Bouton actif
}

// Autres utilisateurs: Vérifier la permission
else if (hasEditPermission) {
  // Bouton actif
} else {
  // Afficher cadenas grisé
  disabled = true
}
```

### 2. Interactions
- **Avec permission**: Bouton coloré (bleu pour modifier, rouge pour supprimer)
- **Sans permission**: Cadenas grisé avec `cursor-not-allowed`
- **Tooltip**: Affiche "Permission refusée" si pas d'accès

## Flux d'Utilisation

### Pour un Administrateur
1. Aller à: Utilisateurs → Sélectionner un utilisateur (non-admin)
2. Voir la nouvelle section "🔐 Permissions Granulaires"
3. Cocher les permissions souhaitées:
   - ✏️ Modifier Prospects
   - 🗑️ Supprimer Prospects
   - ✏️ Modifier Installations
   - etc.
4. Cliquer "Modifier"

### Pour l'Utilisateur
1. Dans la page Prospects/Installations/Paiements/Interventions
2. Si permissions cochées: Voir les boutons colorés (Modifier, Supprimer)
3. Si permissions non cochées: Voir des cadenas grisés
4. Ne peut pas cliquer sur les boutons désactivés

## Fichiers Modifiés

### Base de Données
- `MIGRATION_PERMISSIONS.sql` ← **À exécuter dans Supabase**

### Services
- `src/services/userService.js`
  - Ajout: `hasEditPermission()`
  - Ajout: `hasDeletePermission()`

### Composants
- `src/components/utilisateurs/UserForm.jsx` ← Nouvelle section permissions
- `src/components/prospects/ProspectCard.jsx` ← Vérification permissions
- `src/components/installations/InstallationCard.jsx` ← Vérification permissions
- `src/components/paiements/PaiementsList.jsx` ← Vérification permissions
- `src/components/support/InterventionCard.jsx` ← Vérification permissions
- `src/components/support/InterventionsList.jsx` ← Vérification permissions

## Prochaines Étapes

### 1. ✅ **IMMÉDIATEMENT** - Exécuter la Migration SQL
```sql
-- Ouvrir Supabase SQL Editor et exécuter:
MIGRATION_PERMISSIONS.sql
```

### 2. ✅ Redémarrer le serveur
```bash
npm run dev
```

### 3. ✅ Tester dans l'Application
- Créer/Modifier un utilisateur (non-admin)
- Cocher/Décocher les permissions
- Vérifier que les boutons sont activés/désactivés correctement

### 4. ✅ Vérifier les Cas de Test
- [ ] Admin peut tout faire (pas d'affichage cadenas)
- [ ] User sans permission voit cadenas grisé
- [ ] User avec permission voit bouton coloré actif
- [ ] User ne peut pas cliquer sur bouton grisé
- [ ] Les permissions s'appliquent sur tous les types (Prospects, Installations, etc.)

## Notes de Sécurité

### ✅ Couches de Sécurité
1. **Frontend**: Affichage conditionnel des boutons (UX)
2. **Service Backend**: Vérification des permissions avant action
3. **Base de Données**: Vérification des droits dans les fonctions RPC
4. **API**: Contrôle d'accès au niveau requête

### ⚠️ Important
- Les admins/super_admins IGNORER complètement ce système
- Les permissions sont toujours vérifiées côté serveur
- Ne pas faire confiance au frontend pour la sécurité

## Exemple: Prospect Permission Denied

```javascript
// Cas: User avec role 'commercial', can_edit_prospects = false
const user = {
  id: 'uuid-123',
  role: 'commercial',
  can_edit_prospects: false,
  can_delete_prospects: true
};

// Dans ProspectCard:
const hasEditPermission = false;    // ne peut pas modifier
const hasDeletePermission = true;   // peut supprimer

// Affichage:
// Modifier: 🔒 (cadenas grisé, disabled)
// Supprimer: ✓ (bouton rouge actif)
```

## Configuration par Défaut

Lors de la création d'un nouvel utilisateur (non-admin):
- Toutes les permissions sont cochées à **FALSE** par défaut
- L'administrateur doit les cocher explicitement

```javascript
can_edit_prospects: false,
can_delete_prospects: false,
can_edit_installations: false,
can_delete_installations: false,
can_edit_paiements: false,
can_delete_paiements: false,
can_edit_interventions: false,
can_delete_interventions: false
```

## Rollback (Si Nécessaire)

Si vous devez revenir en arrière:
```sql
-- Supprimer les colonnes de permissions
ALTER TABLE public.users DROP COLUMN can_edit_prospects;
ALTER TABLE public.users DROP COLUMN can_delete_prospects;
-- ... etc pour toutes les colonnes

-- Supprimer les index
DROP INDEX idx_users_can_edit_prospects;
-- ... etc
```
