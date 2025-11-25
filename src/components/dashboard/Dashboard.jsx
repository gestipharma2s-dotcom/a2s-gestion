import React, { useState, useEffect } from 'react';
import { Users, Target, Calendar, TrendingUp, DollarSign, AlertCircle, TrendingDown, Sparkles } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { prospectService } from '../../services/prospectService';
import { installationService } from '../../services/installationService';
import { paiementService } from '../../services/paiementService';
import { interventionService } from '../../services/interventionService'; // ✅ Ajout
import generateAIAnalysis from '../../services/aiService';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalClients: 0,
    prospects: 0,
    revenus: 0,
    abonnementsActifs: 0,
    resteAPayer: 0,
    tauxConversion: 0,
    totalInstallations: 0,
    revenusAbonnementsPaiements: 0,     // ✅ Depuis paiements
    revenusAcquisitionsPaiements: 0,    // ✅ Depuis paiements
    revenusAbonnementsInstallations: 0, // ✅ Depuis installations
    revenusAcquisitionsInstallations: 0 // ✅ Depuis installations
  });
  const [loading, setLoading] = useState(true);
  const [resteAPayerData, setResteAPayerData] = useState([]);
  const [revenusData, setRevenusData] = useState([]);
  const [interventionsByUserData, setInterventionsByUserData] = useState([]); // ✅ Ajout
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

      // Charger les prospects
      const prospectsData = await prospectService.getAll();
      const clientsActifs = prospectsData.filter(p => p.statut === 'actif').length;
      const prospectsEnCours = prospectsData.filter(p => p.statut === 'prospect').length;

      // Charger les installations
      const installationsData = await installationService.getAll();
      const totalInstallations = installationsData.reduce((sum, inst) => sum + (inst.montant || 0), 0);

      // Charger les paiements
      const paiementsData = await paiementService.getAll();
      const totalPaiements = paiementsData.reduce((sum, p) => sum + (p.montant || 0), 0);

      // ✅ Charger les interventions
      const interventionsData = await interventionService.getAll();
      
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
          // Chercher le nom du client depuis les prospects
          const prospect = prospectsData.find(p => p.id === inst.client_id);
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

      setStats({
        totalClients: clientsActifs,
        prospects: prospectsEnCours,
        revenus: totalPaiements,
        abonnementsActifs: clientsActifs,
        resteAPayer: resteAPayer,
        tauxConversion: parseFloat(tauxConversion),
        totalInstallations: totalInstallations,
        revenusAbonnementsPaiements: revenusAbonnementsPaiements,  // ✅ Depuis paiements
        revenusAcquisitionsPaiements: revenusAcquisitionsPaiements, // ✅ Depuis paiements
        revenusAbonnementsInstallations: revenusAbonnementsInstallations, // ✅ Depuis installations
        revenusAcquisitionsInstallations: revenusAcquisitionsInstallations // ✅ Depuis installations
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
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-medium mb-1">Total Clients</p>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">{stats.totalClients}</h3>
              <p className="text-sm text-green-600">+2.5% ce mois</p>
            </div>
            <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center">
              <Users className="text-white" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-medium mb-1">Prospects</p>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">{stats.prospects}</h3>
              <p className="text-sm text-gray-500">En conversion</p>
            </div>
            <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center">
              <Target className="text-white" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-medium mb-1">Revenus Totaux</p>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">{formatMontant(stats.revenus)}</h3>
              <p className="text-sm text-gray-500">Total paiements reçus</p>
            </div>
            <div className="w-14 h-14 bg-purple-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-white" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-600 text-sm font-medium mb-1">Reste à Payer</p>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">{formatMontant(stats.resteAPayer)}</h3>
              <p className="text-sm text-orange-600">Sur {formatMontant(stats.totalInstallations)} total</p>
            </div>
            <div className="w-14 h-14 bg-orange-500 rounded-xl flex items-center justify-center">
              <DollarSign className="text-white" size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Analyse IA */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles size={28} className="text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">Analyse IA - A2S Gestion</h3>
            <p className="text-sm text-gray-600">
              {loadingAI ? 'Génération en cours...' : 'Insights et recommandations intelligentes'}
            </p>
          </div>
        </div>
        
        {loadingAI && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        )}

        {!loadingAI && aiInsights && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {aiInsights.map((insight, idx) => {
              const bgColors = {
                positive: 'from-green-50 to-emerald-50 border-green-200',
                warning: 'from-orange-50 to-amber-50 border-orange-200',
                info: 'from-blue-50 to-indigo-50 border-blue-200',
                action: 'from-purple-50 to-violet-50 border-purple-200'
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
                <div key={idx} className={`bg-gradient-to-br ${bgColors[insight.type]} border-2 rounded-xl p-5 hover:shadow-md transition-all`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 ${iconColors[insight.type]} rounded-lg flex items-center justify-center`}>
                      <Icon size={20} className="text-white" />
                    </div>
                    <h4 className={`font-bold ${textColors[insight.type]} text-lg`}>{insight.title}</h4>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed">{insight.message}</p>
                </div>
              );
            })}
          </div>
        )}

        {!loadingAI && !aiInsights && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* Analyses par défaut si API IA non configurée */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <h4 className="font-bold text-green-800 text-lg">Revenus Totaux</h4>
              </div>
              <p className="text-sm text-green-900 leading-relaxed">
                Revenus totaux de <strong className="text-green-700">{formatMontant(stats.revenus)}</strong> générés. 
                {stats.totalClients} clients actifs contribuent au chiffre d'affaires.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-5 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <AlertCircle size={20} className="text-white" />
                </div>
                <h4 className="font-bold text-orange-800 text-lg">Reste à Payer</h4>
              </div>
              <p className="text-sm text-orange-900 leading-relaxed">
                <strong className="text-orange-700">{formatMontant(stats.resteAPayer)}</strong> de reste à payer. 
                Taux de recouvrement: <strong className="text-orange-700">
                  {((stats.revenus / stats.totalInstallations) * 100).toFixed(1)}%
                </strong>
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Target size={20} className="text-white" />
                </div>
                <h4 className="font-bold text-blue-800 text-lg">Conversion Prospects</h4>
              </div>
              <p className="text-sm text-blue-900 leading-relaxed">
                Taux de conversion de <strong className="text-blue-700">{stats.tauxConversion}%</strong>. 
                {stats.prospects} prospects en cours de conversion.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200 rounded-xl p-5 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <DollarSign size={20} className="text-white" />
                </div>
                <h4 className="font-bold text-purple-800 text-lg">Top 5 Dettes</h4>
              </div>
              <p className="text-sm text-purple-900 leading-relaxed">
                {resteAPayerData.length > 0 ? (
                  <>Les 5 principaux clients doivent <strong className="text-purple-700">
                    {formatMontant(resteAPayerData.reduce((sum, c) => sum + c.montant, 0))}
                  </strong> au total.</>
                ) : (
                  'Aucune dette client enregistrée.'
                )}
              </p>
            </div>
          </div>
        )}

        {!loadingAI && !aiInsights && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              💡 <strong>Astuce:</strong> Configurez VITE_AI_API_KEY dans votre fichier .env pour activer l'analyse IA automatique avec GPT.
            </p>
          </div>
        )}
      </div>

      {/* Graphiques - Lazy Loading */}
      {showGraphs && (
      <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenus Globaux */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Évolution des Revenus (Depuis Installations)</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={revenusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mois" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value) => formatMontant(value)}
              />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={3} name="Total" />
              <Line type="monotone" dataKey="abonnements" stroke="#2563eb" strokeWidth={2} name="Abonnements" />
              <Line type="monotone" dataKey="acquisitions" stroke="#10b981" strokeWidth={2} name="Acquisitions" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition Revenus */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Répartition Revenus (Depuis Paiements)</h2>
          <ResponsiveContainer width="100%" height={350}>
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
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">{formatMontant(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ✅ NOUVEAU: Répartition Revenus depuis Installations */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Répartition Revenus (Depuis Installations)</h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={repartitionDataInstallations}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {repartitionDataInstallations.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatMontant(value)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {repartitionDataInstallations.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">{formatMontant(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenus par Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Revenus Abonnements vs Acquisitions</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mois" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value) => formatMontant(value)}
              />
              <Legend />
              <Bar dataKey="abonnements" fill="#2563eb" name="Abonnements" radius={[8, 8, 0, 0]} />
              <Bar dataKey="acquisitions" fill="#10b981" name="Acquisitions" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Reste à Payer par Client */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Top 5 - Reste à Payer</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resteAPayerData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="client" type="category" stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value) => formatMontant(value)}
              />
              <Bar dataKey="montant" fill="#f59e0b" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ✅ TABLEAU: Interventions par Utilisateur */}
      {showGraphs && interventionsByUserData.length > 0 && (
      <div className="bg-white rounded-xl shadow-md p-6 overflow-x-auto">
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

      {/* Actions Rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="text-blue-600" size={24} />
            </div>
            <h3 className="font-bold text-gray-800">Ajouter Prospect</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Créer un nouveau prospect</p>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Nouveau Prospect
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <h3 className="font-bold text-gray-800">Statistiques</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Voir tous les rapports</p>
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium">
            Statistiques
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-purple-600" size={24} />
            </div>
            <h3 className="font-bold text-gray-800">Paiements</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">Gérer les paiements</p>
          <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors font-medium">
            Paiements
          </button>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

export default Dashboard;