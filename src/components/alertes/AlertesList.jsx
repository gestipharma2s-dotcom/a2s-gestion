import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, Calendar, RefreshCw } from 'lucide-react';
import AlerteCard from './AlerteCard';
import { abonnementService } from '../../services/abonnementService';
import { useApp } from '../../context/AppContext';

const AlertesList = () => {
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useApp();

  useEffect(() => {
    loadAlertes();
  }, []);

  const loadAlertes = async () => {
    try {
      setLoading(true);
      const data = await abonnementService.checkAlertes();
      setAlertes(data);
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur lors du chargement des alertes'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRenouveler = async (abonnementId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir renouveler cet abonnement ?')) {
      return;
    }

    try {
      // 1. Trouver l'abonnement à renouveler
      const abonnementToRenew = alertes.find(a => a.id === abonnementId);
      if (!abonnementToRenew) {
        throw new Error('Abonnement non trouvé');
      }

      // 2. Supprimer l'ancien abonnement
      await abonnementService.delete(abonnementId);
      
      // 3. Créer un nouvel abonnement basé sur l'ancien
      const dateDebut = new Date(abonnementToRenew.date_fin);
      const dateFin = new Date(dateDebut);
      dateFin.setFullYear(dateFin.getFullYear() + 1);
      
      await abonnementService.create({
        installation_id: abonnementToRenew.installation_id,
        date_debut: dateDebut.toISOString(),
        date_fin: dateFin.toISOString(),
        statut: 'actif'
      });

      addNotification({
        type: 'success',
        message: 'Abonnement renouvelé avec succès'
      });
      loadAlertes();
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.message || 'Erreur lors du renouvellement'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const alertesActives = alertes.filter(a => {
    const dateFin = new Date(a.date_fin);
    return dateFin >= new Date();
  });

  const alertesExpirees = alertes.filter(a => {
    const dateFin = new Date(a.date_fin);
    return dateFin < new Date();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-orange-500 to-red-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Alertes de Renouvellement</h2>
            <p className="text-white opacity-90">
              {alertes.length} abonnement(s) nécessitent votre attention
            </p>
          </div>
          <AlertCircle size={64} className="opacity-50" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center gap-3">
            <Bell size={32} />
            <div>
              <p className="text-sm opacity-90 mb-1">En Alerte</p>
              <h3 className="text-3xl font-bold">{alertesActives.length}</h3>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center gap-3">
            <AlertCircle size={32} />
            <div>
              <p className="text-sm opacity-90 mb-1">Expirés</p>
              <h3 className="text-3xl font-bold">{alertesExpirees.length}</h3>
            </div>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center gap-3">
            <Calendar size={32} />
            <div>
              <p className="text-sm opacity-90 mb-1">Total</p>
              <h3 className="text-3xl font-bold">{alertes.length}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes Actives */}
      {alertesActives.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Bell className="text-orange-500" size={24} />
            Abonnements à Renouveler Prochainement
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alertesActives.map((alerte) => (
              <AlerteCard
                key={alerte.id}
                alerte={alerte}
                type="warning"
                onRenouveler={handleRenouveler}
              />
            ))}
          </div>
        </div>
      )}

      {/* Alertes Expirées */}
      {alertesExpirees.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="text-red-500" size={24} />
            Abonnements Expirés - Action Urgente
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alertesExpirees.map((alerte) => (
              <AlerteCard
                key={alerte.id}
                alerte={alerte}
                type="danger"
                onRenouveler={handleRenouveler}
              />
            ))}
          </div>
        </div>
      )}

      {/* Aucune Alerte */}
      {alertes.length === 0 && (
        <div className="card text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Calendar className="text-green-600" size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Aucune Alerte Active
              </h3>
              <p className="text-gray-600">
                Tous les abonnements sont à jour !
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertesList;