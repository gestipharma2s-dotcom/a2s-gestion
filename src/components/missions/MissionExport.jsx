import React, { useState } from 'react';
import { Download, FileText, Sheet, Printer } from 'lucide-react';
import Button from '../common/Button';
import { missionExportService } from '../../services/missionExportService';

const MissionExport = ({ mission, onClose }) => {
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState(null);

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const result = await missionExportService.exportMissionPDF(mission);
      
      // Message informatif
      alert(
        `✅ ${result.message}\n\n` +
        `Le contenu du rapport a été préparé.\n\n` +
        `📌 Pour installer l'export PDF réel:\n` +
        `npm install jspdf html2canvas\n\n` +
        `Ensuite, le PDF sera généré automatiquement.`
      );
      
      setExportFormat('pdf');
    } catch (error) {
      alert('❌ Erreur lors de l\'export PDF: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const result = await missionExportService.exportMissionExcel(mission);
      
      alert(
        `✅ ${result.message}\n\n` +
        `Les données sont prêtes pour Excel.\n\n` +
        `📌 Pour installer l'export Excel réel:\n` +
        `npm install xlsx\n\n` +
        `Ensuite, le fichier Excel sera téléchargé automatiquement.`
      );
      
      setExportFormat('excel');
    } catch (error) {
      alert('❌ Erreur lors de l\'export Excel: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    missionExportService.printMission(mission);
  };

  const handleExportText = () => {
    const textReport = missionExportService.generateTextReport(mission);
    
    // Copier dans le presse-papiers
    navigator.clipboard.writeText(textReport).then(() => {
      alert('✅ Rapport texte copié dans le presse-papiers!');
    });
  };

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <h3 className="font-bold text-blue-900 text-lg mb-2">📤 Exporter le Rapport</h3>
        <p className="text-sm text-blue-700">
          Choisissez le format pour exporter la mission <strong>{mission.titre}</strong>
        </p>
      </div>

      {/* Format Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* PDF */}
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
            exportFormat === 'pdf'
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 hover:border-red-500 hover:bg-red-50'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <FileText size={32} className="text-red-600" />
            <span className="font-semibold text-gray-900">PDF</span>
            <span className="text-xs text-gray-600">Rapport complet</span>
          </div>
        </button>

        {/* Excel */}
        <button
          onClick={handleExportExcel}
          disabled={exporting}
          className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
            exportFormat === 'excel'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <Sheet size={32} className="text-green-600" />
            <span className="font-semibold text-gray-900">Excel</span>
            <span className="text-xs text-gray-600">Feuille de calcul</span>
          </div>
        </button>

        {/* Print */}
        <button
          onClick={handlePrint}
          disabled={exporting}
          className="p-4 rounded-lg border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer"
        >
          <div className="flex flex-col items-center gap-2">
            <Printer size={32} className="text-blue-600" />
            <span className="font-semibold text-gray-900">Imprimer</span>
            <span className="text-xs text-gray-600">Rapport imprimable</span>
          </div>
        </button>

        {/* Text Copy */}
        <button
          onClick={handleExportText}
          disabled={exporting}
          className="p-4 rounded-lg border-2 border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer"
        >
          <div className="flex flex-col items-center gap-2">
            <FileText size={32} className="text-purple-600" />
            <span className="font-semibold text-gray-900">Texte</span>
            <span className="text-xs text-gray-600">Copier rapport</span>
          </div>
        </button>
      </div>

      {/* Contenu exporté */}
      {exportFormat && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="flex items-start gap-2 mb-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-semibold text-green-900">Export en cours</p>
              <p className="text-sm text-green-700">
                Le fichier {exportFormat === 'pdf' ? 'PDF' : exportFormat === 'excel' ? 'Excel' : 'est'} est en préparation...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info box */}
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <p className="text-sm text-yellow-800 mb-2">
          <strong>💡 Info:</strong> Les exports utilisent actuellement des données mockées.
        </p>
        <p className="text-xs text-yellow-700">
          Pour une intégration complète, vous devez installer les bibliothèques requises:
        </p>
        <ul className="text-xs text-yellow-700 mt-2 space-y-1 ml-4">
          <li>• <code>npm install jspdf html2canvas</code> pour PDF</li>
          <li>• <code>npm install xlsx</code> pour Excel</li>
        </ul>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          onClick={onClose}
          className="flex-1 bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-lg py-2 font-medium"
        >
          Fermer
        </Button>
        <Button
          onClick={handleExportPDF}
          disabled={exporting}
          className="flex-1 bg-gradient-to-r from-primary to-primary-dark text-white hover:opacity-90 rounded-lg py-2 font-medium flex items-center justify-center gap-2"
        >
          <Download size={18} />
          {exporting ? 'Export...' : 'Télécharger'}
        </Button>
      </div>
    </div>
  );
};

export default MissionExport;
