import React, { useState, useEffect } from 'react';
import { Download, Edit, ChevronDown, ChevronUp, Plus, Trash2, DollarSign, Check, XCircle } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

const MissionDetailsModal = ({ mission, tab = 'technique', onClose, onValidate, onClosure, onRemove, isAdmin }) => {
  const [activeTab, setActiveTab] = useState(tab);
  const [commentaire, setCommentaire] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    type: 'transport',
    montant: '',
    description: ''
  });
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    technique: true,
    financier: activeTab === 'financier'
  });

  // 🔍 Debug: Vérifier les props reçus
  useEffect(() => {
    console.log('MissionDetailsModal props:', { isAdmin, onRemove: !!onRemove, onValidate: !!onValidate, onClosure: !!onClosure, missionStatut: mission?.statut });
  }, [isAdmin, onRemove, onValidate, onClosure, mission?.statut]);

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

  const handleAddExpense = () => {
    if (newExpense.montant && newExpense.montant > 0) {
      setExpenses([...expenses, {
        id: Date.now(),
        ...newExpense,
        montant: parseFloat(newExpense.montant)
      }]);
      setNewExpense({ type: 'transport', montant: '', description: '' });
    }
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.montant, 0);
  const budgetRemaining = mission.budgetInitial - totalExpenses;
  const budgetUsagePercent = mission.budgetInitial > 0 
    ? Math.round((totalExpenses / mission.budgetInitial) * 100)
    : 0;

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
    <div className="space-y-4 max-h-[80vh] overflow-y-auto">
      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg overflow-x-auto">
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

      {/* ONGLET TECHNIQUE */}
      {activeTab === 'technique' && (
        <div className="space-y-4">
          {/* Section Générale */}
          <div>
            <ExpandButton section="general" label="📋 Informations Générales" />
            {expandedSections.general && (
              <div className="bg-gray-50 p-4 rounded-lg mt-2 space-y-3 border-l-4 border-primary">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Client</p>
                    <p className="font-semibold text-gray-900">{mission.client?.raison_sociale}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-semibold text-gray-900">{mission.type}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Lieu</p>
                  <p className="font-semibold text-gray-900">{mission.lieu}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Début</p>
                    <p className="font-semibold">{new Date(mission.dateDebut).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fin</p>
                    <p className="font-semibold">{new Date(mission.dateFin).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Avancement</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${mission.avancement}%` }}
                      ></div>
                    </div>
                    <span className="font-semibold text-gray-900 w-10">{mission.avancement}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section Technique */}
          <div>
            <ExpandButton section="technique" label="🔧 Détails Techniques" />
            {expandedSections.technique && (
              <div className="bg-blue-50 p-4 rounded-lg mt-2 space-y-3 border-l-4 border-blue-500">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-gray-900 bg-white p-2 rounded">{mission.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">💬 Commentaire Technique</label>
                  <textarea
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    placeholder="Entrez vos observations techniques..."
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded"
                  >
                    Enregistrer Commentaire
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Durée prévue</p>
                    <p className="font-semibold text-gray-900">{mission.dureePrevue} jour(s)</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Durée réelle</p>
                    <p className="font-semibold text-gray-900">{mission.durationReelle} jour(s)</p>
                  </div>
                </div>

                {mission.participants && mission.participants.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Participants</p>
                    <div className="flex flex-wrap gap-2">
                      {mission.participants.map(p => (
                        <span key={p.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {p.nom} ({p.role})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ONGLET FINANCIER */}
      {activeTab === 'financier' && (
        <div className="space-y-4">
          {/* Budget Overview */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 border border-blue-200 p-3 rounded">
              <p className="text-xs text-blue-600 font-semibold">Budget</p>
              <p className="text-lg font-bold text-blue-900">{mission.budgetInitial.toLocaleString('fr-FR')} €</p>
            </div>
            <div className={`${budgetRemaining >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border p-3 rounded`}>
              <p className={`text-xs font-semibold ${budgetRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Reste
              </p>
              <p className={`text-lg font-bold ${budgetRemaining >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {budgetRemaining.toLocaleString('fr-FR')} €
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 p-3 rounded">
              <p className="text-xs text-purple-600 font-semibold">Utilisation</p>
              <p className="text-lg font-bold text-purple-900">{budgetUsagePercent}%</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Progression du Budget</p>
              <p className="text-sm font-bold">
                {totalExpenses.toLocaleString('fr-FR')} € / {mission.budgetInitial.toLocaleString('fr-FR')} €
              </p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all ${
                  budgetRemaining >= 0 ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-red-500 to-red-400'
                }`}
                style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
              ></div>
            </div>
            {budgetRemaining < 0 && (
              <p className="text-red-600 text-sm font-semibold mt-2">
                ⚠️ Dépassement: {Math.abs(budgetRemaining).toLocaleString('fr-FR')} €
              </p>
            )}
          </div>

          {/* Ajouter Dépense */}
          <div className="bg-white border-2 border-green-200 p-4 rounded-lg">
            <h4 className="font-bold text-gray-900 mb-3">➕ Ajouter une Dépense</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newExpense.type}
                    onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {expenseTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
                  <Input
                    type="number"
                    value={newExpense.montant}
                    onChange={(e) => setNewExpense({ ...newExpense, montant: e.target.value })}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder="Détail de la dépense..."
                />
              </div>

              <Button
                onClick={handleAddExpense}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Ajouter Dépense
              </Button>
            </div>
          </div>

          {/* Liste des Dépenses */}
          <div className="bg-white border-2 border-gray-200 p-4 rounded-lg">
            <h4 className="font-bold text-gray-900 mb-3">📋 Dépenses Enregistrées</h4>
            
            {expenses.length === 0 ? (
              <p className="text-gray-600 text-center py-4">Aucune dépense enregistrée</p>
            ) : (
              <div className="space-y-2">
                {expenses.map(expense => (
                  <div key={expense.id} className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {expenseTypes.find(t => t.value === expense.type)?.label}
                      </p>
                      {expense.description && (
                        <p className="text-sm text-gray-600">{expense.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <p className="font-bold text-gray-900 min-w-24 text-right">
                        {expense.montant.toLocaleString('fr-FR')} €
                      </p>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Total */}
                <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-3 rounded-lg font-bold flex justify-between mt-3">
                  <span>Total Dépenses:</span>
                  <span>{totalExpenses.toLocaleString('fr-FR')} €</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ONGLET CLÔTURE */}
      {activeTab === 'cloture' && (
        <div className="space-y-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <h3 className="font-bold text-red-900 mb-2">🔴 Statut Clôture</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-red-700 font-semibold">Statut Actuel</p>
                <p className="font-bold text-lg text-red-600">{mission?.cloturee_par_chef ? '✓ Clôturé Chef' : '⏳ En attente'}</p>
              </div>
              <div>
                <p className="text-xs text-red-700 font-semibold">Validation Admin</p>
                <p className="font-bold text-lg text-red-600">{mission?.cloturee_definitive ? '✓ Validé' : '⏳ En attente'}</p>
              </div>
            </div>
          </div>

          {/* Commentaire Chef */}
          {mission?.commentaire_clot_chef && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded">
              <h3 className="font-semibold text-blue-900 mb-2">💬 Commentaire Chef de Mission</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{mission.commentaire_clot_chef}</p>
              <p className="text-xs text-blue-600 mt-2">
                Date: {mission?.date_clot_chef ? new Date(mission.date_clot_chef).toLocaleDateString('fr-FR') : 'N/A'}
              </p>
            </div>
          )}

          {/* Commentaire Admin */}
          {mission?.commentaire_clot_admin && (
            <div className="bg-purple-50 border border-purple-200 p-4 rounded">
              <h3 className="font-semibold text-purple-900 mb-2">📝 Commentaire Admin (Clôture Définitive)</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{mission.commentaire_clot_admin}</p>
              <p className="text-xs text-purple-600 mt-2">
                Date: {mission?.date_clot_definitive ? new Date(mission.date_clot_definitive).toLocaleDateString('fr-FR') : 'N/A'}
              </p>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-gray-50 border border-gray-200 p-4 rounded">
            <h3 className="font-semibold text-gray-900 mb-4">📅 Timeline Clôture</h3>
            <div className="space-y-3">
              {/* Étape 1 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${mission?.cloturee_par_chef ? 'bg-green-500' : 'bg-gray-400'}`}>
                    1
                  </div>
                  {mission?.cloturee_definitive && <div className="w-1 h-8 bg-green-300" />}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Chef de Mission clôt</p>
                  <p className="text-sm text-gray-600">{mission?.date_clot_chef ? new Date(mission.date_clot_chef).toLocaleDateString('fr-FR') : 'En attente'}</p>
                </div>
              </div>

              {/* Étape 2 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${mission?.cloturee_definitive ? 'bg-green-500' : 'bg-gray-400'}`}>
                    2
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Admin valide définitivement</p>
                  <p className="text-sm text-gray-600">{mission?.date_clot_definitive ? new Date(mission.date_clot_definitive).toLocaleDateString('fr-FR') : 'En attente'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Infos supplémentaires */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Une mission clôturée par le chef de mission ne peut être modifiée que par un administrateur jusqu'à la validation définitive.
            </p>
          </div>
        </div>
      )}

      {/* Footer Buttons */}
      <div className="flex gap-3 pt-4 border-t flex-col sm:flex-row">
        <Button
          onClick={onClose}
          className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-lg py-2 font-medium"
        >
          Fermer
        </Button>
        
        {/* ✅ Bouton VALIDER - Admin uniquement, si statut !== 'validee' */}
        {isAdmin && onValidate && mission.statut !== 'validee' && (
          <Button
            onClick={() => {
              onValidate(mission);
              onClose();
            }}
            className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg py-2 font-medium flex items-center justify-center gap-2"
            title="Valider cette mission"
          >
            <Check size={18} />
            Valider
          </Button>
        )}
        
        {/* ✅ Bouton CLÔTURER - Admin uniquement, si statut !== 'cloturee' */}
        {isAdmin && onClosure && mission.statut !== 'cloturee' && (
          <Button
            onClick={() => {
              onClosure(mission);
              onClose();
            }}
            className="flex-1 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg py-2 font-medium flex items-center justify-center gap-2"
            title="Clôturer cette mission"
          >
            <XCircle size={18} />
            Clôturer
          </Button>
        )}
        
        {/* ✅ Bouton SUPPRIMER - Admin uniquement, TOUJOURS visible */}
        {isAdmin && onRemove && (
          <Button
            onClick={() => {
              onRemove(mission);
              onClose();
            }}
            className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg py-2 font-medium flex items-center justify-center gap-2"
            title="Supprimer cette mission (Admin - Irréversible)"
          >
            <Trash2 size={18} />
            Supprimer
          </Button>
        )}
        
        <Button
          className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white hover:opacity-90 rounded-lg py-2 font-medium flex items-center justify-center gap-2"
        >
          <Download size={18} />
          Exporter
        </Button>
      </div>
    </div>
  );
};

export default MissionDetailsModal;
