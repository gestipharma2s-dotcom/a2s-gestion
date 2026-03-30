import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Briefcase, TrendingUp, AlertTriangle, CheckCircle, Clock, DollarSign,
  BarChart3, PieChart, TrendingDown, Users, CalendarDays, Zap, Plus,
  Filter, Download, RefreshCw, Target, AlertCircle, Sparkles, X, Printer
} from 'lucide-react';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import Modal from '../common/Modal';
import MissionForm from './MissionForm';
import MissionDetailsModal from './MissionDetailsModalNew';
import AiAnalysisDisplay from './AiAnalysisDisplay';
import { prospectService } from '../../services/prospectService';
import { userService } from '../../services/userService';
import { missionService } from '../../services/missionService';
import { installationService } from '../../services/installationService';
import { installationPlanningService } from '../../services/installationPlanningService';
import generateMissionAnalysis from '../../services/missionAnalysisService';
import generateCompleteInsights from '../../services/enhancedAiAnalysisService';
import { missionExportService } from '../../services/missionExportService';
import { formatDate } from '../../utils/helpers';
import { formatWilaya } from '../../constants/wilayas';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const MissionsDashboard = () => {
  const [missions, setMissions] = useState([]);
  const [filteredMissions, setFilteredMissions] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterUserId, setFilterUserId] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAnalysisView, setShowAnalysisView] = useState(false);
  const [selectedMission, setSelectedMission] = useState(null);
  const [stats, setStats] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [completeAnalysis, setCompleteAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNotification } = useApp();
  const { user, profile } = useAuth();
  const location = useLocation();
  const [initialFormData, setInitialFormData] = useState(null);

  // 🔄 RECEPTION DONNÉES DEPUIS PLANNING (Correction navigation)
  useEffect(() => {
    let data = location.state?.createMission;

    // Fallback localStorage
    if (!data) {
      const stored = localStorage.getItem('temp_mission_create');
      if (stored) {
        try {
          data = JSON.parse(stored);
          console.log('📥 Dashboard: Données récupérées du localStorage !');
        } catch (e) {
          console.error('Erreur lecture localStorage', e);
        }
      }
    }

    if (data) {
      console.log('🚀 Dashboard: DÉCLENCHEMENT MODAL AVEC DONNÉES:', data);

      // Injection du prospect si manquant
      if (data.prospectData) {
        const pData = data.prospectData;
        setClients(prev => {
          const exists = prev.find(c => c.id === pData.id);
          if (!exists) {
            console.log("➕ Dashboard: Injection prospect manquant:", pData);
            const newClient = { ...pData, raison_sociale: pData.raison_sociale || pData.nom || 'Prospect', statut: 'actif' };
            return [...prev, newClient];
          }
          return prev;
        });
      }

      setSelectedMission(null); // Mode création
      setInitialFormData(data);
      setShowModal(true);

      // Nettoyage après un court délai
      setTimeout(() => localStorage.removeItem('temp_mission_create'), 2000);
    }
  }, [location.state]);

  // ✅ Calculer isAdmin une fois
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  // Données mockées
  const mockMissions = [
    {
      id: 1,
      titre: 'Installation Système ERP',
      description: 'Installation complète du système ERP client ABC',
      client: { id: 1, raison_sociale: 'Entreprise ABC' },
      lieu: 'Alger',
      dateDebut: '2025-11-20',
      dateFin: '2025-11-25',
      budgetInitial: 50000,
      statut: 'en_cours',
      type: 'Installation',
      participants: [{ id: 1, nom: 'Jean Dupont', role: 'Technicien' }],
      priorite: 'haute',
      avancement: 65,
      dureePrevue: 5,
      durationReelle: 3,
      depenses: 21500
    },
    {
      id: 2,
      titre: 'Formation Équipe Support',
      description: 'Formation sur la nouvelle plateforme logicielle',
      client: { id: 2, raison_sociale: 'Société XYZ' },
      lieu: 'Oran',
      dateDebut: '2025-11-22',
      dateFin: '2025-11-23',
      budgetInitial: 15000,
      statut: 'planifiee',
      type: 'Formation',
      participants: [{ id: 2, nom: 'Marie Martin', role: 'Formateur' }],
      priorite: 'moyenne',
      avancement: 0,
      dureePrevue: 2,
      durationReelle: 0,
      depenses: 0
    },
    {
      id: 3,
      titre: 'Support Technique Urgent',
      description: 'Intervention d\'urgence pour panne système',
      client: { id: 3, raison_sociale: 'Client DEF' },
      lieu: 'Constantine',
      dateDebut: '2025-11-19',
      dateFin: '2025-11-20',
      budgetInitial: 8000,
      statut: 'validee',
      type: 'Support',
      participants: [{ id: 3, nom: 'Pierre Lefevre', role: 'Technicien' }],
      priorite: 'critique',
      avancement: 100,
      dureePrevue: 1,
      durationReelle: 1.5,
      depenses: 6800
    },
    {
      id: 4,
      titre: 'Maintenance Serveurs',
      description: 'Maintenance préventive serveurs client',
      client: { id: 4, raison_sociale: 'Tech Solutions' },
      lieu: 'Annaba',
      dateDebut: '2025-11-25',
      dateFin: '2025-11-27',
      budgetInitial: 12000,
      statut: 'creee',
      type: 'Maintenance',
      participants: [{ id: 1, nom: 'Jean Dupont', role: 'Technicien' }],
      priorite: 'moyenne',
      avancement: 0,
      dureePrevue: 2,
      durationReelle: 0,
      depenses: 0
    },
    {
      id: 5,
      titre: 'Audit Sécurité',
      description: 'Audit complet de sécurité informatique',
      client: { id: 5, raison_sociale: 'Finance Pro' },
      lieu: 'Blida',
      dateDebut: '2025-11-21',
      dateFin: '2025-11-24',
      budgetInitial: 25000,
      statut: 'en_cours',
      type: 'Audit',
      participants: [{ id: 4, nom: 'Sophie Durand', role: 'Auditeur' }],
      priorite: 'haute',
      avancement: 45,
      dureePrevue: 3,
      durationReelle: 2,
      depenses: 8900
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Ne filtrer que si user et profile sont définis
    if (user?.id && profile) {
      filterMissions();
    }
  }, [missions, searchTerm, filterStatus, filterDateFrom, filterDateTo, filterUserId, user?.id, profile]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Test table access first
      const tableTest = await missionService.testTableAccess();
      console.log('Missions table access test:', tableTest);

      const clientsData = await prospectService.getAll();
      setClients(clientsData.filter(p => p.statut === 'actif'));

      // Charger les utilisateurs
      try {
        const usersData = await userService.getAll();
        console.log('Users loaded:', usersData?.length, 'users', usersData);
        setUsers(usersData || []);
      } catch (userError) {
        console.error('Erreur chargement utilisateurs:', userError);
        setUsers([]);
      }

      // Charger les missions depuis la base de données
      try {
        const missionsData = await missionService.getAll();
        // Transform database format to component format
        const transformedMissions = (missionsData || []).map(mission => {
          // Get client info from clients list
          const clientId = mission.prospect_id || mission.clientId;
          const clientInfo = clientId ? clientsData.find(c => c.id === clientId) : null;
          const clientDisplay = mission.client || clientInfo || { id: clientId, raison_sociale: 'Client' };

          return {
            ...mission,
            // Map database field names to component field names
            type: mission.type_mission || mission.type,
            budgetInitial: mission.budget_alloue || mission.budgetInitial || 0,
            depenses: mission.budget_depense || mission.depenses || 0,
            avancement: mission.avancement || 0,
            client: clientDisplay
          };
        });
        console.log('Missions transformed:', transformedMissions);
        setMissions(transformedMissions);
      } catch (error) {
        console.warn('Missions BD non disponibles, utilisation des données mockées:', error);
        setMissions(mockMissions);
      }
    } catch (error) {
      console.error('Erreur:', error);
      addNotification({
        type: 'error',
        message: 'Erreur lors du chargement des données'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterMissions = () => {
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

      // Retourner true SEULEMENT si l'utilisateur a accès
      const hasAccess = isChefMission || isAdmin || isAccompagnateur;
      return hasAccess;
    });

    if (filterStatus !== 'all') {
      filtered = filtered.filter(m => {
        // Consolider creee et planifiee
        if (filterStatus === 'planifiee') {
          return m.statut === 'planifiee' || m.statut === 'creee';
        }
        return m.statut === filterStatus;
      });
    }

    // Filtre par date - Du
    if (filterDateFrom) {
      filtered = filtered.filter(m => {
        const missionDate = new Date(m.dateDebut || m.date_debut);
        const filterDate = new Date(filterDateFrom);
        return missionDate >= filterDate;
      });
    }

    // Filtre par date - Au
    if (filterDateTo) {
      filtered = filtered.filter(m => {
        const missionDate = new Date(m.dateDebut || m.date_debut);
        const filterDate = new Date(filterDateTo);
        return missionDate <= filterDate;
      });
    }

    // Filtre par utilisateur (chef de mission)
    if (filterUserId !== 'all') {
      filtered = filtered.filter(m =>
        m.chefMissionId === filterUserId || m.chef_mission_id === filterUserId
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.client?.raison_sociale?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMissions(filtered);
    calculateStats(filtered);
  };

  const calculateStats = (missionsList) => {
    const total = missionsList.length;
    // Créées et Planifiées sont consolidées en Planifiées
    const planifiees = missionsList.filter(m => m.statut === 'planifiee' || m.statut === 'creee').length;
    const enCours = missionsList.filter(m => m.statut === 'en_cours').length;
    const validees = missionsList.filter(m => m.statut === 'validee').length;
    const cloturees = missionsList.filter(m => m.statut === 'cloturee').length;

    const budgetTotal = missionsList.reduce((acc, m) => acc + (m.budgetInitial || 0), 0);
    const depensesTotal = missionsList.reduce((acc, m) => acc + (m.depenses || 0), 0);
    const avancements = missionsList.map(m => m.avancement || 0);
    const avantageMoyen = avancements.length > 0 ? Math.round(avancements.reduce((a, b) => a + b) / avancements.length) : 0;

    const delaiees = missionsList.filter(m => {
      const fin = new Date(m.dateFin);
      return fin < new Date() && m.statut !== 'validee' && m.statut !== 'cloturee';
    }).length;

    const tauxUtilisation = budgetTotal > 0 ? Math.round((depensesTotal / budgetTotal) * 100) : 0;

    setStats({
      total,
      planifiees,
      enCours,
      validees,
      cloturees,
      budgetTotal,
      depensesTotal,
      tauxUtilisation,
      avantageMoyen,
      delaiees,
      restant: budgetTotal - depensesTotal
    });
  };

  const toggleAnalysisView = () => {
    try {
      if (!showAnalysisView) {
        // Basculer vers la vue analyse
        setAiLoading(true);

        if (filteredMissions.length === 0) {
          addNotification({
            type: 'warning',
            message: 'Aucune mission à analyser'
          });
          setAiLoading(false);
          return;
        }

        // Générer l'analyse
        const analysis = generateCompleteInsights(filteredMissions, stats);
        setCompleteAnalysis(analysis);
      }

      // Basculer l'affichage
      setShowAnalysisView(!showAnalysisView);

      if (!showAnalysisView) {
        addNotification({
          type: 'success',
          message: '📊 Vue Analyse Affichée'
        });
      } else {
        addNotification({
          type: 'success',
          message: '📋 Vue Missions Affichée'
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      addNotification({
        type: 'error',
        message: 'Erreur lors du basculement'
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Helper pour obtenir le type de mission dominant
  const getTopMissionType = (missionsList) => {
    const types = {};
    missionsList.forEach(m => {
      types[m.type] = (types[m.type] || 0) + 1;
    });
    const sorted = Object.entries(types).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : 'N/A';
  };

  const getStatusColor = (statut) => {
    const colors = {
      creee: 'bg-blue-100 text-blue-800', // Redirigé vers planifiee
      planifiee: 'bg-blue-100 text-blue-800',
      en_cours: 'bg-amber-100 text-amber-800',
      cloturee: 'bg-green-100 text-green-800',
      validee: 'bg-emerald-100 text-emerald-800'
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (statut) => {
    const labels = {
      creee: 'Planifiée', // Alias pour creee
      planifiee: 'Planifiée',
      en_cours: 'En cours',
      cloturee: 'Clôturée',
      validee: 'Validée'
    };
    return labels[statut] || statut;
  };

  // ✅ NOUVEAU: Valider une mission (ADMIN uniquement)
  const handleValidateMission = async (mission) => {
    if (!isAdmin) {
      addNotification({
        type: 'error',
        message: 'Seuls les administrateurs peuvent valider une mission'
      });
      return;
    }

    if (window.confirm(`Êtes-vous sûr de vouloir valider la mission "${mission.titre}"?`)) {
      try {
        setMissions(missions.map(m =>
          m.id === mission.id
            ? { ...m, statut: 'validee' }
            : m
        ));
        setSelectedMission({ ...mission, statut: 'validee' });
        addNotification({
          type: 'success',
          message: `✓ Mission "${mission.titre}" validée`
        });
      } catch (error) {
        addNotification({
          type: 'error',
          message: 'Erreur lors de la validation'
        });
      }
    }
  };

  // ✅ NOUVEAU: Clôturer une mission (ADMIN uniquement)
  const handleCloseMission = async (mission) => {
    if (!isAdmin) {
      addNotification({
        type: 'error',
        message: 'Seuls les administrateurs peuvent clôturer une mission'
      });
      return;
    }

    if (window.confirm(`Êtes-vous sûr de vouloir clôturer la mission "${mission.titre}"?`)) {
      try {
        setMissions(missions.map(m =>
          m.id === mission.id
            ? { ...m, statut: 'cloturee', cloturee_definitive: true }
            : m
        ));
        setSelectedMission({ ...mission, statut: 'cloturee', cloturee_definitive: true });
        addNotification({
          type: 'success',
          message: `✓ Mission "${mission.titre}" clôturée`
        });
      } catch (error) {
        addNotification({
          type: 'error',
          message: 'Erreur lors de la clôture'
        });
      }
    }
  };

  // ✅ NOUVEAU: Supprimer une mission (ADMIN uniquement)
  const handleRemoveMission = async (mission) => {
    if (!isAdmin) {
      addNotification({
        type: 'error',
        message: 'Seuls les administrateurs peuvent supprimer une mission'
      });
      return;
    }

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement la mission "${mission.titre}"? Cette action est irréversible.`)) {
      try {
        setMissions(missions.filter(m => m.id !== mission.id));
        setShowDetailsModal(false);
        addNotification({
          type: 'success',
          message: `✓ Mission "${mission.titre}" supprimée`
        });
      } catch (error) {
        addNotification({
          type: 'error',
          message: 'Erreur lors de la suppression'
        });
      }
    }
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

    setSelectedMission(null);
    setShowModal(true);
  };

  // Vérifier les permissions pour modifier une mission
  const canEditMission = (mission) => {
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
    const isCreator = mission?.created_by === user?.id;
    const isChefMission = mission?.chefMissionId === user?.id;

    // Admin peut toujours modifier
    // Créateur peut modifier
    // Chef de mission peut modifier tant que pas clôturée
    return isAdmin || isCreator || (isChefMission && mission?.statut !== 'cloturee' && mission?.statut !== 'validee');
  };

  // Vérifier les permissions pour supprimer une mission
  const canDeleteMission = (mission) => {
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
    const isCreator = mission?.created_by === user?.id;

    // Seulement Admin ou créateur peut supprimer
    // Et seulement si pas clôturée/validée
    return (isAdmin || isCreator) && mission?.statut !== 'cloturee' && mission?.statut !== 'validee';
  };

  const handleEditMission = (mission) => {
    if (!canEditMission(mission)) {
      addNotification({
        type: 'error',
        message: '🚫 Vous n\'avez pas les permissions pour modifier cette mission'
      });
      return;
    }
    setShowDetailsModal(false);
    setShowModal(true);
  };

  const handleDeleteMission = async (mission) => {
    if (!canDeleteMission(mission)) {
      addNotification({
        type: 'error',
        message: '🚫 Vous n\'avez pas les permissions pour supprimer cette mission'
      });
      return;
    }

    if (window.confirm('⚠️ Êtes-vous certain de vouloir supprimer cette mission?')) {
      try {
        await missionService.delete(mission.id);
        setMissions(missions.filter(m => m.id !== mission.id));
        setShowDetailsModal(false);
        addNotification({
          type: 'success',
          message: '✅ Mission supprimée'
        });
      } catch (error) {
        console.error('Erreur suppression:', error);
        addNotification({
          type: 'error',
          message: '❌ Erreur lors de la suppression'
        });
      }
    }
  };

  const handleClosureAdmin = async (closureData) => {
    try {
      // Support both string (legacy) and object (new)
      const closureType = typeof closureData === 'string' ? closureData : closureData?.type;
      const totalExpenses = typeof closureData === 'object' ? closureData?.totalExpenses : 0;

      // Vérifier les permissions
      const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';
      const isChefMission = selectedMission?.chefMissionId === user?.id || selectedMission?.chef_mission_id === user?.id;

      if (closureType === 'start') {
        // Démarrer la mission (Chef de Mission)
        if (!isChefMission) {
          addNotification({
            type: 'error',
            message: '🚫 Seul le Chef de Mission assigné peut démarrer la mission'
          });
          return;
        }

        const updatedMission = {
          ...selectedMission,
          statut: 'en_cours',
          dateDebut: new Date().toISOString()
        };

        // Appeler le service pour mettre à jour
        try {
          await missionService.updateStatus(selectedMission.id, 'en_cours');
          setMissions(missions.map(m => m.id === selectedMission.id ? updatedMission : m));
          setSelectedMission(updatedMission);
          addNotification({
            type: 'success',
            message: '▶️ Mission démarrée - Statut: En cours'
          });
        } catch (error) {
          console.error('Erreur lors du démarrage de la mission:', error);
          addNotification({
            type: 'error',
            message: '❌ Erreur lors du démarrage de la mission'
          });
        }
        return;
      }

      if (closureType === 'admin') {
        // Vérifier si l'utilisateur est admin
        if (!isAdmin) {
          addNotification({
            type: 'error',
            message: '🚫 Seul un administrateur peut effectuer une clôture définitive'
          });
          return;
        }

        // Confirmation avant clôture définitive
        if (window.confirm('⚠️ Êtes-vous certain de vouloir clôturer définitivement cette mission? Cette action est irréversible.')) {
          const updatedMission = {
            ...selectedMission,
            statut: 'cloturee',
            dateCloture: new Date().toISOString(),
            budget_depense: totalExpenses,
            clotureeParAdmin: user?.id
          };

          // Appeler le service pour mettre à jour
          try {
            await missionService.validateClosureByAdmin(selectedMission.id, {
              clotureeDefinitive: true,
              commentaireAdmin: 'Clôture définitive',
              totalExpenses: totalExpenses
            });

            // Mettre à jour la liste des missions
            setMissions(missions.map(m => m.id === selectedMission.id ? updatedMission : m));
            setSelectedMission(updatedMission);

            addNotification({
              type: 'success',
              message: '✅ Mission clôturée définitivement par Admin'
            });

            setTimeout(() => setShowDetailsModal(false), 1000);
          } catch (error) {
            console.error('Erreur lors de la clôture:', error);
            addNotification({
              type: 'error',
              message: '❌ Erreur lors de la clôture définitive'
            });
          }
        }
      } else if (closureType === 'chef') {
        // Vérifier si l'utilisateur est admin
        if (!isAdmin) {
          addNotification({
            type: 'error',
            message: '🚫 Seul un administrateur peut effectuer une clôture définitive'
          });
          return;
        }

        // Confirmation avant clôture définitive
        if (window.confirm('⚠️ Êtes-vous certain de vouloir clôturer définitivement cette mission? Cette action est irréversible.')) {
          const updatedMission = {
            ...selectedMission,
            statut: 'cloturee',
            dateCloture: new Date().toISOString(),
            budget_depense: totalExpenses,
            clotureeParAdmin: user?.id
          };

          // Appeler le service pour mettre à jour
          try {
            await missionService.closeMissionByChef(selectedMission.id, {
              commentaireChef: 'Clôture par chef',
              avancements: selectedMission.avancement || 100,
              dateClotureReelle: new Date().toISOString(),
              totalExpenses: totalExpenses
            });

            // Mettre à jour la liste des missions
            setMissions(missions.map(m => m.id === selectedMission.id ? updatedMission : m));
            setSelectedMission(updatedMission);

            addNotification({
              type: 'success',
              message: '✅ Mission clôturée par Chef - En attente de validation Admin'
            });

            setTimeout(() => setShowDetailsModal(false), 1000);
          } catch (error) {
            console.error('Erreur lors de la clôture par chef:', error);
            addNotification({
              type: 'error',
              message: '❌ Erreur lors de la clôture par le chef'
            });
          }
        }
      } else if (closureType === 'chef') {
        // Vérifier si l'utilisateur est le chef de mission
        if (!isChefMission) {
          addNotification({
            type: 'error',
            message: '🚫 Seul le Chef de Mission assigné peut clôturer la mission'
          });
          return;
        }

        const updatedMission = {
          ...selectedMission,
          statut: 'cloturee',
          dateCloture: new Date().toISOString(),
          budget_depense: totalExpenses,
          clotureeParChef: user?.id
        };

        try {
          await missionService.closeMissionByChef(selectedMission.id, {
            commentaireChef: 'Clôture par chef de mission',
            avancements: selectedMission.avancement || 100,
            dateClotureReelle: new Date().toISOString(),
            totalExpenses: totalExpenses
          });

          setMissions(missions.map(m => m.id === selectedMission.id ? updatedMission : m));
          setSelectedMission(updatedMission);
          addNotification({
            type: 'success',
            message: '✅ Mission clôturée par le Chef de Mission'
          });
        } catch (error) {
          console.error('Erreur lors de la clôture par chef:', error);
          addNotification({
            type: 'error',
            message: '❌ Erreur lors de la clôture par le chef'
          });
        }
      }
    } catch (error) {
      console.error('Erreur clôture:', error);
      addNotification({
        type: 'error',
        message: 'Erreur lors de la clôture'
      });
    }
  };

  const handleFormSubmit = async (formData) => {
    // Prevent double submission
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      let savedMission;

      if (selectedMission) {
        // Mise à jour d'une mission existante
        savedMission = await missionService.update(selectedMission.id, formData);
        setMissions(missions.map(m => m.id === selectedMission.id ? savedMission : m));
        addNotification({
          type: 'success',
          message: '✅ Mission mise à jour avec succès'
        });
      } else {
        // Création d'une nouvelle mission
        savedMission = await missionService.create(formData);

        // Liaison avec l'installation originaire (dans le planning / prospect_history)
        if (initialFormData && initialFormData.installationId) {
          try {
            console.log("🔗 Liaison Mission <-> Planning", initialFormData.installationId);
            await installationPlanningService.update(initialFormData.installationId, {
              mission_id: savedMission.id
            });
          } catch (linkError) {
            console.error("Erreur liaison planning:", linkError);
            addNotification({
              type: 'warning',
              message: 'Mission créée mais échec du lien au planning (vérifiez la table prospect_history)'
            });
          }
        }
        setMissions([savedMission, ...missions]);
        addNotification({
          type: 'success',
          message: '✅ Mission créée avec succès'
        });
      }

      setShowModal(false);
      setSelectedMission(null);
    } catch (error) {
      console.error('Erreur détails:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        fullError: error
      });
      addNotification({
        type: 'error',
        message: `Erreur: ${error.message || 'Erreur lors de la sauvegarde de la mission'}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Briefcase className="mx-auto mb-4 text-primary animate-bounce" size={48} />
          <p className="text-gray-600">Chargement des missions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2">
      <div className="w-full">
        {/* Header */}
        <div className="mb-8 px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Briefcase className="text-primary" size={32} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Missions</h1>
                <p className="text-gray-600">Suivi statistique et financier en temps réel</p>
              </div>
            </div>
            <Button
              onClick={handleAddMission}
              className={`flex items-center gap-2 ${(profile?.role === 'admin' || profile?.role === 'super_admin')
                ? 'bg-primary hover:bg-primary-dark text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              disabled={!(profile?.role === 'admin' || profile?.role === 'super_admin')}
            >
              <Plus size={20} />
              Nouvelle Mission
            </Button>
          </div>

          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <SearchBar
              placeholder="Rechercher une mission..."
              value={searchTerm}
              onChange={setSearchTerm}
              icon={<Briefcase size={18} />}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="planifiee">Planifiées (futures)</option>
              <option value="en_cours">En cours</option>
              <option value="validee">Validées</option>
              <option value="cloturee">Clôturées</option>
            </select>

            {/* Filtre Date Du */}
            <div>
              <label className="block text-xs text-gray-600 font-semibold mb-1">Du</label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Filtre Date Au */}
            <div>
              <label className="block text-xs text-gray-600 font-semibold mb-1">Au</label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Filtre Chef de Mission */}
            <div>
              <label className="block text-xs text-gray-600 font-semibold mb-1">Chef Mission</label>
              <select
                value={filterUserId}
                onChange={(e) => setFilterUserId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">Tous</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.nom || u.email}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <Button
              onClick={toggleAnalysisView}
              disabled={aiLoading}
              className={`flex items-center gap-2 ${showAnalysisView
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                }`}
            >
              <TrendingUp size={18} />
              {aiLoading ? 'Chargement...' : showAnalysisView ? '📋 Voir Missions' : '📊 Voir Analyse'}
            </Button>

            {/* Bouton réinitialiser filtres */}
            {(filterDateFrom || filterDateTo || filterUserId !== 'all' || filterStatus !== 'all' || searchTerm) && (
              <Button
                onClick={() => {
                  setFilterDateFrom('');
                  setFilterDateTo('');
                  setFilterUserId('all');
                  setFilterStatus('all');
                  setSearchTerm('');
                }}
                className="bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center gap-2"
              >
                <X size={18} />
                Réinitialiser
              </Button>
            )}
          </div>
        </div>

        {/* Affichage conditionnel: Statistiques OU Analyse */}
        {showAnalysisView ? (
          // VUE ANALYSE - Affichage complet de l'analyse IA
          <div className="mb-8">
            {completeAnalysis ? (
              <AiAnalysisDisplay analysisData={completeAnalysis} loading={aiLoading} />
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <p className="text-lg text-gray-500">Aucune analyse disponible</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          // VUE MISSIONS - Statistiques Principales
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Total Missions */}
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Total Missions</span>
                  <Briefcase className="text-blue-500" size={20} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.enCours} en cours • {stats.validees} complétées
                </p>
              </div>

              {/* Avancement Moyen */}
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Avancement Moyen</span>
                  <TrendingUp className="text-green-500" size={20} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.avantageMoyen}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.avantageMoyen}%` }}
                  ></div>
                </div>
              </div>

              {/* Budget Total */}
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Budget Total</span>
                  <DollarSign className="text-yellow-500" size={20} />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {(stats.budgetTotal / 1000).toFixed(0)}K DA
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Dépensé: {stats.depensesTotal.toLocaleString('fr-DZ')} DA
                </p>
              </div>

              {/* Taux Utilisation */}
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">Utilisation Budget</span>
                  <PieChart className="text-red-500" size={20} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.tauxUtilisation}%</p>
                <p className={`text-xs mt-2 font-medium ${stats.tauxUtilisation > 80 ? 'text-red-500' : 'text-green-500'}`}>
                  {stats.tauxUtilisation > 80 ? '⚠️ Attention' : '✓ Normal'}
                </p>
              </div>
            </div>

            {/* Deuxième ligne: Statuts et Alertes */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Distribution Statuts */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 size={20} className="text-primary" />
                  Distribution Statuts
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Planifiées (futures)</span>
                    <span className="font-semibold text-gray-900">{stats.planifiees}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">En cours</span>
                    <span className="font-semibold text-amber-600">{stats.enCours}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Validées</span>
                    <span className="font-semibold text-green-600">{stats.validees}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Clôturées</span>
                    <span className="font-semibold text-emerald-600">{stats.cloturees}</span>
                  </div>
                </div>
              </div>

              {/* Alertes et Risques */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-red-500" />
                  Alertes & Risques
                </h3>
                <div className="space-y-3">
                  {stats.delaiees > 0 && (
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm font-medium text-red-800">
                        🔴 {stats.delaiees} mission(s) retardée(s)
                      </p>
                    </div>
                  )}
                  {stats.tauxUtilisation > 80 && (
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-sm font-medium text-orange-800">
                        ⚠️ Budget à {stats.tauxUtilisation}%
                      </p>
                    </div>
                  )}
                  {stats.enCours > 0 && stats.avantageMoyen < 50 && (
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm font-medium text-yellow-800">
                        📊 Avancement faible ({stats.avantageMoyen}%)
                      </p>
                    </div>
                  )}
                  {stats.delaiees === 0 && stats.tauxUtilisation <= 80 && (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-800">
                        ✅ Aucun risque majeur
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Finances */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign size={20} className="text-green-500" />
                  Situation Financière
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm text-blue-900">Budget Total</span>
                    <span className="font-bold text-blue-900">{stats.budgetTotal.toLocaleString('fr-DZ')} DA</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-sm text-red-900">Dépensé</span>
                    <span className="font-bold text-red-900">{stats.depensesTotal.toLocaleString('fr-DZ')} DA</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm text-green-900">Restant</span>
                    <span className="font-bold text-green-900">{stats.restant.toLocaleString('fr-DZ')} DA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ancienne section pour compatibilité */}
            {aiInsights && !completeAnalysis && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Risques et Opportunités */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg shadow p-6 border border-red-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertCircle size={20} className="text-red-600" />
                    🤖 Top Risques (IA)
                  </h3>
                  <div className="space-y-2">
                    {(aiInsights.risques || []).map((risque, idx) => (
                      <p key={idx} className="text-sm text-gray-700">• {risque}</p>
                    ))}
                  </div>
                </div>

                {/* Opportunités */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow p-6 border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Target size={20} className="text-green-600" />
                    ✨ Opportunités (IA)
                  </h3>
                  <div className="space-y-2">
                    {(aiInsights.opportunites || []).map((opp, idx) => (
                      <p key={idx} className="text-sm text-gray-700">• {opp}</p>
                    ))}
                  </div>
                </div>

                {/* Recommandations */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap size={20} className="text-blue-600" />
                    ⚡ Actions Prioritaires (IA)
                  </h3>
                  <div className="space-y-2">
                    {(aiInsights.recommandations || []).map((rec, idx) => (
                      <p key={idx} className="text-sm text-gray-700">• {rec}</p>
                    ))}
                  </div>
                </div>

                {/* Tendances */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg shadow p-6 border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-purple-600" />
                    📈 Tendances (IA)
                  </h3>
                  <div className="space-y-2">
                    {(aiInsights.tendances || []).map((tend, idx) => (
                      <p key={idx} className="text-sm text-gray-700">• {tend}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tableau Missions */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Missions Filtrées ({filteredMissions.length})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Titre</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Client / Wilaya</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Dates (Début / Fin)</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Chef de Mission</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Accompagnateurs</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Avancement</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Budget</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Dépenses</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMissions.map((mission) => (
                      <tr key={mission.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{mission.titre}</td>
                        <td className="px-6 py-4 text-sm">
                          <p className="font-medium text-gray-900">{mission.client?.raison_sociale || 'N/A'}</p>
                          <p className="text-xs text-blue-600 font-bold uppercase">{formatWilaya(mission.client?.wilaya) || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex flex-col gap-1">
                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100">
                              📅 {formatDate(mission.date_debut || mission.dateDebut)}
                            </span>
                            <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-100">
                              🏁 {formatDate(mission.date_fin_prevue || mission.dateFin)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{mission.type || mission.type_mission || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(mission.statut)}`}>
                            {getStatusLabel(mission.statut)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {(() => {
                            // Check multiple ID variations
                            const chefId = mission.chef_mission_id || mission.chefMissionId;
                            if (!chefId) {
                              return <span className="text-red-600 font-medium">❌ Non assigné</span>;
                            }

                            const chef = users.find(u => u.id === chefId);
                            if (chef) {
                              return (
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                                    {(chef.nom || chef.email)?.[0]?.toUpperCase()}
                                  </div>
                                  <span className="text-gray-900 font-medium">{chef.nom || chef.email}</span>
                                </div>
                              );
                            }

                            // If user not found
                            console.warn('Chef not found in users array:', { chefId, usersCount: users.length });
                            return <span className="text-amber-600 font-medium">⚠️ ID invalide</span>;
                          })()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {(() => {
                            const accompIds = mission.accompagnateurs_ids || mission.accompagnateurIds || [];
                            if (!Array.isArray(accompIds) || accompIds.length === 0) {
                              return <span className="text-red-600 font-medium">❌ Aucun</span>;
                            }
                            const accomps = accompIds
                              .map(id => {
                                const user = users.find(u => u.id === id);
                                return user?.nom || user?.email || null;
                              })
                              .filter(Boolean);

                            if (accomps.length === 0) {
                              return <span className="text-red-600 font-medium">❌ Aucun</span>;
                            }

                            return (
                              <div className="flex items-center gap-1 flex-wrap">
                                {accomps.map((name, idx) => (
                                  <span key={idx} className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    {name}
                                  </span>
                                ))}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${mission.avancement || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700">{mission.avancement || 0}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {(mission.budgetInitial || mission.budget_alloue || 0).toLocaleString('fr-DZ')} DA
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={(mission.depenses || 0) > (mission.budgetInitial || mission.budget_alloue || 0) ? 'text-red-600 font-bold' : 'text-gray-600'}>
                            {(mission.depenses || mission.budget_depense || 0).toLocaleString('fr-DZ')} DA
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Button
                            onClick={() => {
                              // Enhance mission with chef name for details modal
                              const enhancedMission = {
                                ...mission,
                                chef_name: (() => {
                                  const chefId = mission.chef_mission_id || mission.chefMissionId;
                                  if (!chefId) return 'Non assigné';
                                  const chef = users.find(u => u.id === chefId);
                                  return chef?.nom || chef?.email || 'Non assigné';
                                })()
                              };
                              setSelectedMission(enhancedMission);
                              setShowDetailsModal(true);
                            }}
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center gap-2 px-3 py-1 rounded text-sm w-full mb-2"
                          >
                            Détails
                          </Button>

                          {/* Bouton Impression Ordre Mission */}
                          <Button
                            onClick={() => missionExportService.printMission(mission)}
                            className="bg-purple-50 text-purple-600 hover:bg-purple-100 flex items-center justify-center gap-2 px-3 py-1 rounded text-sm w-full"
                            title="Imprimer Ordre de Mission"
                          >
                            <Printer size={16} />
                            Ordre de Mission
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredMissions.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <Briefcase className="mx-auto mb-3 text-gray-400" size={40} />
                  <p className="text-gray-600">Aucune mission trouvée</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedMission ? 'Modifier Mission' : 'Nouvelle Mission'}
      >
        <MissionForm
          mission={selectedMission}
          initialData={initialFormData}
          clients={clients}
          users={users}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowModal(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {selectedMission && showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-3xl font-bold">{selectedMission.titre}</h2>
                <p className="text-primary-light text-sm mt-1">{selectedMission.description}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
              >
                <X size={28} />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1">
              <div className="p-6">
                <MissionDetailsModal
                  mission={selectedMission}
                  onClose={() => setShowDetailsModal(false)}
                  onClosureAdmin={handleClosureAdmin}
                  currentUser={user}
                  userProfile={profile}
                  onValidate={handleValidateMission}
                  onClosure={handleCloseMission}
                  onRemove={handleRemoveMission}
                  isAdmin={isAdmin}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex gap-3 justify-end flex-shrink-0">
              <Button
                onClick={() => setShowDetailsModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Fermer
              </Button>

              {/* ✅ Bouton IMPRIMER ORDRE DE MISSION */}
              <Button
                onClick={() => missionExportService.printMission(selectedMission)}
                className="bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
                title="Imprimer l'Ordre de Mission (Modèle Algérien)"
              >
                <Printer size={18} />
                Ordre de Mission
              </Button>

              {canEditMission(selectedMission) && (
                <Button
                  onClick={() => handleEditMission(selectedMission)}
                  className="bg-primary hover:bg-primary-dark text-white"
                >
                  ✏️ Modifier
                </Button>
              )}
              {canDeleteMission(selectedMission) && (
                <Button
                  onClick={() => handleDeleteMission(selectedMission)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  🗑️ Supprimer
                </Button>
              )}
              {!canEditMission(selectedMission) && (
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded text-red-700 text-sm">
                  <span>🔒 Édition non autorisée</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionsDashboard;
