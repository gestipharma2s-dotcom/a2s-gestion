/**
 * Service d'Analyse IA Avancée pour les Missions
 * Gère le calcul intelligent des risques, tendances et recommandations
 */

// ============ CALCUL DE SCORE DE RISQUE ============
export const calculateMissionRiskScore = (mission, now) => {
  const dateFin = new Date(mission.dateFin || mission.date_fin_prevue);
  const dateDebut = new Date(mission.dateDebut || mission.date_debut_prevue);
  
  const daysLeft = Math.ceil((dateFin - now) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.ceil((now - dateDebut) / (1000 * 60 * 60 * 24));
  const totalDuration = Math.ceil((dateFin - dateDebut) / (1000 * 60 * 60 * 24));
  
  const budget = mission.budgetInitial || mission.budget_alloue || 0;
  const depenses = mission.depenses || 0;
  const budgetPercent = budget > 0 ? (depenses / budget) * 100 : 0;
  
  const avancementActuel = mission.avancement || 0;
  const avancementPrévu = totalDuration > 0 ? (daysElapsed / totalDuration) * 100 : 0;
  const écartAvancement = avancementActuel - avancementPrévu;
  
  let score = 0;
  
  if (mission.statut === 'en_cours' || mission.statut === 'en-cours') {
    // Facteur 1: Urgence (0-40 points)
    if (daysLeft < 1) score += 40;
    else if (daysLeft < 3) score += 30;
    else if (daysLeft < 7) score += 20;
    else if (daysLeft < 14) score += 10;
    
    // Facteur 2: Budget (0-35 points)
    if (budgetPercent > 120) score += 35;
    else if (budgetPercent > 100) score += 25;
    else if (budgetPercent > 85) score += 15;
    
    // Facteur 3: Avancement (0-25 points)
    if (écartAvancement < -30) score += 30;
    else if (écartAvancement < -15) score += 20;
    else if (écartAvancement < -5) score += 10;
  }
  
  return Math.min(Math.max(score, 0), 100);
};

// ============ ANALYSE DÉTAILLÉE DES MÉTRIQUES ============
export const analyzeAllMissions = (missions, stats) => {
  const now = new Date();
  
  const missionMetrics = missions.map(m => {
    const dateFin = new Date(m.dateFin || m.date_fin_prevue);
    const dateDebut = new Date(m.dateDebut || m.date_debut_prevue);
    const daysLeft = Math.ceil((dateFin - now) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((now - dateDebut) / (1000 * 60 * 60 * 24));
    const totalDuration = Math.ceil((dateFin - dateDebut) / (1000 * 60 * 60 * 24));
    
    const budget = m.budgetInitial || m.budget_alloue || 0;
    const depenses = m.depenses || 0;
    const budgetPercent = budget > 0 ? (depenses / budget) * 100 : 0;
    const budgetRemaining = budget - depenses;
    
    const avancementActuel = m.avancement || 0;
    const avancementPrévu = totalDuration > 0 ? (daysElapsed / totalDuration) * 100 : 0;
    const écartAvancement = avancementActuel - avancementPrévu;
    
    return {
      id: m.id,
      titre: m.titre,
      statut: m.statut,
      avancementActuel,
      avancementPrévu: Math.round(avancementPrévu),
      écartAvancement: Math.round(écartAvancement),
      budgetPercent: Math.round(budgetPercent),
      budget: Math.round(budget),
      depenses: Math.round(depenses),
      budgetRemaining: Math.round(budgetRemaining),
      daysLeft,
      daysElapsed,
      totalDuration,
      type: m.type || 'Général',
      priorite: m.priorite || 'normale',
      chefMission: m.chef_name || m.chef_id || 'Non assigné',
      riskScore: calculateMissionRiskScore(m, now)
    };
  });
  
  return missionMetrics;
};

// ============ CLASSIFICATION PAR NIVEAUX DE RISQUE ============
export const classifyByRiskLevel = (missionMetrics) => {
  return {
    critique: missionMetrics.filter(m => m.riskScore >= 70),
    avertissement: missionMetrics.filter(m => m.riskScore >= 40 && m.riskScore < 70),
    normal: missionMetrics.filter(m => m.riskScore < 40)
  };
};

// ============ DÉTECTION DES ANOMALIES ============
export const detectAnomalies = (missionMetrics) => {
  const anomalies = [];
  
  missionMetrics.forEach(m => {
    // Anomalie 1: Retard chronologique
    if (m.écartAvancement < -15 && (m.statut === 'en_cours' || m.statut === 'en-cours')) {
      anomalies.push({
        type: 'retard_chronologique',
        mission: m,
        severity: 'haute',
        title: `⏰ Retard Chronologique: ${m.titre}`,
        description: `${Math.abs(m.écartAvancement)}% en retard sur le calendrier prévu`,
        action: 'Accélérer l\'exécution ou reprogrammer'
      });
    }
    
    // Anomalie 2: Dépassement budgétaire
    if (m.budgetPercent > 120) {
      anomalies.push({
        type: 'depassement_budget',
        mission: m,
        severity: m.budgetPercent > 150 ? 'critique' : 'haute',
        title: `💰 Dépassement Budget: ${m.titre}`,
        description: `Dépassement de ${Math.round(m.budgetPercent - 100)}% (${m.depenses}€ / ${m.budget}€)`,
        action: 'Revoir le budget ou demander crédits supplémentaires'
      });
    }
    
    // Anomalie 3: Accélération suspecte
    if (m.écartAvancement > 20 && (m.statut === 'en_cours' || m.statut === 'en-cours')) {
      anomalies.push({
        type: 'qualite_suspecte',
        mission: m,
        severity: 'moyenne',
        title: `⚡ Progression Rapide: ${m.titre}`,
        description: `${m.écartAvancement}% d'avance sur le calendrier - vérifier la qualité`,
        action: 'Audit qualité pour confirmer la conformité'
      });
    }
    
    // Anomalie 4: Urgence d'inachèvement
    if (m.daysLeft < 3 && m.avancementActuel < 80) {
      anomalies.push({
        type: 'urgence_inachevement',
        mission: m,
        severity: 'critique',
        title: `🔴 CRITIQUE: ${m.titre}`,
        description: `${m.daysLeft} jour(s) restant(s), seulement ${m.avancementActuel}% complété`,
        action: 'Intervention immédiate requise'
      });
    }
  });
  
  return anomalies.sort((a, b) => {
    const severityScore = { 'critique': 3, 'haute': 2, 'moyenne': 1 };
    return (severityScore[b.severity] || 0) - (severityScore[a.severity] || 0);
  });
};

// ============ MÉTRIQUES DE PERFORMANCE ============
export const calculatePerformanceMetrics = (missions, stats) => {
  return {
    tauxCompletion: stats.total > 0 ? Math.round((stats.validees / stats.total) * 100) : 0,
    tauxRetard: stats.total > 0 ? Math.round((stats.delaiees / stats.total) * 100) : 0,
    budgetEfficiency: stats.budgetTotal > 0 ? Math.round(((stats.budgetTotal - stats.depensesTotal) / stats.budgetTotal) * 100) : 0,
    averageProgress: stats.enCours > 0 ? Math.round(missions.filter(m => m.statut === 'en_cours' || m.statut === 'en-cours').reduce((sum, m) => sum + (m.avancement || 0), 0) / Math.max(stats.enCours, 1)) : 0,
    missionCount: missions.length,
    chefCount: new Set(missions.map(m => m.chef_id)).size
  };
};

// ============ ANALYSE DES TENDANCES ============
export const calculateTrends = (missionMetrics, performanceMetrics) => {
  // Vélocité
  const completed = missionMetrics.filter(m => m.statut === 'validee' || m.statut === 'cloturee');
  const completionRate = completed.length / Math.max(missionMetrics.length, 1);
  const velocityValue = Math.round(completionRate * 10) / 10;
  
  // Budget
  const efficiency = missionMetrics.filter(m => m.budgetPercent <= 100).length / Math.max(missionMetrics.length, 1) * 100;
  
  // Délais
  const onTimeCount = missionMetrics.filter(m => m.daysLeft >= 7 || (m.statut !== 'en_cours' && m.statut !== 'en-cours'));
  const onTimeRate = onTimeCount.length / Math.max(missionMetrics.length, 1);
  
  const avgDaysLeft = missionMetrics
    .filter(m => m.statut === 'en_cours' || m.statut === 'en-cours')
    .reduce((sum, m) => sum + Math.max(0, m.daysLeft), 0) / 
    Math.max(missionMetrics.filter(m => m.statut === 'en_cours' || m.statut === 'en-cours').length, 1);
  
  // Charge équipe
  const avgLoadPerChef = performanceMetrics.missionCount / Math.max(performanceMetrics.chefCount, 1);
  
  return {
    velocity: {
      status: completionRate > 0.4 ? 'improving' : completionRate > 0.2 ? 'stable' : 'declining',
      value: velocityValue,
      icon: completionRate > 0.4 ? '📈' : completionRate > 0.2 ? '➡️' : '📉'
    },
    budget: {
      status: efficiency > 70 ? 'sain' : efficiency > 50 ? 'moyen' : 'critique',
      percent: Math.round(efficiency),
      icon: efficiency > 70 ? '✅' : efficiency > 50 ? '⚠️' : '🔴'
    },
    deadline: {
      status: onTimeRate > 0.7 ? 'contrôlée' : 'serrée',
      value: Math.round(avgDaysLeft),
      icon: onTimeRate > 0.7 ? '✅' : '⏰'
    },
    teamLoad: {
      status: avgLoadPerChef > 5 ? 'élevée' : 'normale',
      value: Math.round(avgLoadPerChef * 10) / 10,
      icon: avgLoadPerChef > 5 ? '👥⚠️' : '👥✅'
    }
  };
};

// ============ RECOMMANDATIONS INTELLIGENTES ============
export const generateRecommendations = (missionMetrics, riskLevels, anomalies, performanceMetrics, stats) => {
  const recommendations = [];
  
  // CRITIQUE: Missions critiques
  if (riskLevels.critique.length > 0) {
    recommendations.push({
      priority: 'urgent',
      severity: 'critique',
      icon: '🔴',
      title: `INTERVENTION IMMÉDIATE: ${riskLevels.critique.length} Mission(s) Critique(s)`,
      description: `Les missions suivantes nécessitent une action immédiate: ${riskLevels.critique.slice(0, 2).map(m => m.titre).join(', ')}${riskLevels.critique.length > 2 ? '...' : ''}`,
      action: 'Réunion de crise - Allouer ressources supplémentaires'
    });
  }
  
  // CRITIQUE: Anomalies critiques
  const criticalAnomalies = anomalies.filter(a => a.severity === 'critique');
  if (criticalAnomalies.length > 0) {
    recommendations.push({
      priority: 'urgent',
      severity: 'critique',
      icon: '⚠️',
      title: `${criticalAnomalies.length} Anomalie(s) Critique(s)`,
      description: criticalAnomalies[0].description,
      action: criticalAnomalies[0].action
    });
  }
  
  // HAUTE: Faible taux de complétion
  if (performanceMetrics.tauxCompletion < 60) {
    recommendations.push({
      priority: 'haute',
      severity: 'avertissement',
      icon: '📉',
      title: 'Taux de Complétion Faible',
      description: `${performanceMetrics.tauxCompletion}% de complétion (objectif: 80%+). Revoir la planification ou augmenter les ressources.`,
      action: 'Analyser les goulots d\'étranglement et les blocages'
    });
  }
  
  // HAUTE: Dépassements budgétaires récurrents
  const budgetIssues = missionMetrics.filter(m => m.budgetPercent > 100);
  if (budgetIssues.length > missionMetrics.length * 0.3) {
    recommendations.push({
      priority: 'haute',
      severity: 'avertissement',
      icon: '💰',
      title: 'Dépassements Budgétaires Récurrents',
      description: `${budgetIssues.length} mission(s) en dépassement. Plus de 30% du portefeuille affecté.`,
      action: 'Revoir le modèle d\'estimation et les marges de sécurité'
    });
  }
  
  // MOYENNE: Tendance de vélocité à la baisse
  if (performanceMetrics.tauxCompletion > 0 && performanceMetrics.tauxCompletion < 30) {
    recommendations.push({
      priority: 'moyenne',
      severity: 'info',
      icon: '📊',
      title: 'Vélocité à Optimiser',
      description: 'La cadence actuelle laisse peu de marge. Considérer une augmentation de capacité.',
      action: 'Évaluer les ressources disponibles et la charge de travail'
    });
  }
  
  // POSITIVE: Bonne performance
  if (performanceMetrics.tauxCompletion > 70 && riskLevels.critique.length === 0) {
    recommendations.push({
      priority: 'info',
      severity: 'success',
      icon: '🎯',
      title: 'Excellent Taux de Complétion',
      description: `Performance de ${performanceMetrics.tauxCompletion}% - Équipe en excellente trajectoire.`,
      action: 'Maintenir la dynamique actuelle'
    });
  }
  
  return recommendations;
};

// ============ GÉNÉRATION COMPLÈTE DES INSIGHTS ============
export const generateCompleteInsights = (missions, stats) => {
  const now = new Date();
  
  // 1. Analyser toutes les missions
  const missionMetrics = analyzeAllMissions(missions, stats);
  
  // 2. Classifier par risque
  const riskLevels = classifyByRiskLevel(missionMetrics);
  
  // 3. Détecter les anomalies
  const anomalies = detectAnomalies(missionMetrics);
  
  // 4. Calculer les métriques de performance
  const performanceMetrics = calculatePerformanceMetrics(missions, stats);
  
  // 5. Analyser les tendances
  const trends = calculateTrends(missionMetrics, performanceMetrics);
  
  // 6. Générer les recommandations
  const recommendations = generateRecommendations(missionMetrics, riskLevels, anomalies, performanceMetrics, stats);
  
  return {
    missionMetrics,
    riskLevels,
    anomalies,
    performanceMetrics,
    trends,
    recommendations,
    summary: {
      totalMissions: missions.length,
      criticalMissions: riskLevels.critique.length,
      warningMissions: riskLevels.avertissement.length,
      normalMissions: riskLevels.normal.length,
      detectedAnomalies: anomalies.length,
      completionRate: performanceMetrics.tauxCompletion,
      budgetHealth: performanceMetrics.budgetEfficiency
    }
  };
};

export default generateCompleteInsights;
