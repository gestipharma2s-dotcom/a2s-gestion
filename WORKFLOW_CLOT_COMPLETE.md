# 🎯 SYSTÈME COMPLET DE MISSION - WORKFLOW DE CLÔTURE

## 📋 RÉSUMÉ EXÉCUTIF

Système de gestion de missions avec **workflow de clôture en 2 étapes** :
1. **Clôture par Chef de Mission** (commentaire + avancement)
2. **Validation définitive par Admin** (commentaire + archivage)

---

## 👥 RÔLES ET RESPONSABILITÉS

### 1️⃣ **ADMIN - Création de Mission**

L'administrateur crée une mission avec :
- **Titre** : Nom de la mission
- **Description** : Détails complets
- **Client** : Sélection dans liste clients existants
- **Type** : Installation / Formation / Support / Maintenance / Audit
- **Priorité** : Faible / Moyenne / Haute / Critique
- **Lieu** : Où se déroulera la mission
- **Dates** : Début et Fin prévues
- **Budget** : Montant initial alloué
- **👨‍💼 Chef de Mission** : Sélection dans table USER *(obligatoire)*
- **👥 Accompagnateurs** : Sélection multiple dans table USER *(optionnel, multiples)*
- **Commentaire Initial** : Notes Admin

```
┌─ ADMIN ─────────────────────────────────────┐
│ Crée la mission                              │
│ ├─ Chef de Mission (SELECT)                 │
│ ├─ Accompagnateurs (MULTI-SELECT)           │
│ └─ Commentaire création                      │
│                                               │
│ ✓ STATUT : "creee"                          │
│ ✓ Date création                              │
│ ✓ created_by = ADMIN ID                     │
└─────────────────────────────────────────────┘
```

### 2️⃣ **CHEF DE MISSION - Clôture Mission**

À la fin de la mission, le Chef de Mission :
- ✅ Accès au bouton **"🔴 Clôturer"** (uniquement sur ses missions)
- 📅 Confirme la **Date clôture réelle**
- 📊 Indique **Avancement final** (%)
- 💬 Ajoute **Commentaire de clôture** (observations, réussis, obstacles)
- ⏳ Soumet pour validation Admin

```
┌─ CHEF DE MISSION ─────────────────┐
│ Vue Mission                        │
│ ├─ [🔧 Détails Technique]         │
│ ├─ [💰 Détails Financier]         │
│ └─ [🔴 Clôturer]  ← NOUVEAU      │
│                                   │
│ Clôture Modal                      │
│ ├─ Date Clôture Réelle (date)    │
│ ├─ Avancement Final % (slider)   │
│ ├─ Commentaire Clôture * (textarea)
│ │  → "Délais respectés, client     │
│ │     très satisfait, équipe      │
│ │     performante..."              │
│ └─ [→ Soumettre pour Validation]  │
│                                   │
│ ✓ STATUT : "cloturee" (temp)     │
│ ✓ cloturee_par_chef = true        │
│ ✓ date_clot_chef = NOW()          │
│ ✓ commentaire_clot_chef = texte   │
└─────────────────────────────────────┘
```

### 3️⃣ **ADMIN - Validation Définitive**

L'Admin reçoit la mission clôturée et :
- 👁️ Consulte le **Commentaire Chef** dans modal
- 👁️ Voit l'**Avancement final** et **Date réelle**
- 💬 Ajoute son propre **Commentaire de clôture définitive** (observations, approbations)
- ✓ Coche la case **"Clôturer définitivement"** (confirmation)
- 🔒 Valide → **Action irréversible**

```
┌─ ADMIN - Validation ──────────────┐
│ Onglet "🔴 Clôture" de Mission    │
│                                   │
│ [Affichage Commentaire Chef]      │
│ ├─ "Délais respectés, client..." │
│ ├─ Avancement: 100%               │
│ └─ Date réelle: 21/11/2025        │
│                                   │
│ Formulaire Admin                  │
│ ├─ Commentaire Admin * (textarea) │
│ │  → "Facture validée, rapport..." │
│ └─ ☐ Clôturer définitivement      │
│    (case à cocher - obligatoire)   │
│                                   │
│ [Retour] [✓ Clôturer Définitif]  │
│                                   │
│ ✓ STATUT : "cloturee" (final)    │
│ ✓ cloturee_definitive = true      │
│ ✓ commentaire_clot_admin = texte  │
│ ✓ date_clot_definitive = NOW()    │
│ ✓ locked = true (édition bloquée) │
└─────────────────────────────────────┘
```

---

## 🔄 WORKFLOW COMPLET

```
ÉTAPE 1: ADMIN CRÉE MISSION
├─ Form: Titre, Client, Type, Priorité, Dates, Budget
├─ Form: Chef de Mission (SELECT - USER)
├─ Form: Accompagnateurs (MULTI-SELECT - USER)
├─ ✓ Mission créée
├─ Statut: "creee"
├─ Rôle lié: chefMissionId, accompagnateurIds[]
└─ 📧 Notification Chef de Mission

         ⬇️ TEMPS S'ÉCOULE

ÉTAPE 2: CHEF DE MISSION CLÔTURE
├─ Vue Journal des Missions
├─ Bouton [🔴 Clôturer] visible
├─ Ouvre Modal Clôture
│  ├─ Infos mission (affichage)
│  ├─ Date clôture réelle (saisie)
│  ├─ Avancement final % (saisie + slider)
│  └─ Commentaire clôture (textarea)
├─ Soumet Clôture
├─ ✓ Mission clôturée par Chef
├─ Statut: "cloturee" (temporaire)
├─ cloturee_par_chef = true
├─ commentaire_clot_chef = sauvegardé
└─ 📧 Notification Admin

ÉTAPE 3: ADMIN VALIDE DÉFINITIVEMENT
├─ Voit mission clôturée par chef
├─ Onglet "Clôture" affiche:
│  ├─ Commentaire Chef (affichage)
│  ├─ Avancement + Date réelle (affichage)
│  ├─ Formulaire saisie Admin:
│  │  ├─ Commentaire validation
│  │  └─ Checkbox "Clôturer définitivement"
├─ Valide (après checkbox cochée)
├─ ✓ Mission clôturée définitivement
├─ Statut: "cloturee" (final, verrouillé)
├─ cloturee_definitive = true
├─ commentaire_clot_admin = sauvegardé
└─ 📧 Notification Chef de Mission

ÉTAPE 4: ARCHIVE AUTOMATIQUE (optional)
├─ Après validation définitive
├─ Mission peut être archivée après 30j
└─ Statut: "archivee"
```

---

## 📊 STRUCTURE DE DONNÉES - TABLE MISSIONS

```sql
CREATE TABLE missions (
  -- Base
  id BIGINT PRIMARY KEY,
  titre TEXT NOT NULL,
  description TEXT,
  statut VARCHAR (20) DEFAULT 'creee',
  type VARCHAR (50),
  priorite VARCHAR (20),

  -- Client & Lieu
  client_id BIGINT REFERENCES clients(id),
  lieu TEXT,

  -- Dates
  date_debut DATE,
  date_fin DATE,

  -- Budget & Dépenses
  budget_initial DECIMAL(10,2),
  total_depenses DECIMAL(10,2) DEFAULT 0,

  -- Participants (RÔLES)
  chef_mission_id UUID REFERENCES auth.users(id),           ← Chef
  accompagnateurs_ids TEXT[] DEFAULT '{}',                  ← Multi-select

  -- Avancement
  avancement INT DEFAULT 0,

  -- Clôture - ÉTAPE 1 (Chef)
  cloturee_par_chef BOOLEAN DEFAULT FALSE,
  commentaire_clot_chef TEXT,
  date_clot_chef TIMESTAMP,

  -- Clôture - ÉTAPE 2 (Admin)
  cloturee_definitive BOOLEAN DEFAULT FALSE,
  commentaire_clot_admin TEXT,
  date_clot_definitive TIMESTAMP,

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  locked BOOLEAN DEFAULT FALSE
);
```

---

## 🎨 INTERFACE - JOURNAL DES MISSIONS

### Vue par défaut: JOURNAL

```
┌─────────────────────────────────────────────────────┐
│  📔 Journal des Missions                            │
│  [+ Nouvelle Mission]                               │
├─────────────────────────────────────────────────────┤
│  📊 Statistiques: Total [3] En cours [1] Taux [33%] │
├─────────────────────────────────────────────────────┤
│  [📔 Journal] [📋 Liste] [📘 Cahier]               │
├─────────────────────────────────────────────────────┤
│
│  ╔═══════════════════════════════════════════════╗
│  ║ Installation ERP             🟢 Conforme     ║
│  ║ Entreprise ABC | Type: Installation           ║
│  ║ Lieu: Paris | 20/11-25/11 | Haute priorité  ║
│  ║                                               ║
│  ║ Budget: 5000€ | Dépensé: 2150€ | Util: 43%  ║
│  ║ Avancement: 65% ▓░░░░░░░░░░                  ║
│  ║                                               ║
│  ║ [🔧 Détails Technique]                       ║
│  ║ [💰 Détails Financier]                       ║
│  ║ [🔴 Clôturer] ← si Chef ou Admin             ║
│  ╚═══════════════════════════════════════════════╝
│
│  ╔═══════════════════════════════════════════════╗
│  ║ Formation Support             🟠 À risque    ║
│  ║ (+ autres missions...)                       ║
│  ╚═══════════════════════════════════════════════╝
└─────────────────────────────────────────────────────┘
```

### Modal Détails - Onglet "🔴 Clôture"

```
┌──────────────────────────────────────┐
│ 🔧 Technique | 💰 Financier | 🔴 Clôture
├──────────────────────────────────────┤
│                                      │
│ [AVANT clôture]                     │
│ Statut: ⏳ En attente               │
│ Validation Admin: ⏳ En attente     │
│                                      │
│ [APRÈS clôture par Chef]            │
│ Statut: ✓ Clôturé Chef             │
│ Validation Admin: ⏳ En attente     │
│                                      │
│ 💬 Commentaire Chef de Mission      │
│ ┌──────────────────────────────────┐ │
│ │ "Délais respectés, client très   │ │
│ │  satisfait. Équipe performante." │ │
│ │ Date: 21/11/2025                 │ │
│ └──────────────────────────────────┘ │
│                                      │
│ 📝 Commentaire Admin (Clôture Déf.)│
│ ┌──────────────────────────────────┐ │
│ │ "Facture validée, rapport OK."   │ │
│ │ Date: 21/11/2025                 │ │
│ └──────────────────────────────────┘ │
│                                      │
│ Timeline:                            │
│ 1️⃣ Chef clôt: ✓ 21/11  10h30      │
│ 2️⃣ Admin valide: ✓ 21/11 14h00   │
│                                      │
└──────────────────────────────────────┘
```

---

## 🔐 PERMISSIONS

| Action | Admin | Chef de Mission | Accomp. |
|--------|-------|---|---|
| Créer mission | ✅ | ❌ | ❌ |
| Modifier mission | ✅* | ❌ | ❌ |
| Clôturer mission | ✅ | ✅ (la sienne) | ❌ |
| Valider clôture | ✅ | ❌ | ❌ |
| Supprimer mission | ✅** | ❌ | ❌ |
| Voir commentaires | ✅ | ✅ | ✅ |
| Voir dépenses | ✅ | ✅ | ⚠️ |

*Avant clôture par chef
** Avant clôture définitive

---

## 📱 COMPOSANTS IMPACTÉS

### 1. **MissionForm.jsx** (CREATE)
- ✅ SELECT Chef de Mission (obligatoire)
- ✅ MULTI-SELECT Accompagnateurs
- ✅ Validation Chef requis

### 2. **MissionJournalCard.jsx** (VIEW)
- ✅ Bouton [🔴 Clôturer] conditionnel
  - Visible si: Chef de mission OU Admin
  - Caché si: Clôturé définitivement
- ✅ Affiche infos Chef de Mission
- ✅ Affiche liste Accompagnateurs

### 3. **MissionClosureModal.jsx** (NEW)
- ✅ Étape 1: Chef remplit commentaire
- ✅ Étape 2: Admin valide + commentaire
- ✅ Timeline complète
- ✅ Confirmation irréversible

### 4. **MissionDetailsModal.jsx** (ENHANCED)
- ✅ Nouvel onglet "🔴 Clôture"
- ✅ Affichage commentaires Chef + Admin
- ✅ Timeline de clôture
- ✅ Statuts étapes visibles

### 5. **MissionsList.jsx** (ORCHESTRATION)
- ✅ Charge utilisateurs (table USER)
- ✅ Passe users[] à tous composants
- ✅ Handlers clôture: handleOpenClosure
- ✅ Handlers validation: handleValidateByAdmin

---

## 🔄 ÉTATS MISSION

```
CRÉATION (ADMIN)
    ↓
[creee] - Nouvelle mission créée par Admin
    ↓
[planifiee] - Prête à commencer (optionnel)
    ↓
[en_cours] - Chef de Mission travaille
    ↓
[cloturee] - Chef clôt → En attente validation
    ↓ (après submission Chef)
[cloturee_par_chef = TRUE] - Clôture intermédiaire
    ↓
[Admin valide]
    ↓
[cloturee_definitive = TRUE] - FINAL (verrouillé)
    ↓
[archivee] - Après 30 jours (optionnel)
```

---

## 📧 NOTIFICATIONS

| Événement | Destinataire | Message |
|-----------|--------------|---------|
| Mission créée | Chef + Accomp. | "Nouvelle mission: [Titre]" |
| Clôture Chef | Admin | "[Chef] a clôturé: [Titre]" |
| Validation Admin | Chef | "Votre mission validée ✓" |
| Archivage | Tous | "[Titre] archivée" |

---

## ✅ CHECKLIST IMPLÉMENTATION

- [x] MissionForm avec Chef + Accompagnateurs
- [x] MissionClosureModal avec workflow 2 étapes
- [x] MissionDetailsModal onglet Clôture
- [x] MissionJournalCard bouton Clôturer
- [x] MissionsList handlers clôture
- [x] Permissions vérifiées
- [ ] Supabase migration (table missions)
- [ ] API endpoints missionService
- [ ] Notifications email
- [ ] Tests unitaires
- [ ] Tests E2E workflow

---

## 🚀 PROCHAINES ÉTAPES

1. **Créer migration Supabase** pour nouvelle structure missions
2. **Implémenter API** missionService.updateClosure()
3. **Tester workflow complet** en bdd
4. **Ajouter notifications** email/SMS
5. **Export rapport** clôture mission

---

**Date**: 21 novembre 2025
**Version**: 2.1.0 - Workflow Clôture Complet
**Statut**: ✅ INTERFACE COMPLÈTE
