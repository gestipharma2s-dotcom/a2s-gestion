import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, TrendingUp, AlertTriangle, CheckCircle, Clock, Users, FileText, DollarSign } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import FilterBar from '../common/FilterBar';
import MissionForm from './MissionForm';
import MissionCard from './MissionCard';
import MissionJournalCard from './MissionJournalCard';
import MissionDetails from './MissionDetails';
import MissionDetailsModal from './MissionDetailsModal';
import MissionClosureModal from './MissionClosureModal';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { prospectService } from '../../services/prospectService';

const MissionsList = () => {
  const [missions, setMissions] = useState([]);
  const [filteredMissions, setFilteredMissions] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentView, setCurrentView] = useState('journal');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showClosureModal, setShowClosureModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [detailsTab, setDetailsTab] = useState('technique');
  const [modalMode, setModalMode] = useState('create');
  const [hasEditPermission, setHasEditPermission] = useState(false);
  const [hasDeletePermission, setHasDeletePermission] = useState(false);
  const [stats, setStats] = useState(null);
  const { addNotification } = useApp();
  const { user, profile } = useAuth();

  // Types de missions
  const missionTypes = ['Installation', 'Formation', 'Support', 'Maintenance', 'Audit'];
  
  // Statuts de mission
  const missionStatuses = ['creee', 'planifiee', 'en_cours', 'cloturee', 'validee', 'archivee'];
  
  // Données mockées (à remplacer par des appels API)
  const mockMissions = [
    {
      id: 1,
      titre: 'Installation Système ERP',
      description: 'Installation complète du système ERP client ABC',
      client: { id: 1, raison_sociale: 'Entreprise ABC' },
      lieu: 'Paris, France',
      dateDebut: '2025-11-20',
      dateFin: '2025-11-25',
      budgetInitial: 5000,
      statut: 'en_cours',
      type: 'Installation',
      participants: [{ id: 1, nom: 'Jean Dupont', role: 'Technicien' }],
      priorite: 'haute',
      avancement: 65,
      dureePrevue: 5,
      durationReelle: 3,
      dépenses: 2150
    },
    {
      id: 2,
      titre: 'Formation Équipe Support',
      description: 'Formation sur la nouvelle plateforme logicielle',
      client: { id: 2, raison_sociale: 'Société XYZ' },
      lieu: 'Lyon, France',
      dateDebut: '2025-11-22',
      dateFin: '2025-11-23',
      budgetInitial: 3000,
      statut: 'planifiee',
      type: 'Formation',
      participants: [{ id: 2, nom: 'Marie Martin', role: 'Formateur' }],
      priorite: 'moyenne',
      avancement: 0,
      dureePrevue: 2,
      durationReelle: 0,
      dépenses: 0
    },
    {
      id: 3,
      titre: 'Support Technique Urgent',
      description: 'Intervention d\'urgence pour panne système',
      client: { id: 3, raison_sociale: 'Client DEF' },
      lieu: 'Bordeaux, France',
      dateDebut: '2025-11-19',
      dateFin: '2025-11-20',
      budgetInitial: 1500,
      statut: 'validee',
      type: 'Support',
      participants: [{ id: 3, nom: 'Pierre Lefevre', role: 'Technicien' }],
      priorite: 'critique',
      avancement: 100,
      dureePrevue: 1,
      durationReelle: 1.5,
      dépenses: 1200
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [user?.id, profile]);

  useEffect(() => {
    // Ne filtrer que si user et profile sont définis
    if (user?.id && profile) {
      console.log('🔄 Appel du filtre pour utilisateur:', user.id, 'Profil:', profile?.role);
      filterAndStatsMissions();
    }
  }, [missions, searchTerm, filterStatus, filterType, user?.id, profile]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Charger les clients existants
      const clientsData = await prospectService.getAll();
      const activeClients = clientsData.filter(p => p.statut === 'actif');
      setClients(activeClients);
      
      // Charger les utilisateurs
      const usersData = await userService.getAll();
      setUsers(usersData || []);
      
      // TODO: Remplacer mockMissions par missionService.getAll()
      const missionsToSet = mockMissions.map(mission => {
        // Get client info from clients list
        const clientId = mission.prospect_id || mission.clientId || mission.client?.id;
        const clientInfo = clientId ? activeClients.find(c => c.id === clientId) : null;
        const clientDisplay = mission.client || clientInfo || { id: clientId, raison_sociale: 'Client' };
        
        return {
          ...mission,
          // Map database field names to component field names
          type: mission.type_mission || mission.type,
          budgetInitial: mission.budget_alloue || mission.budgetInitial || 0,
          depenses: mission.budget_depense || mission.depenses || 0,
          avancement: mission.avancement || 0,
          client: clientDisplay,
          // Fallback field mappings
          dateDebut: mission.dateDebut || mission.date_debut,
          dateFin: mission.dateFin || mission.date_fin_prevue,
          chefMissionId: mission.chefMissionId || mission.chef_mission_id
        };
      });
      setMissions(missionsToSet);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      addNotification({
        type: 'error',
        message: 'Erreur lors du chargement des données'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkPermissions = async () => {
    if (user?.id && profile) {
      try {
        const canEdit = await userService.hasEditPermission(user.id, 'missions');
        const canDelete = await userService.hasDeletePermission(user.id, 'missions');
        setHasEditPermission(canEdit);
        setHasDeletePermission(canDelete);
      } catch (err) {
        console.error('Erreur vérification permissions:', err);
      }
    }
  };

  const filterAndStatsMissions = () => {
    let filtered = [...missions];

    // FILTRE D'ACCÈS STRICT: 
    // - Admin / Super Admin: voient TOUTES les missions
    // - Chef de mission: voit TOUTES ses missions comme chef
    // - Accompagnateurs: voient SEULEMENT les missions où ils sont accompagnateurs
    // - Autres utilisateurs: ne voient RIEN (array vide)
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
    
    filtered = filtered.filter(m => {
      const isChefMission = m.chefMissionId === user?.id || m.chef_mission_id === user?.id;
      const isAccompagnateur = m.accompagnateurs_ids?.includes(user?.id);
      
      // DEBUG: Afficher l'accès pour chaque mission
      const hasAccess = isChefMission || isAdmin || isAccompagnateur;
      
      if (!hasAccess) {
        console.log(`❌ ${m.titre} - BLOQUÉE pour ${user?.id}`, {
          isChefMission,
          isAdmin,
          isAccompagnateur,
          chef_id: m.chef_mission_id,
          accompagnateurs: m.accompagnateurs_ids
        });
      } else {
        console.log(`✅ ${m.titre} - VISIBLE pour ${user?.id}`, {
          isChefMission,
          isAdmin,
          isAccompagnateur,
          raison: isChefMission ? 'Chef' : isAdmin ? 'Admin' : 'Accompagnateur'
        });
      }
      
      return hasAccess;
    });

    if (filterStatus !== 'all') {
      filtered = filtered.filter(m => m.statut === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(m => m.type === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.client?.raison_sociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMissions(filtered);
    calculateStats(filtered);
  };

  const calculateStats = (missionsList) => {
    const total = missionsList.length;
    const completees = missionsList.filter(m => m.statut === 'validee').length;
    const enCours = missionsList.filter(m => m.statut === 'en_cours').length;
    const aBudget = missionsList.reduce((acc, m) => acc + (m.budgetInitial || 0), 0);
    const aDepense = missionsList.reduce((acc, m) => acc + (m.dépenses || 0), 0);

    setStats({
      total,
      completees,
      enCours,
      taux: total > 0 ? Math.round((completees / total) * 100) : 0,
      budgetTotal: aBudget,
      depensesTotal: aDepense,
      tauxUtilisation: aBudget > 0 ? Math.round((aDepense / aBudget) * 100) : 0
    });
  };

  const getStatusColor = (statut) => {
    const colors = {
      creee: 'bg-gray-100 text-gray-800',
      planifiee: 'bg-blue-100 text-blue-800',
      en_cours: 'bg-amber-100 text-amber-800',
      cloturee: 'bg-green-100 text-green-800',
      validee: 'bg-emerald-100 text-emerald-800',
      archivee: 'bg-slate-100 text-slate-800'
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (statut) => {
    const labels = {
      creee: 'Créée',
      planifiee: 'Planifiée',
      en_cours: 'En cours',
      cloturee: 'Clôturée',
      validee: 'Validée',
      archivee: 'Archivée'
    };
    return labels[statut] || statut;
  };

  const handleAddMission = () => {
    // Vérifier que l'utilisateur est admin
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
    if (!isAdmin) {
      addNotification({
        type: 'error',
        message: 'Seuls les administrateurs peuvent créer des missions'
      });
      return;
    }
    
    setModalMode('create');
    setSelectedMission(null);
    setShowModal(true);
  };

  const handleEditMission = (mission) => {
    // Vérifier si la mission est clôturée
    const isMissionClosed = mission?.cloturee_definitive || mission?.cloturee_par_chef;
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
    
    // Si la mission est clôturée, SEUL l'admin peut la modifier
    if (isMissionClosed && !isAdmin) {
      addNotification({
        type: 'error',
        message: 'Seuls les administrateurs peuvent modifier une mission clôturée'
      });
      return;
    }
    
    if (!hasEditPermission) {
      addNotification({
        type: 'error',
        message: 'Vous n\'avez pas la permission de modifier une mission'
      });
      return;
    }
    setModalMode('edit');
    setSelectedMission(mission);
    setShowModal(true);
  };

  const handleDeleteMission = async (mission) => {
    // Vérifier si la mission est clôturée
    const isMissionClosed = mission?.cloturee_definitive || mission?.cloturee_par_chef;
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
    
    // Si la mission est clôturée, SEUL l'admin peut la supprimer
    if (isMissionClosed && !isAdmin) {
      addNotification({
        type: 'error',
        message: 'Seuls les administrateurs peuvent supprimer une mission clôturée'
      });
      return;
    }
    
    // Vérification permissions standard
    if (!hasDeletePermission) {
      addNotification({
        type: 'error',
        message: 'Vous n\'avez pas la permission de supprimer une mission'
      });
      return;
    }
    
    // Demander confirmation avant suppression
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la mission "${mission.titre}"?`)) {
      // TODO: Implémenter la suppression
      addNotification({
        type: 'success',
        message: 'Mission supprimée'
      });
    }
  };

  const handleSaveMission = async (missionData) => {
    try {
      const selectedClient = clients.find(c => c.id === missionData.clientId);
      const wilaya = selectedClient?.wilaya || missionData.lieu || '';
      
      const completeMissionData = {
        ...missionData,
        lieu: wilaya,
        wilaya: wilaya,
        statut: 'creee',
        id: modalMode === 'create' ? Date.now() : selectedMission.id,
        avancement: modalMode === 'create' ? 0 : selectedMission.avancement,
        dépenses: modalMode === 'create' ? 0 : selectedMission.dépenses,
        created_at: modalMode === 'create' ? new Date().toISOString() : selectedMission.created_at,
        created_by: user?.id
      };

      if (modalMode === 'create') {
        setMissions([completeMissionData, ...missions]);
        addNotification({
          type: 'success',
          message: `✓ Mission "${completeMissionData.titre}" créée`
        });
      } else {
        setMissions(missions.map(m => m.id === selectedMission.id ? completeMissionData : m));
        addNotification({
          type: 'success',
          message: 'Mission mise à jour'
        });
      }
      setShowModal(false);
    } catch (error) {
      console.error('Erreur:', error);
      addNotification({
        type: 'error',
        message: 'Erreur lors de la sauvegarde'
      });
    }
  };

  const handleViewDetails = (mission) => {
    setSelectedMission(mission);
    setShowDetailsModal(true);
  };

  const handleOpenClosure = (mission) => {
    // Vérifier si c'est le chef de mission
    if (mission.chefMissionId !== user?.id && profile?.role !== 'admin' && profile?.role !== 'super_admin') {
      addNotification({
        type: 'error',
        message: 'Seul le chef de mission ou un administrateur peut clôturer'
      });
      return;
    }
    setSelectedMission(mission);
    setShowClosureModal(true);
  };

  const handleCloseByChef = async (closureData) => {
    try {
      // TODO: Appeler missionService.updateClosure(selectedMission.id, {
      //   cloturee_par_chef: true,
      //   commentaire_clot_chef: closureData.commentaireChef,
      //   date_clot_chef: new Date(),
      //   date_cloture_reelle: closureData.dateClotureReeelle,
      //   avancement: closureData.avancements
      // })
      
      addNotification({
        type: 'success',
        message: 'Mission clôturée par le Chef. En attente de validation Admin'
      });
      
      // Mettre à jour localement
      setMissions(missions.map(m => 
        m.id === selectedMission.id 
          ? { ...m, cloturee_par_chef: true, commentaire_clot_chef: closureData.commentaireChef }
          : m
      ));
      
      setShowClosureModal(false);
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur lors de la clôture'
      });
    }
  };

  const handleValidateByAdmin = async (validationData) => {
    try {
      // TODO: Appeler missionService.updateClosure(selectedMission.id, {
      //   cloturee_definitive: true,
      //   commentaire_clot_admin: validationData.commentaireAdmin,
      //   date_clot_definitive: new Date(),
      //   statut: 'cloturee'
      // })
      
      addNotification({
        type: 'success',
        message: 'Mission clôturée définitivement ✓'
      });
      
      // Mettre à jour localement
      setMissions(missions.map(m => 
        m.id === selectedMission.id 
          ? { ...m, cloturee_definitive: true, commentaire_clot_admin: validationData.commentaireAdmin, statut: 'cloturee' }
          : m
      ));
      
      setShowClosureModal(false);
      loadData();
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur lors de la validation'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Briefcase className="text-primary" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Missions</h1>
                <p className="text-gray-600">Suivi complet des missions techniques et commerciales</p>
              </div>
            </div>
            {(profile?.role === 'admin' || profile?.role === 'super_admin') && (
              <Button
                onClick={handleAddMission}
                className="bg-primary hover:bg-primary-dark text-white flex items-center gap-2"
              >
                <Plus size={20} />
                Nouvelle Mission
              </Button>
            )}
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Missions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <Briefcase className="text-blue-500" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">En Cours</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.enCours}</p>
                  </div>
                  <Clock className="text-amber-500" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Taux de Complément</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.taux}%</p>
                  </div>
                  <TrendingUp className="text-green-500" size={32} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Budget Utilisé</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.tauxUtilisation}%</p>
                  </div>
                  <DollarSign className="text-emerald-500" size={32} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* View Selector */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setCurrentView('journal')}
            className={`${currentView === 'journal' ? 'bg-primary text-white' : 'bg-white text-gray-700 border'}`}
          >
            📔 Journal
          </Button>
          <Button
            onClick={() => setCurrentView('list')}
            className={`${currentView === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-700 border'}`}
          >
            📋 Liste
          </Button>
          <Button
            onClick={() => setCurrentView('cahier')}
            className={`${currentView === 'cahier' ? 'bg-primary text-white' : 'bg-white text-gray-700 border'}`}
          >
            <FileText size={18} />
            Cahier des Charges
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Rechercher une mission..."
              className="flex-1"
            />
            <FilterBar
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { value: 'all', label: 'Tous les statuts' },
                ...missionStatuses.map(s => ({ value: s, label: getStatusLabel(s) }))
              ]}
              label="Statut"
            />
            <FilterBar
              value={filterType}
              onChange={setFilterType}
              options={[
                { value: 'all', label: 'Tous types' },
                ...missionTypes.map(t => ({ value: t, label: t }))
              ]}
              label="Type"
            />
          </div>
        </div>

        {/* Content */}
        {currentView === 'journal' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des missions...</p>
              </div>
            ) : filteredMissions.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">Aucune mission trouvée</p>
              </div>
            ) : (
              filteredMissions.map(mission => (
                <MissionJournalCard
                  key={mission.id}
                  mission={mission}
                  onDetails={(m, tab) => {
                    setSelectedMission(m);
                    setDetailsTab(tab);
                    setShowDetailsModal(true);
                  }}
                  onEdit={handleEditMission}
                  onClosure={handleOpenClosure}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                  hasEditPermission={hasEditPermission}
                  isChef={mission.chefMissionId === user?.id || mission.chef_mission_id === user?.id}
                  isAdmin={profile?.role === 'admin' || profile?.role === 'super_admin'}
                  isAccompagnateur={mission.accompagnateurs_ids?.includes(user?.id)}
                />
              ))
            )}
          </div>
        )}

        {currentView === 'list' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des missions...</p>
              </div>
            ) : filteredMissions.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">Aucune mission trouvée</p>
              </div>
            ) : (
              filteredMissions.map(mission => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  onEdit={handleEditMission}
                  onDelete={handleDeleteMission}
                  onDetails={handleViewDetails}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                  hasEditPermission={hasEditPermission}
                  hasDeletePermission={hasDeletePermission}
                  isAdmin={profile?.role === 'admin' || profile?.role === 'super_admin'}
                />
              ))
            )}
          </div>
        )}

        {currentView === 'cahier' && (
          <div className="bg-white rounded-lg shadow p-8">
            <CahierDesCharges />
          </div>
        )}

        {currentView === 'finances' && (
          <MissionFinances missions={filteredMissions} />
        )}
      </div>

      {/* Modal Formulaire */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'create' ? 'Nouvelle Mission' : 'Modifier la Mission'}
      >
        <MissionForm
          mission={selectedMission}
          onSave={handleSaveMission}
          onCancel={() => setShowModal(false)}
          missionTypes={missionTypes}
          clients={clients}
          users={users}
        />
      </Modal>

      {/* Modal Détails */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={selectedMission ? `Mission: ${selectedMission.titre}` : 'Détails'}
        size="lg"
      >
        {selectedMission && (
          <MissionDetailsModal
            mission={selectedMission}
            tab={detailsTab}
            onClose={() => setShowDetailsModal(false)}
          />
        )}
      </Modal>

      {/* Modal Clôture */}
      <Modal
        isOpen={showClosureModal}
        onClose={() => setShowClosureModal(false)}
        title={selectedMission ? `Clôture: ${selectedMission.titre}` : 'Clôture de Mission'}
        size="lg"
      >
        {selectedMission && (
          <MissionClosureModal
            mission={selectedMission}
            isChef={selectedMission.chefMissionId === user?.id}
            isAdmin={profile?.role === 'admin' || profile?.role === 'super_admin'}
            onCloseChef={handleCloseByChef}
            onValidateAdmin={handleValidateByAdmin}
            onCancel={() => setShowClosureModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

// Composant Cahier des Charges
const CahierDesCharges = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-primary mb-4">📘 Cahier des Charges Fonctionnel</h2>
        <p className="text-gray-600 mb-2">Application de Gestion et Suivi des Missions</p>
        <p className="text-gray-600">Domaine : Installation • Formation • Support Logiciel</p>
      </div>

      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-3">1️⃣ Présentation Générale du Projet</h3>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="font-bold text-gray-800 mb-2">1.1 Contexte</h4>
          <p className="text-gray-700 mb-3">
            L'entreprise réalise régulièrement des missions techniques et commerciales chez les clients 
            (installation, formation, maintenance, audit, support logiciel).
          </p>
          <p className="text-gray-700 font-semibold mb-2">Actuellement, la gestion se fait de manière manuelle entraînant :</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Manque de suivi et traçabilité</li>
            <li>Perte d'informations</li>
            <li>Difficile validation et contrôle des dépenses</li>
            <li>Absence de statistiques et reporting</li>
          </ul>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-bold text-gray-800 mb-2">1.2 Objectifs du Projet</h4>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>✔ La création, gestion et suivi des missions</li>
            <li>✔ L'affectation des techniciens/commerciaux aux missions</li>
            <li>✔ La saisie des rapports techniques et des dépenses</li>
            <li>✔ Le suivi des délais et budgets</li>
            <li>✔ La validation finale par le chef de mission et l'administrateur</li>
          </ul>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-3">2️⃣ Périmètre du Projet</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-700">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left font-bold">Rôle</th>
                <th className="px-4 py-2 text-left font-bold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-2 font-semibold">Administrateur</td>
                <td className="px-4 py-2">Crée les missions, affecte les intervenants, valide et commente</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-2 font-semibold">Technicien / Commercial</td>
                <td className="px-4 py-2">Consulte la mission, saisit rapport technique et dépenses</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-semibold">Chef de Mission</td>
                <td className="px-4 py-2">Supervise, valide la fin de mission</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="px-4 py-2 font-semibold">Comptabilité (optionnel)</td>
                <td className="px-4 py-2">Vérifie les dépenses et exporte les justificatifs</td>
              </tr>
              <tr>
                <td className="px-4 py-2 font-semibold">Client (optionnel)</td>
                <td className="px-4 py-2">Consulte ou reçoit le rapport de mission final</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-3">3️⃣ Fonctionnalités Attendues</h3>
        
        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4">
            <h4 className="font-bold text-gray-800 mb-2">🔹 3.1 Création et Gestion de Mission</h4>
            <p className="text-gray-700 mb-2">Création d'une mission avec :</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
              <li>Identifiant, titre, description, client, lieu</li>
              <li>Date début / fin prévue</li>
              <li>Budget initial (montant autorisé)</li>
              <li>Participants (techniciens, commerciaux)</li>
              <li>Type : Installation, Formation, Support, Maintenance, Audit</li>
            </ul>
            <p className="text-gray-700 font-semibold mt-3 mb-2">Statuts de mission :</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
              <li>Créée, Planifiée, En cours, Clôturée, Validée, Archivée</li>
            </ul>
          </div>

          <div className="border-l-4 border-amber-500 pl-4">
            <h4 className="font-bold text-gray-800 mb-2">🔹 3.2 Tableau de Bord & Suivi des Délais</h4>
            <p className="text-gray-700 mb-2">Liste des missions avec filtres :</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
              <li>Par statut, technicien, client, dates, type</li>
            </ul>
            <p className="text-gray-700 font-semibold mt-3 mb-2">Code couleur :</p>
            <ul className="space-y-1 text-gray-700 ml-2">
              <li>🟢 Vert = Dans les délais</li>
              <li>🟠 Orange = À risque (proche échéance)</li>
              <li>🔴 Rouge = Retard dépassé</li>
            </ul>
            <p className="text-gray-700 mt-3">Alertes automatiques par email ou notification mobile</p>
          </div>

          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-bold text-gray-800 mb-2">🔹 3.3 Volet Technique</h4>
            <p className="text-gray-700 mb-2">Chaque technicien saisit :</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
              <li>Objectif de l'intervention</li>
              <li>Actions réalisées</li>
              <li>Logiciels installés</li>
              <li>Matériel utilisé</li>
              <li>Problèmes rencontrés</li>
              <li>Solutions apportées</li>
              <li>Évaluation client (optionnel)</li>
              <li>Rapport technique final</li>
            </ul>
          </div>

          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-bold text-gray-800 mb-2">🔹 3.4 Volet Financier – Gestion des Dépenses</h4>
            <p className="text-gray-700 mb-2">Types de dépenses suivies :</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
              <li>Transport / Fuel</li>
              <li>Hôtel</li>
              <li>Repas</li>
              <li>Divers</li>
            </ul>
            <p className="text-gray-700 mt-3">✔ Upload justificatifs (image, PDF, facture)</p>
            <p className="text-gray-700">✔ Génération automatique du bilan financier final</p>
          </div>

          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-bold text-gray-800 mb-2">🔹 3.5 Clôture & Validation</h4>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-sm text-gray-700">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left font-bold">Action</th>
                    <th className="px-3 py-2 text-left font-bold">Par qui</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="px-3 py-2">Validation technique</td>
                    <td className="px-3 py-2">Chef de mission</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="px-3 py-2">Vérification dépenses</td>
                    <td className="px-3 py-2">Administrateur / Comptabilité</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Commentaires finaux</td>
                    <td className="px-3 py-2">Administrateur</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-gray-700 mt-3">Statut définitif : Validée / Refusée / À modifier</p>
          </div>

          <div className="border-l-4 border-red-500 pl-4">
            <h4 className="font-bold text-gray-800 mb-2">🔹 3.6 Reporting & Export</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
              <li>Export PDF / Excel de la fiche mission</li>
              <li>Statistiques : Missions par technicien / client / type</li>
              <li>Coûts par mission / mois / client</li>
              <li>Respect des délais (%)</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MissionsList;
