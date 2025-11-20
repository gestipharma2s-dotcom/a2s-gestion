import React, { useState, useEffect } from 'react';
import { installationService } from '../../services/installationService';
import { paiementService } from '../../services/paiementService';
import { interventionService } from '../../services/interventionService';
import { prospectService } from '../../services/prospectService';
import { formatDate, formatMontant } from '../../utils/helpers';
import { Building, Calendar, CreditCard, Settings, ChevronDown, ChevronUp, History } from 'lucide-react';
import PaiementHistory from '../paiements/PaiementHistory';
import ProspectHistory from '../prospects/ProspectHistory';

const ClientDetails = ({ client }) => {
  const [installations, setInstallations] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [interventions, setInterventions] = useState([]);
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
      
      // ✅ CORRIGÉ: Calculer le reste au lieu d'appeler une méthode qui n'existe pas
      const totalInstallations = (installData || []).reduce((sum, i) => sum + (i.montant || 0), 0);
      const totalPaye = (paiementData || []).reduce((sum, p) => sum + (p.montant || 0), 0);
      const resteAPayer = Math.max(0, totalInstallations - totalPaye);
      
      setResteTotal({
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
      <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-lg p-6">
        <h3 className="text-2xl font-bold mb-2">{client.raison_sociale}</h3>
        <div className="space-y-1 text-blue-100">
          <p>Contact: {client.contact}</p>
          <p>Téléphone: {client.telephone}</p>
          {client.email && <p>Email: {client.email}</p>}
          {client.secteur && (
            <p className="flex items-center gap-2">
              <span>Secteur:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                client.secteur === 'GROSSISTE PHARM' ? 'bg-blue-500 text-white' :
                client.secteur === 'GROSSISTE PARA' ? 'bg-green-500 text-white' :
                client.secteur === 'PARA SUPER GROS' ? 'bg-purple-500 text-white' :
                client.secteur === 'LABO PROD' ? 'bg-orange-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {client.secteur}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div className="card text-center hover:shadow-lg transition-shadow bg-gradient-to-br from-red-50 to-red-100">
          <CreditCard className="mx-auto mb-2 text-red-600" size={32} />
          <h4 className="text-2xl font-bold text-red-700">{formatMontant(resteTotal?.resteAPayer || 0)}</h4>
          <p className="text-sm text-red-600">Reste à Payer</p>
        </div>
      </div>

      {/* ✅ NOUVEAU: Historique Phase Prospect - CONSERVÉ APRÈS CONVERSION */}
      <div className="card border-l-4 border-blue-500 bg-blue-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <History size={20} className="text-blue-600" />
            📜 Historique Phase Prospect (Conservé)
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
            <p className="mb-2">
              ℹ️ Cet historique contient toutes les actions effectuées pendant la phase <strong>prospect</strong> 
              (avant la conversion en client actif).
            </p>
            <p className="text-xs text-gray-600">
              Il est conservé pour traçabilité et analyse du parcours commercial.
            </p>
          </div>
        )}
      </div>

      {/* Résumé Financier */}
      {resteTotal && (
        <div className="card border-l-4 border-primary">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Résumé Financier</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total des Installations</p>
              <p className="text-2xl font-bold text-gray-800">{formatMontant(resteTotal.totalInstallations)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Montant Payé</p>
              <p className="text-2xl font-bold text-green-600">{formatMontant(resteTotal.totalPaye)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Reste à Payer</p>
              <p className={`text-2xl font-bold ${resteTotal.resteAPayer > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatMontant(resteTotal.resteAPayer)}
              </p>
            </div>
          </div>
        </div>
      )}

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
              // Calculer le reste pour cette installation
              const totalPayeInstallation = paiements
                .filter(p => p.installation_id === inst.id)
                .reduce((sum, p) => sum + (p.montant || 0), 0);
              const resteInstallation = Math.max(0, inst.montant - totalPayeInstallation);

              return (
                <div key={inst.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800">{inst.application_installee}</h4>
                      <p className="text-sm text-gray-600">
                        Installé le {formatDate(inst.date_installation)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{formatMontant(inst.montant)}</p>
                      <span className={inst.statut === 'terminee' ? 'badge-success' : 'badge-warning'}>
                        {inst.statut === 'terminee' ? 'Terminée' : 'En cours'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Détail Paiement */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200 text-xs">
                    <div>
                      <p className="text-gray-600">Payé</p>
                      <p className="font-bold text-green-600">{formatMontant(totalPayeInstallation)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Reste</p>
                      <p className={`font-bold ${resteInstallation > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatMontant(resteInstallation)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Pourcentage</p>
                      <p className="font-bold text-blue-600">
                        {((totalPayeInstallation / inst.montant) * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Historique Paiements - Version Complète ou Résumé */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <CreditCard size={20} className="text-green-500" />
            Historique Paiements
          </h3>
          {paiements.length > 0 && (
            <button
              onClick={() => setShowFullPaiements(!showFullPaiements)}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary-dark font-medium transition-colors"
            >
              {showFullPaiements ? (
                <>
                  <span>Voir résumé</span>
                  <ChevronUp size={16} />
                </>
              ) : (
                <>
                  <span>Voir détails</span>
                  <ChevronDown size={16} />
                </>
              )}
            </button>
          )}
        </div>

        {paiements.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="mx-auto text-gray-300 mb-2" size={48} />
            <p className="text-gray-500 text-sm">Aucun paiement</p>
          </div>
        ) : showFullPaiements ? (
          <PaiementHistory clientId={client.id} />
        ) : (
          <div className="space-y-2">
            {paiements.slice(0, 5).map((paiement) => (
              <div key={paiement.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <p className="font-medium text-gray-800 capitalize">{paiement.type}</p>
                  <p className="text-sm text-gray-600">{formatDate(paiement.date_paiement)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatMontant(paiement.montant)}</p>
                  <p className="text-xs text-gray-500 capitalize">{paiement.mode_paiement}</p>
                  {paiement.resteAPayer && paiement.resteAPayer > 0 && (
                    <p className="text-xs text-red-600 font-semibold">
                      Reste: {formatMontant(paiement.resteAPayer)}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {paiements.length > 5 && (
              <button
                onClick={() => setShowFullPaiements(true)}
                className="w-full py-2 text-sm text-primary hover:text-primary-dark font-medium"
              >
                Voir les {paiements.length - 5} autres paiements
              </button>
            )}
          </div>
        )}
      </div>

      {/* Interventions */}
      {interventions.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Settings size={20} className="text-purple-500" />
            Interventions Récentes
          </h3>
          <div className="space-y-3">
            {interventions.slice(0, 5).map((intervention) => (
              <div key={intervention.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800 capitalize">{intervention.type_intervention}</h4>
                  <span className={intervention.statut === 'cloturee' ? 'badge-success' : 'badge-warning'}>
                    {intervention.statut === 'cloturee' ? 'Clôturée' : 'En cours'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{intervention.resume_probleme}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatDate(intervention.date_intervention)}</span>
                  <span>{intervention.duree} min</span>
                  {intervention.technicien && (
                    <span>Tech: {intervention.technicien.nom}</span>
                  )}
                </div>
              </div>
            ))}
            {interventions.length > 5 && (
              <p className="text-center text-sm text-gray-500 pt-2">
                +{interventions.length - 5} autres interventions
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDetails;