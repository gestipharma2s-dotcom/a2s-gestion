# 🔧 Ajouter les colonnes pour Commentaires et Dépenses

## Problème
Les colonnes suivantes manquent dans la table `missions`:
- `commentaires_techniques`
- `commentaires_financiers`
- `depenses_details`

## Solution: Exécuter la migration SQL

### Étape 1: Ouvrir Supabase SQL Editor
1. Allez sur: https://app.supabase.com
2. Sélectionnez votre projet
3. Cliquez sur **SQL Editor** dans le menu gauche
4. Cliquez sur **New Query**

### Étape 2: Copier-Coller le SQL

```sql
-- Ajouter les colonnes à la table missions
ALTER TABLE missions
ADD COLUMN IF NOT EXISTS commentaires_techniques JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS commentaires_financiers JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS depenses_details JSONB DEFAULT '[]'::jsonb;
```

### Étape 3: Cliquer sur "Run"

Attendez la notification: ✅ **Query executed successfully**

### Étape 4: Vérifier les colonnes

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'missions'
AND column_name IN ('commentaires_techniques', 'commentaires_financiers', 'depenses_details');
```

Vous devriez voir 3 lignes avec le type `jsonb`.

### Étape 5: Rafraîchir l'app

```powershell
# Dans le terminal (Ctrl+C pour arrêter npm run dev)
npm run dev
```

Puis rafraîchir le navigateur (F5) et tester l'ajout de commentaires.

---

## ✅ Résultat

Les commentaires et dépenses seront maintenant **sauvegardés en base de données** avec:
- Date et heure de création
- Auteur (email utilisateur)
- Tous les détails (montant, type, description pour dépenses)

