import React, { useState, useEffect } from 'react';
import { Users, Target, Calendar, TrendingUp, DollarSign, AlertCircle, TrendingDown, Sparkles, CheckCircle, Clock, Activity, BarChart3, PieChart as PieChartIcon, MapPin } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import MultiSelectDropdown from '../common/MultiSelectDropdown';
import { prospectService } from '../../services/prospectService';
import { installationService } from '../../services/installationService';
import { paiementService } from '../../services/paiementService';
import { interventionService } from '../../services/interventionService'; // ✅ Ajout
import { missionService } from '../../services/missionService'; // ✅ Ajout missions
import { formatWilaya } from '../../constants/wilayas';
import generateAIAnalysis from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PAGES } from '../../utils/constants';

const Dashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClients: 0,
    prospects: 0,
    revenus: 0,
    abonnementsActifs: 0,
    resteAPayer: 0,
    totalPaiements: 0,
    tauxConversion: 0,
    totalInstallations: 0,
    revenusAbonnementsPaiements: 0,     // ✅ Depuis paiements
    revenusAcquisitionsPaiements: 0,    // ✅ Depuis paiements
    revenusAbonnementsInstallations: 0, // ✅ Depuis installations
    revenusAcquisitionsInstallations: 0, // ✅ Depuis installations
    tauxRecouvrement: 0,                 // ✅ Nouveau
    totalInterventions: 0,               // ✅ Nouveau
    nombreAbonnements: 0,                // ✅ Nombre d'abonnements (type = abonnement + auto-générés)
    nombreAcquisitions: 0                // ✅ Nombre d'acquisitions (type = acquisition)
  });
  const [loading, setLoading] = useState(true);
  const [resteAPayerData, setResteAPayerData] = useState([]);
  const [revenusData, setRevenusData] = useState([]);
  const [interventionsByUserData, setInterventionsByUserData] = useState([]); // ✅ Ajout
  const [missionsByWilayaData, setMissionsByWilayaData] = useState([]); // ✅ Missions par wilaya
  const [allMissionsByWilayaData, setAllMissionsByWilayaData] = useState([]); // ✅ Toutes les missions (avant filtrage)
  const [selectedWilayas, setSelectedWilayas] = useState([]); // ✅ Wilayas sélectionnées
  const [availableWilayas, setAvailableWilayas] = useState([]); // ✅ Wilayas disponibles
  const [paymentStats, setPaymentStats] = useState({
    fullyPaid: 0,
    partiallyPaid: 0,
    noPaid: 0,
    totalInstallations: 0
  });
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [showGraphs, setShowGraphs] = useState(false);

  // ✅ Charger les graphiques après un délai (lazy loading)
  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setShowGraphs(true), 500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    // ✅ Charger d'abord les stats de base
    loadDashboardData();
  }, []);

  // ✅ Charger l'IA en arrière-plan après les stats
  useEffect(() => {
    if (!loading && stats.totalClients > 0) {
      loadAIAnalysis();
    }
  }, [stats]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // ✅ Fonction de filtrage par année en cours
      const currentYear = new Date().getFullYear();
      const filterByCurrentYear = (data) => {
        return data.filter(item => {
          const dateStr = item.created_at || item.date_creation || item.date_debut || item.date_installation || item.date_paiement || item.date;
          if (!dateStr) return false;
          return new Date(dateStr).getFullYear() === currentYear;
        });
      };

      // Charger les prospects (garder une référence à tous pour les noms)
      const allProspectsData = await prospectService.getAll();
      const prospectsData = filterByCurrentYear(allProspectsData);
      const clientsActifs = prospectsData.filter(p => p.statut === 'actif').length;
      const prospectsEnCours = prospectsData.filter(p => p.statut === 'prospect').length;

      // Charger les installations
      const allInstallationsData = await installationService.getAll();
      const installationsData = filterByCurrentYear(allInstallationsData);
      const totalInstallations = installationsData.reduce((sum, inst) => sum + (inst.montant || 0), 0);

      // Charger les paiements
      const allPaiementsData = await paiementService.getAll();
      const paiementsData = filterByCurrentYear(allPaiementsData);
      const totalPaiements = paiementsData.reduce((sum, p) => sum + (p.montant || 0), 0);

      // ✅ Charger les interventions
      const allInterventionsData = await interventionService.getAll();
      const interventionsData = filterByCurrentYear(allInterventionsData);

      // ✅ Calculer interventions par utilisateur avec temps total
      const interventionsByUser = {};
      interventionsData.forEach(intervention => {
        const technicienName = intervention.technicien?.nom || 'Sans technicien';
        const duree = (intervention.duree_minutes || 0) / 60; // Convertir minutes en heures

        if (!interventionsByUser[technicienName]) {
          interventionsByUser[technicienName] = {
            nom: technicienName,
            interventions: 0,
            tempsTotalHeures: 0
          };
        }
        interventionsByUser[technicienName].interventions += 1;
        interventionsByUser[technicienName].tempsTotalHeures += duree;
      });

      // Convertir en tableau trié par nombre d'interventions
      const interventionsByUserArray = Object.values(interventionsByUser)
        .sort((a, b) => b.interventions - a.interventions);

      setInterventionsByUserData(interventionsByUserArray);

      // ✅ CHARGER LES MISSIONS ET COMPTER PAR WILAYA
      const allMissionsData = await missionService.getAll();
      const missionsData = filterByCurrentYear(allMissionsData);
      const missionsByWilaya = {};

      missionsData.forEach(mission => {
        const wilaya = mission.wilaya || 'Non spécifiée';
        if (!missionsByWilaya[wilaya]) {
          missionsByWilaya[wilaya] = 0;
        }
        missionsByWilaya[wilaya]++;
      });

      // Convertir en tableau et trier par nombre de missions
      const missionsByWilayaArray = Object.entries(missionsByWilaya)
        .map(([wilaya, count]) => ({ wilaya, count }))
        .sort((a, b) => b.count - a.count);

      setMissionsByWilayaData(missionsByWilayaArray);

      // ✅ CALCUL CORRECT: Reste à Payer = Total Installations - Total Paiements
      const resteAPayer = Math.max(0, totalInstallations - totalPaiements);

      // ✅ RÉPARTITION REVENUS - À partir des PAIEMENTS (type field)
      let revenusAbonnementsPaiements = 0;
      let revenusAcquisitionsPaiements = 0;

      paiementsData.forEach(p => {
        const montant = p.montant || 0;
        // Vérifier le type du paiement
        if (p.type === 'abonnement' || p.type?.toLowerCase() === 'abonnement') {
          revenusAbonnementsPaiements += montant;
        } else {
          revenusAcquisitionsPaiements += montant;
        }
      });

      // Si aucun type détecté dans paiements, utiliser la répartition par défaut
      if (revenusAbonnementsPaiements === 0 && revenusAcquisitionsPaiements === 0) {
        revenusAbonnementsPaiements = totalPaiements * 0.7;
        revenusAcquisitionsPaiements = totalPaiements * 0.3;
      }

      // ✅ RÉPARTITION REVENUS - À partir des INSTALLATIONS (type field)
      let revenusAbonnementsInstallations = 0;
      let revenusAcquisitionsInstallations = 0;

      installationsData.forEach(inst => {
        const montant = inst.montant || 0;
        // Vérifier le type de l'installation
        if (inst.type === 'abonnement' || inst.type?.toLowerCase() === 'abonnement') {
          revenusAbonnementsInstallations += montant;
        } else {
          revenusAcquisitionsInstallations += montant;
        }
      });

      // Si aucun type détecté dans installations, utiliser la répartition par défaut
      if (revenusAbonnementsInstallations === 0 && revenusAcquisitionsInstallations === 0) {
        revenusAbonnementsInstallations = totalInstallations * 0.7;
        revenusAcquisitionsInstallations = totalInstallations * 0.3;
      }

      // ✅ TOP 5 RESTE À PAYER - À partir des INSTALLATIONS avec NOMS DES CLIENTS
      const resteParClient = {};

      // Grouper par client depuis les installations
      installationsData.forEach(inst => {
        if (!resteParClient[inst.client_id]) {
          // Chercher le nom du client depuis TOUS les prospects (créés cette année ou avant)
          const prospect = allProspectsData.find(p => p.id === inst.client_id);
          resteParClient[inst.client_id] = {
            client_id: inst.client_id,
            raison_sociale: prospect?.raison_sociale || inst.prospects?.raison_sociale || 'Client Inconnu',
            total_installations: 0,
            total_paye: 0
          };
        }
        resteParClient[inst.client_id].total_installations += (inst.montant || 0);
      });

      // Ajouter les paiements
      paiementsData.forEach(p => {
        if (resteParClient[p.client_id]) {
          resteParClient[p.client_id].total_paye += (p.montant || 0);
        }
      });

      // Calculer le reste et trier TOP 5
      const top5Reste = Object.values(resteParClient)
        .map(c => ({
          client: c.raison_sociale,
          montant: Math.max(0, c.total_installations - c.total_paye)
        }))
        .filter(c => c.montant > 0)
        .sort((a, b) => b.montant - a.montant)
        .slice(0, 5);

      setResteAPayerData(top5Reste);

      // ✅ REVENUS MENSUELS - À partir des INSTALLATIONS avec created_at (groupés par date)
      const generateRevenusFromInstallations = () => {
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
        const monthlyData = {};

        // Initialiser les mois
        months.forEach(m => {
          monthlyData[m] = { total: 0, abonnements: 0, acquisitions: 0 };
        });

        // Grouper les installations par mois en utilisant created_at
        installationsData.forEach(inst => {
          // Utiliser created_at pour les installations
          const dateStr = inst.created_at;
          if (!dateStr) return; // Ignorer les installations sans date

          const date = new Date(dateStr);
          const monthIndex = date.getMonth();
          const month = months[monthIndex] || 'Jan';

          const montant = inst.montant || 0;
          monthlyData[month].total += montant;

          // Déterminer si abonnement ou acquisition basé sur le type
          if (inst.type === 'abonnement' || inst.type?.toLowerCase() === 'abonnement') {
            monthlyData[month].abonnements += montant;
          } else {
            monthlyData[month].acquisitions += montant;
          }
        });

        // Convertir en tableau pour le graphique
        return months.map(mois => ({
          mois,
          total: monthlyData[mois].total,
          abonnements: monthlyData[mois].abonnements,
          acquisitions: monthlyData[mois].acquisitions
        }));
      };

      setRevenusData(generateRevenusFromInstallations());

      // Taux de conversion
      const tauxConversion = prospectsData.length > 0
        ? ((clientsActifs / prospectsData.length) * 100).toFixed(1)
        : 0;

      // ✅ Calculer les stats de paiement (0, 1, 2)
      const paymentCounts = {
        fullyPaid: 0,      // code 2
        partiallyPaid: 0,  // code 1
        noPaid: 0          // code 0
      };

      if (installationsData && installationsData.length > 0) {
        installationsData.forEach(inst => {
          const montantPaye = paiementsData
            .filter(p => p.installation_id === inst.id)
            .reduce((sum, p) => sum + (typeof p.montant === 'number' ? p.montant : 0), 0);

          const reste = Math.max(0, (inst.montant || 0) - montantPaye);

          if (reste === inst.montant || inst.montant === 0) {
            paymentCounts.noPaid++;
          } else if (reste > 0) {
            paymentCounts.partiallyPaid++;
          } else {
            paymentCounts.fullyPaid++;
          }
        });
      }

      setPaymentStats({
        fullyPaid: paymentCounts.fullyPaid,
        partiallyPaid: paymentCounts.partiallyPaid,
        noPaid: paymentCounts.noPaid,
        totalInstallations: installationsData?.length || 0
      });

      setStats({
        totalClients: clientsActifs,
        prospects: prospectsEnCours,
        revenus: totalPaiements,
        abonnementsActifs: clientsActifs,
        resteAPayer: resteAPayer,
        totalPaiements: totalPaiements,
        tauxConversion: parseFloat(tauxConversion),
        totalInstallations: totalInstallations,
        revenusAbonnementsPaiements: revenusAbonnementsPaiements,  // ✅ Depuis paiements
        revenusAcquisitionsPaiements: revenusAcquisitionsPaiements, // ✅ Depuis paiements
        revenusAbonnementsInstallations: revenusAbonnementsInstallations, // ✅ Depuis installations
        revenusAcquisitionsInstallations: revenusAcquisitionsInstallations, // ✅ Depuis installations
        tauxRecouvrement: totalInstallations > 0 ? ((totalPaiements / totalInstallations) * 100).toFixed(1) : 0, // ✅ Nouveau
        totalInterventions: interventionsData?.length || 0,  // ✅ Nouveau
        nombreAbonnements: installationsData?.filter(inst => inst.type === 'abonnement' || inst.type?.toLowerCase() === 'abonnement').length || 0, // ✅ Nombre d'abonnements
        nombreAcquisitions: installationsData?.filter(inst => inst.type === 'acquisition' || inst.type?.toLowerCase() === 'acquisition').length || 0  // ✅ Nombre d'acquisitions
      });

    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Charger l'IA EN ARRIÈRE-PLAN (ne bloque pas l'affichage)
  const loadAIAnalysis = async () => {
    try {
      setLoadingAI(true);
      const insights = await generateAIAnalysis(stats, resteAPayerData);
      setAiInsights(insights);
    } catch (error) {
      console.error('Erreur IA:', error);
      setAiInsights(null);
    } finally {
      setLoadingAI(false);
    }
  };

  // ✅ RÉPARTITION REVENUS - À partir des PAIEMENTS
  const repartitionDataPaiements = [
    {
      name: 'Abonnements',
      value: stats.revenusAbonnementsPaiements || 0,
      color: '#2563eb'
    },
    {
      name: 'Acquisitions',
      value: stats.revenusAcquisitionsPaiements || 0,
      color: '#10b981'
    }
  ].filter(item => item.value > 0);

  // ✅ RÉPARTITION REVENUS - À partir des INSTALLATIONS
  const repartitionDataInstallations = [
    {
      name: 'Abonnements',
      value: stats.revenusAbonnementsInstallations || 0,
      color: '#2563eb'
    },
    {
      name: 'Acquisitions',
      value: stats.revenusAcquisitionsInstallations || 0,
      color: '#10b981'
    }
  ].filter(item => item.value > 0);

  // Reste à payer par client - Données chargées dynamiquement
  // const resteAPayerData - chargé dans useEffect

  const formatMontant = (montant) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(montant);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // ✅ Afficher le dashboard (pas de vérification WelcomePage)
  return (
    <div className="space-y-6 p-6 bg-[#f8fafc] min-h-screen lg:px-8">
      {/* En-tête du Dashboard */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Tableau de Bord A2S Gestion</h1>
        <p className="text-gray-600">Bienvenue, {profile?.nom || 'utilisateur'}. Voici un aperçu de vos opérations.</p>
      </div>

      {/* KPI Cards - Première ligne (5 cartes principales) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Clients Actifs */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-sm p-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-blue-100 uppercase tracking-widest text-[10px] font-bold">Clients Actifs</p>
              <h3 className="text-3xl font-black text-white">{stats.totalClients}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0"><Users size={20} /></div>
          </div>
          <div className="text-[10px] font-bold text-blue-100 pt-2 border-t border-white/20 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 mr-1" />
            Croissance stable
          </div>
        </div>

        {/* Prospects */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-sm p-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-emerald-100 uppercase tracking-widest text-[10px] font-bold">Prospects</p>
              <h3 className="text-3xl font-black text-white">{stats.prospects}</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0"><Target size={20} /></div>
          </div>
          <div className="text-[10px] font-bold text-emerald-100 pt-2 border-t border-white/20 flex items-center gap-1 mt-1">
            Taux: {stats.tauxConversion}%
          </div>
        </div>

        {/* ✅ Total Vente (Total Installations + Abonnements) */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm p-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-indigo-100 uppercase tracking-widest text-[10px] font-bold">Total Vente</p>
              <h3 className="text-3xl font-black text-white">
                {profile?.role === 'admin' || profile?.role === 'super_admin'
                  ? `${(stats.totalInstallations / 1000).toFixed(0)}K DA`
                  : '🔐'}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0"><DollarSign size={20} /></div>
          </div>
          <div className="text-[10px] font-bold text-indigo-100 pt-2 border-t border-white/20 mt-1">Total généré</div>
        </div>

        {/* ✅ Montants Versé */}
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl shadow-sm p-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sky-100 uppercase tracking-widest text-[10px] font-bold">Montants Versé</p>
              <h3 className="text-3xl font-black text-white">
                {profile?.role === 'admin' || profile?.role === 'super_admin'
                  ? `${(stats.totalPaiements / 1000).toFixed(0)}K DA`
                  : '🔐'}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0"><CheckCircle size={20} /></div>
          </div>
          <div className="text-[10px] font-bold text-sky-100 pt-2 border-t border-white/20 mt-1">Paiements enregistrés</div>
        </div>

        {/* ✅ Reste à Payer */}
        <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-xl shadow-sm p-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-rose-100 uppercase tracking-widest text-[10px] font-bold">Reste à Payer</p>
              <h3 className="text-3xl font-black text-white">
                {profile?.role === 'admin' || profile?.role === 'super_admin'
                  ? `${(stats.resteAPayer / 1000).toFixed(0)}K DA`
                  : '🔐'}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/20 text-white flex items-center justify-center shrink-0"><AlertCircle size={20} /></div>
          </div>
          <div className="text-[10px] font-bold text-rose-100 pt-2 border-t border-white/20 mt-1">Montant encore à payer</div>
        </div>
      </div>

      {/* Deuxième ligne - Cartes détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Nombre Abonnements */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Abonnements</h3>
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-indigo-500 w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-600 mb-1">{stats.nombreAbonnements}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase">Installations abonnements</p>
        </div>

        {/* Nombre Acquisitions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-teal-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Acquisitions</h3>
            <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
              <Target className="text-teal-500 w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-teal-600 mb-1">{stats.nombreAcquisitions}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase">Installations acquisitions</p>
        </div>

        {/* Interventions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:border-cyan-300 transition-all">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Interventions</h3>
            <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center">
              <Activity className="text-cyan-500 w-5 h-5" />
            </div>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-2xl font-black text-cyan-600">{stats.totalInterventions}</p>
            <div className="flex flex-col gap-1 w-1/2">
              {interventionsByUserData.slice(0, 2).map((user, idx) => (
                <div key={idx} className="flex justify-between items-center text-[9px] font-bold">
                  <span className="text-gray-500 uppercase truncate max-w-[80px]">{user.nom}</span>
                  <span className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded">{user.interventions}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Analyse IA - Section Améliorée */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 hover:shadow-md transition-all">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
            <Sparkles size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Intelligence Artificielle</h2>
            <p className="text-gray-600 text-sm mt-1">
              {loadingAI ? '🔄 Analyse en cours...' : '✨ Recommandations personnalisées basées sur vos données'}
            </p>
          </div>
        </div>

        {loadingAI && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-gray-600">Génération des insights IA...</p>
            </div>
          </div>
        )}

        {!loadingAI && aiInsights && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiInsights.map((insight, idx) => {
              const bgColors = {
                positive: 'from-green-50 to-emerald-50 border-green-300',
                warning: 'from-orange-50 to-amber-50 border-orange-300',
                info: 'from-blue-50 to-indigo-50 border-blue-300',
                action: 'from-purple-50 to-violet-50 border-purple-300'
              };
              const iconColors = {
                positive: 'bg-green-500',
                warning: 'bg-orange-500',
                info: 'bg-blue-500',
                action: 'bg-purple-500'
              };
              const textColors = {
                positive: 'text-green-800',
                warning: 'text-orange-800',
                info: 'text-blue-800',
                action: 'text-purple-800'
              };

              const Icon = insight.type === 'positive' ? TrendingUp :
                insight.type === 'warning' ? AlertCircle :
                  insight.type === 'info' ? Target : Calendar;

              return (
                <div key={idx} className={`bg-gradient-to-br ${bgColors[insight.type]} border-2 rounded-xl p-6 hover:shadow-md transition-all`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 ${iconColors[insight.type]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold ${textColors[insight.type]} text-lg mb-1`}>{insight.title}</h4>
                      <p className="text-sm text-gray-800 leading-relaxed">{insight.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loadingAI && !aiInsights && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">Revenus Solides</h4>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">
                    Votre chiffre d'affaires s'élève à <strong>{formatMontant(stats.revenus)}</strong> avec {stats.totalClients} clients actifs générant des revenus constants.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">Attention Requise</h4>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">
                    <strong>{formatMontant(stats.resteAPayer)}</strong> reste à recouvrer. Taux de recouvrement actuel: <strong>{stats.tauxRecouvrement}%</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Target size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">Conversion Prospects</h4>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">
                    Taux de conversion: <strong>{stats.tauxConversion}%</strong>. Vous avez {stats.prospects} prospects actuellement en cours de négociation.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <Activity size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">Activité Technique</h4>
                  <p className="text-sm text-gray-600 leading-relaxed font-medium">
                    {stats.totalInterventions} interventions réalisées. Productivité optimale de votre équipe technique.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loadingAI && !aiInsights && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
            <p className="text-xs text-yellow-800">
              💡 <strong>Conseil:</strong> Configurez VITE_AI_API_KEY dans votre fichier .env pour des analyses IA automatisées avec GPT.
            </p>
          </div>
        )}
      </div>

      {/* Graphiques - Lazy Loading */}
      {showGraphs && (
        <>
          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interventions par Technicien */}
            <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Interventions par Technicien</h2>
                  <p className="text-sm text-gray-600 mt-1">Performance de l'équipe</p>
                </div>
                <Activity className="text-cyan-500 w-6 h-6" />
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {interventionsByUserData.slice(0, 8).map((tech, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-cyan-300 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800">{tech.nom}</span>
                      <span className="bg-cyan-100 text-cyan-800 text-xs font-bold px-2 py-1 rounded-full">
                        {tech.interventions}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-cyan-500 h-full rounded-full transition-all"
                        style={{ width: Math.min((tech.interventions / Math.max(...interventionsByUserData.map(t => t.interventions), 1)) * 100, 100) + '%' }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {tech.tempsTotalHeures.toFixed(1)}h ({(tech.tempsTotalHeures / (tech.interventions || 1)).toFixed(1)}h/intervention)
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Répartition Revenus - Pie Chart */}
            <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Répartition Revenus</h2>
                  <p className="text-sm text-gray-600 mt-1">Par type (Depuis Paiements)</p>
                </div>
                <PieChartIcon className="text-purple-500 w-6 h-6" />
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={repartitionDataPaiements}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {repartitionDataPaiements.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatMontant(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {repartitionDataPaiements.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{formatMontant(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Missions par Wilaya */}
          <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Missions par Wilaya</h2>
                <p className="text-sm text-gray-600 mt-1">Distribution géographique</p>
              </div>
              <MapPin className="text-rose-500 w-6 h-6" />
            </div>

            {missionsByWilayaData.length > 0 ? (
              <div className="space-y-3">
                {missionsByWilayaData.map((item, idx) => {
                  const maxMissions = Math.max(...missionsByWilayaData.map(d => d.count), 1);
                  const percentage = (item.count / maxMissions) * 100;
                  const colors = ['bg-rose-500', 'bg-pink-500', 'bg-red-500', 'bg-orange-500', 'bg-amber-500'];
                  const color = colors[idx % colors.length];

                  return (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-rose-300 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-rose-500" />
                          <span className="font-semibold text-gray-800">{item.wilaya}</span>
                        </div>
                        <span className={`${color} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                          {item.count} mission{item.count > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`${color} h-full rounded-full transition-all`}
                          style={{ width: percentage + '%' }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Aucune mission enregistrée</p>
              </div>
            )}
          </div>

          {/* ✅ TABLEAU: Interventions par Utilisateur */}
          {showGraphs && interventionsByUserData.length > 0 && (
            <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-6 overflow-x-auto">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Interventions par Utilisateur</h2>
              <table className="w-full text-sm text-gray-700">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-gray-800">Utilisateur</th>
                    <th className="px-4 py-3 text-center font-bold text-gray-800">Nombre d'Interventions</th>
                    <th className="px-4 py-3 text-center font-bold text-gray-800">Temps Total (heures)</th>
                    <th className="px-4 py-3 text-center font-bold text-gray-800">Temps Moyen</th>
                  </tr>
                </thead>
                <tbody>
                  {interventionsByUserData.map((user, idx) => {
                    const tempsMoyen = user.interventions > 0 ? (user.tempsTotalHeures / user.interventions).toFixed(1) : 0;
                    return (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} >
                        <td className="px-4 py-4 font-medium text-gray-900">{user.nom}</td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                            {user.interventions}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                            {user.tempsTotalHeures.toFixed(1)}h
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center text-gray-600">
                          {tempsMoyen}h/intervention
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Actions Rapides Modernisées */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Nouveau Prospect */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform"></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 text-white shadow-inner">
                    <Target size={28} />
                  </div>
                  <h3 className="text-xl font-black">Ajouter Prospect</h3>
                </div>
                <p className="text-blue-100 text-sm mb-6 flex-1">Créer un nouveau prospect dans le pipeline</p>
                <button
                  onClick={() => navigate(`/${PAGES.PROSPECTS}`)}
                  className="w-full bg-white/20 hover:bg-white text-white hover:text-indigo-600 py-3 px-4 rounded-xl transition-colors font-bold tracking-wide backdrop-blur-sm border border-white/30 hover:border-white shadow-sm"
                >
                  Nouveau Prospect
                </button>
              </div>
            </div>

            {/* Missions (au lieu de Statistiques générique) */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform"></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 text-white shadow-inner">
                    <TrendingUp size={28} />
                  </div>
                  <h3 className="text-xl font-black">Gestion Missions</h3>
                </div>
                <p className="text-indigo-100 text-sm mb-6 flex-1">Piloter les missions et l'opérationnel de l'équipe</p>
                <button
                  onClick={() => navigate(`/${PAGES.MISSIONS}`)}
                  className="w-full bg-white/20 hover:bg-white text-white hover:text-purple-600 py-3 px-4 rounded-xl transition-colors font-bold tracking-wide backdrop-blur-sm border border-white/30 hover:border-white shadow-sm"
                >
                  Voir Missions
                </button>
              </div>
            </div>

            {/* Paiements */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform"></div>
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 text-white shadow-inner">
                    <DollarSign size={28} />
                  </div>
                  <h3 className="text-xl font-black">Paiements</h3>
                </div>
                <p className="text-emerald-100 text-sm mb-6 flex-1">Gérer les flux financiers et le recouvrement</p>
                <button
                  onClick={() => navigate(`/${PAGES.PAIEMENTS}`)}
                  className="w-full bg-white/20 hover:bg-white text-white hover:text-teal-600 py-3 px-4 rounded-xl transition-colors font-bold tracking-wide backdrop-blur-sm border border-white/30 hover:border-white shadow-sm"
                >
                  Accéder aux Paiements
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;