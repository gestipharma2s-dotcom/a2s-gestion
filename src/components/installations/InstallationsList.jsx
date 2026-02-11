import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Eye, RefreshCw, MapPin } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import FilterBar from '../common/FilterBar';
import Input from '../common/Input';
import DataTable from '../common/DataTable';
import MultiSelectDropdown from '../common/MultiSelectDropdown';
import InstallationForm from './InstallationForm';
import InstallationCard from './InstallationCard';
import { installationService } from '../../services/installationService';
import { userService } from '../../services/userService';
import { paiementService } from '../../services/paiementService';
import { formatWilaya } from '../../constants/wilayas';
import PaymentQuickForm from './PaymentQuickForm';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const InstallationsList = () => {
  const [installations, setInstallations] = useState([]);
  const [filteredInstallations, setFilteredInstallations] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [creatorId, setCreatorId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInstallation, setSelectedInstallation] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [hasCreatePermission, setHasCreatePermission] = useState(false);
  const [hasEditPermission, setHasEditPermission] = useState(false);
  const [hasDeletePermission, setHasDeletePermission] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [selectedWilayas, setSelectedWilayas] = useState([]);
  const [availableWilayas, setAvailableWilayas] = useState([]);
  const { addNotification } = useApp();
  const { user, profile } = useAuth();

  useEffect(() => {
    loadInstallations();
  }, []);

  useEffect(() => {
    if (installations.length > 0) {
      loadPaiements();
    }
  }, [installations]);

  useEffect(() => {
    // Extraire les wilayas uniques et les trier
    const wilayas = [...new Set(installations
      .map(inst => inst.wilaya)
      .filter(w => w && w.trim() !== '')
      .map(w => w.trim())
    )].sort();
    setAvailableWilayas(wilayas);
  }, [installations]);

  useEffect(() => {
    loadPermissions();
  }, [user?.id, profile?.role]);

  useEffect(() => {
    filterInstallations();
  }, [installations, searchTerm, filterStatus, dateDebut, dateFin, creatorId, selectedWilayas]);

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

  const loadPaiements = async () => {
    try {
      const data = await paiementService.getAll();
      setPaiements(data);
    } catch (error) {
      console.error('Erreur lors du chargement des paiements:', error);
    }
  };

  const calculateMontantPaye = (installationId) => {
    return paiements
      .filter(p => p.installation_id === installationId)
      .reduce((sum, p) => sum + (p.montant || 0), 0);
  };

  const calculateResteAPayer = (installation) => {
    const montantPaye = calculateMontantPaye(installation.id);
    return Math.max(0, (installation.montant || 0) - montantPaye);
  };

  const loadPermissions = async () => {
    try {
      setLoadingPermissions(true);
      if (user?.id && profile) {
        const canCreate = profile?.role === 'admin' || profile?.role === 'super_admin' || 
                         await userService.hasCreatePermission(user.id, 'installations');
        const canEdit = profile?.role === 'admin' || profile?.role === 'super_admin' || 
                       await userService.hasEditPermission(user.id, 'installations');
        const canDelete = profile?.role === 'admin' || profile?.role === 'super_admin' || 
                         await userService.hasDeletePermission(user.id, 'installations');
        
        setHasCreatePermission(canCreate);
        setHasEditPermission(canEdit);
        setHasDeletePermission(canDelete);
      }
    } catch (err) {
      console.error('Erreur chargement permissions:', err);
    } finally {
      setLoadingPermissions(false);
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

    // Filtre par créateur (pour tous les utilisateurs)
    if (creatorId) {
      filtered = filtered.filter(i => i.created_by === creatorId);
    }

    // ✅ Filtre par wilaya (multiple selection)
    if (selectedWilayas.length > 0) {
      filtered = filtered.filter(i => selectedWilayas.includes(i.wilaya));
    }

    setFilteredInstallations(filtered);
  };

  const handleCreate = () => {
    // ✅ Vérifier la permission AVANT d'ouvrir le modal (silencieusement, sans message)
    if (!hasCreatePermission) {
      return;
    }
    setSelectedInstallation(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (installation) => {
    // ✅ Vérifier la permission AVANT d'ouvrir le modal (silencieusement, sans message)
    if (!hasEditPermission) {
      return;
    }
    setSelectedInstallation(installation);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = async (installation) => {
    // ✅ Extraire l'ID si c'est un objet (du DataTable)
    const installationId = installation?.id || installation;
    
    // ✅ Vérifier la permission AVANT de supprimer (silencieusement, sans message)
    if (!hasDeletePermission) {
      return;
    }
    
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
        // Ajouter l'ID de l'utilisateur courant comme créateur
        const dataWithCreator = {
          ...formData,
          created_by: user?.id || null
        };
        await installationService.create(dataWithCreator);
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
    // Protéger contre les double-clicks
    if (isSubmittingPayment) return;
    setIsSubmittingPayment(true);
    
    try {
      await paiementService.create({
        ...formData,
        client_id: selectedInstallation.client_id,
        installation_id: selectedInstallation.id,
        created_by: user?.id || null
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
    } finally {
      setIsSubmittingPayment(false);
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
        <div className="card">
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleCreate}
            disabled={!hasCreatePermission}
            className="w-full h-full"
            title={!hasCreatePermission ? 'Permission refusée: Créer une installation' : 'Créer une nouvelle installation'}
          >
            Nouvelle Installation
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <div className="space-y-4">
        {/* Filtre avancé avec date et utilisateur */}
        <FilterBar
          onSearchChange={setSearchTerm}
          onDateStartChange={setDateDebut}
          onDateEndChange={setDateFin}
          onCreatorChange={setCreatorId}
          searchValue={searchTerm}
          dateStart={dateDebut}
          dateEnd={dateFin}
          creatorId={creatorId}
        />

        {/* Filtre Wilaya avec dropdown multi-select */}
        <div className="card">
          <MultiSelectDropdown
            options={availableWilayas.map(wilaya => ({
              value: wilaya,
              label: formatWilaya(wilaya),
              count: installations.filter(i => i.wilaya === wilaya).length
            }))}
            selectedValues={selectedWilayas}
            onChange={setSelectedWilayas}
            placeholder="Filtrer par Wilaya"
            label="Filtrer par Wilaya"
            icon={MapPin}
            displayFormat={(count, total) => `Tous les Wilayas (${total})`}
          />
        </div>
      </div>

      {/* Liste */}
      {filteredInstallations.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">Aucune installation trouvée</p>
        </div>
      ) : (
        <DataTable
          data={filteredInstallations}
          columns={[
            {
              key: 'application_installee',
              label: 'Application',
              width: '200px',
              render: (row) => (
                <div>
                  <p className="font-semibold text-gray-900">{row.application_installee || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{row.client?.raison_sociale || 'N/A'}</p>
                </div>
              )
            },
            {
              key: 'date_installation',
              label: 'Date Installation',
              width: '150px',
              render: (row) => (
                <span>{row.date_installation ? new Date(row.date_installation).toLocaleDateString('fr-FR') : 'N/A'}</span>
              )
            },
            {
              key: 'statut',
              label: 'Statut',
              width: '120px',
              render: (row) => (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  row.statut === 'en_cours' 
                    ? 'bg-amber-100 text-amber-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {row.statut === 'en_cours' ? 'En cours' : 'Terminée'}
                </span>
              )
            },
            {
              key: 'type',
              label: 'Type',
              width: '120px',
              render: (row) => (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  row.type === 'acquisition' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-indigo-100 text-indigo-800'
                }`}>
                  {row.type === 'acquisition' ? 'Acquisition' : 'Abonnement'}
                </span>
              )
            },
            {
              key: 'statut_paiement',
              label: 'Statut de Paiement',
              width: '140px',
              render: (row) => {
                const montantPaye = calculateMontantPaye(row.id);
                const reste = calculateResteAPayer(row);
                
                let statut, couleur, code;
                if (reste === row.montant) {
                  // 0 = Aucun paiement
                  statut = 'Aucun paiement';
                  couleur = 'bg-red-100 text-red-700';
                  code = 0;
                } else if (reste > 0) {
                  // 1 = Partiellement payé
                  statut = 'Partiellement payé';
                  couleur = 'bg-orange-100 text-orange-700';
                  code = 1;
                } else {
                  // 2 = Totalement payé
                  statut = 'Totalement payé';
                  couleur = 'bg-green-100 text-green-700';
                  code = 2;
                }
                
                return (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${couleur}`}>
                    {code} ({statut})
                  </span>
                );
              }
            }
          ]}
          actions={[
            {
              key: 'details',
              label: 'Détails',
              icon: <Eye size={18} />,
              onClick: (row) => {
                setSelectedInstallation(row);
                setShowDetailsModal(true);
              },
              className: 'bg-blue-600 hover:bg-blue-700 text-white px-3 py-1'
            },
            {
              key: 'edit',
              label: 'Modifier',
              icon: <Edit2 size={18} />,
              onClick: handleEdit,
              disabled: !hasEditPermission,
              title: !hasEditPermission ? 'Permission refusée: Modifier' : 'Modifier cette installation',
              className: hasEditPermission ? 'bg-amber-600 hover:bg-amber-700 text-white px-3 py-1' : 'bg-gray-400 cursor-not-allowed text-white px-3 py-1'
            },
            {
              key: 'delete',
              label: 'Supprimer',
              icon: <Trash2 size={18} />,
              onClick: handleDelete,
              disabled: !hasDeletePermission,
              title: !hasDeletePermission ? 'Permission refusée: Supprimer' : 'Supprimer cette installation',
              className: hasDeletePermission ? 'bg-red-600 hover:bg-red-700 text-white px-3 py-1' : 'bg-gray-400 cursor-not-allowed text-white px-3 py-1'
            }
          ]}
          loading={loading}
          emptyMessage="Aucune installation trouvée"
        />
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

      {/* Modal Détails Installation */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Détails Installation"
        size="lg"
      >
        {selectedInstallation && (
          <InstallationCard
            installation={selectedInstallation}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPayment={handlePayment}
            refreshTrigger={refreshTrigger}
          />
        )}
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
            isSubmitting={isSubmittingPayment}
          />
        )}
      </Modal>
    </div>
  );
};

export default InstallationsList;