import React, { useState } from 'react';
import { Plus, Trash2, DollarSign, BarChart3, TrendingUp } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

const MissionFinances = ({ missions }) => {
  const [selectedMissionId, setSelectedMissionId] = useState(missions[0]?.id || null);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    type: 'transport',
    montant: '',
    justificatif: null
  });

  const selectedMission = missions.find(m => m.id === selectedMissionId);

  const expenseTypes = [
    { value: 'transport', label: '🚗 Transport / Fuel' },
    { value: 'hotel', label: '🏨 Hôtel' },
    { value: 'repas', label: '🍽️ Repas' },
    { value: 'divers', label: '📦 Divers' }
  ];

  const handleAddExpense = () => {
    if (newExpense.montant && selectedMissionId) {
      setExpenses([...expenses, {
        id: Date.now(),
        missionId: selectedMissionId,
        ...newExpense,
        montant: parseFloat(newExpense.montant)
      }]);
      setNewExpense({ type: 'transport', montant: '', justificatif: null });
    }
  };

  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const calculateTotalExpenses = () => {
    return expenses
      .filter(e => e.missionId === selectedMissionId)
      .reduce((sum, e) => sum + e.montant, 0);
  };

  const getMissionStatistics = () => {
    const stats = {
      totalMissions: missions.length,
      totalBudget: missions.reduce((sum, m) => sum + m.budgetInitial, 0),
      totalExpenses: missions.reduce((sum, m) => sum + m.dépenses, 0),
      averageBudgetUtilization: 0
    };

    if (stats.totalBudget > 0) {
      stats.averageBudgetUtilization = Math.round((stats.totalExpenses / stats.totalBudget) * 100);
    }

    return stats;
  };

  const stats = getMissionStatistics();
  const currentExpenses = calculateTotalExpenses();
  const budgetRemaining = (selectedMission?.budgetInitial || 0) - currentExpenses;
  const budgetUsagePercent = selectedMission?.budgetInitial > 0 
    ? Math.round((currentExpenses / selectedMission.budgetInitial) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Global Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Missions</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalMissions}</p>
            </div>
            <DollarSign className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Budget Total</p>
              <p className="text-2xl font-bold text-green-900">{stats.totalBudget.toLocaleString('fr-FR')} €</p>
            </div>
            <BarChart3 className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Dépensé</p>
              <p className="text-2xl font-bold text-amber-900">{stats.totalExpenses.toLocaleString('fr-FR')} €</p>
            </div>
            <TrendingUp className="text-amber-500" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Utilisation Moy.</p>
              <p className="text-2xl font-bold text-purple-900">{stats.averageBudgetUtilization}%</p>
            </div>
            <BarChart3 className="text-purple-500" size={32} />
          </div>
        </div>
      </div>

      {/* Mission Selection */}
      {missions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Sélectionner une Mission</h3>
          <select
            value={selectedMissionId}
            onChange={(e) => setSelectedMissionId(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {missions.map(mission => (
              <option key={mission.id} value={mission.id}>
                {mission.titre} - {mission.client?.raison_sociale}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedMission && (
        <>
          {/* Mission Budget Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Suivi du Budget - {selectedMission.titre}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm text-gray-600">Budget Alloué</p>
                <p className="text-2xl font-bold text-blue-900">{selectedMission.budgetInitial.toLocaleString('fr-FR')} €</p>
              </div>

              <div className={`${budgetRemaining >= 0 ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'} p-4 rounded-lg border-l-4`}>
                <p className="text-sm text-gray-600">Reste</p>
                <p className={`text-2xl font-bold ${budgetRemaining >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                  {budgetRemaining.toLocaleString('fr-FR')} €
                </p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                <p className="text-sm text-gray-600">Utilisation</p>
                <p className="text-2xl font-bold text-purple-900">{budgetUsagePercent}%</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Progression du Budget</p>
                <p className="text-sm font-bold text-gray-900">
                  {currentExpenses.toLocaleString('fr-FR')} € / {selectedMission.budgetInitial.toLocaleString('fr-FR')} €
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
          </div>

          {/* Add Expense Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ajouter une Dépense</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de Dépense</label>
                  <select
                    value={newExpense.type}
                    onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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

                <div className="flex items-end">
                  <Button
                    onClick={handleAddExpense}
                    className="w-full bg-primary text-white hover:bg-primary-dark flex items-center justify-center gap-2 py-2"
                  >
                    <Plus size={18} />
                    Ajouter
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Expenses List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Dépenses Enregistrées</h3>
            
            {expenses.filter(e => e.missionId === selectedMissionId).length === 0 ? (
              <p className="text-gray-600 text-center py-8">Aucune dépense enregistrée</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-bold text-gray-900">Type</th>
                      <th className="px-4 py-2 text-right font-bold text-gray-900">Montant</th>
                      <th className="px-4 py-2 text-center font-bold text-gray-900">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {expenses
                      .filter(e => e.missionId === selectedMissionId)
                      .map(expense => (
                        <tr key={expense.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            {expenseTypes.find(t => t.value === expense.type)?.label}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            {expense.montant.toLocaleString('fr-FR')} €
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot className="bg-gray-100 border-t-2">
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-900">Total</td>
                      <td className="px-4 py-3 text-right font-bold text-primary text-lg">
                        {currentExpenses.toLocaleString('fr-FR')} €
                      </td>
                      <td className="px-4 py-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Budget Breakdown by Type */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Détails des Dépenses par Type</h3>
            
            <div className="space-y-3">
              {expenseTypes.map(type => {
                const typeExpenses = expenses
                  .filter(e => e.missionId === selectedMissionId && e.type === type.value)
                  .reduce((sum, e) => sum + e.montant, 0);

                return (
                  <div key={type.value}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-700 font-medium">{type.label}</span>
                      <span className="text-gray-900 font-bold">
                        {typeExpenses.toLocaleString('fr-FR')} €
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: currentExpenses > 0 
                            ? `${(typeExpenses / currentExpenses) * 100}%`
                            : '0%'
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MissionFinances;
