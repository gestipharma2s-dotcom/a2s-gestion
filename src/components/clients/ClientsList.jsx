import React, { useState, useEffect } from 'react';
import { Eye, Phone, Mail, Building, User, Archive, ArchiveRestore } from 'lucide-react';
import Modal from '../common/Modal';
import SearchBar from '../common/SearchBar';
import DataTable from '../common/DataTable';
import ClientDetails from './ClientDetails';
import { prospectService } from '../../services/prospectService';
import { installationService } from '../../services/installationService';
import { paiementService } from '../../services/paiementService';
import { supabase } from '../../services/supabaseClient';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatMontant, formatPriceDisplay } from '../../utils/helpers';

const ClientsList = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('actif');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const { addNotification } = useApp();
  const { user, profile } = useAuth();

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm, filterStatus]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await prospectService.getAll();
      // Filtrer pour n'afficher que les clients actifs ou archivés
      const clientsListContext = data.filter(p => p.statut === 'actif' || p.statut === 'archive');

      // Récupérer tous les abonnements en une fois (optimisation)
      const { data: allAbonnements } = await supabase.from('abonnements').select('*');

      // Pour chaque client, calculer montant payé et reste à payer
      const clientsWithFinancials = await Promise.all(
        clientsListContext.map(async (client) => {
          try {
            const installations = await installationService.getByClient(client.id);
            const paiements = await paiementService.getByClient(client.id);

            const totalInstallations = (installations || []).reduce((sum, i) => sum + (parseFloat(i.montant) || 0), 0);
            const soldeInitial = parseFloat(client.solde_initial) || 0;

            // Calculer le total des abonnements pour ce client
            const clientAbonnements = (allAbonnements || []).filter(a =>
              installations.some(i => i.id === a.installation_id)
            );
            const totalAbonnements = clientAbonnements.reduce((sum, a) => {
              const inst = installations.find(i => i.id === a.installation_id);
              return sum + (parseFloat(inst?.montant_abonnement) || 0);
            }, 0);

            const totalDu = soldeInitial + totalInstallations + totalAbonnements;
            const totalPaye = (paiements || []).reduce((sum, p) => sum + (parseFloat(p.montant) || 0), 0);
            const resteAPayer = Math.max(0, totalDu - totalPaye);

            return {
              ...client,
              montant_paye: totalPaye,
              reste_a_payer: resteAPayer,
              montant_total: totalDu,
              total_installations: totalInstallations,
              total_abonnements: totalAbonnements
            };
          } catch (error) {
            console.warn(`Erreur calcul financials pour client ${client.id}:`, error);
            return {
              ...client,
              montant_paye: 0,
              reste_a_payer: 0,
              montant_total: 0
            };
          }
        })
      );

      setClients(clientsWithFinancials);
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur lors du chargement des clients'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = clients.filter(c => c.statut === filterStatus);

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.raison_sociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.telephone?.includes(searchTerm) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredClients(filtered);
  };

  const handleArchiveToggle = async (clientRow) => {
    try {
      // Check permission
      const hasEditPermission = profile?.role === 'admin' || profile?.role === 'super_admin';
      if (!hasEditPermission) {
        addNotification({ type: 'error', message: 'Permission refusée' });
        return;
      }

      const newStatus = clientRow.statut === 'archive' ? 'actif' : 'archive';
      const alertMsg = newStatus === 'archive'
        ? `Voulez-vous vraiment archiver le client "${clientRow.raison_sociale}" ?`
        : `Voulez-vous désarchiver le client "${clientRow.raison_sociale}" (retour aux clients actifs) ?`;

      if (!window.confirm(alertMsg)) return;

      await prospectService.update(clientRow.id, { statut: newStatus });
      addNotification({
        type: 'success',
        message: `Client ${newStatus === 'archive' ? 'archivé' : 'désarchivé'} avec succès`
      });
      loadClients();
    } catch (error) {
      console.error('Erreur archivage:', error);
      addNotification({
        type: 'error',
        message: "Erreur lors de la mise à jour de l'archivage."
      });
    }
  };

  const handleViewDetails = (client) => {
    setSelectedClient(client);
    setShowDetailsModal(true);
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
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-sm opacity-90 mb-1">Total Clients</p>
          <h3 className="text-4xl font-bold">{clients.length}</h3>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90 mb-1">Actifs ce mois</p>
          <h3 className="text-4xl font-bold">{clients.length}</h3>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-sm opacity-90 mb-1">Nouveaux</p>
          <h3 className="text-4xl font-bold">+5</h3>
        </div>
      </div>

      {/* Search Bar & Filters */}
      <div className="card flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-1/2">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Rechercher un client..."
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('actif')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'actif'
              ? 'bg-success text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Clients Actifs
          </button>
          <button
            onClick={() => setFilterStatus('archive')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'archive'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Boîte Archive
          </button>
        </div>
      </div>

      {/* Liste des clients */}
      {filteredClients.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">Aucun client trouvé</p>
        </div>
      ) : (
        <DataTable
          data={filteredClients}
          columns={[
            {
              key: 'raison_sociale',
              label: 'Client',
              width: '200px',
              render: (row) => (
                <div>
                  <p className="font-semibold text-gray-900">{row.raison_sociale}</p>
                  <p className="text-xs text-gray-500">{row.email || 'N/A'}</p>
                </div>
              )
            },
            {
              key: 'created_at',
              label: 'Date Création',
              width: '120px',
              render: (row) => (
                <span className={`text-xs font-bold ${row.created_at?.includes('2025-12-31') ? 'text-blue-700 bg-blue-100 px-2 py-1 rounded border border-blue-200' : 'text-gray-600'}`}>
                  {row.created_at?.includes('2025-12-31') ? '📦 ARCHIVE 2025' : (row.created_at ? formatDate(row.created_at) : 'Sans date')}
                </span>
              )
            },
            {
              key: 'contact',
              label: 'Contact',
              width: '150px',
              render: (row) => (
                <div>
                  <p className="text-sm text-gray-900">{row.contact || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{row.telephone || 'N/A'}</p>
                </div>
              )
            },
            {
              key: 'secteur',
              label: 'Secteur',
              width: '120px',
              render: (row) => <span>{row.secteur || 'N/A'}</span>
            },
            {
              key: 'reste_a_payer',
              label: 'Reste à Payer',
              width: '130px',
              render: (row) => {
                const profileObj = profile || {};
                return (profileObj.role === 'admin' || profileObj.role === 'super_admin') ? (
                  <span className={`font-bold ${row.reste_a_payer > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatMontant(row.reste_a_payer || 0)}
                  </span>
                ) : (
                  <span className="text-gray-400">🔐</span>
                );
              }
            },
            {
              key: 'statut_paiement',
              label: 'Statut de Paiement',
              width: '140px',
              render: (row) => {
                const montantTotal = row.montant_total || 0;
                const montantPaye = row.montant_paye || 0;
                const reste = Math.max(0, montantTotal - montantPaye);

                let statut, couleur, code;
                if (reste === montantTotal || montantTotal === 0) {
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
            },
            {
              key: 'wilaya',
              label: 'Wilaya',
              width: '100px',
              render: (row) => <span>{row.wilaya || 'N/A'}</span>
            },
            {
              key: 'statut',
              label: 'Statut',
              width: '100px',
              render: (row) => (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${row.statut === 'archive' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                  {row.statut === 'archive' ? 'ARCHIVE' : 'CLIENT ACTIF'}
                </span>
              )
            }
          ]}
          actions={[
            {
              key: 'view',
              label: 'Détails',
              icon: <Eye size={18} />,
              onClick: handleViewDetails,
              className: 'bg-blue-600 hover:bg-blue-700 text-white px-3 py-1'
            },
            {
              key: 'archive',
              label: (row) => row.statut === 'archive' ? 'Désarchiver' : 'Archiver',
              icon: (row) => row.statut === 'archive' ? <ArchiveRestore size={18} /> : <Archive size={18} />,
              onClick: (row) => handleArchiveToggle(row),
              disabled: !(profile?.role === 'admin' || profile?.role === 'super_admin'),
              title: !(profile?.role === 'admin' || profile?.role === 'super_admin') ? 'Permission refusée' : (row) => row.statut === 'archive' ? 'Remettre dans les clients actifs' : 'Archiver ce client',
              className: (profile?.role === 'admin' || profile?.role === 'super_admin') ? 'bg-gray-600 hover:bg-gray-700 text-white px-3 py-1' : 'bg-gray-400 cursor-not-allowed text-white px-3 py-1'
            }
          ]}
          loading={loading}
          emptyMessage="Aucun client trouvé"
        />
      )}

      {/* Modal Détails Client */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Détails du Client"
        size="lg"
      >
        <ClientDetails client={selectedClient} />
      </Modal>
    </div>
  );
};

export default ClientsList;