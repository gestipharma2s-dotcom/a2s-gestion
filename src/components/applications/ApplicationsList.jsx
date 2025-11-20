import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import ApplicationForm from './ApplicationForm';
import ApplicationCard from './ApplicationCard';
import { applicationService } from '../../services/applicationService';
import { useApp } from '../../context/AppContext';

const ApplicationsList = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const { addNotification } = useApp();

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await applicationService.getAll();
      setApplications(data);
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur lors du chargement des applications'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredApplications(filtered);
  };

  const handleCreate = () => {
    setSelectedApplication(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (application) => {
    setSelectedApplication(application);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = async (applicationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette application ?')) {
      return;
    }

    try {
      await applicationService.delete(applicationId);
      addNotification({
        type: 'success',
        message: 'Application supprimée avec succès'
      });
      loadApplications();
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
        await applicationService.create(formData);
        addNotification({
          type: 'success',
          message: 'Application créée avec succès'
        });
      } else {
        await applicationService.update(selectedApplication.id, formData);
        addNotification({
          type: 'success',
          message: 'Application modifiée avec succès'
        });
      }
      setShowModal(false);
      loadApplications();
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur lors de l\'enregistrement'
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Catalogue d'Applications</h2>
            <p className="text-white opacity-90">
              {applications.length} application(s) disponible(s)
            </p>
          </div>
          <Package size={64} className="opacity-50" />
        </div>
      </div>

      {/* Actions */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Rechercher une application..."
            />
          </div>
          <Button variant="primary" icon={Plus} onClick={handleCreate}>
            Ajouter Application
          </Button>
        </div>
      </div>

      {/* Liste */}
      {filteredApplications.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">Aucune application trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal Formulaire */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'create' ? 'Nouvelle Application' : 'Modifier Application'}
      >
        <ApplicationForm
          application={selectedApplication}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>
    </div>
  );
};

export default ApplicationsList;