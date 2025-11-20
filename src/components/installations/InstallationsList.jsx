import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import Input from '../common/Input';
import InstallationForm from './InstallationForm';
import InstallationCard from './InstallationCard';
import { installationService } from '../../services/installationService';
import { paiementService } from '../../services/paiementService';
import PaymentQuickForm from './PaymentQuickForm';
import { useApp } from '../../context/AppContext';

const InstallationsList = () => {
  const [installations, setInstallations] = useState([]);
  const [filteredInstallations, setFilteredInstallations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInstallation, setSelectedInstallation] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { addNotification } = useApp();

  useEffect(() => {
    loadInstallations();
  }, []);

  useEffect(() => {
    filterInstallations();
  }, [installations, searchTerm, filterStatus, dateDebut, dateFin]);

  const loadInstallations = async () => {
    try {
      setLoading(true);
      const data = await installationService.getAll();
      setInstallations(data);
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur lors du chargement des installations'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterInstallations = () => {
    let filtered = [...installations];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(i => i.statut === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(i =>
        i.application_installee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.client?.raison_sociale?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateDebut) {
      filtered = filtered.filter(i => new Date(i.date_installation) >= new Date(dateDebut));
    }

    if (dateFin) {
      filtered = filtered.filter(i => new Date(i.date_installation) <= new Date(dateFin + 'T23:59:59'));
    }

    setFilteredInstallations(filtered);
  };

  const handleCreate = () => {
    setSelectedInstallation(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (installation) => {
    setSelectedInstallation(installation);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = async (installationId) => {
    // ✅ Vérifier d'abord s'il y a des paiements
    try {
      const hasPaiements = await installationService.hasPaiements(installationId);
      if (hasPaiements) {
        // Afficher une alerte bloquante très visible
        window.alert(
          `❌ SUPPRESSION IMPOSSIBLE ❌\n\n` +
          `Cette installation est liée à un ou plusieurs paiements enregistrés.\n\n` +
          `⚠️ Vous ne pouvez pas supprimer cette installation.\n\n` +
          `✅ Solution: Supprimez d'abord les paiements avant de supprimer l'installation.`
        );
        return;
      }
    } catch (error) {
      console.error('Erreur vérification paiements:', error);
    }

    const confirmMessage = `⚠️ ATTENTION ⚠️

Cette action va supprimer:
- L'installation
- Tous les abonnements liés

Cette action est IRRÉVERSIBLE !

Êtes-vous absolument sûr de vouloir continuer ?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    const finalConfirm = window.prompt(
      'Pour confirmer la suppression, tapez "SUPPRIMER" en majuscules:'
    );

    if (finalConfirm !== 'SUPPRIMER') {
      addNotification({
        type: 'info',
        message: 'Suppression annulée'
      });
      return;
    }

    try {
      await installationService.delete(installationId);
      addNotification({
        type: 'success',
        message: 'Installation supprimée avec succès'
      });
      loadInstallations();
    } catch (error) {
      // ✅ Afficher une alerte bloquante si l'installation a des paiements
      if (error.code === 'INSTALLATION_HAS_PAIEMENTS') {
        window.alert(
          `❌ SUPPRESSION IMPOSSIBLE ❌\n\n` +
          `Cette installation est liée à un ou plusieurs paiements enregistrés.\n\n` +
          `⚠️ Vous ne pouvez pas supprimer cette installation.\n\n` +
          `✅ Solution: Supprimez d'abord les paiements avant de supprimer l'installation.`
        );
      } else {
        addNotification({
          type: 'error',
          message: error.message || 'Erreur lors de la suppression'
        });
      }
    }
  };

  const handlePayment = (installation) => {
    setSelectedInstallation(installation);
    setShowPaymentModal(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (modalMode === 'create') {
        await installationService.create(formData);
        addNotification({
          type: 'success',
          message: 'Installation créée avec succès'
        });
      } else {
        await installationService.update(selectedInstallation.id, formData);
        addNotification({
          type: 'success',
          message: 'Installation modifiée avec succès'
        });
      }
      setShowModal(false);
      loadInstallations();
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.message || 'Erreur lors de l\'enregistrement'
      });
    }
  };

  const handlePaymentSubmit = async (formData) => {
    try {
      await paiementService.create({
        ...formData,
        client_id: selectedInstallation.client_id,
        installation_id: selectedInstallation.id
      });
      addNotification({
        type: 'success',
        message: 'Paiement enregistré avec succès'
      });
      setShowPaymentModal(false);
      
      await loadInstallations();
      triggerRefresh();
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.message || 'Erreur lors de l\'enregistrement du paiement'
      });
    }
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handlePaiementsRefresh = () => {
    loadInstallations();
    triggerRefresh();
  };

  const stats = {
    total: installations.length,
    enCours: installations.filter(i => i.statut === 'en_cours').length,
    terminees: installations.filter(i => i.statut === 'terminee').length,
    acquisitions: installations.filter(i => i.type === 'acquisition').length,
    abonnements: installations.filter(i => i.type === 'abonnement').length,
    revenuTotal: installations.reduce((sum, i) => sum + (i.montant || 0), 0)
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-sm opacity-90 mb-1">Total Installations</p>
          <h3 className="text-3xl font-bold">{stats.total}</h3>
        </div>
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <p className="text-sm opacity-90 mb-1">En Cours</p>
          <h3 className="text-3xl font-bold">{stats.enCours}</h3>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90 mb-1">Terminées</p>
          <h3 className="text-3xl font-bold">{stats.terminees}</h3>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-sm opacity-90 mb-1">Acquisitions</p>
          <h3 className="text-3xl font-bold">{stats.acquisitions}</h3>
        </div>
        <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <p className="text-sm opacity-90 mb-1">Abonnements</p>
          <h3 className="text-3xl font-bold">{stats.abonnements}</h3>
        </div>
      </div>

      {/* Filtres */}
      <div className="card space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Rechercher une installation..."
            />
          </div>
        </div>

        {/* Filtre par Statut */}
        <div className="flex gap-2 flex-wrap">
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
            onClick={() => setFilterStatus('en_cours')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'en_cours'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            En Cours
          </button>
          <button
            onClick={() => setFilterStatus('terminee')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'terminee'
                ? 'bg-success text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Terminées
          </button>
        </div>

        {/* Filtre par Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-600" />
            <Input
              type="date"
              label="Du"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              placeholder="Date de début"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-600" />
            <Input
              type="date"
              label="Au"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              placeholder="Date de fin"
            />
          </div>
        </div>

        {(dateDebut || dateFin) && (
          <button
            onClick={() => {
              setDateDebut('');
              setDateFin('');
            }}
            className="text-sm text-primary hover:text-primary-dark font-medium"
          >
            Réinitialiser les dates
          </button>
        )}

        <div className="flex justify-end">
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleCreate}
          >
            Nouvelle Installation
          </Button>
        </div>
      </div>

      {/* Liste */}
      {filteredInstallations.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">Aucune installation trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstallations.map((installation) => (
            <InstallationCard
              key={installation.id}
              installation={installation}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPayment={handlePayment}
              refreshTrigger={refreshTrigger}
            />
          ))}
        </div>
      )}

      {/* Modal Installation */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'create' ? 'Nouvelle Installation' : 'Modifier Installation'}
      >
        <InstallationForm
          installation={selectedInstallation}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>

      {/* Modal Paiement */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title={`Enregistrer un paiement - ${selectedInstallation?.application_installee}`}
      >
        {selectedInstallation && (
          <PaymentQuickForm
            installation={selectedInstallation}
            onSubmit={handlePaymentSubmit}
            onCancel={() => setShowPaymentModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default InstallationsList;