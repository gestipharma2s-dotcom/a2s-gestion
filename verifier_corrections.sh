#!/bin/bash

# ============================================
# 🔍 SCRIPT DE VÉRIFICATION FINALE
# ============================================
# Vérifie que toutes les corrections sont bien appliquées

echo ""
echo "============================================"
echo "🔍 VÉRIFICATION DES CORRECTIONS"
echo "============================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
TOTAL=0
OK=0
FAILED=0

check() {
  TOTAL=$((TOTAL + 1))
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ $2${NC}"
    OK=$((OK + 1))
  else
    echo -e "${RED}❌ $2${NC}"
    FAILED=$((FAILED + 1))
  fi
}

# 1. Vérifier API Gemini
echo "📡 1. API GEMINI"
if grep -q "v1beta/models/gemini-1.5-flash" src/services/aiService.js; then
  check 0 "Modèle Gemini corrigé (v1beta/gemini-1.5-flash)"
else
  check 1 "Modèle Gemini NON corrigé"
fi
echo ""

# 2. Vérifier historique prospects
echo "📝 2. HISTORIQUE PROSPECTS"
if grep -q "historique_actions" src/services/prospectService.js; then
  check 0 "Méthodes historique_actions présentes"
else
  check 1 "Méthodes historique_actions MANQUANTES"
fi

if grep -q "getHistorique" src/services/prospectService.js; then
  check 0 "Méthode getHistorique() trouvée"
else
  check 1 "Méthode getHistorique() MANQUANTE"
fi

if grep -q "addHistorique" src/services/prospectService.js; then
  check 0 "Méthode addHistorique() trouvée"
else
  check 1 "Méthode addHistorique() MANQUANTE"
fi
echo ""

# 3. Vérifier champ secteur
echo "🏢 3. CHAMP SECTEUR"
if grep -q "GROSSISTE PHARM" src/components/prospects/ProspectForm.jsx; then
  check 0 "Liste secteur dans formulaire"
else
  check 1 "Liste secteur MANQUANTE"
fi

if grep -q "secteur" src/services/prospectService.js; then
  check 0 "Validation secteur dans service"
else
  check 1 "Validation secteur MANQUANTE"
fi
echo ""

# 4. Vérifier message suppression installation
echo "🗑️ 4. MESSAGE SUPPRESSION"
if grep -q "INSTALLATION_HAS_PAIEMENTS" src/services/installationService.js; then
  check 0 "Code erreur spécifique"
else
  check 1 "Code erreur MANQUANT"
fi

if grep -q "Installation liée" src/components/installations/InstallationsList.jsx; then
  check 0 "Message personnalisé affiché"
else
  check 1 "Message personnalisé MANQUANT"
fi
echo ""

# 5. Vérifier calcul reste à payer
echo "💰 5. CALCUL RESTE À PAYER"
if grep -q "totalInstallations - totalPaiements" src/components/dashboard/Dashboard.jsx; then
  check 0 "Formule de calcul correcte"
else
  check 1 "Formule de calcul INCORRECTE"
fi
echo ""

# 6. Vérifier fichier SQL
echo "🗄️ 6. MIGRATION SQL"
if [ -f "supabase_fix_prospects_secteur.sql" ]; then
  check 0 "Fichier SQL trouvé"
else
  check 1 "Fichier SQL MANQUANT"
fi
echo ""

# 7. Vérifier variables d'environnement
echo "🔑 7. VARIABLES D'ENVIRONNEMENT"
if [ -f ".env" ]; then
  if grep -q "VITE_AI_PROVIDER=gemini" .env; then
    check 0 "Variable VITE_AI_PROVIDER configurée"
  else
    check 1 "Variable VITE_AI_PROVIDER MANQUANTE"
  fi
  
  if grep -q "VITE_AI_API_KEY" .env; then
    check 0 "Variable VITE_AI_API_KEY configurée"
  else
    check 1 "Variable VITE_AI_API_KEY MANQUANTE"
  fi
else
  check 1 "Fichier .env MANQUANT"
fi
echo ""

# Résumé
echo "============================================"
echo "📊 RÉSUMÉ"
echo "============================================"
echo -e "Total vérifications: ${TOTAL}"
echo -e "${GREEN}Réussies: ${OK}${NC}"
echo -e "${RED}Échouées: ${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ TOUTES LES CORRECTIONS SONT APPLIQUÉES!${NC}"
  echo ""
  echo "🎯 Prochaines étapes:"
  echo "1. Exécuter la migration SQL dans Supabase"
  echo "2. Redémarrer le serveur: npm run dev"
  echo "3. Tester les 5 corrections"
  exit 0
else
  echo -e "${RED}⚠️ CERTAINES CORRECTIONS SONT MANQUANTES!${NC}"
  echo ""
  echo "📝 À faire:"
  echo "- Vérifier les fichiers mentionnés ci-dessus"
  echo "- Consulter CORRECTIONS_FINAL_15NOV.md"
  exit 1
fi
