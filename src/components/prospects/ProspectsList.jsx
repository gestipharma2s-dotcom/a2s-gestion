import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Phone, Mail, Zap } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import FilterBar from '../common/FilterBar';
import DataTable from '../common/DataTable';
import ProspectForm from './ProspectForm';
import ProspectCard from './ProspectCard';
import ProspectHistory from './ProspectHistory';
import ProspectActionForm from './ProspectActionForm';
import { prospectService } from '../../services/prospectService';
import { userService } from '../../services/userService';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const ProspectsList = () => {
  const [prospects, setProspects] = useState([]);
  const [filteredProspects, setFilteredProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [creatorId, setCreatorId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [analysisTab, setAnalysisTab] = useState('global');
  const [selectedProspectAnalysis, setSelectedProspectAnalysis] = useState(0);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [hasCreatePermission, setHasCreatePermission] = useState(false);
  const [hasEditPermission, setHasEditPermission] = useState(false);
  const [hasDeletePermission, setHasDeletePermission] = useState(false);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const { addNotification } = useApp();
  const { user, profile } = useAuth();

  useEffect(() => {
    loadProspects();
  }, []);

  useEffect(() => {
    loadPermissions();
  }, [user?.id, profile?.role]);

  useEffect(() => {
    filterProspects();
  }, [prospects, searchTerm, filterStatus, dateStart, dateEnd, creatorId]);

  const loadProspects = async () => {
    try {
      setLoading(true);
      const data = await prospectService.getAll();
      setProspects(data);
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur lors du chargement des prospects'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      setLoadingPermissions(true);
      if (user?.id && profile) {
        // Vérifier que l'utilisateur a accès à la page (sera fait par le composant parent)
        // Ici, on vérifie les permissions granulaires
        const canCreate = profile?.role === 'admin' || profile?.role === 'super_admin' || 
                         await userService.hasCreatePermission(user.id, 'prospects');
        const canEdit = profile?.role === 'admin' || profile?.role === 'super_admin' || 
                       await userService.hasEditPermission(user.id, 'prospects');
        const canDelete = profile?.role === 'admin' || profile?.role === 'super_admin' || 
                         await userService.hasDeletePermission(user.id, 'prospects');
        
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

  const filterProspects = () => {
    let filtered = [...prospects];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.statut === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.raison_sociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.telephone?.includes(searchTerm) ||
        p.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par date
    if (dateStart) {
      const startDate = new Date(dateStart);
      filtered = filtered.filter(p => {
        const prospectDate = new Date(p.created_at);
        return prospectDate >= startDate;
      });
    }

    if (dateEnd) {
      const endDate = new Date(dateEnd);
      endDate.setHours(23, 59, 59, 999); // Inclure toute la journée
      filtered = filtered.filter(p => {
        const prospectDate = new Date(p.created_at);
        return prospectDate <= endDate;
      });
    }

    // Filtre par créateur (seulement si admin)
    if (creatorId && (profile?.role === 'admin' || profile?.role === 'super_admin')) {
      filtered = filtered.filter(p => p.created_by === creatorId);
    }

    setFilteredProspects(filtered);
  };

  const handleCreate = () => {
    // ✅ Vérifier la permission AVANT d'ouvrir le modal (silencieusement, sans message)
    if (!hasCreatePermission) {
      return;
    }
    setSelectedProspect(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (prospect) => {
    // ✅ Vérifier la permission AVANT d'ouvrir le modal (silencieusement, sans message)
    if (!hasEditPermission) {
      return;
    }
    setSelectedProspect(prospect);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = async (prospect) => {
    // ✅ Extraire l'ID si c'est un objet (du DataTable)
    const prospectId = prospect?.id || prospect;
    
    // ✅ Vérifier la permission AVANT de supprimer (silencieusement, sans message)
    if (!hasDeletePermission) {
      return;
    }
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce prospect ?')) {
      return;
    }

    try {
      await prospectService.delete(prospectId);
      addNotification({
        type: 'success',
        message: 'Prospect supprimé avec succès'
      });
      loadProspects();
    } catch (error) {
      // ✅ Gérer les erreurs spécifiques
      console.error('Erreur suppression prospect:', error);
      
      // 409 Conflict = contrainte de clé étrangère (prospect a des enregistrements liés)
      if (error.status === 409 || error.message?.includes('foreign key')) {
        addNotification({
          type: 'error',
          message: 'Impossible de supprimer ce prospect car il est devenu client actif avec des enregistrements liés (installations, abonnements, paiements, etc.)'
        });
      } else {
        addNotification({
          type: 'error',
          message: 'Erreur lors de la suppression du prospect'
        });
      }
    }
  };

  const handleViewHistory = (prospect) => {
    setSelectedProspect(prospect);
    setShowHistoryModal(true);
  };

  const handleAddAction = (prospect) => {
    setSelectedProspect(prospect);
    setShowActionModal(true);
  };

  const handleConvertToClient = async (prospect) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir convertir "${prospect.raison_sociale}" en client actif ?`)) {
      return;
    }

    try {
      // ✅ Convertir le prospect en client (l'historique des actions est conservé)
      await prospectService.convertToClient(prospect.id);
      addNotification({
        type: 'success',
        message: `"${prospect.raison_sociale}" converti en client actif ✅ Historique conservé`
      });
      loadProspects(); // Recharger pour voir les changements
    } catch (error) {
      console.error('Erreur conversion:', error);
      addNotification({
        type: 'error',
        message: 'Erreur lors de la conversion en client'
      });
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
        await prospectService.create(dataWithCreator);
        addNotification({
          type: 'success',
          message: 'Prospect créé avec succès'
        });
      } else {
        await prospectService.update(selectedProspect.id, formData);
        addNotification({
          type: 'success',
          message: 'Prospect modifié avec succès'
        });
      }
      setShowModal(false);
      loadProspects();
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur lors de l\'enregistrement'
      });
    }
  };

  const handleActionSubmit = async (formData) => {
    try {
      // ✅ CORRIGÉ: Utiliser les bons paramètres avec metadata
      await prospectService.addHistorique(
        selectedProspect.id,
        formData.type_action,
        formData.description,
        {
          date_action: formData.date_action,
          details_supplementaires: formData.details
        }
      );
      addNotification({
        type: 'success',
        message: 'Action enregistrée avec succès'
      });
      setShowActionModal(false);
      loadProspects();
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur lors de l\'enregistrement de l\'action'
      });
    }
  };

  const handleAnalyzeProspects = async () => {
    try {
      setAnalysisLoading(true);
      
      if (filteredProspects.length === 0) {
        addNotification({
          type: 'warning',
          message: 'Aucun prospect à analyser'
        });
        return;
      }

      // Juste ouvrir le modal, l'analyse est directement dans le JSX
      setShowAnalysisModal(true);
      
      addNotification({
        type: 'success',
        message: 'Analyse complétée!'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        message: `Erreur: ${error.message}`
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

  const stats = {
    total: prospects.length,
    prospects: prospects.filter(p => p.statut === 'prospect').length,
    actifs: prospects.filter(p => p.statut === 'actif').length,
    inactifs: prospects.filter(p => p.statut === 'inactif').length,
    tauxConversion: prospects.length > 0 
      ? ((prospects.filter(p => p.statut === 'actif').length / prospects.length) * 100).toFixed(0)
      : 0
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
          <p className="text-sm opacity-90 mb-1">Total Prospects</p>
          <h3 className="text-3xl font-bold">{stats.total}</h3>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90 mb-1">Convertis</p>
          <h3 className="text-3xl font-bold">{stats.actifs}</h3>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <p className="text-sm opacity-90 mb-1">En attente</p>
          <h3 className="text-3xl font-bold">{stats.prospects}</h3>
        </div>
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <p className="text-sm opacity-90 mb-1">Taux Conversion</p>
          <h3 className="text-3xl font-bold">{stats.tauxConversion}%</h3>
        </div>
        <div className="card">
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleCreate}
            disabled={!hasCreatePermission}
            className="w-full h-full"
            title={!hasCreatePermission ? 'Permission refusée: Créer un prospect' : 'Créer un nouveau prospect'}
          >
            Nouveau Prospect
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <div className="space-y-4">
        {/* Filtre avancé avec date et utilisateur */}
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

        <div className="card">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Rechercher par nom, contact, téléphone..."
              />
            </div>
            <button
              onClick={handleAnalyzeProspects}
              disabled={analysisLoading || filteredProspects.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <Zap size={18} />
              {analysisLoading ? 'Analyse...' : 'ANALYSE GLOBALE'}
            </button>
          </div>

          {/* Filtres par statut */}
          <div className="flex gap-2 flex-wrap mt-4">
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
              onClick={() => setFilterStatus('prospect')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'prospect'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Prospects
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
              onClick={() => setFilterStatus('inactif')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'inactif'
                  ? 'bg-danger text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Inactifs
            </button>
          </div>
        </div>
      </div>
      {filteredProspects.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">Aucun prospect trouvé</p>
        </div>
      ) : (
        <DataTable
          data={filteredProspects}
          columns={[
            {
              key: 'raison_sociale',
              label: 'Prospect',
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
              key: 'statut',
              label: 'Statut',
              width: '100px',
              render: (row) => (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  row.statut === 'actif' 
                    ? 'bg-green-100 text-green-800' 
                    : row.statut === 'prospect'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {row.statut?.toUpperCase() || 'N/A'}
                </span>
              )
            },
            {
              key: 'wilaya',
              label: 'Wilaya',
              width: '120px',
              render: (row) => <span>{row.wilaya || 'N/A'}</span>
            }
          ]}
          actions={[
            {
              key: 'view',
              label: 'Détails',
              icon: <Eye size={18} />,
              onClick: (row) => {
                setSelectedProspect(row);
                setShowHistoryModal(true);
              },
              className: 'bg-blue-600 hover:bg-blue-700 text-white px-3 py-1'
            },
            {
              key: 'action',
              label: 'Afficher',
              icon: <Zap size={18} />,
              onClick: (row) => {
                // ✅ Vérifier la permission et le statut AVANT d'ouvrir le modal (silencieusement)
                if (!hasEditPermission || row.statut === 'actif') {
                  return;
                }
                setSelectedProspect(row);
                setShowActionModal(true);
              },
              disabled: (row) => !hasEditPermission || row.statut === 'actif',
              title: (row) => row.statut === 'actif' 
                ? 'Actions désactivées: Ce prospect est devenu client actif'
                : !hasEditPermission 
                  ? 'Permission refusée: Ajouter une action' 
                  : 'Ajouter une action',
              className: (row) => (!hasEditPermission || row.statut === 'actif') 
                ? 'bg-gray-400 cursor-not-allowed text-white px-3 py-1' 
                : 'bg-purple-600 hover:bg-purple-700 text-white px-3 py-1'
            },
            {
              key: 'edit',
              label: 'Modifier',
              icon: <Edit2 size={18} />,
              onClick: handleEdit,
              disabled: !hasEditPermission,
              title: !hasEditPermission ? 'Permission refusée: Modifier' : 'Modifier ce prospect',
              className: hasEditPermission ? 'bg-amber-600 hover:bg-amber-700 text-white px-3 py-1' : 'bg-gray-400 cursor-not-allowed text-white px-3 py-1'
            },
            {
              key: 'delete',
              label: 'Supprimer',
              icon: <Trash2 size={18} />,
              onClick: handleDelete,
              disabled: !hasDeletePermission,
              title: !hasDeletePermission ? 'Permission refusée: Supprimer' : 'Supprimer ce prospect',
              className: hasDeletePermission ? 'bg-red-600 hover:bg-red-700 text-white px-3 py-1' : 'bg-gray-400 cursor-not-allowed text-white px-3 py-1'
            }
          ]}
          loading={loading}
          emptyMessage="Aucun prospect trouvé"
        />
      )}

      {/* Modal Formulaire Prospect */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'create' ? 'Nouveau Prospect' : 'Modifier Prospect'}
      >
        <ProspectForm
          prospect={selectedProspect}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowModal(false)}
        />
      </Modal>

      {/* Modal Historique */}
      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title="Historique des Actions"
        size="lg"
      >
        <ProspectHistory prospectId={selectedProspect?.id} />
      </Modal>

      {/* Modal Actions de Suivi */}
      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title="Enregistrer une Action de Suivi"
      >
        {selectedProspect && (
          <ProspectActionForm
            prospect={selectedProspect}
            onSubmit={handleActionSubmit}
            onCancel={() => setShowActionModal(false)}
          />
        )}
      </Modal>

      {/* Modal Analyse IA */}
      <Modal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
        title="🤖 Analyse IA - Prospects"
        size="lg"
      >
        <div className="space-y-4">
          {/* Onglets */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => {
                setAnalysisTab('global');
                setSelectedProspectAnalysis(0);
              }}
              className={`px-4 py-2 font-medium transition-colors ${
                analysisTab === 'global'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📊 Analyse Globale
            </button>
            <button
              onClick={() => setAnalysisTab('prospects')}
              className={`px-4 py-2 font-medium transition-colors ${
                analysisTab === 'prospects'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              👥 Par Prospect ({filteredProspects.length})
            </button>
          </div>

          {/* Contenu Global */}
          {analysisTab === 'global' && (
            <div className="space-y-6 max-h-96 overflow-y-auto p-2">
              {/* Stats principales */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-600 font-semibold">Total</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {filteredProspects.length}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-600 font-semibold">Conversion</p>
                  <p className="text-3xl font-bold text-green-900">
                    {((filteredProspects.filter(p => p.statut === 'actif').length / filteredProspects.length) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Répartition */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-3">Répartition par Statut</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Actifs', count: filteredProspects.filter(p => p.statut === 'actif').length, color: 'bg-green-500' },
                    { label: 'Prospects', count: filteredProspects.filter(p => p.statut === 'prospect').length, color: 'bg-blue-500' },
                    { label: 'Inactifs', count: filteredProspects.filter(p => p.statut === 'inactif').length, color: 'bg-red-500' }
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                        <span className="text-sm font-bold text-gray-900">{item.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${item.color} h-2 rounded-full`}
                          style={{ width: `${(item.count / filteredProspects.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Secteurs */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h3 className="font-bold text-gray-800 mb-3">Top Secteurs</h3>
                <div className="space-y-2">
                  {(() => {
                    const secteurs = {};
                    filteredProspects.forEach(p => {
                      const s = p.secteur || 'Non spécifié';
                      secteurs[s] = (secteurs[s] || 0) + 1;
                    });
                    return Object.entries(secteurs)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([secteur, count]) => (
                        <div key={secteur} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">{secteur}</span>
                          <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                            {count}
                          </span>
                        </div>
                      ));
                  })()}
                </div>
              </div>

              {/* Actions recommandées */}
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <h3 className="font-bold text-gray-800 mb-3">✅ Actions Recommandées</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex gap-2">
                    <span className="text-amber-600 font-bold">→</span>
                    <span>Relancer les {filteredProspects.filter(p => p.statut === 'prospect').length} prospects en attente</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-600 font-bold">→</span>
                    <span>Planifier des appels dans les 48h</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-600 font-bold">→</span>
                    <span>Mettre en place un suivi structuré</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Contenu Par Prospect */}
          {analysisTab === 'prospects' && (
            <div className="space-y-4 max-h-96 overflow-y-auto p-2">
              {/* Navigation */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedProspectAnalysis(Math.max(0, selectedProspectAnalysis - 1))}
                  disabled={selectedProspectAnalysis === 0}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                >
                  ← Précédent
                </button>
                <span className="text-sm font-bold text-gray-700">
                  {selectedProspectAnalysis + 1} / {filteredProspects.length}
                </span>
                <button
                  onClick={() => setSelectedProspectAnalysis(Math.min(filteredProspects.length - 1, selectedProspectAnalysis + 1))}
                  disabled={selectedProspectAnalysis === filteredProspects.length - 1}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                >
                  Suivant →
                </button>
              </div>

              {/* Analyse Prospect */}
              {(() => {
                const p = filteredProspects[selectedProspectAnalysis];
                const scoreConversion = p.statut === 'actif' ? 100 : p.statut === 'prospect' ? 50 : 25;
                
                return (
                  <div className="space-y-4">
                    {/* Header avec Score */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
                      <p className="text-sm opacity-90">Score de Conversion</p>
                      <h2 className="text-4xl font-bold">{scoreConversion}/100</h2>
                    </div>

                    {/* Résumé */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h3 className="font-bold text-gray-800 mb-2">📋 Résumé</h3>
                      <p className="text-sm text-gray-700">
                        <strong>{p.raison_sociale}</strong> - {p.contact} | Actions: 1 | Installations: 0
                      </p>
                    </div>

                    {/* Statistiques */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <p className="text-xs text-blue-600 font-semibold">📞 Contact</p>
                        <p className="text-sm font-bold text-blue-900">{p.telephone}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <p className="text-xs text-purple-600 font-semibold">🏢 Secteur</p>
                        <p className="text-sm font-bold text-purple-900">{p.secteur || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Statut */}
                    <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                      <p className="text-xs text-pink-600 font-semibold mb-1">👤 Statut</p>
                      <p className="text-sm font-bold">
                        Prospect: 
                        <span className={`ml-2 px-2 py-1 rounded font-bold text-white ${
                          p.statut === 'actif' ? 'bg-green-500' : 
                          p.statut === 'prospect' ? 'bg-blue-500' : 
                          'bg-red-500'
                        }`}>
                          {p.statut.toUpperCase()}
                        </span>
                      </p>
                    </div>

                    {/* Recommandations */}
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <h3 className="font-bold text-gray-800 mb-2">💡 Recommandations IA</h3>
                      <ul className="space-y-1 text-sm text-gray-700">
                        {p.statut === 'prospect' && (
                          <>
                            <li className="flex gap-2">
                              <span>✓</span>
                              <span>Relancer dans les 48h</span>
                            </li>
                            <li className="flex gap-2">
                              <span>✓</span>
                              <span>Prévoir un appel commercial</span>
                            </li>
                            <li className="flex gap-2">
                              <span>✓</span>
                              <span>Envoyer une proposition</span>
                            </li>
                          </>
                        )}
                        {p.statut === 'actif' && (
                          <>
                            <li className="flex gap-2">
                              <span>✓</span>
                              <span>Maintenir le contact régulièrement</span>
                            </li>
                            <li className="flex gap-2">
                              <span>✓</span>
                              <span>Proposer des services additionnels</span>
                            </li>
                          </>
                        )}
                        {p.statut === 'inactif' && (
                          <>
                            <li className="flex gap-2">
                              <span>✓</span>
                              <span>Relancer pour réactiver</span>
                            </li>
                            <li className="flex gap-2">
                              <span>✓</span>
                              <span>Comprendre les raisons d'inactivité</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={() => setShowAnalysisModal(false)}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProspectsList;