# Vérification Complète des Opérations Mission
## Budget • Dates • Chef de Mission • Accompagnateurs

---

## 📋 OPÉRATION 1: CRÉATION DE MISSION (CREATE)

### Données Envoyées par le Formulaire
```javascript
{
  titre: 'Mission Test',
  clientId: '<prospect_id>',
  dateDebut: '2025-11-25',
  dateFin: '2025-11-30',
  budgetInitial: 50000,
  chefMissionId: '<user_id>',
  accompagnateurIds: ['<user_id_1>', '<user_id_2>'],
  type: 'Installation',
  priorite: 'haute'
}
```

### Transformation en Base de Données (missionService.create)
```javascript
// ✅ FIXED - Tous les champs maintenant mappés dans INSERT
{
  titre: 'Mission Test',
  statut: 'creee',
  prospect_id: '<prospect_id>',          // ✅ clientId → prospect_id
  date_debut: '2025-11-25',              // ✅ dateDebut → date_debut
  date_fin_prevue: '2025-11-30',         // ✅ dateFin → date_fin_prevue
  budget_alloue: 50000,                  // ✅ FIXED: budgetInitial → budget_alloue
  chef_mission_id: '<user_id>',          // ✅ FIXED: chefMissionId → chef_mission_id
  accompagnateurs_ids: ['<user_id_1>', '<user_id_2>'],  // ✅ FIXED: accompagnateurIds
  type_mission: 'Installation',          // ✅ type → type_mission
  priorite: 'haute'
}
```

### Vérification de Création
- [ ] **Budget Initial**: Le montant 50000 est sauvegardé dans `budget_alloue`
- [ ] **Date Début**: La date '2025-11-25' est sauvegardée dans `date_debut`
- [ ] **Date Fin**: La date '2025-11-30' est sauvegardée dans `date_fin_prevue`
- [ ] **Chef de Mission**: L'ID utilisateur est sauvegardé dans `chef_mission_id`
- [ ] **Accompagnateurs**: Les IDs sont sauvegardés dans `accompagnateurs_ids` (tableau)
- [ ] **Type**: La valeur est sauvegardée dans `type_mission`
- [ ] **Priorité**: La valeur est sauvegardée dans `priorite`

### Console Logs à Vérifier
```
✅ Form data received: {titre, clientId, dateDebut, dateFin, budgetInitial, chefMissionId, accompagnateurIds, ...}
✅ Initial insert data: {titre, statut}
✅ Final insert data: {titre, statut, prospect_id, date_debut, date_fin_prevue, budget_alloue, chef_mission_id, accompagnateurs_ids, type_mission, priorite}
✅ Insert response: {data: [{id, titre, budget_alloue, ...}], error: null, status: 201}
```

---

## 📋 OPÉRATION 2: MODIFICATION DE MISSION (UPDATE)

### Données Envoyées par le Formulaire
```javascript
{
  titre: 'Mission Test - Modifiée',
  clientId: '<prospect_id>',              // ❌ NOT EDITABLE (locked)
  dateDebut: '2025-11-25',               // ❌ NOT EDITABLE (locked)
  dateFin: '2025-12-05',                 // ✅ CAN EDIT DATES
  budgetInitial: 60000,                  // ✅ CAN EDIT BUDGET
  chefMissionId: '<user_id>',            // 🔒 FROZEN (read-only display)
  accompagnateurIds: ['<user_id_1>'],    // 🔒 FROZEN (read-only display)
  type: 'Installation',
  priorite: 'critique'
}
```

### Transformation en Base de Données (missionService.update)
```javascript
// ✅ UPDATE - Champs modifiables
{
  titre: 'Mission Test - Modifiée',
  description: '...',                    // ✅ updateData.description
  prospect_id: '<prospect_id>',          // ✅ updateData from clientId
  lieu: '...',                           // ✅ updateData.lieu
  date_debut: '2025-11-25',              // ✅ updateData from dateDebut
  date_fin_prevue: '2025-12-05',         // ✅ updateData from dateFin (CAN CHANGE)
  type_mission: 'Installation',          // ✅ updateData from type
  priorite: 'critique',                  // ✅ updateData from priorite
  budget_alloue: 60000,                  // ✅ updateData from budgetInitial (CAN CHANGE)
  chef_mission_id: '<user_id>',          // 🔒 FROZEN - ne pas changer
  accompagnateurs_ids: [...]             // 🔒 FROZEN - ne pas changer
  updated_at: '<ISO_TIMESTAMP>'
}
```

### Affichage dans le Formulaire (MissionForm.jsx)
**Chef de Mission Section (Ligne 300-343):**
```jsx
{mission && (
  <>
    {/* ✅ Edit mode: Read-only display */}
    <div className="bg-gray-50 p-3 rounded border border-gray-300">
      {chefUser?.full_name || 'Aucun Chef de Mission assigné'}
    </div>
    {/* ✅ Badge "🔒 Figé à la création" shown */}
    <p className="text-xs text-gray-600 mt-2">
      ✓ Le Chef de Mission ne peut pas être modifié après la création
    </p>
  </>
)}
```

**Accompagnateurs Section (Ligne 353-418):**
```jsx
{mission && (
  <>
    {/* ✅ Edit mode: Read-only list display */}
    {selectedAccompagnateursData.map(user => (
      <div className="bg-gray-50 border-gray-300">
        {user.full_name || user.email}
        {/* ❌ Remove button NOT shown in edit mode */}
      </div>
    ))}
    {/* ✅ Badge "🔒 Figé à la création" shown */}
    <p className="text-xs text-gray-600 mt-2">
      ✓ Les accompagnateurs ne peuvent pas être modifiés après la création
    </p>
  </>
)}
```

### Vérification de Modification
- [ ] **Budget Modifiable**: Le budget PEUT être changé lors de l'édition
- [ ] **Dates Modifiables**: Les dates PEUVENT être changées lors de l'édition
- [ ] **Chef Figé**: Le Chef de Mission s'affiche comme READ-ONLY avec badge 🔒
- [ ] **Accompagnateurs Figés**: Les accompagnateurs s'affichent comme READ-ONLY avec badge 🔒
- [ ] **Aucun Bouton Supprimer**: Les boutons de suppression ne sont visibles QUE en création
- [ ] **Autres Champs**: Titre, type, priorité restent modifiables

### Interaction Utilisateur
1. **En mode CREATE**: Tous les champs sont éditables (inputs, selects, boutons de suppression)
2. **En mode EDIT**: 
   - ✅ Titre, Description, Dates, Budget, Type, Priorité = éditables
   - 🔒 Chef de Mission = affichage figé avec "🔒 Figé à la création"
   - 🔒 Accompagnateurs = affichage figé avec "🔒 Figé à la création"
   - ❌ Aucun bouton d'ajout/suppression pour Chef et Accompagnateurs

---

## 📋 OPÉRATION 3: SUPPRESSION DE MISSION (DELETE)

### Fonction de Suppression (MissionsDashboard.jsx)
```javascript
async handleDeleteMission(mission) {
  // 1. Vérifier les permissions
  if (!canDeleteMission(mission)) {
    notification: 'Vous n\'avez pas les permissions'
    return;
  }

  // 2. Confirmation utilisateur
  if (window.confirm('Êtes-vous certain de vouloir supprimer?')) {
    // 3. Appel service
    await missionService.delete(mission.id);
    
    // 4. Mise à jour état local
    setMissions(missions.filter(m => m.id !== mission.id));
    
    // 5. Notification
    addNotification('✅ Mission supprimée');
  }
}
```

### Service de Suppression (missionService.js)
```javascript
async delete(id) {
  const { error } = await supabase
    .from('missions')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}
```

### Vérification de Suppression
- [ ] **Permissions Vérifiées**: La suppression ne fonctionne que pour les utilisateurs autorisés
- [ ] **Confirmation Demandée**: Un `window.confirm()` demande confirmation avant suppression
- [ ] **Suppression en Base**: La mission est supprimée de la table `missions`
- [ ] **UI Mise à Jour**: La mission disparaît de la liste immédiatement
- [ ] **Notification**: Le message "✅ Mission supprimée" s'affiche

### Scénarios de Suppression
| Condition | Résultat | Notes |
|-----------|----------|-------|
| Utilisateur = Admin | ✅ Peut supprimer | `profile.role === 'admin'` |
| Utilisateur = Creator | ✅ Peut supprimer | Créateur de la mission |
| Utilisateur ≠ Admin | ❌ Impossible | Notification d'erreur |
| Statut = 'cloturee' | ❌ Impossible | Mission fermée |

---

## 🔍 TABLEAU DE SYNTHÈSE

| Opération | Budget | Date Début | Date Fin | Chef Mission | Accompagnateurs |
|-----------|--------|-----------|----------|-------------|-----------------|
| **CREATE** | ✅ Sauvegardé | ✅ Sauvegardé | ✅ Sauvegardé | ✅ Sauvegardé | ✅ Sauvegardé |
| **DISPLAY (Create)** | ✅ Éditable | ✅ Éditable | ✅ Éditable | ✅ Éditable | ✅ Éditable |
| **UPDATE** | ✅ Modifiable | ✅ Modifiable* | ✅ Modifiable | 🔒 Figé | 🔒 Figé |
| **DISPLAY (Edit)** | ✅ Éditable | ✅ Affichage | ✅ Éditable | 🔒 Read-only | 🔒 Read-only |
| **DELETE** | ✅ Supprimé | ✅ Supprimé | ✅ Supprimé | ✅ Supprimé | ✅ Supprimé |

*Date Début peut être modifiée en UPDATE mais reste généralement figée en pratique

---

## ✅ CHECKLIST DE TESTS

### Test 1: Créer une mission avec tous les champs
```
Steps:
1. Cliquer "Nouvelle Mission"
2. Remplir: Titre, Client, Type, Dates, Budget, Chef, Accompagnateurs
3. Cliquer "Enregistrer"

Expected:
✅ Mission créée avec tous les champs en base
✅ Budget sauvegardé dans budget_alloue
✅ Chef sauvegardé dans chef_mission_id
✅ Accompagnateurs sauvegardés dans accompagnateurs_ids
✅ Notification "✅ Mission créée avec succès"
```

### Test 2: Modifier une mission existante
```
Steps:
1. Cliquer sur une mission existante
2. Cliquer "Éditer"
3. Modifier: Budget +10000, Date Fin +5 jours, Priorité
4. Cliquer "Enregistrer"

Expected:
✅ Budget modifié dans budget_alloue
✅ Date Fin modifiée dans date_fin_prevue
✅ Priorité modifiée
✅ Chef de Mission affichage: "🔒 Figé à la création"
✅ Accompagnateurs affichage: "🔒 Figé à la création"
✅ Aucun bouton de modification pour Chef et Accompagnateurs
```

### Test 3: Vérifier les champs figés
```
Steps:
1. Ouvrir une mission en mode édition
2. Regarder les sections "Chef de Mission" et "Accompagnateurs"

Expected:
✅ Chef de Mission: Affichage avec badge "🔒 Figé à la création"
✅ Accompagnateurs: Affichage avec badge "🔒 Figé à la création"
✅ Aucun input/select/bouton pour modifier ces champs
✅ Texte explicatif: "...ne peuvent pas être modifiés après la création"
```

### Test 4: Supprimer une mission
```
Steps:
1. Ouvrir les détails d'une mission
2. Cliquer "Supprimer"
3. Confirmer dans la boîte de dialogue

Expected:
✅ Confirmation demandée
✅ Mission supprimée de la base
✅ Mission disparaît de la liste
✅ Notification "✅ Mission supprimée"
```

### Test 5: Validation des erreurs
```
Steps:
1. Créer une mission sans:
   - Titre (doit afficher erreur)
   - Client (doit afficher erreur)
   - Chef de Mission (doit afficher erreur)
   - Dates valides (doit afficher erreur)
   - Budget > 0 (doit afficher erreur)

Expected:
✅ Erreurs affichées pour chaque champ obligatoire
✅ Date Fin >= Date Début validée
✅ Budget > 0 validé
✅ Bouton Enregistrer désactivé jusqu'à correction
```

---

## 🗂️ FICHIERS MODIFIÉS

### 1. missionService.js - CREATE
**AVANT**: Budget, Chef, Accompagnateurs non sauvegardés en création
**APRÈS**: Tous les champs maintenant ajoutés à insertData

```diff
+ if (missionData.budgetInitial) {
+   insertData.budget_alloue = parseFloat(missionData.budgetInitial);
+ }
+ if (missionData.chefMissionId) {
+   insertData.chef_mission_id = missionData.chefMissionId;
+ }
+ if (missionData.accompagnateurIds && missionData.accompagnateurIds.length > 0) {
+   insertData.accompagnateurs_ids = missionData.accompagnateurIds;
+ }
```

### 2. MissionForm.jsx
- ✅ Chef de Mission: Déjà figé en mode édition (ligne 300-343)
- ✅ Accompagnateurs: Déjà figés en mode édition (ligne 353-418)
- ✅ Tous les champs initialisés avec fallbacks
- ✅ Validation budget > 0

### 3. MissionsDashboard.jsx
- ✅ Double-click protection (isSubmitting)
- ✅ Gestion des erreurs complète
- ✅ Suppression avec permissions
- ✅ Chef et Accompagnateurs affichés en table

---

## 📊 ÉTAT DES DONNÉES EN BASE

### Table: missions
```sql
Column              | Type      | Source                | Validation
--------------------|-----------|----------------------|------------
id                  | uuid      | Auto                 | PK
titre               | text      | form.titre            | Required
description         | text      | form.description     | Optional
prospect_id         | uuid      | form.clientId         | Required FK
date_debut          | date      | form.dateDebut       | Required
date_fin_prevue     | date      | form.dateFin         | Required
budget_alloue       | numeric   | form.budgetInitial   | > 0
chef_mission_id     | uuid      | form.chefMissionId   | Required FK, Figé
accompagnateurs_ids | uuid[]    | form.accompagnateurIds | Figés
type_mission        | text      | form.type            | Required
priorite            | text      | form.priorite        | Optional
lieu                | text      | auto from client     | Optional
statut              | text      | hardcoded 'creee'    | Enum
created_at          | timestamp | Auto                 | Auto
updated_at          | timestamp | Auto                 | Auto
```

---

## 🚀 PROCHAINES ÉTAPES

1. **Lancer l'application**: `npm run dev`
2. **Exécuter les tests**: Suivre la checklist ci-dessus
3. **Vérifier les logs console**: Valider transformations des données
4. **Vérifier la base**: Supabase → Inspecter table missions
5. **Reporter les résultats**: Documenter tout passage/échec

