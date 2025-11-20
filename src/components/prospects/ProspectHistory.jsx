import React, { useState, useEffect } from 'react';
import { prospectService } from '../../services/prospectService';
import { installationService } from '../../services/installationService';
import { formatDateTime, formatDate } from '../../utils/helpers';
import { Phone, Mail, Calendar, FileText, CheckCircle, Edit2, Gift } from 'lucide-react';

const ProspectHistory = ({ prospectId }) => {
  const [history, setHistory] = useState([]);
  const [firstInstallation, setFirstInstallation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (prospectId) {
      loadHistory();
    }
  }, [prospectId]);

  const loadHistory = async () => {
    try {
      console.log('🔍 Chargement historique pour prospect/client:', prospectId);
      
      // Récupérer l'historique des actions
      const historyData = await prospectService.getHistorique(prospectId);
      console.log('📊 Historique récupéré:', historyData);
      
      // Récupérer toutes les installations du prospect
      const allInstallations = await installationService.getByClient(prospectId);
      console.log('🏢 Installations:', allInstallations);
      
      // Trouver la PREMIÈRE installation (date de conversion)
      let firstInst = null;
      if (allInstallations && allInstallations.length > 0) {
        firstInst = allInstallations.reduce((earliest, inst) => {
          return new Date(inst.date_installation) < new Date(earliest.date_installation)
            ? inst
            : earliest;
        });
      }
      
      setFirstInstallation(firstInst);
      
      // ✅ CORRIGÉ: Afficher TOUT l'historique (inclus la conversion)
      // Ne pas filtrer par date, juste trier chronologiquement
      let filteredHistory = historyData;
      
      // Si installation existe, marquer la date de conversion
      if (firstInst) {
        console.log('✅ Première installation trouvée:', firstInst.date_installation);
      }
      
      console.log('📋 Historique affiché:', filteredHistory);
      setHistory(filteredHistory);
    } catch (error) {
      console.error('❌ Erreur chargement historique:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (actionType) => {
    // ✅ CORRIGÉ: Mappe les valeurs 'action' correctes
    const icons = {
      appel: Phone,
      email: Mail,
      rdv: Calendar,
      demo: FileText,
      offre_envoyee: FileText,
      suivi: Phone,
      visite: Calendar,
      creation: CheckCircle,
      modification: Edit2,
      conversion: Gift,
      installation: Gift
    };
    return icons[actionType] || FileText;
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="space-y-4">
        {history.length === 0 && !firstInstallation && (
          <div className="text-center py-8 text-gray-500">
            Aucun historique disponible
          </div>
        )}

        {/* Actions de suivi (avant conversion) */}
        {history.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-sm">🕐 Phase PROSPECT - Actions de Suivi</h3>
            {history.map((item, index) => {
              // ✅ CORRIGÉ: Utilise 'action' au lieu de 'type_action'
              const Icon = getActionIcon(item.action);
              return (
                <div key={item.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                      <Icon size={20} />
                    </div>
                    {index < history.length - 1 || firstInstallation ? (
                      <div className="w-0.5 h-12 bg-gray-200 mt-2"></div>
                    ) : null}
                  </div>
                  
                  <div className="flex-1 pb-4">
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">
                          {/* ✅ CORRIGÉ: Affiche 'action' correctement */}
                          {item.action.replace('_', ' ').toUpperCase()}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {/* ✅ CORRIGÉ: Utilise 'created_at' au lieu de 'date_action' */}
                          {formatDateTime(item.created_at)}
                        </span>
                      </div>
                      {/* ✅ CORRIGÉ: Utilise 'details' (pas 'détails') */}
                      <p className="text-gray-600 text-sm">{item.details}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Première Installation (Conversion) */}
        {firstInstallation && (
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                <Gift size={20} />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-gray-800 text-lg">
                    ✅ CONVERSION - PREMIÈRE INSTALLATION
                  </h4>
                  <span className="text-sm text-gray-600 font-bold">
                    {formatDate(firstInstallation.date_installation)}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <strong>Application:</strong> {firstInstallation.application_installee}
                  </p>
                  <p>
                    <strong>Montant:</strong> <span className="font-bold text-green-600">
                      {(firstInstallation.montant || 0).toLocaleString('fr-FR')} DA
                    </span>
                  </p>
                  <p>
                    <strong>Statut:</strong> <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">
                      PROSPECT → ACTIF
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message si aucune action avant conversion */}
        {history.length === 0 && firstInstallation && (
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 text-sm text-gray-700">
            ℹ️ Aucune action de suivi enregistrée avant la conversion en client actif.
          </div>
        )}
      </div>

      {/* Résumé */}
      {(history.length > 0 || firstInstallation) && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-bold text-gray-800 mb-3">📊 Résumé Phase Prospect</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Actions de Suivi</p>
              <p className="text-2xl font-bold text-blue-600">{history.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Durée Phase Prospect</p>
              {firstInstallation ? (
                <p className="text-2xl font-bold text-green-600">
                  {(() => {
                    // ✅ CORRIGÉ: Accède au champ created_at correctement
                    const oldestAction = history.length > 0 
                      ? new Date(history[history.length - 1].created_at)
                      : new Date(firstInstallation.date_installation);
                    const conversionDate = new Date(firstInstallation.date_installation);
                    const days = Math.floor((conversionDate - oldestAction) / (1000 * 60 * 60 * 24));
                    return days > 0 ? `${days}j` : '< 1j';
                  })()}
                </p>
              ) : (
                <p className="text-lg font-bold text-gray-600">En cours</p>
              )}
            </div>
            {firstInstallation && (
              <>
                <div className="col-span-2 pt-2 border-t border-gray-300">
                  <p className="text-gray-600 mb-1">📅 Date de Conversion</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatDate(firstInstallation.date_installation)}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProspectHistory;