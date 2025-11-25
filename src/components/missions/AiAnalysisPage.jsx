import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Download, Share2, Calendar, Filter } from 'lucide-react';
import AiAnalysisDisplay from './AiAnalysisDisplay';
import generateCompleteInsights from '../../services/enhancedAiAnalysisService';
import { missionService } from '../../services/missionService';
import { useApp } from '../../context/AppContext';
import Button from '../common/Button';

const AiAnalysisPage = ({ onBack, filteredMissions, stats }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatedAt, setGeneratedAt] = useState(null);
  const { addNotification } = useApp();

  // Générer l'analyse au montage
  useEffect(() => {
    generateAnalysis();
  }, [filteredMissions, stats]);

  const generateAnalysis = async () => {
    try {
      setLoading(true);
      
      if (!filteredMissions || filteredMissions.length === 0) {
        addNotification({
          type: 'warning',
          message: 'Aucune mission à analyser'
        });
        setLoading(false);
        return;
      }

      // Générer l'analyse
      const analysis = generateCompleteInsights(filteredMissions, stats);
      setAnalysisData(analysis);
      setGeneratedAt(new Date());

      addNotification({
        type: 'success',
        message: '✅ Analyse IA complète générée'
      });
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      addNotification({
        type: 'error',
        message: 'Erreur lors de la génération de l\'analyse'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      if (!analysisData) return;

      const exportData = {
        générationDate: generatedAt?.toLocaleString('fr-DZ'),
        résumé: analysisData.summary,
        risques: analysisData.riskLevels,
        anomalies: analysisData.anomalies,
        métriques: analysisData.performanceMetrics,
        tendances: analysisData.trends,
        recommandations: analysisData.recommendations.map(r => ({
          titre: r.title,
          description: r.description,
          action: r.action,
          priorité: r.priority,
          sévérité: r.severity
        }))
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonString));
      element.setAttribute('download', `analyse-missions-${new Date().toISOString().split('T')[0]}.json`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      addNotification({
        type: 'success',
        message: '✅ Analyse exportée en JSON'
      });
    } catch (error) {
      console.error('Erreur export:', error);
      addNotification({
        type: 'error',
        message: 'Erreur lors de l\'export'
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-lg border-b-4 border-purple-600">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={24} />
                <span className="font-medium">Retour au Dashboard</span>
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={generateAnalysis}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Analyse...' : 'Régénérer'}
              </Button>
              
              <Button
                onClick={handleExport}
                disabled={!analysisData}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <Download size={18} />
                Exporter
              </Button>

              <Button
                onClick={handlePrint}
                className="bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-2"
              >
                <Share2 size={18} />
                Imprimer
              </Button>
            </div>
          </div>

          {/* Titre et info */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🤖 Analyse IA Complète des Missions
              </h1>
              <p className="text-gray-600">
                Analyse intelligente en temps réel basée sur {filteredMissions?.length || 0} mission(s)
              </p>
            </div>
            
            {generatedAt && (
              <div className="text-right text-sm text-gray-500">
                <p>📅 Générée: {generatedAt.toLocaleTimeString('fr-DZ')}</p>
                <p>🔄 Dernière mise à jour</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin mb-4">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full"></div>
              </div>
              <p className="text-lg font-semibold text-gray-700">Génération de l'analyse...</p>
              <p className="text-gray-500 mt-2">Analyse intelligente en cours de calcul</p>
            </div>
          </div>
        ) : analysisData ? (
          <div className="space-y-8 print:space-y-4">
            {/* Afficher le composant d'analyse */}
            <AiAnalysisDisplay analysisData={analysisData} loading={false} />

            {/* Section supplémentaire: Détails des missions par risque */}
            <div className="mt-12 pt-8 border-t-4 border-gray-300">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                🎯 Détail des Missions par Catégorie de Risque
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Missions Critiques */}
                {analysisData.riskLevels.critique.length > 0 && (
                  <div className="bg-red-50 rounded-lg border-2 border-red-300 p-6">
                    <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                      🔴 Missions Critiques ({analysisData.riskLevels.critique.length})
                    </h3>
                    <div className="space-y-3">
                      {analysisData.riskLevels.critique.map((m, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
                          <h4 className="font-bold text-gray-900">{m.titre}</h4>
                          <div className="text-sm text-gray-600 mt-2 space-y-1">
                            <p>📊 Score Risque: <span className="font-bold text-red-600">{m.riskScore}/100</span></p>
                            <p>⏰ Jours restants: <span className="font-bold">{m.daysLeft}</span></p>
                            <p>📈 Avancement: <span className="font-bold">{m.avancementActuel}%</span></p>
                            <p>💰 Budget: <span className="font-bold">{m.budgetPercent}%</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missions d'Avertissement */}
                {analysisData.riskLevels.avertissement.length > 0 && (
                  <div className="bg-yellow-50 rounded-lg border-2 border-yellow-300 p-6">
                    <h3 className="text-xl font-bold text-yellow-900 mb-4 flex items-center gap-2">
                      🟡 Missions à Surveiller ({analysisData.riskLevels.avertissement.length})
                    </h3>
                    <div className="space-y-3">
                      {analysisData.riskLevels.avertissement.slice(0, 5).map((m, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
                          <h4 className="font-bold text-gray-900">{m.titre}</h4>
                          <div className="text-sm text-gray-600 mt-2 space-y-1">
                            <p>📊 Score Risque: <span className="font-bold text-yellow-600">{m.riskScore}/100</span></p>
                            <p>⏰ Jours restants: <span className="font-bold">{m.daysLeft}</span></p>
                            <p>📈 Avancement: <span className="font-bold">{m.avancementActuel}%</span></p>
                          </div>
                        </div>
                      ))}
                      {analysisData.riskLevels.avertissement.length > 5 && (
                        <p className="text-xs text-yellow-700 italic">
                          +{analysisData.riskLevels.avertissement.length - 5} autre(s)...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Missions Normales */}
                {analysisData.riskLevels.normal.length > 0 && (
                  <div className="bg-green-50 rounded-lg border-2 border-green-300 p-6">
                    <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                      ✅ Missions Saines ({analysisData.riskLevels.normal.length})
                    </h3>
                    <div className="space-y-3">
                      {analysisData.riskLevels.normal.slice(0, 5).map((m, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                          <h4 className="font-bold text-gray-900">{m.titre}</h4>
                          <div className="text-sm text-gray-600 mt-2 space-y-1">
                            <p>📊 Score Risque: <span className="font-bold text-green-600">{m.riskScore}/100</span></p>
                            <p>⏰ Jours restants: <span className="font-bold">{m.daysLeft}</span></p>
                            <p>📈 Avancement: <span className="font-bold">{m.avancementActuel}%</span></p>
                          </div>
                        </div>
                      ))}
                      {analysisData.riskLevels.normal.length > 5 && (
                        <p className="text-xs text-green-700 italic">
                          +{analysisData.riskLevels.normal.length - 5} autre(s)...
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section: Comparaison Avancement Réel vs Prévu */}
            <div className="mt-12 pt-8 border-t-4 border-gray-300">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                📊 Analyse Avancement Réel vs Prévu
              </h2>
              <div className="bg-white rounded-lg shadow-lg p-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b-2 border-gray-300">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-gray-900">Mission</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-900">Avancement Réel</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-900">Avancement Prévu</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-900">Écart</th>
                      <th className="px-4 py-3 text-center font-bold text-gray-900">État</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {analysisData.missionMetrics.map((m, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{m.titre}</td>
                        <td className="px-4 py-3 text-center">{m.avancementActuel}%</td>
                        <td className="px-4 py-3 text-center">{m.avancementPrévu}%</td>
                        <td className={`px-4 py-3 text-center font-bold ${
                          m.écartAvancement > 0
                            ? 'text-green-600'
                            : m.écartAvancement < -15
                            ? 'text-red-600'
                            : 'text-amber-600'
                        }`}>
                          {m.écartAvancement > 0 ? '+' : ''}{m.écartAvancement}%
                        </td>
                        <td className="px-4 py-3 text-center">
                          {m.écartAvancement > 0 ? '✅ En avance' : m.écartAvancement < -15 ? '🔴 Retard' : '⚠️ Normal'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t-4 border-gray-300 text-center text-gray-600">
              <p className="text-sm">
                📄 Rapport généré automatiquement par le système d'analyse IA
              </p>
              <p className="text-xs mt-2">
                Basé sur {filteredMissions?.length || 0} mission(s) - {generatedAt?.toLocaleString('fr-DZ')}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700">Aucune analyse disponible</p>
              <p className="text-gray-500 mt-2">Veuillez sélectionner des missions pour générer une analyse</p>
            </div>
          </div>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .sticky {
            position: static;
          }
          button, .hide-on-print {
            display: none !important;
          }
          body {
            background: white;
          }
          .print\\:space-y-4 > * + * {
            margin-top: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AiAnalysisPage;
