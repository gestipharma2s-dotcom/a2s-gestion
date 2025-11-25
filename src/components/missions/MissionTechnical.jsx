import React, { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';

const MissionTechnical = ({ mission, onUpdate }) => {
  const [technicalData, setTechnicalData] = useState({
    rapportTechnique: mission?.rapportTechnique || '',
    actionsRealisees: mission?.actionsRealisees || [],
    logicielsMateriels: mission?.logicielsMateriels || [],
    problemesResolutions: mission?.problemesResolutions || []
  });

  const [expandedSections, setExpandedSections] = useState({
    rapport: true,
    actions: true,
    logiciels: true,
    problemes: true
  });

  const [newAction, setNewAction] = useState('');
  const [newLogiciel, setNewLogiciel] = useState({ type: '', nom: '', version: '' });
  const [newProbleme, setNewProbleme] = useState({ probleme: '', solution: '' });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleRapportChange = (e) => {
    const rapport = e.target.value;
    setTechnicalData(prev => ({ ...prev, rapportTechnique: rapport }));
    if (onUpdate) {
      onUpdate({ ...technicalData, rapportTechnique: rapport });
    }
  };

  const addAction = () => {
    if (newAction.trim()) {
      const updatedActions = [...technicalData.actionsRealisees, {
        id: Date.now(),
        description: newAction,
        dateAjout: new Date().toISOString().split('T')[0]
      }];
      setTechnicalData(prev => ({ ...prev, actionsRealisees: updatedActions }));
      setNewAction('');
      if (onUpdate) {
        onUpdate({ ...technicalData, actionsRealisees: updatedActions });
      }
    }
  };

  const removeAction = (id) => {
    const updatedActions = technicalData.actionsRealisees.filter(a => a.id !== id);
    setTechnicalData(prev => ({ ...prev, actionsRealisees: updatedActions }));
    if (onUpdate) {
      onUpdate({ ...technicalData, actionsRealisees: updatedActions });
    }
  };

  const addLogiciel = () => {
    if (newLogiciel.nom.trim() && newLogiciel.type) {
      const updatedLogiciels = [...technicalData.logicielsMateriels, {
        id: Date.now(),
        type: newLogiciel.type,
        nom: newLogiciel.nom,
        version: newLogiciel.version,
        dateInstallation: new Date().toISOString().split('T')[0]
      }];
      setTechnicalData(prev => ({ ...prev, logicielsMateriels: updatedLogiciels }));
      setNewLogiciel({ type: '', nom: '', version: '' });
      if (onUpdate) {
        onUpdate({ ...technicalData, logicielsMateriels: updatedLogiciels });
      }
    }
  };

  const removeLogiciel = (id) => {
    const updatedLogiciels = technicalData.logicielsMateriels.filter(l => l.id !== id);
    setTechnicalData(prev => ({ ...prev, logicielsMateriels: updatedLogiciels }));
    if (onUpdate) {
      onUpdate({ ...technicalData, logicielsMateriels: updatedLogiciels });
    }
  };

  const addProbleme = () => {
    if (newProbleme.probleme.trim() && newProbleme.solution.trim()) {
      const updatedProblemes = [...technicalData.problemesResolutions, {
        id: Date.now(),
        probleme: newProbleme.probleme,
        solution: newProbleme.solution,
        dateSignalement: new Date().toISOString().split('T')[0],
        statut: 'resolu'
      }];
      setTechnicalData(prev => ({ ...prev, problemesResolutions: updatedProblemes }));
      setNewProbleme({ probleme: '', solution: '' });
      if (onUpdate) {
        onUpdate({ ...technicalData, problemesResolutions: updatedProblemes });
      }
    }
  };

  const removeProbleme = (id) => {
    const updatedProblemes = technicalData.problemesResolutions.filter(p => p.id !== id);
    setTechnicalData(prev => ({ ...prev, problemesResolutions: updatedProblemes }));
    if (onUpdate) {
      onUpdate({ ...technicalData, problemesResolutions: updatedProblemes });
    }
  };

  const ExpandButton = ({ section, label, count }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 p-4 rounded-lg font-semibold text-white transition-colors"
    >
      <div className="flex items-center gap-2">
        <span>{label}</span>
        {count !== undefined && (
          <span className="bg-blue-700 text-white text-xs font-bold px-2 py-1 rounded-full">
            {count}
          </span>
        )}
      </div>
      {expandedSections[section] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* SECTION 1: RAPPORT TECHNIQUE */}
      <div className="space-y-2">
        <ExpandButton section="rapport" label="📋 Rapport Technique" />
        {expandedSections.rapport && (
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Résumé technique de la mission
              </label>
              <textarea
                value={technicalData.rapportTechnique}
                onChange={handleRapportChange}
                placeholder="Décrivez le rapport technique, les observations, les configurations effectuées..."
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-blue-600 mt-1">
                💡 Inclure: architecture, configurations, paramètres, résultats de tests
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: ACTIONS RÉALISÉES */}
      <div className="space-y-2">
        <ExpandButton 
          section="actions" 
          label="✅ Actions Réalisées" 
          count={technicalData.actionsRealisees.length}
        />
        {expandedSections.actions && (
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500 space-y-3">
            {/* Ajouter action */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                placeholder="Décrire l'action réalisée..."
                onKeyPress={(e) => e.key === 'Enter' && addAction()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Button
                onClick={addAction}
                className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded flex items-center gap-2"
              >
                <Plus size={18} />
                Ajouter
              </Button>
            </div>

            {/* Liste actions */}
            {technicalData.actionsRealisees.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucune action enregistrée</p>
            ) : (
              <div className="space-y-2">
                {technicalData.actionsRealisees.map((action) => (
                  <div
                    key={action.id}
                    className="bg-white p-3 rounded border border-green-200 flex items-start justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">✓ {action.description}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(action.dateAjout).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <button
                      onClick={() => removeAction(action.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 3: LOGICIELS & MATÉRIELS */}
      <div className="space-y-2">
        <ExpandButton 
          section="logiciels" 
          label="💻 Logiciels & Matériels Installés" 
          count={technicalData.logicielsMateriels.length}
        />
        {expandedSections.logiciels && (
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500 space-y-3">
            {/* Formulaire ajout */}
            <div className="bg-white p-3 rounded border border-purple-200 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    value={newLogiciel.type}
                    onChange={(e) => setNewLogiciel(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Choisir...</option>
                    <option value="logiciel">💾 Logiciel</option>
                    <option value="materiel">⚙️ Matériel</option>
                    <option value="driver">🔌 Driver</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={newLogiciel.nom}
                    onChange={(e) => setNewLogiciel(prev => ({ ...prev, nom: e.target.value }))}
                    placeholder="Ex: Windows Server 2022"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Version</label>
                  <input
                    type="text"
                    value={newLogiciel.version}
                    onChange={(e) => setNewLogiciel(prev => ({ ...prev, version: e.target.value }))}
                    placeholder="Ex: 10.0.20348"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <Button
                onClick={addLogiciel}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 rounded flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Ajouter Logiciel/Matériel
              </Button>
            </div>

            {/* Liste */}
            {technicalData.logicielsMateriels.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun logiciel/matériel enregistré</p>
            ) : (
              <div className="space-y-2">
                {technicalData.logicielsMateriels.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-3 rounded border border-purple-200 flex items-start justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {item.type === 'logiciel' && '💾'}
                          {item.type === 'materiel' && '⚙️'}
                          {item.type === 'driver' && '🔌'}
                        </span>
                        <p className="font-medium text-gray-900">{item.nom}</p>
                        {item.version && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            v{item.version}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Installé le: {new Date(item.dateInstallation).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <button
                      onClick={() => removeLogiciel(item.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 4: PROBLÈMES ET RÉSOLUTIONS */}
      <div className="space-y-2">
        <ExpandButton 
          section="problemes" 
          label="⚠️ Problèmes & Résolutions" 
          count={technicalData.problemesResolutions.length}
        />
        {expandedSections.problemes && (
          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500 space-y-3">
            {/* Formulaire ajout */}
            <div className="bg-white p-3 rounded border border-orange-200 space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Problème rencontré *</label>
                <textarea
                  value={newProbleme.probleme}
                  onChange={(e) => setNewProbleme(prev => ({ ...prev, probleme: e.target.value }))}
                  placeholder="Décrire le problème en détail..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Solution appliquée *</label>
                <textarea
                  value={newProbleme.solution}
                  onChange={(e) => setNewProbleme(prev => ({ ...prev, solution: e.target.value }))}
                  placeholder="Comment vous avez résolu le problème..."
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <Button
                onClick={addProbleme}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Ajouter Problème/Solution
              </Button>
            </div>

            {/* Liste */}
            {technicalData.problemesResolutions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun problème enregistré</p>
            ) : (
              <div className="space-y-2">
                {technicalData.problemesResolutions.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white p-3 rounded border border-orange-200 space-y-2 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-2">
                          <span className="text-lg mt-1">⚠️</span>
                          <div>
                            <p className="font-medium text-gray-900">{item.probleme}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              Signalé le: {new Date(item.dateSignalement).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeProbleme(item.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="bg-green-50 border border-green-200 p-2 rounded ml-6">
                      <p className="text-xs font-semibold text-green-900 mb-1">✓ Solution:</p>
                      <p className="text-sm text-gray-700">{item.solution}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Conseil:</strong> Documentez bien tous les détails techniques pour faciliter la maintenance future et les audits.
        </p>
      </div>
    </div>
  );
};

export default MissionTechnical;
