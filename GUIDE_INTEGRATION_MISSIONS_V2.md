# 🎯 GUIDE D'INTÉGRATION - NOUVELLES FONCTIONNALITÉS MISSIONS

## 📝 Résumé Rapide

3 nouveaux composants et 2 nouveaux services ont été créés pour compléter le système de missions selon le cahier des charges v2.

---

## 1️⃣ COMPOSANT: MissionTechnical.jsx

### 📍 Localisation
`src/components/missions/MissionTechnical.jsx` (558 lignes)

### 📌 Fonctionnalités
- ✅ Rapport technique (textarea)
- ✅ Actions réalisées (liste avec dates)
- ✅ Logiciels & matériels (type, nom, version)
- ✅ Problèmes & résolutions (problème + solution)
- ✅ Sections pliables/dépliables
- ✅ Compteurs d'éléments

### 🔗 Utilisation

```jsx
import MissionTechnical from './MissionTechnical';

// Dans votre composant
<MissionTechnical 
  mission={mission}
  onUpdate={handleTechnicalUpdate}
/>

// Fonction de callback
const handleTechnicalUpdate = (technicalData) => {
  // technicalData contient:
  // {
  //   rapportTechnique: "...",
  //   actionsRealisees: [...],
  //   logicielsMateriels: [...],
  //   problemesResolutions: [...]
  // }
  
  // Appeler le service pour sauvegarder
  await missionService.updateTechnicalDetails(mission.id, technicalData);
};
```

### 🎨 Intégration dans MissionDetailsModal

```jsx
// Ajouter dans l'onglet "Technique"
{activeTab === 'technique' && (
  <MissionTechnical 
    mission={mission}
    onUpdate={handleTechnicalUpdate}
  />
)}
```

---

## 2️⃣ COMPOSANT: MissionExport.jsx

### 📍 Localisation
`src/components/missions/MissionExport.jsx` (220 lignes)

### 📌 Fonctionnalités
- ✅ Export PDF (avec jsPDF/html2canvas)
- ✅ Export Excel (avec xlsx)
- ✅ Impression (fenêtre native)
- ✅ Copie texte (presse-papiers)
- ✅ Interface sélection format

### 🔗 Utilisation

```jsx
import MissionExport from './MissionExport';

// Dans votre composant
const [showExportModal, setShowExportModal] = useState(false);

<Modal
  isOpen={showExportModal}
  onClose={() => setShowExportModal(false)}
  title="Exporter la mission"
>
  <MissionExport 
    mission={selectedMission}
    onClose={() => setShowExportModal(false)}
  />
</Modal>

// Bouton pour ouvrir
<Button onClick={() => setShowExportModal(true)}>
  📤 Exporter
</Button>
```

### 📦 Installation des dépendances

```bash
# Pour PDF réel
npm install jspdf html2canvas

# Pour Excel réel
npm install xlsx
```

### 💡 Note
Actuellement, les exports sont simulés. Après installation des dépendances, décommenter les imports dans `missionExportService.js`.

---

## 3️⃣ COMPOSANT: JustificatifsUpload.jsx

### 📍 Localisation
`src/components/missions/JustificatifsUpload.jsx` (440 lignes)

### 📌 Fonctionnalités
- ✅ Drag & drop de fichiers
- ✅ Sélection fichier normal
- ✅ Validation taille (max 10MB)
- ✅ Validation type (PDF, images, Excel, Word)
- ✅ Upload simulé (prêt pour Supabase Storage)
- ✅ Affichage fichiers uploadés
- ✅ Suppression fichiers

### 🔗 Utilisation

```jsx
import JustificatifsUpload from './JustificatifsUpload';

// Dans votre composant
const [justificatifs, setJustificatifs] = useState([]);

<JustificatifsUpload 
  missionId={mission.id}
  onFilesUploaded={(files) => {
    setJustificatifs(files);
    console.log('Fichiers uploadés:', files);
  }}
/>

// Pour sauvegarder dans Supabase
const saveJustificatifs = async (files) => {
  for (const file of files) {
    await missionService.uploadJustificatif(
      mission.id,
      expenseId,
      file.file
    );
  }
};
```

### 🔌 Intégration Supabase Storage

1. Créer un bucket (si pas déjà fait):
```sql
-- Dans Supabase console
CREATE BUCKET mission-justificatifs
```

2. Configuration politique (RLS):
```sql
-- Permettre upload par utilisateurs authentifiés
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'mission-justificatifs');
```

---

## 4️⃣ SERVICE: missionExportService.js

