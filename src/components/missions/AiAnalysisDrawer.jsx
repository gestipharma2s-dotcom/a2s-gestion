import React, { useState, useEffect } from 'react';
import { X, RefreshCw, Download, Share2 } from 'lucide-react';
import AiAnalysisDisplay from './AiAnalysisDisplay';
import generateCompleteInsights from '../../services/enhancedAiAnalysisService';
import { useApp } from '../../context/AppContext';
import Button from '../common/Button';

const AiAnalysisDrawer = ({ isOpen, onClose, filteredMissions, stats }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatedAt, setGeneratedAt] = useState(null);
  const { addNotification } = useApp();

  // Générer l'analyse quand le drawer s'ouvre
  useEffect(() => {
    if (isOpen) {
      generateAnalysis();
    }
  }, [isOpen, filteredMissions, stats]);

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

      const analysis = generateCompleteInsights(filteredMissions, stats);
      setAnalysisData(analysis);
      setGeneratedAt(new Date());

      addNotification({
        type: 'success',
        message: '✅ Analyse IA générée'
      });
    } catch (error) {
      console.error('Erreur analyse:', error);
      addNotification({
        type: 'error',
        message: 'Erreur lors de l\'analyse IA'
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
        message: '✅ Analyse exportée'
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

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-screen w-full md:w-2/3 lg:w-1/2 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 overflow-hidden">
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 flex items-center justify-between flex-shrink-0 shadow-lg">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">🤖 Analyse IA</h2>
            {generatedAt && (
              <span className="text-sm text-purple-100">
                • {generatedAt.toLocaleTimeString('fr-DZ')}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={generateAnalysis}
              disabled={loading}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition disabled:opacity-50"
              title="Régénérer"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            
            <button
              onClick={handleExport}
              disabled={!analysisData}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition disabled:opacity-50"
              title="Exporter JSON"
            >
              <Download size={20} />
            </button>

            <button
              onClick={handlePrint}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
              title="Imprimer"
            >
              <Share2 size={20} />
            </button>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
              title="Fermer"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin mb-4">
                  <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full"></div>
                </div>
                <p className="text-lg font-semibold text-gray-700">Analyse en cours...</p>
              </div>
            </div>
          ) : analysisData ? (
            <div className="space-y-6">
              {/* Afficher le composant d'analyse */}
              <AiAnalysisDisplay analysisData={analysisData} loading={false} />

              {/* Section missions par risque */}
              {(analysisData.riskLevels.critique.length > 0 || 
                analysisData.riskLevels.avertissement.length > 0 ||
                analysisData.riskLevels.normal.length > 0) && (
                <div className="mt-8 pt-6 border-t-2 border-gray-300">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    🎯 Missions par Catégorie
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Critiques */}
                    {analysisData.riskLevels.critique.length > 0 && (
                      <div className="bg-red-50 rounded-lg border-l-4 border-red-500 p-4">
                        <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                          🔴 Missions Critiques ({analysisData.riskLevels.critique.length})
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {analysisData.riskLevels.critique.map((m, idx) => (
                            <div key={idx} className="text-sm bg-white p-2 rounded border-l-2 border-red-500">
                              <p className="font-semibold text-gray-900">{m.titre}</p>
                              <p className="text-xs text-gray-600 mt-1">
                                Score: {m.riskScore}/100 | {m.daysLeft}j | {m.avancementActuel}%
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Avertissement */}
                    {analysisData.riskLevels.avertissement.length > 0 && (
                      <div className="bg-yellow-50 rounded-lg border-l-4 border-yellow-500 p-4">
                        <h4 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                          🟡 À Surveiller ({analysisData.riskLevels.avertissement.length})
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {analysisData.riskLevels.avertissement.slice(0, 5).map((m, idx) => (
                            <div key={idx} className="text-sm bg-white p-2 rounded border-l-2 border-yellow-500">
                              <p className="font-semibold text-gray-900">{m.titre}</p>
                              <p className="text-xs text-gray-600 mt-1">
                                Score: {m.riskScore}/100 | {m.daysLeft}j
                              </p>
                            </div>
                          ))}
                          {analysisData.riskLevels.avertissement.length > 5 && (
                            <p className="text-xs text-yellow-700 italic">
                              +{analysisData.riskLevels.avertissement.length - 5} autre(s)
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Normales */}
                    {analysisData.riskLevels.normal.length > 0 && (
                      <div className="bg-green-50 rounded-lg border-l-4 border-green-500 p-4">
                        <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                          ✅ Saines ({analysisData.riskLevels.normal.length})
                        </h4>
                        <p className="text-sm text-green-800">
                          {analysisData.riskLevels.normal.length} mission(s) en bonne santé
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Aucune analyse disponible</p>
            </div>
          )}
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            display: none !important;
          }
          .fixed, [class*="drawer"], [class*="overlay"] {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
};

export default AiAnalysisDrawer;
