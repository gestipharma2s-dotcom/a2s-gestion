import React, { useState, useEffect } from 'react';
import { Plus, FileText, Brain, Eye, Edit2, Trash2, MapPin } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import FilterBar from '../common/FilterBar';
import DataTable from '../common/DataTable';
import MultiSelectDropdown from '../common/MultiSelectDropdown';
import InterventionForm from './InterventionForm';
import InterventionCard from './InterventionCard';
import InterventionDetails from './InterventionDetails';
import InterventionJournal from './InterventionJournal';
import InterventionAnalyse from './InterventionAnalyse';
import { interventionService } from '../../services/interventionService';
import { userService } from '../../services/userService';
import { formatWilaya } from '../../constants/wilayas';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const InterventionsList = () => {
  const ITEMS_PER_PAGE = 25;
  
  const [interventions, setInterventions] = useState([]);
  const [filteredInterventions, setFilteredInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedWilayas, setSelectedWilayas] = useState([]);
  const [availableWilayas, setAvailableWilayas] = useState([]);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [creatorId, setCreatorId] = useState('');
  const [currentView, setCurrentView] = useState('journal');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [hasCreatePermission, setHasCreatePermission] = useState(false);
  const [hasEditPermission, setHasEditPermission] = useState(false);
  const [hasDeletePermission, setHasDeletePermission] = useState(false);
  const [hasClosePermission, setHasClosePermission] = useState(false);
  const { addNotification } = useApp();
  const { user, profile } = useAuth();

  useEffect(() => {
    loadInterventions();
  }, []);

  useEffect(() => {
    loadInterventions();
  }, []);

  useEffect(() => {
    // Appeler filterInterventions quand les données ou filtres changent
    filterInterventions();
    setCurrentPage(1); // Réinitialiser à la page 1 quand on filtre
  }, [interventions, filterStatus, filterType, searchTerm, dateStart, dateEnd, creatorId, selectedWilayas, profile]);

  useEffect(() => {
    // Extraire les wilayas uniques depuis les clients des interventions
    const wilayas = [...new Set(interventions
      .map(int => int.client?.wilaya)
      .filter(w => w && w.trim() !== '')
      .map(w => w.trim())
    )].sort();
    setAvailableWilayas(wilayas);
  }, [interventions]);

  useEffect(() => {
    // Vérifier les permissions
    const checkPermissions = async () => {
      if (user?.id && profile) {
        try {
          const canCreate = profile?.role === 'admin' || profile?.role === 'super_admin' || 
                           await userService.hasCreatePermission(user.id, 'support');
          const canEdit = profile?.role === 'admin' || profile?.role === 'super_admin' || 
                         await userService.hasEditPermission(user.id, 'support');
          const canDelete = profile?.role === 'admin' || profile?.role === 'super_admin' || 
                           await userService.hasDeletePermission(user.id, 'support');
          const canClose = profile?.role === 'admin' || profile?.role === 'super_admin' || 
                          await userService.hasClosePermission(user.id, 'support');
          setHasCreatePermission(canCreate);
          setHasEditPermission(canEdit);
          setHasDeletePermission(canDelete);
          setHasClosePermission(canClose);
        } catch (err) {
          console.error('Erreur vérification permissions:', err);
        }
      }
    };

    checkPermissions();
  }, [user?.id, profile]);

  const loadInterventions = async () => {
    try {
      setLoading(true);
      const data = await interventionService.getAll();
      setInterventions(data);
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur lors du chargement des interventions'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterInterventions = () => {
    let filtered = [...interventions];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(i => i.statut === filterStatus);
    }

    // ✅ Filtre par type d'intervention
    if (filterType !== 'all') {
      filtered = filtered.filter(i => i.type === filterType);
    }

    // ✅ Filtre par wilaya (multiple selection)
    if (selectedWilayas.length > 0) {
      filtered = filtered.filter(i => selectedWilayas.includes(i.client?.wilaya));
    }

    if (searchTerm) {
      filtered = filtered.filter(i =>
        i.client?.raison_sociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.technicien?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.resume_probleme?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par date
    if (dateStart) {
      const startDate = new Date(dateStart);
      filtered = filtered.filter(i => {
        const interventionDate = new Date(i.date_intervention);
        return interventionDate >= startDate;
      });
    }

    if (dateEnd) {
      const endDate = new Date(dateEnd);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(i => {
        const interventionDate = new Date(i.date_intervention);
        return interventionDate <= endDate;
      });
    }

    // Filtre par créateur
    // ✅ TOUS LES UTILISATEURS voient TOUTES les interventions (consultation)
    // SANS filtrage par créateur - chacun peut consulter le travail de tous
    // Les permissions Créer/Modifier/Supprimer restent contrôlées individuellement
    if (creatorId && (profile?.role === 'admin' || profile?.role === 'super_admin')) {
      // Admins/Super_admin peuvent OPTIONNELLEMENT filtrer par créateur
      filtered = filtered.filter(i => i.created_by === creatorId);
    }
    // Les autres utilisateurs (Support, Technicien, Commercial) voient TOUTES les interventions

    setFilteredInterventions(filtered);
  };

  const handleCreate = () => {
    // ✅ Vérifier la permission AVANT d'ouvrir le modal (silencieusement, sans message)
    if (!hasCreatePermission) {
      return;
    }
    setSelectedIntervention(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (intervention) => {
    // ✅ Vérifier la permission AVANT d'ouvrir le modal (silencieusement, sans message)
    if (!hasEditPermission) {
      return;
    }
    setSelectedIntervention(intervention);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleViewDetails = (intervention) => {
    setSelectedIntervention(intervention);
    setShowDetailsModal(true);
  };

  const handleCloturer = (intervention) => {
    // ✅ Vérifier la permission AVANT d'ouvrir le modal (silencieusement, sans message)
    if (!hasClosePermission) {
      return;
    }
    setSelectedIntervention(intervention);
    setShowCloseModal(true);
  };

  const handleDelete = async (intervention) => {
    // ✅ Extraire l'ID si c'est un objet (du DataTable)
    const interventionId = intervention?.id || intervention;
    
    // ✅ Vérifier la permission AVANT de supprimer (silencieusement, sans message)
    if (!hasDeletePermission) {
      return;
    }
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette intervention ?')) {
      return;
    }

    try {
      await interventionService.delete(interventionId);
      addNotification({
        type: 'success',
        message: 'Intervention supprimée avec succès'
      });
      loadInterventions();
    } catch (error) {
      // ✅ Gérer les erreurs spécifiques
      console.error('Erreur suppression intervention:', error);
      
      // 409 Conflict = contrainte de clé étrangère
      if (error.status === 409 || error.message?.includes('foreign key')) {
        addNotification({
          type: 'error',
          message: 'Impossible de supprimer cette intervention car elle est liée à d\'autres enregistrements'
        });
      } else {
        addNotification({
          type: 'error',
          message: 'Erreur lors de la suppression de l\'intervention'
        });
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (modalMode === 'create') {
        // Ajouter l'ID de l'utilisateur courant comme créateur
        const dataWithCreator = {
          ...formData,
          created_by: user?.id || null
        };
        await interventionService.create(dataWithCreator);
        addNotification({
          type: 'success',
          message: 'Intervention créée avec succès'
        });
      } else {
        await interventionService.update(selectedIntervention.id, formData);
        addNotification({
          type: 'success',
          message: 'Intervention modifiée avec succès'
        });
      }
      setShowModal(false);
      loadInterventions();
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur lors de l\'enregistrement'
      });
    }
  };

  const handleCloturerSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      const result = await interventionService.cloturer(
        selectedIntervention.id,
        formData.get('action_entreprise'),
        formData.get('commentaires')
      );
      addNotification({
        type: 'success',
        message: 'Intervention clôturée avec succès'
      });
      // Fermer le modal de clôture
      setShowCloseModal(false);
      // Fermer le modal de détails aussi
      setShowDetailsModal(false);
      // Réinitialiser l'intervention sélectionnée
      setSelectedIntervention(null);
      // Recharger la liste
      loadInterventions();
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur lors de la clôture'
      });
    }
  };

  const stats = {
    total: interventions.length,
    enCours: interventions.filter(i => i.statut === 'en_cours').length,
    cloturees: interventions.filter(i => i.statut === 'cloturee').length,
    hautesPriorites: interventions.filter(i => i.priorite === 'haute').length
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
      {/* Note informative - Tous les utilisateurs peuvent voir toutes les interventions */}
      <div className="card bg-blue-50 border-l-4 border-blue-500">
        <div className="flex items-start gap-3">
          <Eye size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-900">Consultation de toutes les interventions</p>
            <p className="text-sm text-blue-700 mt-1">
              Vous pouvez consulter <strong>toutes les interventions</strong> indépendamment de leur créateur.
              Vos permissions pour Créer, Modifier ou Supprimer sont définies individuellement par les administrateurs.
            </p>
          </div>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <p className="text-sm opacity-90 mb-1">Total Interventions</p>
          <h3 className="text-3xl font-bold">{stats.total}</h3>
        </div>
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <p className="text-sm opacity-90 mb-1">En Cours</p>
          <h3 className="text-3xl font-bold">{stats.enCours}</h3>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90 mb-1">Clôturées</p>
          <h3 className="text-3xl font-bold">{stats.cloturees}</h3>
        </div>
        <div className="card">
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleCreate}
            disabled={!hasCreatePermission}
            className="w-full h-full"
            title={!hasCreatePermission ? 'Permission refusée: Créer une intervention' : 'Créer une nouvelle intervention'}
          >
            Nouvelle Intervention
          </Button>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="card">
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentView('journal')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'journal'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FileText size={18} />
            Journal
          </button>
          <button
            onClick={() => setCurrentView('analyse')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'analyse'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Brain size={18} />
            Analyse IA
          </button>
        </div>
      </div>

      {/* Vue Journal */}
      {currentView === 'journal' && (
        <>
          {/* Filtres avancés */}
          <FilterBar
            onSearchChange={setSearchTerm}
            onDateStartChange={setDateStart}
            onDateEndChange={setDateEnd}
            onCreatorChange={setCreatorId}
            searchValue={searchTerm}
            dateStart={dateStart}
            dateEnd={dateEnd}
            creatorId={creatorId}
          />

          {/* Filtre Wilaya avec dropdown multi-select */}
          <div className="card">
            <MultiSelectDropdown
              options={availableWilayas.map(wilaya => ({
                value: wilaya,
                label: formatWilaya(wilaya),
                count: interventions.filter(i => i.client?.wilaya === wilaya).length
              }))}
              selectedValues={selectedWilayas}
              onChange={setSelectedWilayas}
              placeholder="Filtrer par Wilaya"
              label="Filtrer par Wilaya"
              icon={MapPin}
              displayFormat={(count, total) => `Tous les Wilayas (${total})`}
            />
          </div>

          {/* Tableau Journal */}
          {filteredInterventions.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 text-lg">Aucune intervention trouvée</p>
            </div>
          ) : (
            <DataTable
              data={filteredInterventions.slice(
                (currentPage - 1) * ITEMS_PER_PAGE,
                currentPage * ITEMS_PER_PAGE
              )}
              columns={[
                {
                  key: 'client',
                  label: 'Client',
                  width: '180px',
                  render: (row) => (
                    <div>
                      <p className="font-semibold text-gray-900">{row.client?.raison_sociale || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{row.technicien?.nom || 'N/A'}</p>
                    </div>
                  )
                },
                {
                  key: 'resume_probleme',
                  label: 'Problème',
                  width: '180px',
                  render: (row) => <span>{row.resume_probleme || 'N/A'}</span>
                },
                {
                  key: 'time_creation',
                  label: 'Début',
                  width: '160px',
                  render: (row) => {
                    const timeCreationUTC = row.time_creation?.endsWith('Z') 
                      ? row.time_creation 
                      : row.time_creation ? row.time_creation + 'Z' : null;
                    return (
                      <div>
                        <p className="font-medium text-gray-900">
                          {timeCreationUTC ? new Date(timeCreationUTC).toLocaleDateString('fr-FR') : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {timeCreationUTC ? new Date(timeCreationUTC).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                        </p>
                      </div>
                    )
                  }
                },
                {
                  key: 'date_fin',
                  label: 'Fin',
                  width: '160px',
                  render: (row) => {
                    const dateFin = row.date_fin?.endsWith('Z') 
                      ? row.date_fin 
                      : row.date_fin ? row.date_fin + 'Z' : null;
                    return (
                      <div>
                        <p className="font-medium text-gray-900">
                          {dateFin ? new Date(dateFin).toLocaleDateString('fr-FR') : '-'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {dateFin ? new Date(dateFin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </p>
                      </div>
                    )
                  }
                },
                {
                  key: 'duree_minutes',
                  label: 'Durée',
                  width: '80px',
                  render: (row) => (
                    <span className="font-semibold text-blue-600">{row.duree_minutes || 0} min</span>
                  )
                },
                {
                  key: 'priorite',
                  label: 'Priorité',
                  width: '100px',
                  render: (row) => (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      row.priorite === 'haute' 
                        ? 'bg-red-100 text-red-800' 
                        : row.priorite === 'normale'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {row.priorite === 'haute' ? 'Haute' : row.priorite === 'normale' ? 'Normale' : 'Basse'}
                    </span>
                  )
                },
                {
                  key: 'statut',
                  label: 'Statut',
                  width: '100px',
                  render: (row) => (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      row.statut === 'en_cours' 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {row.statut === 'en_cours' ? 'En cours' : 'Clôturée'}
                    </span>
                  )
                }
              ]}
              actions={[
                {
                  key: 'details',
                  label: 'Détails',
                  icon: <Eye size={18} />,
                  onClick: (row) => {
                    setSelectedIntervention(row);
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
                  title: !hasEditPermission ? 'Permission refusée: Modifier' : 'Modifier cette intervention',
                  className: hasEditPermission ? 'bg-amber-600 hover:bg-amber-700 text-white px-3 py-1' : 'bg-gray-400 cursor-not-allowed text-white px-3 py-1'
                },
                {
                  key: 'delete',
                  label: 'Supprimer',
                  icon: <Trash2 size={18} />,
                  onClick: handleDelete,
                  disabled: !hasDeletePermission,
                  title: !hasDeletePermission ? 'Permission refusée: Supprimer' : 'Supprimer cette intervention',
                  className: hasDeletePermission ? 'bg-red-600 hover:bg-red-700 text-white px-3 py-1' : 'bg-gray-400 cursor-not-allowed text-white px-3 py-1'
                }
              ]}
              loading={loading}
              emptyMessage="Aucune intervention trouvée"
            />
          )}
        </>
      )}
      
      {/* Pagination */}
      {currentView === 'journal' && filteredInterventions.length > 0 && (
        <div className="card flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Affichage {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredInterventions.length)} à{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredInterventions.length)} sur{' '}
            {filteredInterventions.length} interventions
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
            >
              ← Précédent
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.ceil(filteredInterventions.length / ITEMS_PER_PAGE) }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-2 rounded-lg ${
                    currentPage === i + 1
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredInterventions.length / ITEMS_PER_PAGE), p + 1))}
              disabled={currentPage === Math.ceil(filteredInterventions.length / ITEMS_PER_PAGE)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
      
      {/* Vue Analyse */}
      {currentView === 'analyse' && <InterventionAnalyse />}

      {/* Modal Formulaire */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'create' ? 'Nouvelle Intervention' : 'Modifier Intervention'}
        size="lg"
      >
        <InterventionForm
          intervention={selectedIntervention}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>

      {/* Modal Détails */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Détails Intervention"
        size="lg"
      >
        {selectedIntervention && (
          <InterventionDetails
            intervention={selectedIntervention}
            onClose={() => setShowDetailsModal(false)}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onCloturer={handleCloturer}
            hasClosePermission={hasClosePermission}
          />
        )}
      </Modal>

      {/* Modal Clôture */}
      <Modal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        title="Clôturer l'Intervention"
      >
        <form onSubmit={handleCloturerSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Entreprise <span className="text-red-500">*</span>
            </label>
            <textarea
              name="action_entreprise"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Décrivez l'action entreprise..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaires
            </label>
            <textarea
              name="commentaires"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Commentaires additionnels..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setShowCloseModal(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="success">
              Clôturer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InterventionsList;