import React, { useState, useEffect } from 'react';
import { paiementService } from '../../services/paiementService';
import { formatDate, formatMontant, getStatutLabel } from '../../utils/helpers';
import { CreditCard, Calendar, Filter, Download } from 'lucide-react';

const PaiementHistory = ({ clientId, installationId }) => {
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterMode, setFilterMode] = useState('all');

  useEffect(() => {
    loadPaiements();
  }, [clientId, installationId]);

  const loadPaiements = async () => {
    try {
      setLoading(true);
      let data;
      
      if (clientId) {
        data = await paiementService.getByClient(clientId);
      } else {
        data = await paiementService.getAll();
      }

      // Filtrer par installation si spécifié
      if (installationId) {
        data = data.filter(p => p.installation_id === installationId);
      }

      setPaiements(data);
    } catch (error) {
      console.error('Erreur chargement paiements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPaiements = paiements.filter(p => {
    if (filterType !== 'all' && p.type !== filterType) return false;
    if (filterMode !== 'all' && p.mode_paiement !== filterMode) return false;
    return true;
  });

  const totalMontant = filteredPaiements.reduce((sum, p) => sum + (p.montant || 0), 0);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-gray-600 mt-2">Chargement...</p>
      </div>
    );
  }

  if (paiements.length === 0) {
    return (
      <div className="text-center py-8">
        <CreditCard className="mx-auto text-gray-400 mb-2" size={48} />
        <p className="text-gray-500">Aucun paiement enregistré</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tous</option>
            <option value="acquisition">Acquisition</option>
            <option value="abonnement">Abonnement</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Mode:</span>
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tous</option>
            <option value="especes">Espèces</option>
            <option value="virement">Virement</option>
            <option value="cheque">Chèque</option>
            <option value="autre">Autre</option>
          </select>
        </div>
      </div>

      {/* Statistiques */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-700 font-medium mb-1">Total des Paiements</p>
            <p className="text-2xl font-bold text-green-800">{formatMontant(totalMontant)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-green-700 font-medium mb-1">Nombre</p>
            <p className="text-2xl font-bold text-green-800">{filteredPaiements.length}</p>
          </div>
        </div>
      </div>

      {/* Timeline des paiements */}
      <div className="space-y-3">
        {filteredPaiements.map((paiement, index) => (
          <div
            key={paiement.id}
            className="relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            {/* Timeline line */}
            {index < filteredPaiements.length - 1 && (
              <div className="absolute left-6 top-16 w-0.5 h-8 bg-gray-200"></div>
            )}

            <div className="flex gap-4">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  paiement.type === 'acquisition' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  <CreditCard size={24} />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800">
                        {paiement.type === 'acquisition' ? 'Acquisition' : 'Abonnement'}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        paiement.type === 'acquisition' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {getStatutLabel(paiement.mode_paiement)}
                      </span>
                    </div>
                    {paiement.client && (
                      <p className="text-sm text-gray-600">
                        {paiement.client.raison_sociale}
                      </p>
                    )}
                    {paiement.installation && (
                      <p className="text-xs text-gray-500">
                        {paiement.installation.application_installee}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      {formatMontant(paiement.montant)}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Calendar size={12} />
                      <span>{formatDate(paiement.date_paiement)}</span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="flex items-center gap-4 text-xs text-gray-600 mt-2 pt-2 border-t border-gray-100">
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Mode:</span>
                    {getStatutLabel(paiement.mode_paiement)}
                  </span>
                  {paiement.installation_id && (
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Installation:</span>
                      Liée
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Export Button */}
      <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700 font-medium">
        <Download size={18} />
        Exporter l'historique (PDF)
      </button>
    </div>
  );
};

export default PaiementHistory;