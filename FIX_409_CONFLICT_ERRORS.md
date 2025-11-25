# Fix: 409 Conflict Errors - Foreign Key Constraint Handling

## Issue
When trying to delete a prospect (or other records) that has been converted to an active client with linked records (installations, abonnements, paiements, etc.), Supabase returns a **409 Conflict** error.

**Error Message:**
```
ynoxsibapzatlxhmredp.supabase.co/rest/v1/prospects?id=eq.72fb5d0d-20f8-4dbe-b496-c8a49234c1c5:1  
Failed to load resource: the server responded with a status of 409 ()
```

## Root Cause
The database has **foreign key constraints** that prevent deletion of records that have dependent records:
- A prospect cannot be deleted if it has linked installations
- A prospect cannot be deleted if it has linked abonnements or paiements
- Etc.

This is a **database-level integrity constraint**, not an application error.

## Solution Implemented

### 1. Updated DataTable.jsx
Enhanced the DataTable component to support per-row evaluation of button properties:
- `disabled` can now be a function: `(row) => boolean`
- `title` can now be a function: `(row) => string`
- `className` can now be a function: `(row) => string`

This allows dynamic evaluation per row instead of static values at definition time.

### 2. Updated ProspectsList.jsx
Fixed the "Afficher" action button to properly evaluate per-row:
```jsx
disabled: (row) => !hasEditPermission || row.statut === 'actif',
title: (row) => row.statut === 'actif' 
  ? 'Actions désactivées: Ce prospect est devenu client actif'
  : !hasEditPermission 
    ? 'Permission refusée: Ajouter une action' 
    : 'Ajouter une action',
className: (row) => (!hasEditPermission || row.statut === 'actif') 
  ? 'bg-gray-400 cursor-not-allowed text-white px-3 py-1' 
  : 'bg-purple-600 hover:bg-purple-700 text-white px-3 py-1'
```

### 3. Improved Error Handling in Delete Handlers
Added specific error handling for **409 Conflict** errors in the following components:

#### ProspectsList.jsx
```jsx
if (error.status === 409 || error.message?.includes('foreign key')) {
  addNotification({
    type: 'error',
    message: 'Impossible de supprimer ce prospect car il est devenu client actif avec des enregistrements liés (installations, abonnements, paiements, etc.)'
  });
} else {
  addNotification({
    type: 'error',
    message: 'Erreur lors de la suppression du prospect'
  });
}
```

#### InterventionsList.jsx
```jsx
if (error.status === 409 || error.message?.includes('foreign key')) {
  addNotification({
    type: 'error',
    message: 'Impossible de supprimer cette intervention car elle est liée à d\'autres enregistrements'
  });
}
```

#### PaiementsList.jsx
```jsx
if (error.status === 409 || error.message?.includes('foreign key')) {
  addNotification({
    type: 'error',
    message: 'Impossible de supprimer ce paiement car il est lié à d\'autres enregistrements'
  });
}
```

#### ApplicationsList.jsx
```jsx
if (error.status === 409 || error.message?.includes('foreign key')) {
  addNotification({
    type: 'error',
    message: 'Impossible de supprimer cette application car elle est liée à d\'autres enregistrements'
  });
}
```

#### AbonnementsList.jsx
```jsx
if (error.status === 409 || error.message?.includes('foreign key')) {
  addNotification({
    type: 'error',
    message: 'Impossible de supprimer cet abonnement car il est lié à d\'autres enregistrements'
  });
}
```

## Result
- ✅ Build compiles successfully
- ✅ Users receive a **clear, user-friendly error message** explaining why deletion failed
- ✅ The app doesn't crash on 409 errors
- ✅ Console shows detailed error logging for debugging

## User Experience
When a user tries to delete a record with linked data:
1. Permission check happens first
2. Confirmation dialog is shown
3. If deletion fails with 409 error, user sees:
   - **Specific message** explaining the constraint (e.g., "prospect has become an active client")
   - **Reason** for the failure (foreign key constraint)
   - **No app crash or generic error**

## What Not To Do
Users should NOT:
- Try to delete prospects that have become active clients
- Try to delete records with linked data

Instead, they should:
- Delete the linked records first (installations, abonnements, paiements)
- Then delete the parent record

## Future Improvement
Consider adding a cascade delete option or implementing soft deletes to handle these scenarios more gracefully.
