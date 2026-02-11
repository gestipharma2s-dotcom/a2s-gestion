# Checklist de test - Filtre Wilaya Dropdown

## Test Unitaire: MultiSelectDropdown.jsx

### 1. Rendu Initial
- [ ] Composant affiche le label "Filtrer par Wilaya"
- [ ] Bouton affiche "Tous les Wilayas (X)" au chargement
- [ ] Chevron pointe vers le bas (↓)
- [ ] Icône MapPin affiche correctement

### 2. Ouverture/Fermeture
- [ ] Cliquer sur le bouton ouvre le dropdown
- [ ] Chevron tourne 180° (↑) quand ouvert
- [ ] Cliquer sur le bouton à nouveau ferme le dropdown
- [ ] Chevron redevient normal (↓) quand fermé
- [ ] Clic extérieur ferme le dropdown

### 3. Sélection Individuelle
- [ ] Cliquer une checkbox sélectionne l'option
- [ ] Checkbox devient coché (visuel bleu)
- [ ] Le bouton affiche "1 sélectionné"
- [ ] Cliquer 2+ options affiche "2 sélectionnés", "3 sélectionnés"...
- [ ] Unchecking une option la retire de la sélection

### 4. Bouton "Tous"
- [ ] Cliquer "Tous" sélectionne TOUTES les wilayas
- [ ] Tous les checkboxes deviennent coché
- [ ] Bouton affiche "6 sélectionnés" (ou nombre total)
- [ ] État du checkbox "Tous" = checked

### 5. État Indeterminate
- [ ] Sélectionner 1-5 items (sur 6 total)
- [ ] Checkbox "Tous" affiche l'état indeterminate (-)
- [ ] Clic sur "Tous" sélectionne maintenant les AUTRES items
- [ ] Clic de nouveau déselectionne tous

### 6. Bouton X (Réinitialiser)
- [ ] Sélectionner 1+ item
- [ ] Bouton X apparaît à droite du header
- [ ] Cliquer X réinitialise toute la sélection
- [ ] Le dropdown se ferme après clic X
- [ ] Le bouton affiche à nouveau "Tous les Wilayas (X)"

### 7. Scrolling
- [ ] Si >6 items, liste doit scroller
- [ ] Max-height: 240px (60 * 4 = approx)
- [ ] Header "sticky" reste visible en haut
- [ ] Scroll fluide et performant

## Tests d'Intégration: InterventionsList.jsx

### 8. Filtrage Interventions
- [ ] Sélectionner "Alger" filtre les interventions
- [ ] Sélectionner "Alger" + "Oran" filtre les deux
- [ ] Filtre s'applique en temps réel (sans rechargement)
- [ ] Nombre d'interventions diminue selon sélection
- [ ] Le reste des filtres (statut, date, etc.) restent fonctionnels

### 9. Multi-Filtre
- [ ] Combiner: Wilaya + Status (en_cours/cloturee)
- [ ] Combiner: Wilaya + Date + Creator
- [ ] Tous les filtres appliqués simultanément
- [ ] Aucune intervention dupliquée

### 10. Data Refresh
- [ ] Charger la page → wilayas disponibles affichées
- [ ] Créer une nouvelle intervention avec wilaya
- [ ] La wilaya apparaît dans le dropdown
- [ ] Filtre fonctionne sur les nouvelles données

## Tests d'Intégration: InstallationsList.jsx

### 11. Filtrage Installations
- [ ] Sélectionner "Alger" filtre les installations
- [ ] Sélectionner multiple → filtre correct
- [ ] Combiné avec autres filtres (date, statut, creator)

### 12. Nombre d'items
- [ ] Affichage total des wilayas correct
- [ ] Compte correct des installations par wilaya

## Tests Responsiveness

### 13. Mobile (< 640px)
- [ ] Dropdown prend 100% largeur
- [ ] Texte pas coupé
- [ ] Chevron bien positionné
- [ ] Dropdown menu visible sans déborder de l'écran

### 14. Tablet (640px - 1024px)
- [ ] Dropdown responsive
- [ ] Menu s'affiche correctement

### 15. Desktop (> 1024px)
- [ ] Dropdown max-width respecté
- [ ] Espacement bon

## Tests d'Accessibilité

### 16. Keyboard Navigation
- [ ] Tab vers le bouton (focus visible)
- [ ] Enter/Space ouvre le dropdown
- [ ] Tab dans les checkboxes
- [ ] Space sur checkbox toggle la sélection
- [ ] Escape ferme le dropdown

### 17. Screen Reader
- [ ] Label "Filtrer par Wilaya" lu correctement
- [ ] Checkboxes annoncées avec leur label
- [ ] "Tous" bien annoncé
- [ ] Nombre d'items annoncé

## Tests de Performance

### 18. Rendering
- [ ] Ouverture dropdown < 100ms
- [ ] No jank ou lag au scrolling
- [ ] Sélection multiple < 50ms par item

### 19. Memory
- [ ] Event listeners nettoyés on unmount
- [ ] Pas de memory leaks avec DevTools

## Tests Edge Cases

### 20. Cas particuliers
- [ ] 0 wilayas disponibles → "Aucune option disponible"
- [ ] 1 wilaya uniquement → bouton "Tous" fonctionne
- [ ] 100+ wilayas → scroll performant
- [ ] Noms de wilaya très longs → truncate ou wrap
- [ ] Sélectionner tout → déselectionner tout → resélectionner

## Résumé

### ✅ À Valider
- [ ] Tous les tests 1-20 passent
- [ ] Pas d'erreurs console (devtools)
- [ ] Pas d'erreurs TypeScript/Lint
- [ ] Performance acceptable
- [ ] Design correspond à la spécification

### 📸 Screenshots requis
- Dropdown fermé (aucune sélection)
- Dropdown fermé (avec sélection: "2 sélectionnés")
- Dropdown ouvert, header visible
- Dropdown scrolling (si >6 items)
- État indeterminate du checkbox "Tous"
- Filtre appliqué (interventions/installations réduites)

### 🚀 Déploiement
- Tous les tests ✅
- Documentation ✅
- Code review ✅
- Merge vers main ✅
