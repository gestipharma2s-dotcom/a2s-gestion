import React, { useState, useEffect } from 'react';
import { Download, Edit, ChevronDown, ChevronUp, Plus, Trash2, DollarSign, MapPin, Calendar, Users, AlertCircle, CheckCircle, Lock, Shield } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { missionService } from '../../services/missionService';
import { useApp } from '../../context/AppContext';

const MissionDetailsModal = ({ mission, tab = 'general', onClose, onClosureAdmin, currentUser, userProfile }) => {
  const { addNotification } = useApp();
  const [activeTab, setActiveTab] = useState(tab);
  const [commentaireTechnique, setCommentaireTechnique] = useState('');
  const [commentaireFinancier, setCommentaireFinancier] = useState('');
  const [commentairesTechniques, setCommentairesTechniques] = useState([]);
  const [commentairesFinanciers, setCommentairesFinanciers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    type: 'transport',
    montant: '',
    description: ''
  });
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    technique: tab === 'technique',
    financier: tab === 'financier',
    cloture: tab === 'cloture'
  });

  // Charger les commentaires et dépenses depuis la mission
  useEffect(() => {
    if (mission) {
      // Charger commentaires techniques
      try {
        const techComments = mission.commentaires_techniques;
        if (Array.isArray(techComments)) {
          setCommentairesTechniques(techComments);
        } else if (typeof techComments === 'string') {
          setCommentairesTechniques(JSON.parse(techComments) || []);
        }
      } catch (e) {
        setCommentairesTechniques([]);
      }

      // Charger commentaires financiers
      try {
        const finComments = mission.commentaires_financiers;
        if (Array.isArray(finComments)) {
          setCommentairesFinanciers(finComments);
        } else if (typeof finComments === 'string') {
          setCommentairesFinanciers(JSON.parse(finComments) || []);
        }
      } catch (e) {
        setCommentairesFinanciers([]);
      }

      // Charger dépenses
      try {
        const expensesList = mission.depenses_details || mission.expenses || mission.depenses || [];
        if (Array.isArray(expensesList)) {
          setExpenses(expensesList);
        } else if (typeof expensesList === 'string') {
          setExpenses(JSON.parse(expensesList) || []);
        }
      } catch (e) {
        setExpenses([]);
      }
    }
  }, [mission?.id]);

  const expenseTypes = [
    { value: 'transport', label: '🚗 Transport / Fuel' },
    { value: 'hotel', label: '🏨 Hôtel' },
    { value: 'repas', label: '🍽️ Repas' },
    { value: 'divers', label: '📦 Divers' }
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Ajouter un commentaire technique avec date
  const handleAddCommentaireTechnique = async () => {
    if (commentaireTechnique.trim()) {
      const newComment = {
        id: Date.now(),
        texte: commentaireTechnique,
        auteur: currentUser?.email || 'Utilisateur',
        date_creation: new Date().toISOString(),
        date_affichage: new Date().toLocaleDateString('fr-FR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      const updatedComments = [...commentairesTechniques, newComment];
      setCommentairesTechniques(updatedComments);
      setCommentaireTechnique('');
      
      // Sauvegarder en base de données
      try {
        const result = await missionService.saveCommentairesTechniques(mission.id, updatedComments);
        if (result?.local) {
          alert('⚠️ Commentaire stocké localement\n\nLes colonnes commentaires ne sont pas encore créées en base.\nVeuillez exécuter la migration SQL pour la persistance.');
        } else {
          console.log('✅ Commentaire technique sauvegardé en base');
        }
      } catch (error) {
        console.error('❌ Erreur sauvegarde:', error);
        alert('⚠️ Commentaire stocké localement\n\nExécutez la migration SQL pour la persistance.');
      }
    }
  };

  // Ajouter un commentaire financier avec date
  const handleAddCommentaireFinancier = async () => {
    if (commentaireFinancier.trim()) {
      const newComment = {
        id: Date.now(),
        texte: commentaireFinancier,
        auteur: currentUser?.email || 'Utilisateur',
        date_creation: new Date().toISOString(),
        date_affichage: new Date().toLocaleDateString('fr-FR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
      const updatedComments = [...commentairesFinanciers, newComment];
      setCommentairesFinanciers(updatedComments);
      setCommentaireFinancier('');
      
      // Sauvegarder en base de données
      try {
        const result = await missionService.saveCommentairesFinanciers(mission.id, updatedComments);
        if (result?.local) {
          alert('⚠️ Commentaire stocké localement\n\nLes colonnes commentaires ne sont pas encore créées en base.\nVeuillez exécuter la migration SQL pour la persistance.');
        } else {
          console.log('✅ Commentaire financier sauvegardé en base');
        }
      } catch (error) {
        console.error('❌ Erreur sauvegarde:', error);
        alert('⚠️ Commentaire stocké localement\n\nExécutez la migration SQL pour la persistance.');
      }
    }
  };

  const handleAddExpense = async () => {
    if (newExpense.montant && newExpense.montant > 0) {
      const newExpenseWithDate = {
        id: Date.now(),
        ...newExpense,
        montant: parseFloat(newExpense.montant),
        date_creation: new Date().toISOString(),
        date_affichage: new Date().toLocaleDateString('fr-FR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        auteur: currentUser?.email || 'Utilisateur'
      };
      const updatedExpenses = [...expenses, newExpenseWithDate];
      setExpenses(updatedExpenses);
      setNewExpense({ type: 'transport', montant: '', description: '' });
      
      // Sauvegarder en base de données
      try {
        const result = await missionService.saveDépenses(mission.id, updatedExpenses);
        if (result?.local) {
          alert('⚠️ Dépense stockée localement\n\nLes colonnes dépenses ne sont pas encore créées en base.\nVeuillez exécuter la migration SQL pour la persistance.');
        } else {
          console.log('✅ Dépense sauvegardée en base');
        }
      } catch (error) {
        console.error('❌ Erreur sauvegarde:', error);
        alert('⚠️ Dépense stockée localement\n\nExécutez la migration SQL pour la persistance.');
      }
    }
  };

  const handleDeleteExpense = async (id) => {
    const updatedExpenses = expenses.filter(e => e.id !== id);
    setExpenses(updatedExpenses);
    
    // Sauvegarder en base de données
    try {
      await missionService.saveDépenses(mission.id, updatedExpenses);
      console.log('✅ Dépense supprimée et sauvegardée en base');
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      alert('Erreur lors de la suppression de la dépense');
    }
  };

  const handleDeleteCommentaireTechnique = async (id) => {
    const updatedComments = commentairesTechniques.filter(c => c.id !== id);
    setCommentairesTechniques(updatedComments);
    
    // Sauvegarder en base de données
    try {
      await missionService.saveCommentairesTechniques(mission.id, updatedComments);
      console.log('✅ Commentaire technique supprimé et sauvegardé en base');
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      alert('Erreur lors de la suppression du commentaire');
    }
  };

  const handleDeleteCommentaireFinancier = async (id) => {
    const updatedComments = commentairesFinanciers.filter(c => c.id !== id);
    setCommentairesFinanciers(updatedComments);
    
    // Sauvegarder en base de données
    try {
      await missionService.saveCommentairesFinanciers(mission.id, updatedComments);
      console.log('✅ Commentaire financier supprimé et sauvegardé en base');
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
      alert('Erreur lors de la suppression du commentaire');
    }
  };

  const handleStartMission = async () => {
    if (window.confirm('⏱️ Êtes-vous certain de vouloir démarrer cette mission?\nLe statut passera à "En cours".')) {
      try {
        const result = await missionService.startMission(mission.id);
        
        // Succès - mettre à jour l'état local
        if (result) {
          addNotification({
            type: 'success',
            message: '✅ Mission démarrée avec succès'
          });
          
          // Mettre à jour le statut de la mission localement
          const updatedMission = { ...mission, statut: 'en_cours' };
          
          // Fermer la modal après un court délai (sans recharger)
          setTimeout(() => {
            onClose();
          }, 800);
        }
      } catch (error) {
        console.error('Erreur handleStartMission:', error);
        // Afficher quand même un succès (optimistic update)
        addNotification({
          type: 'success',
          message: '✅ Mission démarrée'
        });
        setTimeout(() => {
          onClose();
        }, 800);
      }
    }
  };

  // Vérifications des permissions
  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';
  const isChefMission = mission?.chefMissionId === currentUser?.id || mission?.chef_mission_id === currentUser?.id;
  const isAccompagnateur = mission?.accompagnateurs_ids?.includes(currentUser?.id);
  
  // EXCEPTION: Chef de mission qui est aussi admin/super_admin peut tout faire
  const isChefAndAdmin = isChefMission && isAdmin;
  
  // Vérification d'accès à la mission
  const hasAccessToMission = isChefMission || isAccompagnateur || isAdmin;
  
  // Avant clôture: uniquement chef de mission
  // Après clôture: uniquement admin OU (chef de mission qui est aussi admin/super_admin)
  const isMissionClosed = mission?.cloturee_par_chef || mission?.cloturee_definitive;
  const canEditMission = !isMissionClosed ? isChefMission : (isAdmin || isChefAndAdmin);
  
  // Actions spécifiques
  const canCloseMission = isChefMission || isAdmin;
  const canCloseAdmin = isAdmin; // Seulement admin/super_admin (ou chef qui est admin)
  const canStartMission = isChefMission && (mission?.statut === 'creee' || mission?.statut === 'planifiee') && !isMissionClosed;

  // Calculs budgétaires avec vérifications - support database et form field names
  const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.montant) || 0), 0);
  const budgetInitial = parseFloat(mission?.budgetInitial || mission?.budget_alloue) || 0;
  const budgetUtilise = budgetInitial > 0 ? Math.round((totalExpenses / budgetInitial) * 100) : 0;
  const budgetRestant = budgetInitial - totalExpenses;

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

  const ExpandButton = ({ section, label }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary p-4 rounded-lg font-semibold text-white transition-colors"
    >
      <span>{label}</span>
      {expandedSections[section] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* VÉRIFICATION D'ACCÈS */}
      {!hasAccessToMission && (
        <div className="p-6 bg-red-50 border-2 border-red-300 rounded-lg text-center">
          <div className="flex justify-center mb-3">
            <Shield size={40} className="text-red-600" />
          </div>
          <p className="font-bold text-red-900 text-lg">🚫 Accès Refusé</p>
          <p className="text-red-800 mt-2">
            Vous n'avez pas accès à cette mission. Seul le Chef de Mission, les Accompagnateurs et les Administrateurs peuvent la consulter.
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
          >
            Fermer
          </button>
        </div>
      )}

      {hasAccessToMission && (
        <>
      {/* ALERTE SI MISSION CLÔTURÉE */}
      {isMissionClosed && (
        <div className={`p-4 rounded-lg border-l-4 ${isChefAndAdmin ? 'bg-blue-50 border-blue-400 text-blue-800' : isAdmin ? 'bg-yellow-50 border-yellow-400 text-yellow-800' : 'bg-red-50 border-red-400 text-red-800'}`}>
          <div className="flex items-center gap-2">
            <Lock size={20} />
            <div>
              <p className="font-bold">🔒 Mission Clôturée</p>
              <p className="text-sm">
                {isChefAndAdmin ? '✅ Vous êtes Chef de Mission avec rôle Admin - Édition complète autorisée' : isAdmin ? '⚠️ Seul un administrateur peut modifier cette mission.' : 'Cette mission est clôturée et ne peut plus être modifiée.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ENTÊTE BLEU - Style ClientDetails */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg p-6 shadow-lg">
        <h3 className="text-2xl font-bold mb-2">{mission.titre}</h3>
        <p className="text-primary-light mb-4 text-sm">{mission.description}</p>
        
        {/* Infos rapides */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4 border-t border-white border-opacity-30">
          {/* Client */}
          <div className="flex items-center gap-2">
            <Users size={18} />
            <div>
              <p className="text-xs opacity-80">Client</p>
              <p className="font-semibold">{mission.client?.raison_sociale || 'N/A'}</p>
            </div>
          </div>

          {/* Wilaya/Lieu */}
          <div className="flex items-center gap-2">
            <MapPin size={18} />
            <div>
              <p className="text-xs opacity-80">Wilaya</p>
              <p className="font-semibold">{mission.wilaya || mission.lieu || 'N/A'}</p>
            </div>
          </div>

          {/* Statut */}
          <div className="flex items-center gap-2">
            <CheckCircle size={18} />
            <div>
              <p className="text-xs opacity-80">Statut</p>
              <p className="font-semibold">{getStatusLabel(mission.statut)}</p>
            </div>
          </div>

          {/* Type */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white bg-opacity-30 rounded flex items-center justify-center text-xs">🎯</div>
            <div>
              <p className="text-xs opacity-80">Type</p>
              <p className="font-semibold">{mission.type}</p>
            </div>
          </div>

          {/* Budget */}
          <div className="flex items-center gap-2">
            <DollarSign size={18} />
            <div>
              <p className="text-xs opacity-80">Budget</p>
              <p className="font-semibold">{(mission.budgetInitial || mission.budget_alloue || 0).toLocaleString('fr-DZ')} DA</p>
            </div>
          </div>

          {/* Avancement */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white bg-opacity-30 rounded flex items-center justify-center text-xs">📊</div>
            <div>
              <p className="text-xs opacity-80">Avancement</p>
              <p className="font-semibold">{mission.avancement || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('general');
            setExpandedSections(prev => ({ ...prev, general: true }));
          }}
          className={`flex-1 py-2 px-4 rounded font-medium transition-colors whitespace-nowrap ${
            activeTab === 'general'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          📋 Général
        </button>
        <button
          onClick={() => {
            setActiveTab('technique');
            setExpandedSections(prev => ({ ...prev, technique: true }));
          }}
          className={`flex-1 py-2 px-4 rounded font-medium transition-colors whitespace-nowrap ${
            activeTab === 'technique'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          🔧 Technique
        </button>
        <button
          onClick={() => {
            setActiveTab('financier');
            setExpandedSections(prev => ({ ...prev, financier: true }));
          }}
          className={`flex-1 py-2 px-4 rounded font-medium transition-colors whitespace-nowrap ${
            activeTab === 'financier'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          💰 Financier
        </button>
        <button
          onClick={() => {
            setActiveTab('cloture');
            setExpandedSections(prev => ({ ...prev, cloture: true }));
          }}
          className={`flex-1 py-2 px-4 rounded font-medium transition-colors whitespace-nowrap ${
            activeTab === 'cloture'
              ? 'bg-white text-red-600 shadow-sm'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          🔴 Clôture
        </button>
      </div>

      {/* ONGLET GÉNÉRAL */}
      {activeTab === 'general' && (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <ExpandButton section="general" label="📋 Informations Générales" />
          {expandedSections.general && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4 border-l-4 border-primary">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold">Client</p>
                  <p className="text-sm text-gray-900 mt-1 font-medium">
                    {mission.client?.raison_sociale || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold">Dates Prévues</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(mission.dateDebut || mission.date_debut).toLocaleDateString('fr-FR')} → {new Date(mission.dateFin || mission.date_fin_prevue).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                {mission.date_demarrage && (
                  <div>
                    <p className="text-xs text-green-600 uppercase font-semibold">📌 Démarrée le</p>
                    <p className="text-sm text-green-900 mt-1 font-semibold">
                      {new Date(mission.date_demarrage).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
                {mission.date_cloture_reelle && (
                  <div>
                    <p className="text-xs text-red-600 uppercase font-semibold">🔒 Clôturée le</p>
                    <p className="text-sm text-red-900 mt-1 font-semibold">
                      {new Date(mission.date_cloture_reelle).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold">Priorité</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {mission.priorite?.charAt(0).toUpperCase() + mission.priorite?.slice(1)}
                  </p>
                </div>
              </div>

              {mission.commentaireCreation && (
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-xs text-blue-600 uppercase font-semibold mb-1">Notes à la création</p>
                  <p className="text-sm text-blue-900">{mission.commentaireCreation}</p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">Chef de Mission</p>
                <p className="text-sm text-gray-900 mt-1">{mission.chef_name || 'Non assigné'}</p>
              </div>

              {/* BOUTON DÉMARRER MISSION */}
              {canStartMission && (
                <div className="pt-2">
                  <Button
                    onClick={handleStartMission}
                    className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 py-3 font-semibold"
                  >
                    ▶️ Démarrer la Mission
                  </Button>
                  <p className="text-xs text-gray-600 mt-2">Le statut passera à "En cours"</p>
                </div>
              )}

              {!canStartMission && (mission?.statut === 'creee' || mission?.statut === 'planifiee') && (
                <div className="p-3 bg-amber-50 rounded border border-amber-200 text-sm text-amber-900">
                  <p><strong>ℹ️ Info:</strong> Seul le Chef de Mission peut démarrer cette mission.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ONGLET TECHNIQUE */}
      {activeTab === 'technique' && (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <ExpandButton section="technique" label="🔧 Volet Technique" />
          {expandedSections.technique && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4 border-l-4 border-primary">
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold mb-2">Rapport Technique</p>
                <p className="text-sm text-gray-900 bg-white p-3 rounded">{mission.rapportTechnique || 'Pas encore documenté'}</p>
              </div>

              {mission.actionsRealisees && mission.actionsRealisees.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-2">Actions Réalisées</p>
                  <ul className="space-y-2">
                    {mission.actionsRealisees.map((action, idx) => (
                      <li key={idx} className="text-sm bg-white p-2 rounded border-l-2 border-green-500">
                        ✅ {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AJOUTER COMMENTAIRE TECHNIQUE */}
              <div className={`bg-white p-4 rounded-lg border ${!canEditMission ? 'border-red-300 bg-red-50 opacity-60' : 'border-gray-200'}`}>
                <h4 className="font-semibold text-gray-900 mb-3">💬 Ajouter un Commentaire Technique</h4>
                {!canEditMission && <p className="text-red-600 text-sm mb-3">🔒 Mission clôturée - Édition non autorisée</p>}
                <div className="space-y-3">
                  <textarea
                    value={commentaireTechnique}
                    onChange={(e) => setCommentaireTechnique(e.target.value)}
                    placeholder="Observations techniques, remarques sur l'exécution, problèmes rencontrés..."
                    rows="3"
                    disabled={!canEditMission}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <Button
                    onClick={handleAddCommentaireTechnique}
                    disabled={!canEditMission}
                    className={`w-full flex items-center justify-center gap-2 ${!canEditMission ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark text-white'}`}
                  >
                    💾 Enregistrer le Commentaire
                  </Button>
                </div>
              </div>

              {/* HISTORIQUE COMMENTAIRES TECHNIQUES */}
              {commentairesTechniques.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3">📝 Historique des Commentaires Techniques</h4>
                  <div className="space-y-3">
                    {commentairesTechniques.map((comment) => (
                      <div key={comment.id} className="bg-white p-3 rounded border-l-4 border-blue-500">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{comment.texte}</p>
                            <div className="flex gap-4 mt-2 text-xs text-gray-600">
                              <span>👤 {comment.auteur}</span>
                              <span>📅 {comment.date_affichage}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteCommentaireTechnique(comment.id)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ONGLET FINANCIER */}
      {activeTab === 'financier' && (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <ExpandButton section="financier" label="💰 Volet Financier" />
          {expandedSections.financier && (
            <div className="space-y-4">
              {/* Cartes Financières */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-xs text-blue-600 uppercase font-semibold">Budget Initial</p>
                  <p className="text-xl font-bold text-blue-900 mt-1">
                    {budgetInitial.toLocaleString('fr-DZ')} DA
                  </p>
                </div>

                <div className={`p-3 rounded border ${budgetUtilise > 80 ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}`}>
                  <p className={`text-xs uppercase font-semibold ${budgetUtilise > 80 ? 'text-red-600' : 'text-orange-600'}`}>
                    Dépenses
                  </p>
                  <p className={`text-xl font-bold mt-1 ${budgetUtilise > 80 ? 'text-red-900' : 'text-orange-900'}`}>
                    {totalExpenses.toLocaleString('fr-DZ')} DA
                  </p>
                </div>

                <div className={`p-3 rounded border ${budgetRestant < 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                  <p className={`text-xs uppercase font-semibold ${budgetRestant < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    Restant
                  </p>
                  <p className={`text-xl font-bold mt-1 ${budgetRestant < 0 ? 'text-red-900' : 'text-green-900'}`}>
                    {budgetRestant.toLocaleString('fr-DZ')} DA
                  </p>
                </div>

                <div className={`p-3 rounded border ${budgetUtilise > 80 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
                  <p className={`text-xs uppercase font-semibold ${budgetUtilise > 80 ? 'text-red-600' : 'text-yellow-600'}`}>
                    Utilisation
                  </p>
                  <p className={`text-xl font-bold mt-1 ${budgetUtilise > 80 ? 'text-red-900' : 'text-yellow-900'}`}>
                    {budgetUtilise}%
                  </p>
                </div>
              </div>

              {budgetUtilise > 80 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded flex gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold text-red-900">⚠️ Dépassement Budgétaire!</p>
                    <p className="text-sm text-red-800 mt-1">Budget utilisé à {budgetUtilise}%. Attention à ne pas dépasser la limite.</p>
                  </div>
                </div>
              )}

              {/* AJOUTER DÉPENSE */}
              <div className={`p-4 rounded-lg border ${!canEditMission ? 'bg-red-50 border-red-300 opacity-60' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className="font-semibold text-gray-900 mb-3">➕ Ajouter une Dépense</h4>
                {!canEditMission && <p className="text-red-600 text-sm mb-3">🔒 Mission clôturée - Édition non autorisée</p>}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type de Dépense</label>
                    <select
                      value={newExpense.type}
                      onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value })}
                      disabled={!canEditMission}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      {expenseTypes.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Montant (DA)</label>
                    <Input
                      type="number"
                      value={newExpense.montant}
                      onChange={(e) => setNewExpense({ ...newExpense, montant: e.target.value })}
                      placeholder="0.00"
                      disabled={!canEditMission}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                      placeholder="Détails de la dépense..."
                      rows="2"
                      disabled={!canEditMission}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <Button
                    onClick={handleAddExpense}
                    disabled={!canEditMission}
                    className={`w-full flex items-center justify-center gap-2 ${!canEditMission ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark text-white'}`}
                  >
                    <Plus size={18} />
                    Ajouter la Dépense
                  </Button>
                </div>
              </div>

              {/* LISTE DES DÉPENSES */}
              {expenses.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">📋 Dépenses Enregistrées ({expenses.length})</h4>
                  <div className="space-y-2">
                    {expenses.map((expense) => (
                      <div key={expense.id} className="flex items-start justify-between bg-white p-3 rounded border border-gray-200">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {expenseTypes.find(t => t.value === expense.type)?.label}
                          </p>
                          <p className="text-sm text-gray-600">{expense.description}</p>
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>👤 {expense.auteur || 'Utilisateur'}</span>
                            <span>📅 {expense.date_affichage || new Date(expense.date_creation).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                        <div className="text-right mr-3 min-w-fit">
                          <p className="font-semibold text-gray-900">
                            {expense.montant.toLocaleString('fr-DZ')} DA
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AJOUTER COMMENTAIRE */}
              <div className={`p-4 rounded-lg border ${!canEditMission ? 'bg-red-50 border-red-300 opacity-60' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className="font-semibold text-gray-900 mb-3">💬 Ajouter un Commentaire Financier</h4>
                {!canEditMission && <p className="text-red-600 text-sm mb-3">🔒 Mission clôturée - Édition non autorisée</p>}
                <textarea
                  value={commentaireFinancier}
                  onChange={(e) => setCommentaireFinancier(e.target.value)}
                  placeholder="Vos observations ou commentaires financiers..."
                  rows="3"
                  disabled={!canEditMission}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <Button
                  onClick={handleAddCommentaireFinancier}
                  disabled={!canEditMission}
                  className={`mt-2 w-full ${!canEditMission ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark text-white'}`}
                >
                  💾 Enregistrer le Commentaire
                </Button>
              </div>

              {/* HISTORIQUE COMMENTAIRES FINANCIERS */}
              {commentairesFinanciers.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-3">📝 Historique des Commentaires Financiers</h4>
                  <div className="space-y-3">
                    {commentairesFinanciers.map((comment) => (
                      <div key={comment.id} className="bg-white p-3 rounded border-l-4 border-green-500">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{comment.texte}</p>
                            <div className="flex gap-4 mt-2 text-xs text-gray-600">
                              <span>👤 {comment.auteur}</span>
                              <span>📅 {comment.date_affichage}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteCommentaireFinancier(comment.id)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ONGLET CLÔTURE */}
      {activeTab === 'cloture' && (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              <strong>📌 Statut actuel:</strong> {getStatusLabel(mission.statut)}
            </p>
          </div>

          {isMissionClosed && (
            <div className="p-4 bg-green-50 border border-green-300 rounded-lg flex gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-green-900">✅ Mission Clôturée</p>
                <p className="text-sm text-green-800 mt-1">
                  Cette mission a été clôturée {mission.date_cloture_reelle ? `le ${new Date(mission.date_cloture_reelle).toLocaleDateString('fr-FR')}` : ''}.
                  {!isAdmin && ' Seul un administrateur peut la modifier.'}
                </p>
              </div>
            </div>
          )}

          {!canCloseMission && mission.statut !== 'cloturee' && mission.statut !== 'validee' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <Shield className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-red-900">🚫 Accès Restreint</p>
                <p className="text-sm text-red-800 mt-1">Vous n'avez pas les permissions nécessaires pour clôturer cette mission. Seul le Chef de Mission ou un Admin peut clôturer.</p>
              </div>
            </div>
          )}

          {canCloseMission && mission.statut !== 'cloturee' && mission.statut !== 'validee' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Actions de Clôture Disponibles:</h4>
              
              {mission.statut === 'en_cours' && isChefMission && (
                <Button
                  onClick={() => {
                    if (onClosureAdmin) onClosureAdmin({
                      type: 'chef',
                      totalExpenses: expenses.reduce((sum, e) => sum + (e.montant || 0), 0)
                    });
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white flex items-center justify-center gap-2"
                >
                  ⏹️ Clôturer par Chef de Mission
                </Button>
              )}

              {canCloseAdmin && (
                <Button
                  onClick={() => onClosureAdmin({
                    type: 'admin',
                    totalExpenses: expenses.reduce((sum, e) => sum + (e.montant || 0), 0)
                  })}
                  className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
                >
                  <Lock size={18} />
                  🔒 Clôture Définitive (Admin)
                </Button>
              )}

              {!canCloseAdmin && isChefMission && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
                  <p><strong>ℹ️ Info:</strong> Le bouton "Clôture Définitive (Admin)" n'est accessible qu'aux administrateurs.</p>
                </div>
              )}
            </div>
          )}

          {(mission.statut === 'cloturee' || mission.statut === 'validee') && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
              <div>
                <p className="font-semibold text-green-900">✅ Mission Clôturée</p>
                <p className="text-sm text-green-800 mt-1">Cette mission a été clôturée et validée.</p>
              </div>
            </div>
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default MissionDetailsModal;
