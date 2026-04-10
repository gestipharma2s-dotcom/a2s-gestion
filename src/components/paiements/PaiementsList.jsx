import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Download, Calendar, Lock, CreditCard } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import FilterBar from '../common/FilterBar';
import Input from '../common/Input';
import PaiementForm from './PaiementForm';
import { paiementService } from '../../services/paiementService';
import { installationService } from '../../services/installationService';
import { abonnementService } from '../../services/abonnementService';
import { supabase } from '../../services/supabaseClient';
import { formatDate, formatMontant, getStatutPaiement, formatPriceDisplay } from '../../utils/helpers';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { prospectService } from '../../services/prospectService';

const PaiementsList = ({ refreshTrigger, onRefreshTrigger }) => {
  const [paiements, setPaiements] = useState([]);
  const [prospects, setProspects] = useState([]);
  const [filteredPaiements, setFilteredPaiements] = useState([]);
  const [installations, setInstallations] = useState([]);
  const [abonnements, setAbonnements] = useState([]);
  const [clientBalances, setClientBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [creatorId, setCreatorId] = useState('');
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPaiement, setSelectedPaiement] = useState(null);
  const [modalMode, setModalMode] = useState('create');
  const [hasCreatePermission, setHasCreatePermission] = useState(false);
  const [hasEditPermission, setHasEditPermission] = useState(false);
  const [hasDeletePermission, setHasDeletePermission] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalPaymentStatusCounts, setGlobalPaymentStatusCounts] = useState({
    fullyPaid: 0,
    partiallyPaid: 0,
    noPaid: 0
  });
  const { addNotification } = useApp();
  const { user, profile } = useAuth();

  useEffect(() => {
    loadData();
  }, [refreshTrigger]); // Recharger si refreshTrigger change

  useEffect(() => {
    // Vérifier les permissions
    const checkPermissions = async () => {
      if (user?.id && profile) {
        try {
          const canCreate = profile?.role === 'admin' || profile?.role === 'super_admin' ||
            await userService.hasCreatePermission(user.id, 'paiements');
          const canEdit = profile?.role === 'admin' || profile?.role === 'super_admin' ||
            await userService.hasEditPermission(user.id, 'paiements');
          const canDelete = profile?.role === 'admin' || profile?.role === 'super_admin' ||
            await userService.hasDeletePermission(user.id, 'paiements');
          setHasCreatePermission(canCreate);
          setHasEditPermission(canEdit);
          setHasDeletePermission(canDelete);
        } catch (err) {
          console.error('Erreur vérification permissions:', err);
        }
      }
    };

    checkPermissions();
  }, [user?.id, profile]);

  useEffect(() => {
    filterPaiements();
  }, [paiements, searchTerm, filterType, dateDebut, dateFin, creatorId]);

  // ✅ Recalculer les stats globales quand paiements ou installations changent
  useEffect(() => {
    const stats = {
      fullyPaid: 0,
      partiallyPaid: 0,
      noPaid: 0
    };

    if (installations && installations.length > 0) {
      installations.forEach(inst => {
        const montantPaye = paiements
          .filter(p => p.installation_id === inst.id)
          .reduce((sum, p) => sum + (typeof p.montant === 'number' ? p.montant : 0), 0);

        const reste = (inst.montant || 0) - montantPaye;

        if (reste === inst.montant || inst.montant === 0) {
          stats.noPaid++;
        } else if (reste > 0) {
          stats.partiallyPaid++;
        } else {
          stats.fullyPaid++;
        }
      });
    }

    setGlobalPaymentStatusCounts(stats);
    console.log('✅ Stats mises à jour:', stats);
  }, [installations, paiements]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paiementsData, installationsData, usersData, prospectsData, abonnementsData] = await Promise.all([
        paiementService.getAll(),
        installationService.getAll(),
        userService.getAll(),
        prospectService.getAll(),
        supabase.from('abonnements').select('*')
      ]);
      console.log(`📦 Paiements chargés (${paiementsData.length}):`, paiementsData.slice(0, 3));
      console.log(`👥 Utilisateurs chargés (${usersData.length}):`, usersData.map(u => ({ id: u.id, email: u.email })));

      // Vérifier created_by
      const withCreatedBy = paiementsData.filter(p => p.created_by);
      console.log(`✅ Paiements avec created_by: ${withCreatedBy.length}/${paiementsData.length}`);
      if (withCreatedBy.length > 0) {
        console.log(`   Exemples:`, withCreatedBy.slice(0, 2).map(p => ({ id: p.id, created_by: p.created_by })));
      }

      setPaiements(paiementsData);
      setInstallations(installationsData);
      setUsers(usersData);
      setProspects(prospectsData);
      setAbonnements(abonnementsData?.data || []);

      // ✅ Pré-calculer les soldes globaux par client
      const balances = {};
      const allAbos = abonnementsData?.data || [];

      prospectsData.forEach(p => {
        const clientInsts = installationsData.filter(i => i.client_id === p.id);
        const clientPaiements = paiementsData.filter(pai => pai.client_id === p.id);
        const clientAbos = allAbos.filter(a => clientInsts.some(i => i.id === a.installation_id));

        const totalInst = clientInsts.reduce((sum, i) => sum + (parseFloat(i.montant) || 0), 0);
        const totalAbo = clientAbos.reduce((sum, a) => {
          const inst = clientInsts.find(i => i.id === a.installation_id);
          return sum + (parseFloat(inst?.montant_abonnement) || 0);
        }, 0);
        const totalPaye = clientPaiements.reduce((sum, pai) => sum + (parseFloat(pai.montant) || 0), 0);

        balances[p.id] = (parseFloat(p.solde_initial) || 0) + totalInst + totalAbo - totalPaye;
      });
      setClientBalances(balances);
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

    // Filtre par créateur
    if (creatorId) {
      filtered = filtered.filter(p => p.created_by === creatorId);
    }

    setFilteredPaiements(filtered);
  };

  const handleEdit = (paiement) => {
    // ✅ Vérifier la permission AVANT d'ouvrir le modal (silencieusement, sans message)
    if (!hasEditPermission) {
      return;
    }
    setSelectedPaiement(paiement);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDelete = async (paiement) => {
    // ✅ Extraire l'ID si c'est un objet (du DataTable)
    const paiementId = paiement?.id || paiement;

    // ✅ Vérifier la permission AVANT de supprimer (silencieusement, sans message)
    if (!hasDeletePermission) {
      return;
    }

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
      // ✅ Gérer les erreurs spécifiques
      console.error('Erreur suppression paiement:', error);

      // 409 Conflict = contrainte de clé étrangère
      if (error.status === 409 || error.message?.includes('foreign key')) {
        addNotification({
          type: 'error',
          message: 'Impossible de supprimer ce paiement car il est lié à d\'autres enregistrements'
        });
      } else {
        addNotification({
          type: 'error',
          message: error.message || 'Erreur lors de la suppression du paiement'
        });
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    // Protéger contre les double-clicks
    if (isSubmitting) return;
    setIsSubmitting(true);

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
          installation_id: formData.installation_id || null,
          type: formData.type,
          montant: formData.montant,
          mode_paiement: formData.mode_paiement,
          date_paiement: formData.date_paiement,
          created_by: user?.id || null
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotalReste = () => {
    // 1. Total des soldes initiaux
    const totalSoldeInitial = (prospects || []).reduce((sum, p) => sum + (parseFloat(p.solde_initial) || 0), 0);

    // 2. Total des nouvelles installations (Acquisitions)
    const totalInstallations = (installations || []).reduce((sum, i) => {
      const base = parseFloat(i.montant) || 0;
      const annexes = (i.applications_annexes || []).reduce((acc, a) => acc + (parseFloat(a.montant) || 0), 0);
      return sum + base + annexes;
    }, 0);

    // 3. Total des abonnements (Périodes facturées)
    // Pour chaque abonnement, on ajoute le montant_abonnement lié (base + annexes)
    const totalAbonnements = (abonnements || []).reduce((sum, a) => {
      const inst = installations.find(i => i.id === a.installation_id);
      const baseAbo = parseFloat(inst?.montant_abonnement) || 0;
      const annexesAbo = (inst?.applications_annexes || []).reduce((acc, ann) => acc + (parseFloat(ann.montant_abonnement) || 0), 0);
      return sum + baseAbo + annexesAbo;
    }, 0);

    // 4. Total des paiements effectués
    const totalPaye = (paiements || []).reduce((sum, p) => sum + (parseFloat(p.montant) || 0), 0);

    // Reste Global = (Dette Initiale + Acquisitions + Abonnements) - Remboursements
    return (totalSoldeInitial + totalInstallations + totalAbonnements) - totalPaye;
  };

  const stats = {
    total: filteredPaiements.length,
    revenuTotal: filteredPaiements.reduce((sum, p) => sum + (p.montant || 0), 0),
    acquisitions: filteredPaiements.filter(p => p.installation?.type === 'acquisition').length,
    abonnements: filteredPaiements.filter(p => p.installation?.type === 'abonnement').length,
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Paiements</h2>
        {hasCreatePermission && (
          <Button
            onClick={() => {
              setSelectedPaiement(null);
              setModalMode('create');
              setShowModal(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            Ajouter Paiement
          </Button>
        )}
      </div>

      {/* Stats - Cartes principales: Total des paiements et Reste à payer */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm opacity-90 mb-1">Total des Paiements</p>
            <h3 className="text-3xl font-bold">
              {profile?.role === 'admin' || profile?.role === 'super_admin' ? (
                formatMontant(stats.revenuTotal)
              ) : (
                '🔐'
              )}
            </h3>
          </div>
          <CreditCard className="absolute right-[-10px] bottom-[-10px] opacity-20 rotate-12" size={80} />
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-sm opacity-90 mb-1">Reste à Payer Global</p>
            <h3 className="text-3xl font-bold">
              {profile?.role === 'admin' || profile?.role === 'super_admin' ? (
                formatMontant(stats.resteTotal)
              ) : (
                '🔐'
              )}
            </h3>
          </div>
          <Lock className="absolute right-[-10px] bottom-[-10px] opacity-20 rotate-12" size={80} />
        </div>
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 mb-1">Nombre de Paiements</p>
            <h3 className="text-3xl font-bold">{stats.total}</h3>
          </div>
          <Calendar size={40} className="opacity-50" />
        </div>
      </div>

      {/* Filtres */}
      <div className="space-y-4">
        {/* Filtre Type, Dates et Créateur */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtre Type */}
          <div className="card p-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">📦 Type:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="acquisition">Acquisition</option>
              <option value="abonnement">Abonnement</option>
            </select>
          </div>

          {/* Filtre Date Début */}
          <div className="card p-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">📅 Du:</label>
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Filtre Date Fin */}
          <div className="card p-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">📅 Au:</label>
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Filtre Créateur */}
          <div className="card p-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">👤 Créateur:</label>
            <select
              value={creatorId || ''}
              onChange={(e) => setCreatorId(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Tous les créateurs</option>
              {Array.from(
                new Map(
                  paiements.map(p => [p.created_by, p])
                ).entries()
              )
                .filter(([uid]) => uid)
                .map(([uid, p]) => {
                  const paiementsByUser = paiements.filter(x => x.created_by === uid);
                  const user = users.find(u => u.id === uid);
                  const displayName = user?.email?.split('@')[0] || user?.email || uid?.substring(0, 8) || 'Inconnu';
                  return (
                    <option key={uid} value={uid}>
                      {displayName} ({paiementsByUser.length})
                    </option>
                  );
                })
              }
            </select>
          </div>
        </div>

        {/* Filtre recherche */}
        <div className="card p-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">🔍 Rechercher:</label>
          <input
            type="text"
            placeholder="Client ou mode de paiement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
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
                Montant Versé
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reste
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dette Client
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
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
                    <span className={`badge-${paiement.installation?.type === 'acquisition' ? 'info' : 'success'}`}>
                      {paiement.installation?.type === 'acquisition' ? 'Acquisition' : 'Abonnement'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                    {/* ✅ Afficher le montant versé (montant réel) */}
                    {profile?.role === 'admin' || profile?.role === 'super_admin' ? (
                      <span className="text-blue-600">{formatMontant(paiement.montant || 0)}</span>
                    ) : (
                      <span className="text-gray-400">🔐</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {/* ✅ Afficher le reste (selon type) */}
                    {profile?.role === 'admin' || profile?.role === 'super_admin' ? (
                      (() => {
                        const isAbo = paiement.type === 'abonnement' || paiement.installation?.type === 'abonnement';
                        const baseVal = isAbo ? (paiement.installation?.montant_abonnement || 0) : (paiement.installation?.montant || 0);
                        const annexesVal = (paiement.installation?.applications_annexes || []).reduce((acc, a) => acc + (parseFloat(isAbo ? a.montant_abonnement : a.montant) || 0), 0);
                        const totalDu = baseVal + annexesVal;
                        const reste = totalDu - (paiement.montant || 0);
                        return <span>{formatMontant(reste)}</span>;
                      })()
                    ) : (
                      <span className="text-gray-400">🔐</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                    {/* ✅ Dette Globale du Client */}
                    {profile?.role === 'admin' || profile?.role === 'super_admin' ? (
                      <span className={clientBalances[paiement.client_id] > 0 ? 'text-red-600' : 'text-green-600'}>
                        {formatMontant(clientBalances[paiement.client_id] || 0)}
                      </span>
                    ) : (
                      <span className="text-gray-400">🔐</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {/* ✅ Afficher le code (0, 1, 2) */}
                    {(() => {
                      const isAbo = paiement.type === 'abonnement' || paiement.installation?.type === 'abonnement';
                      const baseVal = isAbo ? (paiement.installation?.montant_abonnement || 0) : (paiement.installation?.montant || 0);
                      const annexesVal = (paiement.installation?.applications_annexes || []).reduce((acc, a) => acc + (parseFloat(isAbo ? a.montant_abonnement : a.montant) || 0), 0);
                      const totalDu = baseVal + annexesVal;
                      const status = getStatutPaiement(totalDu, paiement.montant || 0);
                      return (
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${status.couleur}`}>
                          {status.code}
                        </span>
                      );
                    })()}
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
                        disabled={!hasEditPermission && !(profile?.role === 'admin' || profile?.role === 'super_admin')}
                        className={`p-2 rounded-lg transition-colors ${!hasEditPermission && !(profile?.role === 'admin' || profile?.role === 'super_admin')
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-blue-600 hover:bg-blue-50'
                          }`}
                        title={!hasEditPermission && !(profile?.role === 'admin' || profile?.role === 'super_admin') ? 'Permission refusée' : 'Modifier'}
                      >
                        {!hasEditPermission && !(profile?.role === 'admin' || profile?.role === 'super_admin') ? (
                          <Lock size={18} />
                        ) : (
                          <Edit2 size={18} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(paiement.id)}
                        disabled={!hasDeletePermission && !(profile?.role === 'admin' || profile?.role === 'super_admin')}
                        className={`p-2 rounded-lg transition-colors ${!hasDeletePermission && !(profile?.role === 'admin' || profile?.role === 'super_admin')
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-red-600 hover:bg-red-50'
                          }`}
                        title={!hasDeletePermission && !(profile?.role === 'admin' || profile?.role === 'super_admin') ? 'Permission refusée' : 'Supprimer'}
                      >
                        {!hasDeletePermission && !(profile?.role === 'admin' || profile?.role === 'super_admin') ? (
                          <Lock size={18} />
                        ) : (
                          <Trash2 size={18} />
                        )}
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
        title={modalMode === 'create' ? "Ajouter un Paiement" : "Modifier Paiement"}
      >
        <PaiementForm
          paiement={selectedPaiement}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowModal(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
};

export default PaiementsList;