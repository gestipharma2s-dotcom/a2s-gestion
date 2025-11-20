import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Building, Calendar, DollarSign, CreditCard } from 'lucide-react';
import { formatDate, formatMontant, getStatutClass, getStatutLabel } from '../../utils/helpers';
import { paiementService } from '../../services/paiementService';

const InstallationCard = ({ installation, onEdit, onDelete, onPayment, refreshTrigger }) => {
  const [resteAPayer, setResteAPayer] = useState(0);
  const [paiementsInstallation, setPaiementsInstallation] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (installation && installation.client_id && installation.id) {
      calculateResteAPayer();
    }
  }, [installation?.id, refreshTrigger]); // Recalculer si l'installation ou refreshTrigger change

  const calculateResteAPayer = async () => {
    try {
      setLoading(true);
      
      // Récupérer TOUS les paiements du client
      const paiements = await paiementService.getByClient(installation.client_id);
      
      // Filtrer STRICTEMENT par installation_id
      const paiementsInst = paiements.filter(p => 
        p.installation_id === installation.id
      );
      
      setPaiementsInstallation(paiementsInst);
      
      // Calculer le total payé pour CETTE installation uniquement
      const totalPaye = paiementsInst.reduce((sum, p) => sum + (p.montant || 0), 0);
      
      // Calculer le reste pour CETTE installation uniquement
      const reste = Math.max(0, installation.montant - totalPaye);
      setResteAPayer(reste);
    } catch (error) {
      console.error('Erreur calcul reste à payer:', error);
      setResteAPayer(installation.montant);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (onPayment) {
      onPayment(installation);
    }
  };

  return (
    <div className="card hover:shadow-xl transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-1">
            {installation.application_installee}
          </h3>
          <span className={`${getStatutClass(installation.statut)} text-xs`}>
            {getStatutLabel(installation.statut)}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(installation)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => onDelete(installation.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Building size={16} />
          <span className="font-medium">{installation.client?.raison_sociale}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Calendar size={16} />
          <span>Installé le {formatDate(installation.date_installation)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-primary text-lg font-bold">
          <DollarSign size={20} />
          <span>{formatMontant(installation.montant)}</span>
        </div>

        {/* Reste à Payer */}
        {!loading && resteAPayer > 0 && (
          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-700 font-medium">Reste à payer:</span>
              <span className="text-lg font-bold text-red-600">{formatMontant(resteAPayer)}</span>
            </div>
          </div>
        )}

        {!loading && resteAPayer === 0 && (
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <span className="text-sm text-green-700 font-medium">✓ Entièrement payé</span>
          </div>
        )}

        {/* Paiements enregistrés */}
        {!loading && paiementsInstallation.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="text-sm text-blue-700 font-medium mb-2">
              Paiements enregistrés ({paiementsInstallation.length}):
            </div>
            <div className="space-y-2">
              {paiementsInstallation.map((paiement) => (
                <div key={paiement.id} className="flex justify-between text-sm">
                  <span className="text-blue-600">
                    {formatDate(paiement.date_paiement)}
                  </span>
                  <span className="font-bold text-blue-700">
                    {formatMontant(paiement.montant)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-200 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Client:</span>
          <span className="font-medium text-gray-800">{installation.client?.contact}</span>
        </div>

        {/* Bouton Payer */}
        {resteAPayer > 0 && (
          <button
            onClick={handlePayment}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard size={18} />
            Enregistrer un paiement
          </button>
        )}
      </div>
    </div>
  );
};

export default InstallationCard;