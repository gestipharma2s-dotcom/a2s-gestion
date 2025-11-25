import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, TrendingUp, Lightbulb, Target } from 'lucide-react';

const AiAnalysisDisplay = ({ analysisData, loading }) => {
  const [expandedSections, setExpandedSections] = useState({
    risks: true,
    anomalies: true,
    metrics: true,
    trends: true,
    recommendations: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!analysisData) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500">Aucune analyse disponible. Cliquez sur "Analyser avec l'IA" pour générer une analyse.</p>
      </div>
    );
  }

  const { missionMetrics, riskLevels, anomalies, performanceMetrics, trends, recommendations, summary } = analysisData;

  return (
    <div className="space-y-4">
      {/* ============ RÉSUMÉ EXÉCUTIF ============ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600 font-semibold">Total Missions</p>
          <p className="text-2xl font-bold text-blue-900">{summary.totalMissions}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <p className="text-sm text-red-600 font-semibold">Critique</p>
          <p className="text-2xl font-bold text-red-900">{summary.criticalMissions}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-600 font-semibold">Avertissement</p>
          <p className="text-2xl font-bold text-yellow-900">{summary.warningMissions}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600 font-semibold">Complétion</p>
          <p className="text-2xl font-bold text-green-900">{summary.completionRate}%</p>
        </div>
      </div>

      {/* ============ RISQUES CLASSIFIÉS ============ */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <div
          onClick={() => toggleSection('risks')}
          className="bg-gradient-to-r from-red-500 to-red-600 p-4 cursor-pointer flex items-center justify-between hover:shadow-lg transition"
        >
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-white" />
            <span className="text-white font-semibold">
              🔴 Risques Identifiés ({summary.criticalMissions + summary.warningMissions} missions)
            </span>
          </div>
          {expandedSections.risks ? <ChevronUp size={20} className="text-white" /> : <ChevronDown size={20} className="text-white" />}
        </div>

        {expandedSections.risks && (
          <div className="p-4 space-y-3">
            {/* Missions Critiques */}
            {riskLevels.critique.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-900 mb-2">🚨 Missions Critiques</h4>
                <div className="space-y-2">
                  {riskLevels.critique.map(m => (
                    <div key={m.id} className="text-sm text-red-800 p-2 bg-white rounded border-l-4 border-red-500">
                      <p className="font-semibold">{m.titre}</p>
                      <p className="text-xs mt-1">
                        Score risque: <span className="font-bold">{m.riskScore}/100</span> | 
                        {m.daysLeft} jour(s) restant(s) | Budget: {m.budgetPercent}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missions d'Avertissement */}
            {riskLevels.avertissement.length > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Missions à Surveiller</h4>
                <div className="space-y-2">
                  {riskLevels.avertissement.slice(0, 3).map(m => (
                    <div key={m.id} className="text-sm text-yellow-800 p-2 bg-white rounded border-l-4 border-yellow-500">
                      <p className="font-semibold">{m.titre}</p>
                      <p className="text-xs mt-1">
                        Score risque: <span className="font-bold">{m.riskScore}/100</span>
                      </p>
                    </div>
                  ))}
                  {riskLevels.avertissement.length > 3 && (
                    <p className="text-xs text-yellow-600 italic">
                      +{riskLevels.avertissement.length - 3} autre(s)...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Pas de risques */}
            {riskLevels.critique.length === 0 && riskLevels.avertissement.length === 0 && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-green-800 font-semibold">✅ Aucune mission critique - Bonne santé du portefeuille</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============ ANOMALIES DÉTECTÉES ============ */}
      {anomalies.length > 0 && (
        <div className="border rounded-lg overflow-hidden bg-white">
          <div
            onClick={() => toggleSection('anomalies')}
            className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 cursor-pointer flex items-center justify-between hover:shadow-lg transition"
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-white" />
              <span className="text-white font-semibold">⚡ Anomalies Détectées ({anomalies.length})</span>
            </div>
            {expandedSections.anomalies ? <ChevronUp size={20} className="text-white" /> : <ChevronDown size={20} className="text-white" />}
          </div>

          {expandedSections.anomalies && (
            <div className="p-4 space-y-3">
              {anomalies.map((anomaly, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-l-4 ${
                    anomaly.severity === 'critique'
                      ? 'bg-red-50 border-red-500'
                      : anomaly.severity === 'haute'
                      ? 'bg-orange-50 border-orange-500'
                      : 'bg-yellow-50 border-yellow-500'
                  }`}
                >
                  <h4 className={`font-semibold mb-1 ${
                    anomaly.severity === 'critique'
                      ? 'text-red-900'
                      : anomaly.severity === 'haute'
                      ? 'text-orange-900'
                      : 'text-yellow-900'
                  }`}>
                    {anomaly.title}
                  </h4>
                  <p className="text-sm text-gray-700 mb-2">{anomaly.description}</p>
                  <p className="text-xs font-semibold text-gray-800 bg-white bg-opacity-50 p-2 rounded">
                    ✓ Action: {anomaly.action}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============ MÉTRIQUES DE PERFORMANCE ============ */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <div
          onClick={() => toggleSection('metrics')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 cursor-pointer flex items-center justify-between hover:shadow-lg transition"
        >
          <div className="flex items-center gap-3">
            <Target size={20} className="text-white" />
            <span className="text-white font-semibold">📊 Métriques de Performance</span>
          </div>
          {expandedSections.metrics ? <ChevronUp size={20} className="text-white" /> : <ChevronDown size={20} className="text-white" />}
        </div>

        {expandedSections.metrics && (
          <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <p className="text-xs text-blue-600 font-semibold">Taux Complétion</p>
              <p className="text-xl font-bold text-blue-900">{performanceMetrics.tauxCompletion}%</p>
            </div>
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <p className="text-xs text-green-600 font-semibold">Efficience Budget</p>
              <p className="text-xl font-bold text-green-900">{performanceMetrics.budgetEfficiency}%</p>
            </div>
            <div className="bg-purple-50 p-3 rounded border border-purple-200">
              <p className="text-xs text-purple-600 font-semibold">Avancement Moyen</p>
              <p className="text-xl font-bold text-purple-900">{performanceMetrics.averageProgress}%</p>
            </div>
            <div className="bg-indigo-50 p-3 rounded border border-indigo-200">
              <p className="text-xs text-indigo-600 font-semibold">Taux Retard</p>
              <p className="text-xl font-bold text-indigo-900">{performanceMetrics.tauxRetard}%</p>
            </div>
            <div className="bg-orange-50 p-3 rounded border border-orange-200">
              <p className="text-xs text-orange-600 font-semibold">Charge Moyenne</p>
              <p className="text-xl font-bold text-orange-900">{Math.round(performanceMetrics.missionCount / Math.max(performanceMetrics.chefCount, 1))} / chef</p>
            </div>
            <div className="bg-cyan-50 p-3 rounded border border-cyan-200">
              <p className="text-xs text-cyan-600 font-semibold">Chefs Assignés</p>
              <p className="text-xl font-bold text-cyan-900">{performanceMetrics.chefCount}</p>
            </div>
          </div>
        )}
      </div>

      {/* ============ TENDANCES & PRÉDICTIONS ============ */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <div
          onClick={() => toggleSection('trends')}
          className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 cursor-pointer flex items-center justify-between hover:shadow-lg transition"
        >
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-white" />
            <span className="text-white font-semibold">📈 Tendances & Prédictions</span>
          </div>
          {expandedSections.trends ? <ChevronUp size={20} className="text-white" /> : <ChevronDown size={20} className="text-white" />}
        </div>

        {expandedSections.trends && (
          <div className="p-4 space-y-3">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-blue-900">Vélocité</span>
                <span className="text-2xl">{trends.velocity.icon}</span>
              </div>
              <p className="text-sm text-blue-800">
                <span className="font-bold capitalize">{trends.velocity.status}</span> - {trends.velocity.value} missions/semaine
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-green-900">Budget</span>
                <span className="text-2xl">{trends.budget.icon}</span>
              </div>
              <p className="text-sm text-green-800">
                <span className="font-bold capitalize">{trends.budget.status}</span> - {trends.budget.percent}% d'efficience
              </p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-orange-900">Délais</span>
                <span className="text-2xl">{trends.deadline.icon}</span>
              </div>
              <p className="text-sm text-orange-800">
                <span className="font-bold capitalize">{trends.deadline.status}</span> - {trends.deadline.value} jours en moyenne
              </p>
            </div>

            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-red-900">Charge Équipe</span>
                <span className="text-2xl">{trends.teamLoad.icon}</span>
              </div>
              <p className="text-sm text-red-800">
                <span className="font-bold capitalize">{trends.teamLoad.status}</span> - {trends.teamLoad.value} missions par chef
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ============ RECOMMANDATIONS ACTIONABLES ============ */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <div
          onClick={() => toggleSection('recommendations')}
          className="bg-gradient-to-r from-green-500 to-green-600 p-4 cursor-pointer flex items-center justify-between hover:shadow-lg transition"
        >
          <div className="flex items-center gap-3">
            <Lightbulb size={20} className="text-white" />
            <span className="text-white font-semibold">⚡ Recommandations ({recommendations.length})</span>
          </div>
          {expandedSections.recommendations ? <ChevronUp size={20} className="text-white" /> : <ChevronDown size={20} className="text-white" />}
        </div>

        {expandedSections.recommendations && (
          <div className="p-4 space-y-3">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  rec.severity === 'critique'
                    ? 'bg-red-50 border-red-500'
                    : rec.severity === 'avertissement'
                    ? 'bg-yellow-50 border-yellow-500'
                    : rec.severity === 'success'
                    ? 'bg-green-50 border-green-500'
                    : 'bg-blue-50 border-blue-500'
                }`}
              >
                <h4 className={`font-semibold mb-1 flex items-center gap-2 ${
                  rec.severity === 'critique'
                    ? 'text-red-900'
                    : rec.severity === 'avertissement'
                    ? 'text-yellow-900'
                    : rec.severity === 'success'
                    ? 'text-green-900'
                    : 'text-blue-900'
                }`}>
                  <span>{rec.icon}</span>
                  {rec.title}
                </h4>
                <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                <div className={`text-xs font-semibold p-2 rounded ${
                  rec.severity === 'critique'
                    ? 'bg-red-100 text-red-900'
                    : rec.severity === 'avertissement'
                    ? 'bg-yellow-100 text-yellow-900'
                    : rec.severity === 'success'
                    ? 'bg-green-100 text-green-900'
                    : 'bg-blue-100 text-blue-900'
                }`}>
                  ✓ {rec.action}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AiAnalysisDisplay;
