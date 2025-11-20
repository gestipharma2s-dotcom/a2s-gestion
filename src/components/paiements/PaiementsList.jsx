import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Download, Calendar } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import Input from '../common/Input';
import PaiementForm from './PaiementForm';
import { paiementService } from '../../services/paiementService';
import { installationService } from '../../services/installationService';
import { abonnementService } from '../../services/abonnementService';
import { supabase } from '../../services/supabaseClient';
import { formatDate, formatMontant } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';

const PaiementsList = ({ refreshTrigger, onRefreshTrigger }) => {
  const [paiements, setPaiements] = useState([]);
  const [filteredPaiements, setFilteredPaiements] = useState([]);
  const [installations, setInstallations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPaiement, setSelectedPaiement] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const { addNotification } = useApp();

  useEffect(() => {
    loadData();
  }, [refreshTrigger]); // Recharger si refreshTrigger change

  useEffect(() => {
    filterPaiements();
  }, [paiements, searchTerm, filterType, dateDebut, dateFin]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paiementsData, installationsData] = await Promise.all([
        paiementService.getAll(),
        installationService.getAll()
      ]);
      setPaiements(paiementsData);
      setInstallations(installationsData);
    } catch (error) {
      console.error('Erreur chargement:', error);
      addNotification({
        type: 'error',
        message: 'Erreur lors du chargement des données'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPaiements = () => {
    let filtered = [...paiements];

    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.client?.raison_sociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.mode_paiement?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateDebut) {
      filtered = filtered.filter(p => new Date(p.date_paiement) >= new Date(dateDebut));
    }

    if (dateFin) {
      filtered = filtered.filter(p => new Date(p.date_paiement) <= new Date(dateFin + 'T23:59:59'));
    }

    setFilteredPaiements(filtered);
  };

  const handleEdit = (paiement) => {
    setSelectedPaiement(paiement);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = async (paiementId) => {
    const confirmMessage = `⚠️ ATTENTION ⚠️

Voulez-vous vraiment supprimer ce paiement ?

Cette action est IRRÉVERSIBLE et affectera:
- L'historique financier
- Les statistiques de revenus
- Le reste à payer de l'installation

Êtes-vous sûr de vouloir continuer ?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await paiementService.delete(paiementId);
      addNotification({
        type: 'success',
        message: 'Paiement supprimé avec succès'
      });
      loadData();
      // Notifier InstallationsList de se rafraîchir
      if (onRefreshTrigger) {
        onRefreshTrigger();
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.message || 'Erreur lors de la suppression'
      });
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (modalMode === 'edit') {
        await paiementService.update(selectedPaiement.id, formData);
        addNotification({
          type: 'success',
          message: 'Paiement modifié avec succès'
        });
      } else {
        // Mode création
        const cleanData = {
          client_id: formData.client_id,
          installation_id: formData.installation_id,
          type: formData.type,
          montant: formData.montant,
          mode_paiement: formData.mode_paiement,
          date_paiement: formData.date_paiement
        };
        
        await paiementService.create(cleanData);
        
        // Vérifier si l'installation liée a un abonnement expiré
        if (formData.installation_id) {
          const { data: abonnements } = await supabase
            .from('abonnements')
            .select('*')
            .eq('installation_id', formData.installation_id)
            .eq('statut', 'expire');
          
          if (abonnements && abonnements.length > 0) {
            const expiredAbo = abonnements[0];
            
            // Récupérer le montant total des paiements pour cette installation
            const { data: allPaiements } = await supabase
              .from('paiements')
              .select('montant')
              .eq('installation_id', formData.installation_id);
            
            const totalPaye = (allPaiements || []).reduce((sum, p) => sum + (p.montant || 0), 0);
            
            // Récupérer le montant de l'installation
            const { data: instData } = await supabase
              .from('installations')
              .select('montant')
              .eq('id', formData.installation_id)
              .single();
            
            // Si complètement payé, renouveler automatiquement
            if (totalPaye >= (instData?.montant || 0)) {
              await abonnementService.delete(expiredAbo.id);
              
              const dateDebut = new Date(expiredAbo.date_fin);
              const dateFin = new Date(dateDebut);
              dateFin.setFullYear(dateFin.getFullYear() + 1);
              
              await abonnementService.create({
                installation_id: formData.installation_id,
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
        } else {
          addNotification({
            type: 'success',
            message: 'Paiement enregistré avec succès'
          });
        }
      }
      
      setShowModal(false);
      loadData();
      // Notifier InstallationsList de se rafraîchir
      if (onRefreshTrigger) {
        onRefreshTrigger();
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.message || 'Erreur lors de l\'enregistrement'
      });
    }
  };

  const calculateTotalReste = () => {
    const resteDesPaiements = paiements.reduce((sum, p) => sum + (p.resteAPayer || 0), 0);

    const installationAvecPaiement = new Set(
      paiements.map(p => p.installation_id).filter(id => id)
    );

    const restsInstallationsSansPaiement = installations
      .filter(inst => !installationAvecPaiement.has(inst.id))
      .reduce((sum, inst) => sum + (inst.montant || 0), 0);

    return resteDesPaiements + restsInstallationsSansPaiement;
  };

  const stats = {
    total: filteredPaiements.length,
    revenuTotal: filteredPaiements.reduce((sum, p) => sum + (p.montant || 0), 0),
    acquisitions: filteredPaiements.filter(p => p.type === 'acquisition').length,
    abonnements: filteredPaiements.filter(p => p.type === 'abonnement').length,
    resteTotal: calculateTotalReste()
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
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90 mb-1">Revenus Totaux</p>
          <h3 className="text-2xl font-bold">{formatMontant(stats.revenuTotal)}</h3>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <p className="text-sm opacity-90 mb-1">Reste à Payer</p>
          <h3 className="text-2xl font-bold">{formatMontant(stats.resteTotal)}</h3>
        </div>
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-sm opacity-90 mb-1">Acquisitions</p>
          <h3 className="text-3xl font-bold">{stats.acquisitions}</h3>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-sm opacity-90 mb-1">Abonnements</p>
          <h3 className="text-3xl font-bold">{stats.abonnements}</h3>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-2">Journal des Paiements</p>
          <p className="text-xs text-gray-500">Modifier ou supprimer via la table</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="card space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Rechercher un paiement..."
            />
          </div>
        </div>

        {/* Filtre par Type */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilterType('acquisition')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === 'acquisition'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Acquisitions
          </button>
          <button
            onClick={() => setFilterType('abonnement')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterType === 'abonnement'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Abonnements
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
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Installation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPaiements.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  Aucun paiement trouvé
                </td>
              </tr>
            ) : (
              filteredPaiements.map((paiement) => (
                <tr key={paiement.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-800">
                      {paiement.client?.raison_sociale}
                    </div>
                    <div className="text-sm text-gray-600">
                      {paiement.client?.contact}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {paiement.installation?.application_installee}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge-${paiement.type === 'acquisition' ? 'info' : 'success'}`}>
                      {paiement.type === 'acquisition' ? 'Acquisition' : 'Abonnement'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-bold text-green-600">
                      {formatMontant(paiement.montant)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                    {paiement.mode_paiement}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(paiement.date_paiement)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(paiement)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(paiement.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Formulaire */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Modifier Paiement"
      >
        <PaiementForm
          paiement={selectedPaiement}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};

export default PaiementsList;