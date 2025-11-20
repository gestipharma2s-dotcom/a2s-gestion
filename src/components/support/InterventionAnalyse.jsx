import React, { useState, useEffect } from 'react';
import { interventionService } from '../../services/interventionService';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Users, Zap, Award } from 'lucide-react';

const InterventionAnalyse = () => {
  const [interventions, setInterventions] = useState([]);
  const [analyse, setAnalyse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAndAnalyze();
  }, []);

  const loadAndAnalyze = async () => {
    try {
      const data = await interventionService.getAll();
      setInterventions(data);
      analyzeData(data);
    } catch (error) {
      console.error('Erreur chargement interventions:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeData = (data) => {
    if (data.length === 0) {
      setAnalyse(null);
      return;
    }

    // Analyse par IA (simulation intelligente)
    const totalInterventions = data.length;
    const cloturees = data.filter(i => i.statut === 'cloturee');
    const enCours = data.filter(i => i.statut === 'en_cours');
    const hautesPriorites = data.filter(i => i.priorite === 'haute');
    
    // Durée moyenne
    const dureeMoyenne = Math.round(data.reduce((sum, i) => sum + (i.duree || 0), 0) / totalInterventions || 0);
    
    // Taux de résolution
    const tauxResolution = Math.round((cloturees.length / totalInterventions * 100) || 0);
    
    // Types d'interventions
    const typesCount = {};
    data.forEach(i => {
      typesCount[i.type_intervention] = (typesCount[i.type_intervention] || 0) + 1;
    });
    
    const typePlusFrequent = Object.entries(typesCount)
      .sort((a, b) => b[1] - a[1])[0];
    
    // Problèmes récurrents (analyse basique des mots-clés)
    const motsCles = {};
    data.forEach(i => {
      const mots = i.resume_probleme?.toLowerCase().split(' ') || [];
      mots.forEach(mot => {
        if (mot.length > 4) {
          motsCles[mot] = (motsCles[mot] || 0) + 1;
        }
      });
    });
    
    const problemesRecurrents = Object.entries(motsCles)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([mot, count]) => ({ mot, count }));
    
    // Performance par technicien
    const techniciens = {};
    data.forEach(i => {
      if (i.technicien?.nom) {
        if (!techniciens[i.technicien.nom]) {
          techniciens[i.technicien.nom] = { total: 0, cloturees: 0, duree: 0 };
        }
        techniciens[i.technicien.nom].total++;
        if (i.statut === 'cloturee') techniciens[i.technicien.nom].cloturees++;
        techniciens[i.technicien.nom].duree += i.duree || 0;
      }
    });
    
    const performanceTechniciens = Object.entries(techniciens).map(([nom, stats]) => ({
      nom,
      total: stats.total,
      tauxResolution: Math.round((stats.cloturees / stats.total) * 100),
      dureeMoyenne: Math.round(stats.duree / stats.total)
    })).sort((a, b) => b.tauxResolution - a.tauxResolution);
    
    // Tendances temporelles
    const aujourdhui = new Date();
    const semaineDerniere = new Date(aujourdhui.getTime() - 7 * 24 * 60 * 60 * 1000);
    const interventionsSemaine = data.filter(i => new Date(i.date_intervention) >= semaineDerniere);
    
    const tendance = interventionsSemaine.length > (totalInterventions / 4) ? 'hausse' : 'baisse';
    
    // Recommandations IA
    const recommandations = [];
    
    if (enCours.length > cloturees.length) {
      recommandations.push({
        type: 'warning',
        message: `${enCours.length} interventions en cours. Prioriser la clôture des interventions en attente.`
      });
    }
    
    if (hautesPriorites.length > totalInterventions * 0.3) {
      recommandations.push({
        type: 'danger',
        message: `${hautesPriorites.length} interventions haute priorité. Augmenter les ressources techniques.`
      });
    }
    
    if (dureeMoyenne > 120) {
      recommandations.push({
        type: 'info',
        message: `Durée moyenne élevée (${dureeMoyenne} min). Envisager une formation technique supplémentaire.`
      });
    }
    
    if (tauxResolution > 80) {
      recommandations.push({
        type: 'success',
        message: `Excellent taux de résolution (${tauxResolution}%). Continuez sur cette lancée !`
      });
    }
    
    if (problemesRecurrents.length > 0) {
      recommandations.push({
        type: 'info',
        message: `Problème récurrent détecté: "${problemesRecurrents[0].mot}". Créer une documentation préventive.`
      });
    }

    setAnalyse({
      totalInterventions,
      cloturees: cloturees.length,
      enCours: enCours.length,
      hautesPriorites: hautesPriorites.length,
      dureeMoyenne,
      tauxResolution,
      typePlusFrequent,
      problemesRecurrents,
      performanceTechniciens,
      tendance,
      recommandations
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analyse) {
    return (
      <div className="card text-center py-12">
        <Brain className="mx-auto text-gray-300 mb-4" size={64} />
        <p className="text-gray-500 text-lg">Aucune donnée disponible pour l'analyse</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
            <Brain size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">Analyse IA des Interventions</h2>
            <p className="text-purple-100">Intelligence artificielle • Insights automatiques</p>
          </div>
        </div>
      </div>

      {/* Métriques Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <Clock className="text-blue-600" size={32} />
            <div>
              <p className="text-sm text-blue-600 font-medium">Durée Moyenne</p>
              <h3 className="text-2xl font-bold text-blue-800">{analyse.dureeMoyenne} min</h3>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-600" size={32} />
            <div>
              <p className="text-sm text-green-600 font-medium">Taux de Résolution</p>
              <h3 className="text-2xl font-bold text-green-800">{analyse.tauxResolution}%</h3>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-500">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-orange-600" size={32} />
            <div>
              <p className="text-sm text-orange-600 font-medium">Haute Priorité</p>
              <h3 className="text-2xl font-bold text-orange-800">{analyse.hautesPriorites}</h3>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500">
          <div className="flex items-center gap-3">
            {analyse.tendance === 'hausse' ? (
              <TrendingUp className="text-purple-600" size={32} />
            ) : (
              <TrendingDown className="text-purple-600" size={32} />
            )}
            <div>
              <p className="text-sm text-purple-600 font-medium">Tendance</p>
              <h3 className="text-2xl font-bold text-purple-800 capitalize">{analyse.tendance}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recommandations IA */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="text-yellow-500" size={24} />
          <h3 className="text-lg font-bold text-gray-800">Recommandations IA</h3>
        </div>
        <div className="space-y-3">
          {analyse.recommandations.map((reco, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                reco.type === 'success' ? 'bg-green-50 border-green-500' :
                reco.type === 'warning' ? 'bg-orange-50 border-orange-500' :
                reco.type === 'danger' ? 'bg-red-50 border-red-500' :
                'bg-blue-50 border-blue-500'
              }`}
            >
              <p className={`text-sm font-medium ${
                reco.type === 'success' ? 'text-green-800' :
                reco.type === 'warning' ? 'text-orange-800' :
                reco.type === 'danger' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {reco.message}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Techniciens */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Award className="text-primary" size={24} />
          <h3 className="text-lg font-bold text-gray-800">Performance des Techniciens</h3>
        </div>
        <div className="space-y-3">
          {analyse.performanceTechniciens.map((tech, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-yellow-100' :
                    index === 1 ? 'bg-gray-200' :
                    index === 2 ? 'bg-orange-100' :
                    'bg-blue-100'
                  }`}>
                    <Users className={
                      index === 0 ? 'text-yellow-600' :
                      index === 1 ? 'text-gray-600' :
                      index === 2 ? 'text-orange-600' :
                      'text-blue-600'
                    } size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{tech.nom}</h4>
                    <p className="text-xs text-gray-500">{tech.total} interventions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{tech.tauxResolution}%</p>
                  <p className="text-xs text-gray-500">{tech.dureeMoyenne} min/inter</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${tech.tauxResolution}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Problèmes Récurrents */}
      {analyse.problemesRecurrents.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-orange-500" size={24} />
            <h3 className="text-lg font-bold text-gray-800">Problèmes Récurrents Détectés</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {analyse.problemesRecurrents.map((probleme, index) => (
              <div key={index} className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
                <p className="text-2xl font-bold text-orange-600">{probleme.count}</p>
                <p className="text-sm text-orange-800 capitalize truncate">{probleme.mot}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Type Plus Fréquent */}
      {analyse.typePlusFrequent && (
        <div className="card bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-600 font-medium mb-1">Type d'intervention le plus fréquent</p>
              <h3 className="text-2xl font-bold text-indigo-800 capitalize">
                {analyse.typePlusFrequent[0]}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-indigo-600">{analyse.typePlusFrequent[1]}</p>
              <p className="text-sm text-indigo-500">occurrences</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterventionAnalyse;