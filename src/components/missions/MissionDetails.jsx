import React, { useState } from 'react';
import { Download, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../common/Button';

const MissionDetails = ({ mission, onEdit, onClose, getStatusLabel }) => {
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    technique: false,
    financier: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const downloadPDF = () => {
    // TODO: Implémenter export PDF
    console.log('Télécharger PDF');
  };

  const ExpandButton = ({ section, label }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 p-4 rounded-lg font-semibold text-gray-900 transition-colors"
    >
      <span>{label}</span>
      {expandedSections[section] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </button>
  );

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {/* Section Générale */}
      <div>
        <ExpandButton section="general" label="📋 Informations Générales" />
        {expandedSections.general && (
          <div className="bg-gray-50 p-4 rounded-lg mt-2 space-y-3 border-l-4 border-primary">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Statut</p>
                <span className={`inline-block px-2 py-1 rounded text-sm font-semibold ${
                  mission.statut === 'validee' ? 'bg-green-100 text-green-800' :
                  mission.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {getStatusLabel(mission.statut)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Priorité</p>
                <p className="font-semibold text-gray-900">{mission.priorite?.toUpperCase()}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Client</p>
              <p className="font-semibold text-gray-900">{mission.client?.raison_sociale}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Lieu</p>
              <p className="font-semibold text-gray-900">{mission.lieu}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Date de début</p>
                <p className="font-semibold text-gray-900">
                  {new Date(mission.dateDebut).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date de fin</p>
                <p className="font-semibold text-gray-900">
                  {new Date(mission.dateFin).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">Avancement</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${mission.avancement}%` }}
                  ></div>
                </div>
                <span className="font-semibold text-gray-900">{mission.avancement}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section Technique */}
      <div>
        <ExpandButton section="technique" label="🔧 Informations Techniques" />
        {expandedSections.technique && (
          <div className="bg-blue-50 p-4 rounded-lg mt-2 space-y-3 border-l-4 border-blue-500">
            <div>
              <p className="text-sm text-gray-600">Type de mission</p>
              <p className="font-semibold text-gray-900">{mission.type}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Participants</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {mission.participants?.map(p => (
                  <span key={p.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {p.nom} - {p.role}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Description</p>
              <p className="text-gray-900">{mission.description}</p>
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
          </div>
        )}
      </div>

      {/* Section Financière */}
      <div>
        <ExpandButton section="financier" label="💰 Informations Financières" />
        {expandedSections.financier && (
          <div className="bg-green-50 p-4 rounded-lg mt-2 space-y-3 border-l-4 border-green-500">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Budget initial</p>
                <p className="font-semibold text-gray-900">
                  {mission.budgetInitial.toLocaleString('fr-FR')} €
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Dépenses</p>
                <p className={`font-semibold ${mission.dépenses > mission.budgetInitial ? 'text-red-600' : 'text-green-600'}`}>
                  {mission.dépenses.toLocaleString('fr-FR')} €
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Utilisation du budget</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={mission.dépenses > mission.budgetInitial ? 'bg-red-500' : 'bg-green-500'} 
                    style={{
                      width: `${Math.min((mission.dépenses / mission.budgetInitial) * 100, 100)}%`,
                      height: '100%',
                      borderRadius: '9999px'
                    }}
                  ></div>
                </div>
                <span className="font-semibold text-gray-900">
                  {mission.budgetInitial > 0 ? Math.round((mission.dépenses / mission.budgetInitial) * 100) : 0}%
                </span>
              </div>
            </div>

            {mission.dépenses > mission.budgetInitial && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                ⚠️ Dépassement budget: {(mission.dépenses - mission.budgetInitial).toLocaleString('fr-FR')} €
              </div>
            )}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          onClick={downloadPDF}
          className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300 flex items-center justify-center gap-2"
        >
          <Download size={18} />
          Exporter PDF
        </Button>
        <Button
          onClick={() => {
            onEdit(mission);
            onClose();
          }}
          className="flex-1 bg-primary text-white hover:bg-primary-dark flex items-center justify-center gap-2"
        >
          <Edit size={18} />
          Modifier
        </Button>
      </div>
    </div>
  );
};

export default MissionDetails;