### 📍 Localisation
`src/services/missionExportService.js` (300 lignes)

### 📌 Méthodes Disponibles

```javascript
import missionExportService from '../../services/missionExportService';

// Export PDF
const result = await missionExportService.exportMissionPDF(mission);

// Export Excel
const result = await missionExportService.exportMissionExcel(mission);

// Export statistiques
const stats = missionExportService.exportMissionStatistics(missions);

// Générer rapport texte
const textReport = missionExportService.generateTextReport(mission);

// Imprimer
missionExportService.printMission(mission);
```

### ⚙️ Configuration PDF

```javascript
// Dans missionExportService.js, quand jsPDF installé:
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Décommenter la logique d'export réel
```

### ⚙️ Configuration Excel

```javascript
// Dans missionExportService.js, quand xlsx installé:
import XLSX from 'xlsx';

// Décommenter la logique d'export réel
```

---

## 5️⃣ SERVICE: missionAlertsService.js

### 📍 Localisation
`src/services/missionAlertsService.js` (400 lignes)

### 📌 Méthodes Disponibles

```javascript
import missionAlertsService from '../../services/missionAlertsService';

// Envoyer alerte générique
await missionAlertsService.sendAlert(
  missionAlertsService.alertTypes.MISSION_CREATED,
  mission,
  recipients,
  message
);

// Alertes spécifiques
await missionAlertsService.onMissionCreated(mission, recipients);
await missionAlertsService.onMissionDelayed(mission, recipients);
await missionAlertsService.onMissionBudgetWarning(mission, recipients);
await missionAlertsService.onMissionClosed(mission, recipients, commentaire);
await missionAlertsService.onMissionValidated(mission, recipients, commentaire);

// Vérifier et envoyer alertes nécessaires
const alerts = await missionAlertsService.checkAndSendAlerts(
  newMission, 
  oldMission,
  allUsers
);
```

### 📧 Intégration Email (v3)

```javascript
// Configuration .env requise:
VITE_EMAIL_SERVICE=sendgrid // ou resend, smtp, etc.
VITE_EMAIL_API_KEY=sk_xxx
```

### 💡 Implémentation Future

```javascript
// Dans missionAlertsService.js:

// 1. Installer dépendance
npm install @sendgrid/mail  // ou autre service

// 2. Importer
import sgMail from '@sendgrid/mail';

// 3. Configurer
sgMail.setApiKey(import.meta.env.VITE_EMAIL_API_KEY);

// 4. Envoyer dans sendAlert()
await sgMail.send({
  to: recipient,
  from: 'noreply@a2s-gestion.com',
  subject: template.subject,
  html: template.body
});
```

---

## 6️⃣ UTILITAIRE: missionPermissions.js

### 📍 Localisation
`src/utils/missionPermissions.js` (250 lignes)

### 📌 Utilisation

```javascript
import missionPermissions from '../../utils/missionPermissions';

// Vérifier permissions individuelles
if (missionPermissions.canEditMission(userRole, mission, userId)) {
  // Afficher bouton modifier
}

if (missionPermissions.canCloseMission(userRole, mission, userId)) {
  // Afficher bouton clôturer
}

// Récupérer toutes les actions disponibles
const actions = missionPermissions.getAvailableActions(
  userRole, 
  mission, 
  userId
);

// actions = ['edit', 'close', 'viewExpenses', ...]

// Message d'erreur personnalisé
const message = missionPermissions.getErrorMessage('edit', userRole);
```

### 🔐 Matrice Permissions

```javascript
// Accéder à la matrice
console.log(missionPermissions.permissionMatrix);

// Résultat:
{
  'Super Admin': [...],
  'Admin': [...],
  'Chef Mission': [...],
  // ...
}
```

---

## 7️⃣ AMÉLIORATION: missionService.js

### 📍 Localisation
`src/services/missionService.js`

### 📌 Nouvelles Méthodes

```javascript
import { missionService } from '../../services/missionService';

// Techniques
await missionService.updateTechnicalDetails(missionId, technicalData);

// Clôture
await missionService.closeMissionByChef(missionId, closureData);
await missionService.validateClosureByAdmin(missionId, validationData);

// Justificatifs
await missionService.uploadJustificatif(missionId, expenseId, file);
const justificatifs = await missionService.getJustificatifs(missionId);
await missionService.deleteJustificatif(expenseId, fileUrl);

// Alertes
const delayed = await missionService.getDelayedMissions();
const budgetWarning = await missionService.getMissionsWithBudgetWarning();
```

