import React, { useState, useEffect } from 'react';
import { prospectService } from '../../services/prospectService';
import { installationService } from '../../services/installationService';
import { installationPlanningService } from '../../services/installationPlanningService';
import { userService } from '../../services/userService';
import { formatDateTime, formatDate, formatMontant } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';
import { Phone, Mail, Calendar, FileText, CheckCircle, Edit2, Gift, Zap, RefreshCw, Trash2, X, Save } from 'lucide-react';

const ProspectHistory = ({ prospectId, prospect }) => {
  const { profile } = useAuth();
  const [history, setHistory] = useState([]);
  const [firstInstallation, setFirstInstallation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (prospectId) {
      loadHistory();
      loadUsers();
    }
  }, [prospectId]);

  const loadUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data || []);
    } catch (e) {
      console.error("Erreur users:", e);
    }
  };

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

  const handleDeleteAction = async (item) => {
    // Vérification stricte car mission_id peut être une chaîne "null" ou 0 dans certains cas
    const isLinked = item.mission_id && item.mission_id !== "null" && item.mission_id !== 0 && item.mission_id !== "0";

    if (isLinked) {
      alert(`❌ Impossible de supprimer cette action car une mission (ID: ${item.mission_id}) y est déjà liée.`);
      return;
    }

    if (window.confirm("❗ Voulez-vous vraiment supprimer cette action du planning ?\nElle sera également retirée de la vue Planification.")) {
      try {
        // Utilise la nouvelle méthode qui gère les cas avec ID (table) ET sans ID (JSON legacy)
        await prospectService.deleteAction(prospectId, item);
        loadHistory();
      } catch (error) {
        console.error("Erreur suppression:", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const openEditModal = (item) => {
    if (!item.id) {
      alert("⚠️ Cette action ancienne ne peut pas être modifiée.");
      return;
    }
    // Vérification stricte
    const isLinked = item.mission_id && item.mission_id !== "null" && item.mission_id !== 0 && item.mission_id !== "0";

    if (isLinked) {
      alert(`❌ Impossible de modifier cette action car une mission (ID: ${item.mission_id}) y est déjà liée.`);
      return;
    }
    setSelectedAction({ ...item });
    setShowEditModal(true);
  };

  const handleUpdateAction = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { id, ...updateData } = selectedAction;
      await installationPlanningService.update(id, {
        description: updateData.description,
        application: updateData.application,
        date_debut: updateData.date_debut,
        date_fin: updateData.date_fin,
        chef_mission: updateData.chef_mission,
        conversion: updateData.conversion
      });
      setShowEditModal(false);
      loadHistory();
    } catch (error) {
      alert("Erreur lors de la mise à jour");
    } finally {
      setIsSaving(false);
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
      installation: Gift,
      abonnement_acquisition: Zap,
      abonnement_auto_renew: RefreshCw
    };
    return icons[actionType] || FileText;
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Onglet Historique uniquement */}
      <div className="border-b border-gray-200 pb-2">
        <h3 className="text-lg font-bold text-gray-800">📋 Historique Actions</h3>
      </div>

      {/* Contenu Historique */}
      <div className="space-y-6">
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
                <div key={item.id || `history-${index}`} className="flex gap-4">
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
                          {item.action.replace(/_/g, ' ').toUpperCase()}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {/* ✅ CORRIGÉ: Utilise 'created_at' au lieu de 'date_action' */}
                          {formatDateTime(item.created_at)}
                        </span>
                      </div>
                      {/* ✅ CORRIGÉ: Affiche la description qui contient plus d'infos que 'details' */}
                      <p className="text-gray-600 text-sm mb-2">{item.description || item.details}</p>

                      {/* BOUTONS D'ACTION SPECIFIQUES AUX INSTALLATIONS */}
                      {item.action === 'installation' && (
                        <div className="flex gap-2 mt-3 border-t border-blue-200 pt-3">
                          <button
                            onClick={() => openEditModal(item)}
                            disabled={item.mission_id && item.mission_id !== "null" && item.mission_id !== 0 && item.mission_id !== "0"}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-colors ${item.mission_id && item.mission_id !== "null" && item.mission_id !== 0 && item.mission_id !== "0"
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                          >
                            <Edit2 size={12} />
                            Modifier Action
                          </button>
                          <button
                            onClick={() => handleDeleteAction(item)}
                            disabled={item.mission_id && item.mission_id !== "null" && item.mission_id !== 0 && item.mission_id !== "0"}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-colors ${item.mission_id && item.mission_id !== "null" && item.mission_id !== 0 && item.mission_id !== "0"
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-red-600 text-white hover:bg-red-700'
                              }`}
                          >
                            <Trash2 size={12} />
                            Supprimer Planning
                          </button>

                          {item.mission_id && item.mission_id !== "null" && item.mission_id !== 0 && item.mission_id !== "0" && (
                            <span className="text-[10px] text-blue-600 font-bold bg-blue-100 px-2 py-1 rounded border border-blue-200 uppercase">
                              🔗 Mission liée
                            </span>
                          )}
                        </div>
                      )}

                      {/* ✅ AFFICHE aussi le montant et la date si disponibles */}
                      {item.action === 'abonnement_auto_renew' && item.details && (
                        <div className="text-sm text-gray-500 mt-2 space-y-1">
                          {item.details.date_debut && (
                            <p>📅 Du {item.details.date_debut} au {item.details.date_fin}</p>
                          )}
                          {item.details.montant && (
                            <p>💰 Montant: {item.details.montant} DA</p>
                          )}
                        </div>
                      )}
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
                      {profile?.role === 'admin' || profile?.role === 'super_admin' ? (
                        formatMontant(firstInstallation.montant || 0)
                      ) : (
                        '🔐'
                      )}
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

      {/* MODAL DE MODIFICATION */}
      {showEditModal && selectedAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-primary p-4 text-white flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2">
                <Edit2 size={18} />
                Modifier la Planification
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="hover:bg-white/20 p-1 rounded-full transition-colors"
                title="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateAction} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Application</label>
                <input
                  type="text"
                  required
                  value={selectedAction.application || ''}
                  onChange={(e) => setSelectedAction({ ...selectedAction, application: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="ex: Gestipharm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Date Début</label>
                  <input
                    type="date"
                    required
                    value={selectedAction.date_debut ? selectedAction.date_debut.split('T')[0] : ''}
                    onChange={(e) => setSelectedAction({ ...selectedAction, date_debut: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Date Fin</label>
                  <input
                    type="date"
                    required
                    value={selectedAction.date_fin ? selectedAction.date_fin.split('T')[0] : ''}
                    onChange={(e) => setSelectedAction({ ...selectedAction, date_fin: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Chef de Mission</label>
                <select
                  required
                  value={selectedAction.chef_mission || ''}
                  onChange={(e) => setSelectedAction({ ...selectedAction, chef_mission: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="">Sélectionner un utilisateur</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.nom}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Commentaires</label>
                <textarea
                  value={selectedAction.description || ''}
                  onChange={(e) => setSelectedAction({ ...selectedAction, description: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="Détails de l'installation..."
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="conversion"
                  checked={selectedAction.conversion === 'oui'}
                  onChange={(e) => setSelectedAction({ ...selectedAction, conversion: e.target.checked ? 'oui' : 'non' })}
                  className="w-4 h-4 text-primary"
                />
                <label htmlFor="conversion" className="text-sm font-medium text-gray-700">
                  Le client a-t-il déjà payé l'avance ? (Conversion)
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-bold text-gray-600 hover:bg-gray-50"
                  disabled={isSaving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  disabled={isSaving}
                >
                  {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProspectHistory;