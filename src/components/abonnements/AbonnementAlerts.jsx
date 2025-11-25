import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Clock, RefreshCw, X, Phone, Mail, CheckCircle } from 'lucide-react';
import { abonnementService } from '../../services/abonnementService';
import { formatDate, joursRestants } from '../../utils/helpers';

const AbonnementAlerts = ({ onClose }) => {
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renewing, setRenewing] = useState(null);

  useEffect(() => {
    loadAlertes();
  }, []);

  const loadAlertes = async () => {
    try {
      setLoading(true);
      const data = await abonnementService.checkAlertes();
      setAlertes(data);
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRenouveler = async (abonnementId) => {
    try {
      setRenewing(abonnementId);
      await abonnementService.renouveler(abonnementId);
      await loadAlertes(); // Recharger les alertes
    } catch (error) {
      console.error('Erreur renouvellement:', error);
      alert('Erreur lors du renouvellement');
    } finally {
      setRenewing(null);
    }
  };

  if (loading) {
    return (
      <div className="fixed top-4 right-4 bg-white rounded-xl shadow-2xl p-6 w-96 z-50 border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-600 mt-3 text-sm">Vérification des abonnements...</p>
        </div>
      </div>
    );
  }

  if (alertes.length === 0) {
    return null;
  }

  // Séparer les alertes expirées et proches d'expiration
  const alertesExpirees = alertes.filter(a => joursRestants(a.date_fin) < 0);
  const alertesProches = alertes.filter(a => joursRestants(a.date_fin) >= 0);

  return (
    <div className="fixed top-4 right-4 bg-white rounded-xl shadow-2xl w-[420px] z-50 max-h-[85vh] overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 text-white p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <Bell size={24} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Alertes Abonnements</h3>
            <p className="text-sm opacity-90">
              {alertesExpirees.length} expiré(s) • {alertesProches.length} proche(s)
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className="overflow-y-auto max-h-[calc(85vh-80px)]">
        {/* Abonnements Expirés */}
        {alertesExpirees.length > 0 && (
          <div className="p-4 bg-red-50 border-b-2 border-red-200">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-red-600" />
              <h4 className="font-bold text-red-800 text-sm uppercase">
                Expirés ({alertesExpirees.length})
              </h4>
            </div>
            <div className="space-y-3">
              {alertesExpirees.map((alerte) => {
                const jours = Math.abs(joursRestants(alerte.date_fin));
                return (
                  <AlerteCard
                    key={alerte.id}
                    alerte={alerte}
                    isExpired={true}
                    jours={jours}
                    renewing={renewing}
                    onRenouveler={handleRenouveler}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Abonnements Proches d'Expiration */}
        {alertesProches.length > 0 && (
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={18} className="text-orange-600" />
              <h4 className="font-bold text-orange-800 text-sm uppercase">
                Expirent bientôt ({alertesProches.length})
              </h4>
            </div>
            <div className="space-y-3">
              {alertesProches.map((alerte) => {
                const jours = joursRestants(alerte.date_fin);
                return (
                  <AlerteCard
                    key={alerte.id}
                    alerte={alerte}
                    isExpired={false}
                    jours={jours}
                    renewing={renewing}
                    onRenouveler={handleRenouveler}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant pour une carte d'alerte
const AlerteCard = ({ alerte, isExpired, jours, renewing, onRenouveler }) => {
  return (
    <div
      className={`border-l-4 rounded-lg p-4 transition-all hover:shadow-md ${
        isExpired
          ? 'bg-white border-red-500 shadow-sm'
          : 'bg-white border-orange-500 shadow-sm'
      }`}
    >
      {/* Info Client */}
      <div className="mb-3">
        <h5 className="font-bold text-gray-800 text-sm mb-1">
          {alerte.installation?.client?.raison_sociale || 'Client inconnu'}
        </h5>
        <p className="text-xs text-gray-600 font-medium">
          {alerte.installation?.application_installee || 'Application inconnue'}
        </p>
      </div>

      {/* Dates et Statut */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Date d'expiration:</span>
          <span className={`font-semibold ${isExpired ? 'text-red-600' : 'text-orange-600'}`}>
            {formatDate(alerte.date_fin)}
          </span>
        </div>
        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
          isExpired
            ? 'bg-red-100 text-red-700'
            : 'bg-orange-100 text-orange-700'
        }`}>
          {isExpired ? (
            <>
              <AlertTriangle size={12} />
              EXPIRÉ depuis {jours} jour{jours > 1 ? 's' : ''}
            </>
          ) : (
            <>
              <Clock size={12} />
              {jours} jour{jours > 1 ? 's' : ''} restant{jours > 1 ? 's' : ''}
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onRenouveler(alerte.id)}
          disabled={renewing === alerte.id}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
            isExpired
              ? 'bg-red-600 hover:bg-red-700 text-white disabled:bg-red-400'
              : 'bg-orange-600 hover:bg-orange-700 text-white disabled:bg-orange-400'
          }`}
        >
          {renewing === alerte.id ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              Renouvellement...
            </>
          ) : (
            <>
              <RefreshCw size={14} />
              Renouveler
            </>
          )}
        </button>
        
        {alerte.installation?.client?.telephone && (
          <a
            href={`tel:${alerte.installation.client.telephone}`}
            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
            title="Appeler le client"
          >
            <Phone size={16} />
          </a>
        )}
        
        {alerte.installation?.client?.email && (
          <a
            href={`mailto:${alerte.installation.client.email}`}
            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
            title="Envoyer un email"
          >
            <Mail size={16} />
          </a>
        )}
      </div>
    </div>
  );
};

export default AbonnementAlerts;