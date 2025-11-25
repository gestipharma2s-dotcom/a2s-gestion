# 🧪 Guide de Test - Corrections Installation Delete 400 Error

## Problème Corrigé

**Erreur:** `Failed to load resource: the server responded with a status of 400`
**Cause:** La fonction `handleDelete` recevait un objet complet au lieu d'un UUID

```
installation_id=eq.%5Bobject+Object%5D  ❌ INCORRECT
installation_id=eq.550e8400-e29b-41d4-a716-446655440000  ✅ CORRECT
```

**Correction appliquée:**
```javascript
// AVANT
const handleDelete = async (installationId) => {
  await installationService.hasPaiements(installationId);  // 💥 Reçoit l'objet complet
}

// APRÈS
const handleDelete = async (installation) => {
  const installationId = installation?.id || installation;  // ✅ Extrait l'ID correctement
  await installationService.hasPaiements(installationId);
}
```

---

## ✅ Checklist de Test

### 1️⃣ Test de Suppression d'Installation

**Scénario A: Installation SANS paiements (doit être supprimable)**

1. Allez dans **Installations**
2. Cherchez une installation qui n'a PAS de paiements
3. Cliquez sur le bouton **"Supprimer"** (icône rouge 🗑️)
4. ✅ Vous devez voir un message: **"✅ Solution: Supprimez d'abord les paiements..."** N'apparaît PAS
5. ✅ Fenêtre de confirmation s'affiche
6. ✅ Tapez "SUPPRIMER" pour confirmer
7. ✅ Installation supprimée avec succès
8. ✅ **Console:** Pas d'erreur 400

**Scénario B: Installation AVEC paiements (doit être bloquée)**

1. Allez dans **Installations**
2. Cherchez une installation qui a des paiements
3. Cliquez sur le bouton **"Supprimer"** (icône rouge 🗑️)
4. ✅ Vous voyez l'alerte: `❌ SUPPRESSION IMPOSSIBLE ❌`
5. ✅ Message explique: "Cette installation est liée à un ou plusieurs paiements enregistrés"
6. ✅ Installation n'est PAS supprimée
7. ✅ **Console:** Pas d'erreur 400

### 2️⃣ Vérifier les Logs de Console

**Ouvrir Console (F12 > Onglet Console)**

❌ Vous ne devriez PAS voir:
```
Failed to load resource: 400
Erreur vérification paiements: Object
invalid input syntax for type uuid: "[object Object]"
```

✅ Vous devriez voir uniquement:
```
Installation supprimée avec succès  (si suppression réussie)
OU
Erreur vérification paiements: {message: ''} (si vérification réussit avec vide)
```

### 3️⃣ Tester avec Permissions Refusées

1. Créez un utilisateur NON-admin sans permission "Supprimer installations"
2. Connectez-vous avec cet utilisateur
3. Allez dans **Installations**
4. ✅ Le bouton **"Supprimer"** doit être GRIS et DÉSACTIVÉ
5. ✅ Au survol, message: **"Permission refusée: Supprimer"**
6. ✅ Clic sur le bouton ne fait rien

### 4️⃣ Tester avec Permissions Accordées

1. Accordez la permission "Supprimer installations" à un utilisateur
2. Connectez-vous avec cet utilisateur
3. Allez dans **Installations**
4. ✅ Le bouton **"Supprimer"** doit être ROUGE et ACTIF
5. ✅ Vous pouvez cliquer et supprimer (si pas de paiements)

---

## 📋 Résumé des Changements

| Fichier | Ligne | Changement |
|---------|-------|-----------|
| `src/components/installations/InstallationsList.jsx` | 134 | `handleDelete` extrait maintenant `installation.id` |

**Impact:** Correction du problème où les IDs d'installation étaient envoyés comme `[object Object]` à la place des UUID réels.

---

## 🚀 Prochaines Étapes

1. ✅ **Build:** Vérifier que npm run build réussit ✓
2. ✅ **Test:** Tester la suppression d'une installation sans paiements
3. ⚠️ **Important:** Exécuter la migration SQL pour ajouter les colonnes de permissions (voir GUIDE_PERMISSIONS_GRANULAIRES.md)
4. ⚠️ **Vérifier:** Que les permissions granulaires fonctionnent après la migration

---

## 🔗 Fichiers Associés

- **Guide Permissions:** `GUIDE_PERMISSIONS_GRANULAIRES.md`
- **Migration SQL:** `MIGRATION_ADD_GRANULAR_PERMISSIONS.sql`
- **Modifications Précédentes:** `GUIDE_INTEGRATION_MISSIONS_V2.md`