### 📦 Tables Supabase Requises

```sql
-- Vérifier existence de ces colonnes:

ALTER TABLE missions ADD COLUMN rapport_technique TEXT;
ALTER TABLE missions ADD COLUMN actions_realisees JSONB;
ALTER TABLE missions ADD COLUMN logiciels_materiels JSONB;
ALTER TABLE missions ADD COLUMN problemes_resolutions JSONB;

ALTER TABLE missions ADD COLUMN cloturee_par_chef BOOLEAN DEFAULT FALSE;
ALTER TABLE missions ADD COLUMN cloturee_definitive BOOLEAN DEFAULT FALSE;
ALTER TABLE missions ADD COLUMN date_clot_chef TIMESTAMP;
ALTER TABLE missions ADD COLUMN date_clot_definitive TIMESTAMP;
ALTER TABLE missions ADD COLUMN commentaire_clot_chef TEXT;
ALTER TABLE missions ADD COLUMN commentaire_clot_admin TEXT;
ALTER TABLE missions ADD COLUMN date_cloture_reelle DATE;

ALTER TABLE missions_expenses ADD COLUMN justificatif_url TEXT;

-- Bucket pour fichiers:
CREATE BUCKET mission-justificatifs;
```

---

## 🔄 FLUX D'INTÉGRATION COMPLET

### Étape 1: Ajouter Volet Technique
```jsx
// Dans MissionDetailsModal.jsx
import MissionTechnical from './MissionTechnical';

// Ajouter onglet
<button onClick={() => setActiveTab('technique')}>
  🔧 Technique
</button>

// Afficher composant
{activeTab === 'technique' && (
  <MissionTechnical mission={mission} onUpdate={handleSave} />
)}
```

### Étape 2: Ajouter Export
```jsx
// Ajouter bouton export
<Button onClick={() => setShowExport(true)}>
  📤 Exporter
</Button>

// Modal export
<MissionExport mission={mission} onClose={() => setShowExport(false)} />
```

### Étape 3: Ajouter Justificatifs
```jsx
// Dans volet Financier
import JustificatifsUpload from './JustificatifsUpload';

<JustificatifsUpload 
  missionId={mission.id}
  onFilesUploaded={handleFilesUploaded}
/>
```

### Étape 4: Activer Alertes
```jsx
// Quand statut change
if (newStatus !== oldStatus) {
  const recipients = missionAlertsService.getRecipients(
    mission, 
    null, 
    allUsers
  );
  
  await missionAlertsService.onMissionStarted(mission, recipients);
}
```

### Étape 5: Appliquer Permissions
```jsx
// Sur chaque action
import missionPermissions from '../../utils/missionPermissions';

if (!missionPermissions.canEditMission(userRole, mission, userId)) {
  alert(missionPermissions.getErrorMessage('edit', userRole));
  return;
}
```

---

## ✅ CHECKLIST D'INTÉGRATION

- [ ] Importer MissionTechnical.jsx dans MissionDetailsModal
- [ ] Ajouter onglet "Technique" 
- [ ] Tester ajout actions/logiciels/problèmes
- [ ] Importer MissionExport.jsx
- [ ] Ajouter bouton export avec modal
- [ ] Tester formats export (texte, impression)
- [ ] Importer JustificatifsUpload.jsx
- [ ] Ajouter dans volet financier
- [ ] Configurer bucket Supabase storage
- [ ] Importer missionAlertsService
- [ ] Configurer appels d'alertes
- [ ] Importer missionPermissions
- [ ] Appliquer vérifications permissions
- [ ] Mettre à jour missionService.js
- [ ] Tester nouvelles méthodes Supabase
- [ ] Tests end-to-end complets

---

## 🚀 DÉPLOIEMENT

1. **Push code** sur git
2. **Installer dépendances** (jspdf, xlsx si export réel)
3. **Configurer Supabase** (migrations SQL)
4. **Tests en staging** (tous les flux)
5. **Deploy production**

---

## 📞 TROUBLESHOOTING

### Les exports ne fonctionnent pas
→ Installer: `npm install jspdf html2canvas xlsx`

### Les justificatifs ne s'upload pas
→ Vérifier bucket Supabase existe et RLS configurée

### Les alertes email ne partent pas
→ Configurer SendGrid/Resend avec `missionAlertsService`

### Les permissions bloquent les actions
→ Vérifier rôle utilisateur dans `profile.role`

---

**Documentation créée:** 22 novembre 2025  
**Version:** v2.0 Complet
