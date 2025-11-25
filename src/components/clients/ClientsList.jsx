import React, { useState, useEffect } from 'react';
import { Eye, Phone, Mail, Building, User } from 'lucide-react';
import Modal from '../common/Modal';
import SearchBar from '../common/SearchBar';
import DataTable from '../common/DataTable';
import ClientDetails from './ClientDetails';
import { prospectService } from '../../services/prospectService';
import { installationService } from '../../services/installationService';
import { paiementService } from '../../services/paiementService';
import { useApp } from '../../context/AppContext';

const ClientsList = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const { addNotification } = useApp();

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await prospectService.getAll();
      // Filtrer uniquement les clients actifs
      const activeClients = data.filter(p => p.statut === 'actif');
      
      // Pour chaque client, calculer montant payé et reste à payer
      const clientsWithFinancials = await Promise.all(
        activeClients.map(async (client) => {
          try {
            const installations = await installationService.getByClient(client.id);
            const paiements = await paiementService.getByClient(client.id);
            
            const totalInstallations = (installations || []).reduce((sum, i) => sum + (i.montant || 0), 0);
            const totalPaye = (paiements || []).reduce((sum, p) => sum + (p.montant || 0), 0);
            const resteAPayer = Math.max(0, totalInstallations - totalPaye);
            
            return {
              ...client,
              montant_paye: totalPaye,
              reste_a_payer: resteAPayer,
              montant_total: totalInstallations
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
    let filtered = [...clients];

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

      {/* Search Bar */}
      <div className="card">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Rechercher un client..."
        />
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
              key: 'montant_paye',
              label: 'Montant Payé',
              width: '140px',
              render: (row) => (
                <span className="font-semibold text-green-600">
                  {new Intl.NumberFormat('fr-DZ', { 
                    style: 'decimal',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(row.montant_paye || 0)} DA
                </span>
              )
            },
            {
              key: 'reste_a_payer',
              label: 'Reste à Payer',
              width: '140px',
              render: (row) => (
                <span className={`font-semibold ${(row.reste_a_payer || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {new Intl.NumberFormat('fr-DZ', { 
                    style: 'decimal',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(row.reste_a_payer || 0)} DA
                </span>
              )
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
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  CLIENT ACTIF
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