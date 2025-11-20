import React, { useState, useEffect } from 'react';
import { Eye, Phone, Mail, Building, User } from 'lucide-react';
import Modal from '../common/Modal';
import SearchBar from '../common/SearchBar';
import ClientDetails from './ClientDetails';
import { prospectService } from '../../services/prospectService';
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
      setClients(activeClients);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <div key={client.id} className="card hover:shadow-xl transition-shadow duration-200">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {client.raison_sociale}
                  </h3>
                  <span className="badge-success text-xs">Client Actif</span>
                </div>
                <button
                  onClick={() => handleViewDetails(client)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <User size={16} />
                  <span>{client.contact}</span>
                </div>
                
                {client.secteur && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Building size={16} />
                    <span>{client.secteur}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Phone size={16} />
                  <span>{client.telephone}</span>
                </div>
                
                {client.email && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Mail size={16} />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleViewDetails(client)}
                  className="flex-1 btn-primary text-sm py-2"
                >
                  Voir Détails
                </button>
                
                <a
                  href={`tel:${client.telephone}`}
                  className="flex items-center justify-center p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Phone size={18} />
                </a>
              </div>
            </div>
          ))}
        </div>
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