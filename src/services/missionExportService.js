/**
 * Service d'export pour les missions
 * Généère des rapports en PDF et Excel
 */

// Utilise jsPDF et ExcelJS (à installer)
// npm install jspdf xlsx

export const missionExportService = {
  /**
   * Exporte une mission en PDF complet
   */
  exportMissionPDF: async (mission) => {
    try {
      // Pour une implémentation réelle, vous devez installer jsPDF
      // npm install jspdf html2canvas

      // Création du contenu PDF simulé
      const pdfContent = `
        ╔════════════════════════════════════════════════════════════════╗
        ║                    RAPPORT MISSION COMPLET                     ║
        ╚════════════════════════════════════════════════════════════════╝

        📋 INFORMATIONS GÉNÉRALES
        ─────────────────────────────────────────────────────────────────
        Titre:           ${mission.titre}
        Type:            ${mission.type}
        Priorité:        ${mission.priorite}
        Statut:          ${mission.statut}
        Client:          ${mission.client?.raison_sociale || 'N/A'}
        Lieu:            ${mission.lieu}
        
        📅 DATES
        ─────────────────────────────────────────────────────────────────
        Début:           ${new Date(mission.dateDebut).toLocaleDateString('fr-FR')}
        Fin:             ${new Date(mission.dateFin).toLocaleDateString('fr-FR')}
        Avancement:      ${mission.avancement}%
        
        💰 INFORMATIONS FINANCIÈRES
        ─────────────────────────────────────────────────────────────────
        Budget Initial:  ${mission.budgetInitial.toLocaleString('fr-FR')} €
        Dépenses:        ${mission.depenses?.toLocaleString('fr-FR') || '0'} €
        Reste:           ${(mission.budgetInitial - (mission.depenses || 0)).toLocaleString('fr-FR')} €
        
        🔧 DESCRIPTION TECHNIQUE
        ─────────────────────────────────────────────────────────────────
        ${mission.description || 'N/A'}
        
        👥 PARTICIPANTS
        ─────────────────────────────────────────────────────────────────
        ${mission.participants?.map(p => `• ${p.nom} (${p.role})`).join('\n') || 'Aucun'}
        
        ✅ ACTIONS RÉALISÉES
        ─────────────────────────────────────────────────────────────────
        ${mission.actionsRealisees?.map(a => `• ${a.description}`).join('\n') || 'Aucune'}
        
        💻 LOGICIELS & MATÉRIELS
        ─────────────────────────────────────────────────────────────────
        ${mission.logicielsMateriels?.map(l => `• ${l.nom} (${l.type}) - v${l.version}`).join('\n') || 'Aucun'}
        
        ⚠️ PROBLÈMES & SOLUTIONS
        ─────────────────────────────────────────────────────────────────
        ${mission.problemesResolutions?.map(p => `
        Problème: ${p.probleme}
        Solution: ${p.solution}
        `).join('\n') || 'Aucun'}
        
        Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
      `;

      // Copier dans le presse-papiers
      await navigator.clipboard.writeText(pdfContent);
      
      console.warn('⚠️ NOTE: Pour une véritable export PDF, vous devez:');
      console.warn('1. Installer: npm install jspdf html2canvas');
      console.warn('2. Importer et utiliser jsPDF dans ce fichier');
      console.warn('\nPour l\'instant, le contenu a été copié dans le presse-papiers.');
      
      return {
        success: true,
        message: 'Contenu copié dans le presse-papiers. Pour PDF réel, installer jsPDF.',
        content: pdfContent
      };
    } catch (error) {
      console.error('Erreur export PDF:', error);
      throw new Error('Impossible d\'exporter le rapport PDF');
    }
  },

  /**
   * Exporte une mission en Excel
   */
  exportMissionExcel: async (mission) => {
    try {
      // Pour une implémentation réelle, vous devez installer xlsx
      // npm install xlsx

      const excelContent = {
        'Général': [
          ['Titre', mission.titre],
          ['Type', mission.type],
          ['Priorité', mission.priorite],
          ['Statut', mission.statut],
          ['Client', mission.client?.raison_sociale || 'N/A'],
          ['Lieu', mission.lieu],
          ['Avancement', `${mission.avancement}%`],
          ['', ''],
          ['Dates', ''],
          ['Début', new Date(mission.dateDebut).toLocaleDateString('fr-FR')],
          ['Fin', new Date(mission.dateFin).toLocaleDateString('fr-FR')],
          ['', ''],
          ['Budget', ''],
          ['Budget Initial', `${mission.budgetInitial} €`],
          ['Dépenses', `${mission.depenses || 0} €`],
          ['Reste', `${mission.budgetInitial - (mission.depenses || 0)} €`],
        ],
        'Actions': [
          ['Description', 'Date d\'ajout'],
          ...mission.actionsRealisees?.map(a => [
            a.description,
            new Date(a.dateAjout).toLocaleDateString('fr-FR')
          ]) || []
        ],
        'Logiciels & Matériels': [
          ['Type', 'Nom', 'Version', 'Date Installation'],
          ...mission.logicielsMateriels?.map(l => [
            l.type,
            l.nom,
            l.version || '-',
            new Date(l.dateInstallation).toLocaleDateString('fr-FR')
          ]) || []
        ],
        'Problèmes & Solutions': [
          ['Problème', 'Solution', 'Date', 'Statut'],
          ...mission.problemesResolutions?.map(p => [
            p.probleme,
            p.solution,
            new Date(p.dateSignalement).toLocaleDateString('fr-FR'),
            p.statut
          ]) || []
        ]
      };

      console.warn('⚠️ NOTE: Pour une véritable export Excel, vous devez:');
      console.warn('1. Installer: npm install xlsx');
      console.warn('2. Importer et utiliser xlsx dans ce fichier');
      console.warn('\nStructure Excel prête:\n', JSON.stringify(excelContent, null, 2));
      
      return {
        success: true,
        message: 'Données Excel préparées. Pour export réel, installer xlsx.',
        data: excelContent
      };
    } catch (error) {
      console.error('Erreur export Excel:', error);
      throw new Error('Impossible d\'exporter vers Excel');
    }
  },

  /**
   * Exporte statistiques mission
   */
  exportMissionStatistics: (missions) => {
    const stats = {
      totalMissions: missions.length,
      parStatut: {},
      parType: {},
      budgetTotal: 0,
      depensesTotal: 0,
      moyenneAvancement: 0,
      missionsAuRisque: 0
    };

    let totalAvancement = 0;

    missions.forEach(m => {
      // Compter par statut
      stats.parStatut[m.statut] = (stats.parStatut[m.statut] || 0) + 1;

      // Compter par type
      stats.parType[m.type] = (stats.parType[m.type] || 0) + 1;

      // Budgets
      stats.budgetTotal += m.budgetInitial || 0;
      stats.depensesTotal += m.depenses || 0;

      // Avancement
      totalAvancement += m.avancement || 0;

      // Risques (délai - date fin < aujourd'hui)
      if (new Date(m.dateFin) < new Date() && m.statut !== 'cloturee' && m.statut !== 'validee') {
        stats.missionsAuRisque++;
      }
    });

    stats.moyenneAvancement = Math.round(totalAvancement / missions.length);

    return stats;
  },

  /**
   * Génère un rapport texte simple
   */
  generateTextReport: (mission) => {
    return `
═══════════════════════════════════════════════════════════════
                    RAPPORT MISSION
═══════════════════════════════════════════════════════════════

MISSION: ${mission.titre}
TYPE: ${mission.type}
CLIENT: ${mission.client?.raison_sociale || 'N/A'}

STATUT: ${mission.statut}
AVANCEMENT: ${mission.avancement}%
PRIORITÉ: ${mission.priorite}

DATES:
  • Début: ${new Date(mission.dateDebut).toLocaleDateString('fr-FR')}
  • Fin: ${new Date(mission.dateFin).toLocaleDateString('fr-FR')}

BUDGET:
  • Alloué: ${mission.budgetInitial} €
  • Dépensé: ${mission.depenses || 0} €
  • Reste: ${mission.budgetInitial - (mission.depenses || 0)} €

DESCRIPTION:
${mission.description || 'N/A'}

═══════════════════════════════════════════════════════════════
Généré le: ${new Date().toLocaleString('fr-FR')}
═══════════════════════════════════════════════════════════════
    `;
  },

  /**
   * Imprime le rapport
   */
  printMission: (mission) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rapport Mission - ${mission.titre}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
          .section { margin: 20px 0; }
          .label { font-weight: bold; color: #555; }
          .value { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background-color: #007bff; color: white; padding: 8px; text-align: left; }
          td { padding: 8px; border-bottom: 1px solid #ddd; }
          tr:hover { background-color: #f5f5f5; }
        </style>
      </head>
      <body>
        <h1>Rapport de Mission</h1>
        <div class="section">
          <div><span class="label">Titre:</span> <span class="value">${mission.titre}</span></div>
          <div><span class="label">Type:</span> <span class="value">${mission.type}</span></div>
          <div><span class="label">Client:</span> <span class="value">${mission.client?.raison_sociale || 'N/A'}</span></div>
          <div><span class="label">Lieu:</span> <span class="value">${mission.lieu}</span></div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  }
};

export default missionExportService;
