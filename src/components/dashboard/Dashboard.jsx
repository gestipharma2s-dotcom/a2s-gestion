import React, { useState, useEffect } from 'react';
import { Users, Target, Calendar, TrendingUp, DollarSign, AlertCircle, TrendingDown, Sparkles } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { prospectService } from '../../services/prospectService';
import { installationService } from '../../services/installationService';
import { paiementService } from '../../services/paiementService';
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
    totalInstallations: 0
  });
  const [loading, setLoading] = useState(true);
  const [resteAPayerData, setResteAPayerData] = useState([]);
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

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

      // ✅ CALCUL CORRECT: Reste à Payer = Total Installations - Total Paiements
      const resteAPayer = Math.max(0, totalInstallations - totalPaiements);

      // Calculer le reste à payer par client (TOP 5)
      const resteParClient = {};
      
      // Grouper par client
      installationsData.forEach(inst => {
        if (!resteParClient[inst.client_id]) {
          resteParClient[inst.client_id] = {
            client_id: inst.client_id,
            raison_sociale: inst.prospects?.raison_sociale || 'Client',
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
        totalInstallations: totalInstallations
      });

      // ✅ Générer l'analyse IA
      setLoadingAI(true);
      const insights = await generateAIAnalysis(
        {
          totalClients: clientsActifs,
          prospects: prospectsEnCours,
          revenus: totalPaiements,
          abonnementsActifs: clientsActifs,
          resteAPayer: resteAPayer,
          tauxConversion: parseFloat(tauxConversion),
          totalInstallations: totalInstallations
        },
        top5Reste
      );
      setAiInsights(insights);
      setLoadingAI(false);

    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Données de revenus mensuels
  const revenusData = [
    { mois: 'Jan', total: 180000, abonnements: 120000, acquisitions: 60000 },
    { mois: 'Fév', total: 220000, abonnements: 140000, acquisitions: 80000 },
    { mois: 'Mar', total: 280000, abonnements: 180000, acquisitions: 100000 },
    { mois: 'Avr', total: 320000, abonnements: 200000, acquisitions: 120000 },
    { mois: 'Mai', total: 350000, abonnements: 220000, acquisitions: 130000 },
    { mois: 'Juin', total: 420000, abonnements: 280000, acquisitions: 140000 }
  ];

  // Répartition revenus
  const repartitionData = [
    { name: 'Abonnements', value: 1680000, color: '#2563eb' },
    { name: 'Acquisitions', value: 770000, color: '#10b981' }
  ];

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

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenus Globaux */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Évolution des Revenus</h2>
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
          <h2 className="text-xl font-bold text-gray-800 mb-6">Répartition Revenus</h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={repartitionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {repartitionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatMontant(value)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {repartitionData.map((item, idx) => (
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
    </div>
  );
};

export default Dashboard;