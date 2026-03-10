import React, { useState, useEffect } from 'react';
import { installationService } from '../../services/installationService';
import { paiementService } from '../../services/paiementService';
import { interventionService } from '../../services/interventionService';
import { prospectService } from '../../services/prospectService';
import { formatDate, formatMontant, getStatutPaiement } from '../../utils/helpers';
import { Building, Calendar, CreditCard, Settings, ChevronDown, ChevronUp, History, RefreshCw } from 'lucide-react';
import PaiementHistory from '../paiements/PaiementHistory';
import ProspectHistory from '../prospects/ProspectHistory';

const ClientDetails = ({ client }) => {
  const [installations, setInstallations] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [renouvellements, setRenouvellements] = useState([]);
  const [resteTotal, setResteTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullPaiements, setShowFullPaiements] = useState(false);
  const [showProspectHistory, setShowProspectHistory] = useState(false);

  useEffect(() => {
    if (client) {
      loadClientData();
    }
  }, [client]);

  const loadClientData = async () => {
    try {
      setLoading(true);

      // Récupérer les installations et paiements
      const installData = await installationService.getByClient(client.id);
      const paiementData = await paiementService.getByClient(client.id);

      setInstallations(installData || []);
      setPaiements(paiementData || []);

      // Récupérer les abonnements renouvelés à partir de l'historique
      try {
        const historyData = await prospectService.getHistorique(client.id);
        const renouvellementsList = (historyData || [])
          .filter(action => action.action === 'abonnement_auto_renew')
          .map((action, idx) => {
            // Extraire le nom de l'application depuis la description
            // Format: "Abonnement auto-renouvelé pour [APPLICATION_NAME]"
            let applicationName = 'Application inconnue';
            if (action.description) {
              const match = action.description.match(/pour\s+(.+?)(?:\n|$)/);
              applicationName = match ? match[1].trim() : 'Application inconnue';
            }

            return {
              id: `renew-${action.id}-${idx}`,
              application: applicationName,
              date: action.date || action.created_at,
              montant: action.details?.montant,
              description: action.description
            };
          });
        setRenouvellements(renouvellementsList);
      } catch (error) {
        console.warn('Renouvellements non disponibles:', error);
        setRenouvellements([]);
      }

      // ✅ CORRIGÉ: Calculer le reste au lieu d'appeler une méthode qui n'existe pas
      const totalInstallations = (installData || []).reduce((sum, i) => sum + (i.montant || 0), 0);
      const soldeInitial = client.solde_initial || 0;
      const totalDu = totalInstallations + soldeInitial;
      const totalPaye = (paiementData || []).reduce((sum, p) => sum + (p.montant || 0), 0);
      const resteAPayer = Math.max(0, totalDu - totalPaye);

      setResteTotal({
        soldeInitial: soldeInitial,
        totalInstallations: totalInstallations,
        totalPaye: totalPaye,
        resteAPayer: resteAPayer
      });

      // Récupérer les interventions (si le service existe)
      try {
        const interventionData = await interventionService.getByClient(client.id);
        setInterventions(interventionData || []);
      } catch (error) {
        console.warn('Interventions non disponibles:', error);
        setInterventions([]);
      }
    } catch (error) {
      console.error('Erreur chargement données client:', error);
      setInstallations([]);
      setPaiements([]);
      setInterventions([]);
      setRenouvellements([]);
      setResteTotal({
        totalInstallations: 0,
        totalPaye: 0,
        resteAPayer: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-gray-600 mt-2">Chargement...</p>
      </div>
    );
  }

  const totalPaiements = paiements.reduce((sum, p) => sum + (p.montant || 0), 0);

  return (
    <div className="space-y-6">
      {/* Informations Client */}
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-lg p-6 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2">{client.raison_sociale}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-blue-100">
            <p>Contact: {client.contact}</p>
            <p>Téléphone: {client.telephone}</p>
            {client.email && <p>Email: {client.email}</p>}
            {client.solde_initial > 0 && (
              <p className="font-bold text-yellow-300">
                Solde Initial: {formatMontant(client.solde_initial)}
              </p>
            )}
            {client.secteur && (
              <p className="flex items-center gap-2">
                <span>Secteur:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${client.secteur === 'GROSSISTE PHARM' ? 'bg-blue-500' :
                  client.secteur === 'GROSSISTE PARA' ? 'bg-green-500' :
                    client.secteur === 'PARA SUPER GROS' ? 'bg-purple-500' :
                      client.secteur === 'LABO PROD' ? 'bg-orange-500' :
                        'bg-gray-500'
                  } text-white`}>
                  {client.secteur}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card text-center hover:shadow-lg transition-shadow bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
          <History className="mx-auto mb-2 text-yellow-600" size={32} />
          <h4 className="text-2xl font-bold text-yellow-700">{formatMontant(client.solde_initial || 0)}</h4>
          <p className="text-sm text-yellow-600 font-semibold">Solde Initial</p>
        </div>
        <div className="card text-center hover:shadow-lg transition-shadow">
          <Building className="mx-auto mb-2 text-primary" size={32} />
          <h4 className="text-2xl font-bold text-gray-800">{installations.length}</h4>
          <p className="text-sm text-gray-600">Installations</p>
        </div>
        <div className="card text-center hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-green-100">
          <CreditCard className="mx-auto mb-2 text-green-600" size={32} />
          <h4 className="text-2xl font-bold text-green-700">{formatMontant(totalPaiements)}</h4>
          <p className="text-sm text-green-600">Total Payé</p>
        </div>
        <div className="card text-center hover:shadow-lg transition-shadow bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
          <CreditCard className="mx-auto mb-2 text-red-600" size={32} />
          <h4 className="text-2xl font-bold text-red-700">{formatMontant(resteTotal?.resteAPayer || 0)}</h4>
          <p className="text-sm text-red-600 font-bold underline">Reste Global</p>
        </div>
      </div>

      {/* Historique Complet */}
      <div className="card border-l-4 border-blue-500 bg-blue-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <History size={20} className="text-blue-600" />
            📜 Historique Complet du Client
          </h3>
          <button
            onClick={() => setShowProspectHistory(!showProspectHistory)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {showProspectHistory ? (
              <>
                <span>Masquer</span>
                <ChevronUp size={16} />
              </>
            ) : (
              <>
                <span>Voir l'historique</span>
                <ChevronDown size={16} />
              </>
            )}
          </button>
        </div>

        {showProspectHistory ? (
          <div className="bg-white rounded-lg p-4">
            <ProspectHistory prospectId={client.id} />
          </div>
        ) : (
          <div className="text-sm text-gray-700">
            <p className="mb-2">ℹ️ Cet historique contient:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
              <li><strong>Actions de suivi</strong></li>
              <li><strong>Conversion en client</strong></li>
              <li><strong>Installations</strong></li>
              <li><strong>Abonnements</strong></li>
            </ul>
          </div>
        )}
      </div>

      {/* Installations */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Building size={20} className="text-primary" />
          Installations
        </h3>
        {installations.length === 0 ? (
          <div className="text-center py-8">
            <Building className="mx-auto text-gray-300 mb-2" size={48} />
            <p className="text-gray-500 text-sm">Aucune installation</p>
          </div>
        ) : (
          <div className="space-y-3">
            {installations.map((inst) => {
              const totalPayeInst = paiements
                .filter(p => p.installation_id === inst.id)
                .reduce((sum, p) => sum + (p.montant || 0), 0);
              const statusPaiement = getStatutPaiement(inst.montant, totalPayeInst);

              return (
                <div key={inst.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">{inst.application_installee}</h4>
                      <p className="text-sm text-gray-600">Installé le {formatDate(inst.date_installation)}</p>
                    </div>
                    <div className="text-right">
                      <div className={`rounded-lg p-2 text-center font-bold text-xl ${statusPaiement.couleur}`}>
                        {statusPaiement.code}
                        <div className="text-xs">{statusPaiement.icon}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Abonnements Renouvelés */}
      {renouvellements.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <RefreshCw size={20} className="text-blue-600" />
            🔄 Abonnements Renouvelés
          </h3>
          <div className="space-y-3">
            {renouvellements.map((renew) => (
              <div key={renew.id} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800">{renew.application}</h4>
                    <p className="text-sm text-gray-600">Renouvelé le {formatDate(renew.date)}</p>
                  </div>
                  <div className="text-right font-bold text-blue-600">
                    {renew.montant && formatMontant(renew.montant)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historique Paiements */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <CreditCard size={20} className="text-green-500" />
            Historique Paiements
          </h3>
          {paiements.length > 5 && (
            <button
              onClick={() => setShowFullPaiements(!showFullPaiements)}
              className="text-sm text-primary font-medium"
            >
              {showFullPaiements ? 'Voir résumé' : 'Voir tout'}
            </button>
          )}
        </div>

        <div className="space-y-2">
          {(showFullPaiements ? paiements : paiements.slice(0, 5)).map((paiement) => (
            <div key={paiement.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-800">{paiement.installation?.application_installee || 'Paiement'}</p>
                <p className="text-sm text-gray-500">{formatDate(paiement.date_paiement)} {paiement.mode_paiement && `- ${paiement.mode_paiement}`}</p>
              </div>
              <p className="font-bold text-green-600">{formatMontant(paiement.montant)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interventions */}
      {interventions.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Settings size={20} className="text-purple-500" />
            Interventions Récentes
          </h3>
          <div className="space-y-3">
            {interventions.slice(0, 5).map((inter) => (
              <div key={inter.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between mb-1">
                  <h4 className="font-semibold text-gray-800 capitalize">{inter.type_intervention}</h4>
                  <span className={inter.statut === 'cloturee' ? 'badge-success' : 'badge-warning'}>
                    {inter.statut === 'cloturee' ? 'Clôturée' : 'En cours'}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(inter.date_intervention)} {inter.technicien && `- Tech: ${inter.technicien.nom}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetails;