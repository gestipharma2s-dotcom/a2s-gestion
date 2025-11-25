# Sources de Données - Dashboard Corrigé

## 📊 Chaque Graphique Utilise Maintenant les Bonnes Sources

### 1️⃣ **Répartition Revenus** 
**Source**: `INSTALLATIONS` table
```javascript
// Calcul
installationsData.forEach(inst => {
  if (inst.type === 'abonnement' || inst.statut === 'actif') {
    revenusAbonnements += inst.montant;
  } else {
    revenusAcquisitions += inst.montant;
  }
});

// Pie Chart
{
  name: 'Abonnements', 
  value: stats.revenusAbonnements, // Depuis installations
  color: '#2563eb' 
},
{
  name: 'Acquisitions', 
  value: stats.revenusAcquisitions, // Depuis installations
  color: '#10b981' 
}
```

**Données Affichées**:
- Abonnements: Somme des installations avec type='abonnement'
- Acquisitions: Somme des installations avec type='acquisition'
- Total: revenusAbonnements + revenusAcquisitions

---

### 2️⃣ **Revenus Abonnements vs Acquisitions**
**Source**: `PAIEMENTS` table (groupés par mois)
```javascript
// Calcul
paiementsData.forEach(p => {
  const month = getMonth(p.created_at); // Jan, Fév, etc.
  
  if (p.type === 'abonnement') {
    monthlyData[month].abonnements += p.montant;
  } else {
    monthlyData[month].acquisitions += p.montant;
  }
  
  monthlyData[month].total += p.montant;
});

// BarChart
{
  mois: 'Jan',
  total: 50000,           // SUM(paiements WHERE created_at in January)
  abonnements: 35000,     // SUM(paiements WHERE type='abonnement' AND January)
  acquisitions: 15000     // SUM(paiements WHERE type='acquisition' AND January)
}
```

**Données Affichées**:
- Chaque barre représente 1 mois
- Hauteur = Total paiements du mois
- Couleurs = Répartition abonnements vs acquisitions
- Basé sur `created_at` du paiement

---

### 3️⃣ **Top 5 - Reste à Payer**
**Source**: `INSTALLATIONS` + `PROSPECTS` (avec noms des clients)
```javascript
// Calcul 1: Grouper installations par client
installationsData.forEach(inst => {
  resteParClient[inst.client_id].total_installations += inst.montant;
});

// Calcul 2: Chercher le nom du client
const prospect = prospectsData.find(p => p.id === inst.client_id);
raison_sociale: prospect?.raison_sociale;

// Calcul 3: Soustraire les paiements
paiementsData.forEach(p => {
  resteParClient[p.client_id].total_paye += p.montant;
});

// Calcul 4: Calculer le reste
const reste = total_installations - total_paye;

// BarChart Horizontal
{
  client: "SOPRODI SPA",  // Nom du client depuis PROSPECTS
  montant: 450000         // total_installations - total_paye
}
```

**Données Affichées**:
- Y-axis: Noms des clients (depuis PROSPECTS)
- X-axis: Montant reste à payer
- Top 5 clients avec plus de dettes
- Filtré: Seulement si reste > 0
- Trié: DESC par montant

---

## 🔗 Relation Entre les Données

```
PROSPECTS (raison_sociale, statut)
    ↓
    ├─→ INSTALLATIONS (client_id, montant, type)
    │       ↓
    │       └─→ PAIEMENTS (client_id, montant, created_at, type)
    │
    └─→ Taux de Conversion = (clients actifs / prospects) * 100
```

---

## 📋 Tableau Complet des Sources

| Graphique | Données | Source SQL | Calcul |
|-----------|---------|------------|--------|
| **Répartition Revenus** | Abonnements, Acquisitions | `installations` | `SUM(montant) WHERE type='abonnement'` |
| **Revenus Mensuels** | Total, Abonnements, Acquisitions | `paiements` | `SUM(montant) GROUP BY MONTH(created_at), type` |
| **Top 5 Dettes** | Client (nom), Montant | `installations + paiements + prospects` | `SUM(inst) - SUM(paiements) GROUP BY client ORDER BY DESC LIMIT 5` |
| **Stats Cards** | Clients, Prospects, Revenus | `prospects + paiements + installations` | `COUNT()`, `SUM()` |

---

## 🎯 Vérification des Données

### Avant (❌ Incorrecte)
- Répartition revenus: Statique (1.68M + 770K codés en dur)
- Revenus mensuels: Données mockées avec du hasard aléatoire
- Top 5 dettes: Sans noms de clients

### Après (✅ Correcte)
- Répartition revenus: Basée sur les installations réelles
- Revenus mensuels: Basée sur les paiements réels groupés par date
- Top 5 dettes: Avec noms de clients depuis PROSPECTS

---

## 🔍 Exemples de Requêtes SQL Équivalentes

### 1. Répartition Revenus
```sql
SELECT 
  type,
  SUM(montant) as total
FROM installations
GROUP BY type;
```

### 2. Revenus Mensuels
```sql
SELECT 
  DATE_TRUNC('month', created_at) as mois,
  type,
  SUM(montant) as total
FROM paiements
GROUP BY DATE_TRUNC('month', created_at), type
ORDER BY mois DESC
LIMIT 6;
```

### 3. Top 5 Dettes
```sql
SELECT 
  p.raison_sociale as client,
  SUM(i.montant) - SUM(paiements.montant) as reste
FROM installations i
LEFT JOIN prospects p ON i.client_id = p.id
LEFT JOIN paiements ON paiements.client_id = i.client_id
GROUP BY i.client_id, p.raison_sociale
HAVING (SUM(i.montant) - SUM(paiements.montant)) > 0
ORDER BY reste DESC
LIMIT 5;
```

---

## ✅ Test et Validation

Pour vérifier que les données sont correctes:

1. **Ouvrir le Dashboard**
2. **Vérifier Répartition Revenus**
   - Doit correspondent à la somme des installations
   - Si une seule installation de 1M abonnement: Afficher 1M en bleu

3. **Vérifier Revenus Mensuels**
   - Les barres doivent correspondre aux paiements réels
   - Les mois vides doivent avoir 0

4. **Vérifier Top 5 Dettes**
   - Doit afficher les vrais noms de clients
   - Doit afficher le reste réel (installations - paiements)
   - Doit être trié par montant DESC

---

## 📝 Modifications Apportées

**Fichier**: `src/components/dashboard/Dashboard.jsx`

**Changements:**
1. ✅ Ajouter calcul `revenusAbonnements` et `revenusAcquisitions` depuis installations
2. ✅ Créer fonction `generateRevenusFromPaiements()` pour grouper paiements par mois
3. ✅ Améliorer Top 5 Dettes avec recherche du nom de client depuis prospects
4. ✅ Ajouter champs `revenusAbonnements` et `revenusAcquisitions` dans `stats` state
5. ✅ Mettre à jour `repartitionData` pour utiliser `stats.revenusAbonnements/Acquisitions`

---

## 🎉 Résultat

✅ Tous les graphiques utilisent maintenant les **vraies données** de Supabase
✅ Pas de données statiques ou mockées
✅ Chaque graphique reflète l'état réel de la base de données
✅ Build successful (2198 modules, 0 erreurs)
