import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import Modal from '../common/Modal';
import AbonnementCard from './AbonnementCard';
import PaiementForm from '../paiements/PaiementForm';
import { abonnementService } from '../../services/abonnementService';
import { paiementService } from '../../services/paiementService';
import { supabase } from '../../services/supabaseClient';
import { useApp } from '../../context/AppContext';

const AbonnementsList = () => {
  const [abonnements, setAbonnements] = useState([]);
  const [filteredAbonnements, setFilteredAbonnements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPaiementModal, setShowPaiementModal] = useState(false);
  const [selectedAbonnement, setSelectedAbonnement] = useState(null);
  const { addNotification } = useApp();

  useEffect(() => {
    loadAbonnements();
  }, []);

  useEffect(() => {
    filterAbonnements();
  }, [abonnements, searchTerm, filterStatus]);

  const loadAbonnements = async () => {
    try {
      setLoading(true);
      const data = await abonnementService.getAll();
      setAbonnements(data);
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur lors du chargement des abonnements'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAbonnements = () => {
    let filtered = [...abonnements];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(a => a.statut === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.installation?.application_installee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.installation?.client?.raison_sociale?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAbonnements(filtered);
  };

  const handleRenouveler = async (abonnementId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir renouveler cet abonnement ?')) {
      return;
    }

    try {
      // 1. Supprimer l'ancien abonnement d'abord
      await abonnementService.delete(abonnementId);
      
      // 2. Créer un nouvel abonnement basé sur l'ancien
      const abonnementToRenew = abonnements.find(a => a.id === abonnementId);
      if (!abonnementToRenew) {
        throw new Error('Abonnement non trouvé');
      }
      
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
      loadAbonnements();
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.message || 'Erreur lors du renouvellement'
      });
    }
  };

  const handleOpenPaiement = (abonnement) => {
    setSelectedAbonnement(abonnement);
    setShowPaiementModal(true);
  };

  const handlePaiementSubmit = async (paiementData) => {
    try {
      // Créer le paiement avec les données du formulaire
      const dataToSubmit = {
        montant: paiementData.montant,
        type: paiementData.type,
        mode_paiement: paiementData.mode_paiement,
        date_paiement: paiementData.date_paiement,
        client_id: selectedAbonnement.installation?.client?.id || selectedAbonnement.installation.client_id,
        installation_id: selectedAbonnement.installation_id
      };
      
      await paiementService.create(dataToSubmit);
      
      // Vérifier si l'abonnement est complètement payé
      if (selectedAbonnement.statut === 'expire') {
        // Récupérer le montant total des paiements pour cet abonnement
        const { data: paiements } = await supabase
          .from('paiements')
          .select('montant')
          .eq('installation_id', selectedAbonnement.installation_id);
        
        const totalPaye = (paiements || []).reduce((sum, p) => sum + (p.montant || 0), 0);
        
        // Vérifier si le montant total payé ≥ montant de l'installation
        const installation = selectedAbonnement.installation;
        if (totalPaye >= (installation?.montant || 0)) {
          // Renouveler automatiquement l'abonnement
          await abonnementService.delete(selectedAbonnement.id);
          
          const dateDebut = new Date(selectedAbonnement.date_fin);
          const dateFin = new Date(dateDebut);
          dateFin.setFullYear(dateFin.getFullYear() + 1);
          
          await abonnementService.create({
            installation_id: selectedAbonnement.installation_id,
            date_debut: dateDebut.toISOString(),
            date_fin: dateFin.toISOString(),
            statut: 'actif'
          });
          
          addNotification({
            type: 'success',
            message: 'Paiement enregistré et abonnement renouvelé automatiquement'
          });
        } else {
          addNotification({
            type: 'success',
            message: 'Paiement enregistré avec succès'
          });
        }
      } else {
        addNotification({
          type: 'success',
          message: 'Paiement enregistré avec succès'
        });
      }
      
      setShowPaiementModal(false);
      setSelectedAbonnement(null);
      loadAbonnements();
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.message || 'Erreur lors de l\'enregistrement du paiement'
      });
    }
  };

  const stats = {
    total: abonnements.length,
    actifs: abonnements.filter(a => a.statut === 'actif').length,
    enAlerte: abonnements.filter(a => a.statut === 'en_alerte').length,
    expires: abonnements.filter(a => a.statut === 'expire').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-sm opacity-90 mb-1">Total Abonnements</p>
          <h3 className="text-3xl font-bold">{stats.total}</h3>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90 mb-1">Actifs</p>
          <h3 className="text-3xl font-bold">{stats.actifs}</h3>
          <p className="text-sm opacity-90 mt-1">
            Taux {stats.total > 0 ? ((stats.actifs / stats.total) * 100).toFixed(0) : 0}%
          </p>
        </div>
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <p className="text-sm opacity-90 mb-1">En Alerte</p>
          <h3 className="text-3xl font-bold">{stats.enAlerte}</h3>
          <p className="text-sm opacity-90 mt-1">À renouveler</p>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <p className="text-sm opacity-90 mb-1">Expirés</p>
          <h3 className="text-3xl font-bold">{stats.expires}</h3>
          <p className="text-sm opacity-90 mt-1">Action requise</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Rechercher un abonnement..."
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilterStatus('actif')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'actif'
                  ? 'bg-success text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Actifs
            </button>
            <button
              onClick={() => setFilterStatus('en_alerte')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'en_alerte'
                  ? 'bg-warning text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              En Alerte
            </button>
            <button
              onClick={() => setFilterStatus('expire')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'expire'
                  ? 'bg-danger text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Expirés
            </button>
          </div>
        </div>
      </div>

      {/* Liste */}
      {filteredAbonnements.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">Aucun abonnement trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAbonnements.map((abonnement) => (
            <AbonnementCard
              key={abonnement.id}
              abonnement={abonnement}
              onRenouveler={handleRenouveler}
              onPayment={handleOpenPaiement}
            />
          ))}
        </div>
      )}

      {/* Modal Paiement */}
      <Modal
        isOpen={showPaiementModal}
        onClose={() => {
          setShowPaiementModal(false);
          setSelectedAbonnement(null);
        }}
        title={selectedAbonnement ? `Enregistrer paiement - ${selectedAbonnement.installation?.application_installee}` : 'Enregistrer paiement'}
        size="lg"
      >
        {selectedAbonnement && (
          <PaiementForm
            isAbonnement={true}
            paiement={{
              client_id: selectedAbonnement.installation?.client?.id || selectedAbonnement.installation?.client_id || '',
              installation_id: selectedAbonnement.installation_id,
              type: 'abonnement',
              mode_paiement: 'especes',
              montant: '',
              date_paiement: new Date().toISOString().split('T')[0]
            }}
            onSubmit={handlePaiementSubmit}
            onCancel={() => setShowPaiementModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default AbonnementsList;