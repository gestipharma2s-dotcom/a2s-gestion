import React, { useState, useEffect } from 'react';
import { Plus, FileText, Brain } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import InterventionForm from './InterventionForm';
import InterventionCard from './InterventionCard';
import InterventionDetails from './InterventionDetails';
import InterventionJournal from './InterventionJournal';
import InterventionAnalyse from './InterventionAnalyse';
import { interventionService } from '../../services/interventionService';
import { useApp } from '../../context/AppContext';

const InterventionsList = () => {
  const [interventions, setInterventions] = useState([]);
  const [filteredInterventions, setFilteredInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentView, setCurrentView] = useState('journal');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const { addNotification } = useApp();

  useEffect(() => {
    loadInterventions();
  }, []);

  useEffect(() => {
    filterInterventions();
  }, [interventions, searchTerm, filterStatus]);

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

    if (searchTerm) {
      filtered = filtered.filter(i =>
        i.client?.raison_sociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.technicien?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.resume_probleme?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInterventions(filtered);
  };

  const handleCreate = () => {
    setSelectedIntervention(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (intervention) => {
    setSelectedIntervention(intervention);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleViewDetails = (intervention) => {
    setSelectedIntervention(intervention);
    setShowDetailsModal(true);
  };

  const handleCloturer = (intervention) => {
    setSelectedIntervention(intervention);
    setShowCloseModal(true);
  };

  const handleDelete = async (interventionId) => {
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
      addNotification({
        type: 'error',
        message: 'Erreur lors de la suppression'
      });
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (modalMode === 'create') {
        await interventionService.create(formData);
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
      await interventionService.cloturer(
        selectedIntervention.id,
        formData.get('action_entreprise'),
        formData.get('commentaires')
      );
      addNotification({
        type: 'success',
        message: 'Intervention clôturée avec succès'
      });
      setShowCloseModal(false);
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
            className="w-full h-full"
          >
            Nouvelle Intervention
          </Button>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="card">
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentView('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'list'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Plus size={18} />
            Liste
          </button>
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

      {/* Vue Liste */}
      {currentView === 'list' && (
        <>
          {/* Filtres */}
          <div className="card">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder="Rechercher une intervention..."
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
                  onClick={() => setFilterStatus('cloturee')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterStatus === 'cloturee'
                      ? 'bg-success text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Clôturées
                </button>
              </div>
            </div>
          </div>

          {/* Liste */}
          {filteredInterventions.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 text-lg">Aucune intervention trouvée</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInterventions.map((intervention) => (
                <InterventionCard
                  key={intervention.id}
                  intervention={intervention}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onCloturer={handleCloturer}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Vue Journal */}
      {currentView === 'journal' && (
        <InterventionJournal 
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCloturer={handleCloturer}
          onViewDetails={handleViewDetails}
        />
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