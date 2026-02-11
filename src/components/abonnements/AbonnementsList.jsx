import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, CheckCircle, Eye, Edit2, Trash2 } from 'lucide-react';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar';
import Modal from '../common/Modal';
import DataTable from '../common/DataTable';
import AbonnementCard from './AbonnementCard';
import PaiementForm from '../paiements/PaiementForm';
import { abonnementService } from '../../services/abonnementService';
import { paiementService } from '../../services/paiementService';
import { userService } from '../../services/userService';
import { supabase } from '../../services/supabaseClient';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatMontant, formatPriceDisplay } from '../../utils/helpers';

const AbonnementsList = () => {
  const [abonnements, setAbonnements] = useState([]);
  const [filteredAbonnements, setFilteredAbonnements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPaiementModal, setShowPaiementModal] = useState(false);
  const [selectedAbonnement, setSelectedAbonnement] = useState(null);
  const [hasDeletePermission, setHasDeletePermission] = useState(false);
  const [hasCreatePaiementPermission, setHasCreatePaiementPermission] = useState(false);
  const [isSubmittingPaiement, setIsSubmittingPaiement] = useState(false);
  const { addNotification } = useApp();
  const { user, profile } = useAuth();

  useEffect(() => {
    loadAbonnements();
  }, []);

  useEffect(() => {
    loadPermissions();
  }, [user?.id, profile?.role]);

  useEffect(() => {
    filterAbonnements();
  }, [abonnements, searchTerm, filterStatus]);

  const loadAbonnements = async () => {
    try {
      setLoading(true);
      const data = await abonnementService.getAll();
      
      // Enrichir chaque abonnement avec le montant de l'installation et les paiements
      const enrichedData = await Promise.all(data.map(async (abonnement) => {
        try {
          // Récupérer les paiements pour cet abonnement
          const { data: paiements } = await supabase
            .from('paiements')
            .select('montant')
            .eq('installation_id', abonnement.installation_id);
          
          const totalPaye = (paiements || []).reduce((sum, p) => sum + (p.montant || 0), 0);
          const montantInstallation = abonnement.installation?.montant || 0;
          
          // ✅ NOUVEAU: Récupérer le prix_abonnement de l'application
          let prixAbonnement = montantInstallation;
          try {
            const { data: appData } = await supabase
              .from('applications')
              .select('prix_abonnement, prix_acquisition')
              .eq('nom', abonnement.installation?.application_installee)
              .single();
            
            if (appData?.prix_abonnement) {
              prixAbonnement = appData.prix_abonnement;
            }
          } catch (appErr) {
            console.warn('Impossible de récupérer le prix_abonnement');
          }
          
          const resteAPayer = Math.max(0, prixAbonnement - totalPaye);
          
          return {
            ...abonnement,
            totalPaye,
            resteAPayer,
            montantInstallation: prixAbonnement
          };
        } catch (err) {
          console.error('Erreur chargement paiements:', err);
          return {
            ...abonnement,
            totalPaye: 0,
            resteAPayer: abonnement.installation?.montant || 0,
            montantInstallation: abonnement.installation?.montant || 0
          };
        }
      }));
      
      setAbonnements(enrichedData);
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Erreur lors du chargement des abonnements'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      if (user?.id && profile) {
        // Permissions pour supprimer les abonnements
        const canDelete = profile?.role === 'admin' || profile?.role === 'super_admin' || 
                         await userService.hasDeletePermission(user.id, 'abonnements');
        
        // ✅ Permissions pour créer des paiements - SEULEMENT pour les admins
        const canCreatePaiement = profile?.role === 'admin' || profile?.role === 'super_admin';
        
        setHasDeletePermission(canDelete);
        setHasCreatePaiementPermission(canCreatePaiement);
      }
    } catch (error) {
      console.error('Erreur chargement permissions:', error);
    }
  };

  const filterAbonnements = () => {
    let filtered = [...abonnements];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(a => a.statut === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.installation?.application_installee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.installation?.client?.raison_sociale?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAbonnements(filtered);
  };

  const handleDelete = async (abonnement) => {
    // Accepter soit un ID soit un objet abonnement
    const abonnementId = typeof abonnement === 'object' ? abonnement.id : abonnement;
    
    // ✅ Vérifier la permission AVANT de supprimer
    if (!hasDeletePermission) {
      addNotification({
        type: 'error',
        message: '🔒 Vous n\'avez pas la permission de supprimer des abonnements'
      });
      return;
    }
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) {
      return;
    }

    try {
      await abonnementService.delete(abonnementId);
      addNotification({
        type: 'success',
        message: 'Abonnement supprimé avec succès'
      });
      loadAbonnements();
    } catch (error) {
      // ✅ Gérer les erreurs spécifiques
      console.error('Erreur suppression abonnement:', error);
      
      // 409 Conflict = contrainte de clé étrangère
      if (error.status === 409 || error.message?.includes('foreign key')) {
        addNotification({
          type: 'error',
          message: 'Impossible de supprimer cet abonnement car il est lié à d\'autres enregistrements'
        });
      } else {
        addNotification({
          type: 'error',
          message: error.message || 'Erreur lors de la suppression de l\'abonnement'
        });
      }
    }
  };

  const handleRenouveler = async (abonnement) => {
    // Accepter soit un ID soit un objet abonnement
    const abonnementId = typeof abonnement === 'object' ? abonnement.id : abonnement;
    const abonnementToRenew = typeof abonnement === 'object' ? abonnement : abonnements.find(a => a.id === abonnementId);
    
    if (!window.confirm('Êtes-vous sûr de vouloir renouveler cet abonnement ?')) {
      return;
    }

    try {
      // 1. Supprimer l'ancien abonnement d'abord
      await abonnementService.delete(abonnementId);
      
      // 2. Créer un nouvel abonnement basé sur l'ancien
      if (!abonnementToRenew) {
        throw new Error('Abonnement non trouvé');
      }
      
      const dateDebut = new Date(abonnementToRenew.date_fin);
      const dateFin = new Date(dateDebut);
      dateFin.setFullYear(dateFin.getFullYear() + 1);
      
      await abonnementService.create({
        installation_id: abonnementToRenew.installation_id,
        date_debut: dateDebut.toISOString(),
        date_fin: dateFin.toISOString(),
        statut: 'actif'
      });
      
      addNotification({
        type: 'success',
        message: 'Abonnement renouvelé avec succès'
      });
      loadAbonnements();
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.message || 'Erreur lors du renouvellement'
      });
    }
  };

  const handleOpenPaiement = (abonnement) => {
    // ✅ Vérifier la permission de créer un paiement (silencieusement)
    if (!hasCreatePaiementPermission) {
      return;
    }
    setSelectedAbonnement(abonnement);
    setShowPaiementModal(true);
  };

  const handlePaiementSubmit = async (paiementData) => {
    // Protéger contre les double-clicks
    if (isSubmittingPaiement) return;
    setIsSubmittingPaiement(true);
    
    try {
      // Créer le paiement avec les données du formulaire
      const dataToSubmit = {
        montant: paiementData.montant,
        type: paiementData.type,
        mode_paiement: paiementData.mode_paiement,
        date_paiement: paiementData.date_paiement,
        client_id: selectedAbonnement.installation?.client?.id || selectedAbonnement.installation.client_id,
        installation_id: selectedAbonnement.installation_id,
        created_by: user?.id || null
      };
      
      await paiementService.create(dataToSubmit);
      
      // Vérifier si l'abonnement est complètement payé
      if (selectedAbonnement.statut === 'expire') {
        // Récupérer le montant total des paiements pour cet abonnement
        const { data: paiements } = await supabase
          .from('paiements')
          .select('montant')
          .eq('installation_id', selectedAbonnement.installation_id);
        
        const totalPaye = (paiements || []).reduce((sum, p) => sum + (p.montant || 0), 0);
        
        // Vérifier si le montant total payé ≥ montant de l'installation
        const installation = selectedAbonnement.installation;
        if (totalPaye >= (installation?.montant || 0)) {
          // Renouveler automatiquement l'abonnement
          await abonnementService.delete(selectedAbonnement.id);
          
          const dateDebut = new Date(selectedAbonnement.date_fin);
          const dateFin = new Date(dateDebut);
          dateFin.setFullYear(dateFin.getFullYear() + 1);
          
          await abonnementService.create({
            installation_id: selectedAbonnement.installation_id,
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
      
      setShowPaiementModal(false);
      setSelectedAbonnement(null);
      loadAbonnements();
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.message || 'Erreur lors de l\'enregistrement du paiement'
      });
    } finally {
      setIsSubmittingPaiement(false);
    }
  };

  const stats = {
    total: abonnements.length,
    actifs: abonnements.filter(a => a.statut === 'actif').length,
    enAlerte: abonnements.filter(a => a.statut === 'en_alerte').length,
    expires: abonnements.filter(a => a.statut === 'expire').length
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
          <p className="text-sm opacity-90 mb-1">Total Abonnements</p>
          <h3 className="text-3xl font-bold">{stats.total}</h3>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <p className="text-sm opacity-90 mb-1">Actifs</p>
          <h3 className="text-3xl font-bold">{stats.actifs}</h3>
          <p className="text-sm opacity-90 mt-1">
            Taux {stats.total > 0 ? ((stats.actifs / stats.total) * 100).toFixed(0) : 0}%
          </p>
        </div>
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <p className="text-sm opacity-90 mb-1">En Alerte</p>
          <h3 className="text-3xl font-bold">{stats.enAlerte}</h3>
          <p className="text-sm opacity-90 mt-1">À renouveler</p>
        </div>
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <p className="text-sm opacity-90 mb-1">Expirés</p>
          <h3 className="text-3xl font-bold">{stats.expires}</h3>
          <p className="text-sm opacity-90 mt-1">Action requise</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Rechercher un abonnement..."
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
              onClick={() => setFilterStatus('en_alerte')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'en_alerte'
                  ? 'bg-warning text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              En Alerte
            </button>
            <button
              onClick={() => setFilterStatus('expire')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'expire'
                  ? 'bg-danger text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Expirés
            </button>
          </div>
        </div>
      </div>

      {/* Liste */}
      {filteredAbonnements.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">Aucun abonnement trouvé</p>
        </div>
      ) : (
        <DataTable
          data={filteredAbonnements}
          columns={[
            {
              key: 'installation',
              label: 'Installation',
              width: '200px',
              render: (row) => (
                <div>
                  <p className="font-semibold text-gray-900">{row.installation?.application_installee || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{row.installation?.client?.raison_sociale || 'N/A'}</p>
                </div>
              )
            },
            {
              key: 'date_debut',
              label: 'Date Début',
              width: '120px',
              render: (row) => (
                <span>{row.date_debut ? new Date(row.date_debut).toLocaleDateString('fr-FR') : 'N/A'}</span>
              )
            },
            {
              key: 'date_fin',
              label: 'Date Fin',
              width: '120px',
              render: (row) => (
                <span>{row.date_fin ? new Date(row.date_fin).toLocaleDateString('fr-FR') : 'N/A'}</span>
              )
            },
            {
              key: 'montant',
              label: 'Montant',
              width: '120px',
              render: (row) => (
                <span className="font-semibold">
                  {profile?.role === 'admin' || profile?.role === 'super_admin' ? (
                    <span className="text-blue-600">{formatMontant(row.montantInstallation || 0)}</span>
                  ) : (
                    <span className="text-gray-400">🔐</span>
                  )}
                </span>
              )
            },
            {
              key: 'statut_paiement',
              label: 'Statut de Paiement',
              width: '140px',
              render: (row) => {
                const montantTotal = row.montantInstallation || 0;
                const montantPaye = row.totalPaye || 0;
                const reste = Math.max(0, montantTotal - montantPaye);
                
                let statut, couleur, code;
                if (reste === montantTotal || montantTotal === 0) {
                  // 0 = Aucun paiement
                  statut = 'Aucun paiement';
                  couleur = 'bg-red-100 text-red-700';
                  code = 0;
                } else if (reste > 0) {
                  // 1 = Partiellement payé
                  statut = 'Partiellement payé';
                  couleur = 'bg-orange-100 text-orange-700';
                  code = 1;
                } else {
                  // 2 = Totalement payé
                  statut = 'Totalement payé';
                  couleur = 'bg-green-100 text-green-700';
                  code = 2;
                }
                
                return (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${couleur}`}>
                    {profile?.role === 'admin' || profile?.role === 'super_admin' ? (
                      <>{code}</>
                    ) : (
                      <>{code} ({statut})</>
                    )}
                  </span>
                );
              }
            },
            {
              key: 'statut',
              label: 'Statut',
              width: '100px',
              render: (row) => {
                const today = new Date();
                const endDate = new Date(row.date_fin);
                const isExpired = endDate < today;
                const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                
                return (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isExpired
                      ? 'bg-red-100 text-red-800'
                      : daysLeft <= 30
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {isExpired ? 'Expiré' : daysLeft <= 30 ? 'À renouveler' : 'Actif'}
                  </span>
                );
              }
            }
          ]}
          actions={[
            {
              key: 'payment',
              label: 'Paiement',
              icon: '💰',
              onClick: handleOpenPaiement,
              disabled: !hasCreatePaiementPermission,
              title: !hasCreatePaiementPermission ? 'Permission refusée: Ajouter un paiement' : 'Ajouter un paiement',
              className: hasCreatePaiementPermission ? 'bg-green-600 hover:bg-green-700 text-white px-3 py-1' : 'bg-gray-400 cursor-not-allowed text-white px-3 py-1'
            },
            {
              key: 'renew',
              label: 'Renouveler',
              icon: '🔄',
              onClick: handleRenouveler,
              className: 'bg-blue-600 hover:bg-blue-700 text-white px-3 py-1',
              condition: (row) => {
                const today = new Date();
                const endDate = new Date(row.date_fin);
                const isExpired = endDate < today;
                const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
                // Afficher le bouton seulement si expiré ou en alerte (≤30 jours)
                return isExpired || daysLeft <= 30;
              }
            }
          ]}
          loading={loading}
          emptyMessage="Aucun abonnement trouvé"
        />
      )}

      {/* Modal Paiement */}
      <Modal
        isOpen={showPaiementModal}
        onClose={() => {
          setShowPaiementModal(false);
          setSelectedAbonnement(null);
        }}
        title={selectedAbonnement ? `Enregistrer paiement - ${selectedAbonnement.installation?.application_installee}` : 'Enregistrer paiement'}
        size="lg"
      >
        {selectedAbonnement && (
          <PaiementForm
            isAbonnement={true}
            isSubmitting={isSubmittingPaiement}
            paiement={{
              client_id: selectedAbonnement.installation?.client?.id || selectedAbonnement.installation?.client_id || '',
              installation_id: selectedAbonnement.installation_id,
              type: 'abonnement',
              mode_paiement: 'especes',
              montant: '',
              date_paiement: new Date().toISOString().split('T')[0],
              abonnement_montant: selectedAbonnement.installation?.montant || 0
            }}
            onSubmit={handlePaiementSubmit}
            onCancel={() => setShowPaiementModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

export default AbonnementsList;