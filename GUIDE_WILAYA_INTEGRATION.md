# 🎯 INTÉGRATION WILAYA - GUIDE COMPLET

## 📌 OVERVIEW

Système complet de missions avec **auto-remplissage de la wilaya** depuis la fiche client/prospect.

**Flux**:
```
Création Client/Prospect
  ├─ Saisir wilaya (Alger, Blida, Oran, etc.)
  ↓
Création Mission
  ├─ Sélectionner client → wilaya s'auto-remplit ✓
  └─ Plus besoin de saisir lieu manuellement
```

---

## 🔧 MODIFICATIONS NÉCESSAIRES

### 1️⃣ Ajouter Wilaya dans Formulaire CLIENT

**Fichier**: `src/components/clients/ClientForm.jsx` (ou équivalent)

```jsx
const ClientForm = ({ client, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    raison_sociale: '',
    email: '',
    telephone: '',
    adresse: '',
    wilaya: '',  // ← AJOUTER
    statut: 'actif',
    // ...autres champs...
  });

  return (
    <form>
      {/* Champs existants */}
      <Input
        name="raison_sociale"
        value={formData.raison_sociale}
        // ...
      />
      
      {/* NOUVEAU: Wilaya */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          📍 Wilaya
        </label>
        <Select
          name="wilaya"
          value={formData.wilaya}
          onChange={handleChange}
          options={[
            { value: '', label: 'Sélectionner une wilaya...' },
            { value: 'Alger', label: 'Alger' },
            { value: 'Blida', label: 'Blida' },
            { value: 'Oran', label: 'Oran' },
            { value: 'Constantine', label: 'Constantine' },
            { value: 'Annaba', label: 'Annaba' },
            // ... autres wilayas
          ]}
        />
      </div>

      {/* Buttons */}
      <Button onClick={handleSubmit}>Sauvegarder</Button>
    </form>
  );
};
```

### 2️⃣ Ajouter Wilaya dans Formulaire PROSPECT

**Fichier**: `src/components/prospects/ProspectForm.jsx` (ou équivalent)

Même structure que ClientForm - ajouter le Select Wilaya.

### 3️⃣ Sauvegarder Wilaya en BDD

**Fichier**: `src/services/clientService.js`

```javascript
export const clientService = {
  async create(clientData) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert([
          {
            raison_sociale: clientData.raison_sociale,
            email: clientData.email,
            telephone: clientData.telephone,
            adresse: clientData.adresse,
            wilaya: clientData.wilaya,  // ← AJOUTER
            statut: clientData.statut,
            created_by: clientData.created_by
          }
        ])
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur création client:', error);
      throw error;
    }
  }
};
```

---

## 📋 LISTE COMPLÈTE WILAYAS ALGÉRIE

```javascript
const WILAYAS = [
  'Adrar',
  'Aïn Defla',
  'Aïn Témouchent',
  'Alger',
  'Annaba',
  'Batna',
  'Béchar',
  'Béjaïa',
  'Biskra',
  'Blida',
  'Bordj Bou Arréridj',
  'Bouïra',
  'Boumerdès',
  'Chlef',
  'Constantine',
  'Djelfa',
  'El Bayadh',
  'Elbiari',
  'El Oued',
  'El Taref',
  'Ghardaïa',
  'Guelma',
  'Illizi',
  'Jijel',
  'Khenchela',
  'Laghouat',
  'Mascara',
  'Médéa',
  'Mila',
  'Mostaganem',
  'M\'Sila',
  'Nabeul',
  'Oran',
  'Ouargla',
  'Oum El Bouaghi',
  'Relizane',
  'Saïda',
  'Sétif',
  'Sidi Bel Abbès',
  'Skikda',
  'Souk Ahras',
  'Tamanghasset',
  'Tébessa',
  'Tiaret',
  'Tindouf',
  'Tipasa',
  'Tissemsilt',
  'Tizi Ouzou',
  'Touat',
  'Tlemcen'
];

// Utiliser dans Select:
options={WILAYAS.map(w => ({ value: w, label: w }))}
```

---

## 🔄 WORKFLOW COMPLET

### Étape 1: CLIENT CRÉE PROSPECT

```
[Formulaire Prospect]
├─ Nom: "ACME Corp"
├─ Email: "contact@acme.dz"
├─ Adresse: "123 Rue..."
├─ 📍 Wilaya: [Alger ▼]
└─ [Créer]

✓ Prospect créé avec wilaya='Alger'
```

### Étape 2: PROSPECT DEVIENT CLIENT

```
✓ Client créé (statut: 'actif')
  └─ wilaya='Alger' (conservée)
```

### Étape 3: ADMIN CRÉE MISSION POUR CE CLIENT

```
[Formulaire Mission]
├─ Titre: "Installation ERP"
├─ Description: "..."
├─ Client: [ACME Corp ▼]
│  
│  EVENT: useEffect déclenché
│  → Récupère wilaya='Alger' du client ACME
│
├─ 📍 Wilaya: Alger (auto-rempli) ✓
├─ Type: [Installation ▼]
├─ Dates: [20/11] [25/11]
├─ Budget: [5000]
├─ Chef: [Jean Dupont ▼]
└─ [Créer]

✓ Mission créée
  └─ lieu='Alger'
  └─ wilaya='Alger'
```

### Étape 4: MISSION VISIBLE DANS JOURNAL

```
📔 Journal des Missions
├─ ✨ Installation ERP      🟢 Conforme
│  ACME Corp | Installation
│  📍 Alger (auto) ← Wilaya du client
│  Budget: 5000€ ...
│
└─ [🔧 Technique] [💰 Financier] [🔴 Clôturer]
```

---

## ✅ CHECKLIST IMPLÉMENTATION

**Pour CLIENT/PROSPECT**:
- [ ] Ajouter champ `wilaya` au formulaire
- [ ] Select avec liste des 58 wilayas
- [ ] Sauvegarder `wilaya` en BDD
- [ ] Afficher wilaya dans détails client

**Pour MISSION**:
- [x] ✅ Ajouter `wilaya` à formData
- [x] ✅ Auto-remplir wilaya au sélection client
- [x] ✅ Afficher READ-ONLY dans formulaire
- [x] ✅ Sauvegarder wilaya avec mission

**Pour BDD**:
- [ ] Exécuter migration SQL (MIGRATION_WILAYA_MISSIONS.sql)
- [ ] Ajouter index pour recherche rapide

**Tests**:
- [ ] Créer client avec wilaya
- [ ] Créer prospect avec wilaya
- [ ] Créer mission → wilaya auto-rempli
- [ ] Affichage wilaya dans journal
- [ ] Recherche par wilaya (optionnel)

---

## 🎨 COMPOSANTS AFFECTÉS

| Composant | Modification | Priorité |
|-----------|--------------|----------|
| ClientForm.jsx | Ajouter wilaya Select | ⭕ Haute |
| ProspectForm.jsx | Ajouter wilaya Select | ⭕ Haute |
| MissionForm.jsx | ✅ Déjà fait (auto-rempli) | ✅ Done |
| MissionsList.jsx | ✅ Déjà fait | ✅ Done |
| clientService.js | Inclure wilaya dans create/update | ⭕ Haute |
| prospectService.js | Inclure wilaya dans create/update | ⭕ Haute |

---

## 🚀 APRÈS IMPLÉMENTATION

### Recherche avancée (optionnel)
```javascript
// Filtrer missions par wilaya
const missionsByWilaya = (wilaya) => {
  return missions.filter(m => m.wilaya === wilaya);
};

// Afficher dropdown wilaya unique
const uniqueWilayas = [...new Set(missions.map(m => m.wilaya))];
```

### Rapport par Wilaya
```
📊 MISSIONS PAR WILAYA
├─ Alger: 5 missions (15 000€)
├─ Blida: 3 missions (9 000€)
├─ Oran: 2 missions (6 500€)
└─ ...
```

### Export Wilayas
```javascript
// Exporter missions par wilaya en CSV
const exportByWilaya = (wilaya) => {
  const data = missions.filter(m => m.wilaya === wilaya);
  return convertToCSV(data);
};
```

---

## 📞 SUPPORT

**Questions**:
- Wilaya obligatoire? OUI (pour missions)
- Une mission = une wilaya? OUI
- Peut changer wilaya après création? BIENTÔT (Admin only)
- Can search by wilaya? OUI (filter Bar)

---

## 📝 NOTES

✨ Le système est **prêt pour intégration BDD** une fois:
1. Wilayas ajoutés dans formulaires Client/Prospect
2. Migration SQL exécutée
3. Services mis à jour

**Développement UI**: ~30 min
**Tests**: ~15 min
**Déploiement**: Immédiat

---

**Date**: 21 novembre 2025
**Version**: 2.2.0 - Wilaya Integration Guide
**Statut**: 📋 GUIDE COMPLET
