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
   * Imprime le rapport (Ordre de mission modèle Algérien)
   */
  printMission: async (mission) => {
    // Open window immediately to prevent popup blocking
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      alert("Le navigateur a bloqué l'ouverture de la fenêtre d'impression. Veuillez autoriser les pop-ups.");
      return;
    }
    printWindow.document.write('<h2>Préparation du document...</h2>');

    try {
      // Dynamic import to prevent circular dependency
      const { userService } = await import('./userService');
      let users = [];
      try {
        users = await userService.getAll();
      } catch (e) {
        console.warn('Could not fetch users for printing', e);
      }

      // Helper pour formater la date
      const formatDate = (dateString) => {
        if (!dateString) return '...................';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
      };

      const motifTexte = mission.description ? `<br/>${mission.description}` : '';
      const dDebut = mission.date_debut || mission.dateDebut;
      const dFin = mission.date_fin_prevue || mission.dateFin;

      // Build participants
      let participantsHtml = '';
      let pList = [];
      if (mission.participants && mission.participants.length > 0) {
        participantsHtml = mission.participants.map(p => `<li>${p.nom} - ${p.role}</li>`).join('');
        pList = mission.participants;
      } else {
        const chefId = mission.chef_mission_id || mission.chefMissionId;
        const accompIds = mission.accompagnateurs_ids || mission.accompagnateurIds || [];

        if (chefId && users.length > 0) {
          const chef = users.find(u => u.id === chefId);
          if (chef) pList.push({ nom: chef.nom || chef.email, role: 'Chef de Mission' });
        } else if (mission.chef_name) {
          pList.push({ nom: mission.chef_name, role: 'Chef de Mission' });
        }

        if (accompIds.length > 0 && users.length > 0) {
          accompIds.forEach(id => {
            const user = users.find(u => u.id === id);
            if (user) pList.push({ nom: user.nom || user.email, role: 'Accompagnateur' });
          });
        }

        if (pList.length > 0) {
          participantsHtml = pList.map(p => `<li>${p.nom} - ${p.role}</li>`).join('');
        } else {
          participantsHtml = '<li>Aucun participant spécifié.</li>';
        }
      }

      const pagesToPrint = pList.length > 0 ? pList : [{ nom: '.......................................', role: '........................' }];

      // Loop through pagesToPrint and generate HTML for each
      const pagesHtml = pagesToPrint.map((p, index) => `
        <div class="page" ${index < pagesToPrint.length - 1 ? 'style="page-break-after: always;"' : ''}>
          <!-- Header -->
          <div style="position: relative;">
            <div style="position: absolute; top:0; right:0; width:0; height:0; border-style: solid; border-width: 0 120px 120px 0; border-color: transparent #e02a27 transparent transparent; opacity: 0.9; z-index: -1;">
              <div style="position: absolute; top: -10px; right: -120px; width: 0; height: 0; border-style: solid; border-width: 0 90px 90px 0; border-color: transparent #00763b transparent transparent;"></div>
            </div>
            
            <div style="font-size: 14px; line-height: 1.5; font-family: Arial, sans-serif; font-weight: bold;">
              ALGERIE<br/>
              SARL ADVANCED SOFTWARE SOLUTION<br/>
              Bureau 1215, 6e étage, Mohammadia Mall, Alger.<br/>
              TEL / N° +213 561 68 56 90 / 94<br/>
              EMAIL : contact@a2s-dz.com
            </div>
          </div>

          <!-- Titles -->
          <div style="text-align: center; margin-top: 50px; font-family: Arial, sans-serif;">
            <h1 style="font-size: 28px; margin: 0; font-weight: 900;" dir="rtl">تكليف بمهمة</h1>
            <h1 style="font-size: 24px; margin: 5px 0 10px 0; font-weight: 800; letter-spacing: 1px;">ORDRE DE MISSION</h1>
            <p style="font-size: 16px; font-weight: bold; margin: 0;">N° ......${mission.id.toString().padStart(3, '0')}/${new Date().getFullYear()}......</p>
          </div>

          <!-- Form Fields -->
          <div class="form-body" style="margin-top: 60px; font-size: 16px; font-family: 'Times New Roman', Times, serif; font-weight: bold;">
            
            <div class="form-row">
              <span class="label-fr" style="width: 250px;">M ........................................</span>
              <span class="value">${p.nom.toUpperCase()}</span>
              <span class="label-ar" style="width: 250px; text-align: left; padding-left: 10px;">................................... الاسم و اللقب</span>
            </div>

            <div class="form-row">
              <span class="label-fr" style="width: 200px;">Fonction</span>
              <span class="value">${(p.role || 'Employé').toUpperCase()}</span>
              <span class="label-ar" style="width: 200px;">الوظيفة</span>
            </div>

            <div class="form-row">
              <span class="label-fr" style="width: 250px;">Résidence Administrative</span>
              <span class="value">ALGER</span>
              <span class="label-ar" style="width: 250px;">العنوان الاداري</span>
            </div>

            <div class="form-row">
              <span class="label-fr" style="width: 200px;">Se rendre à</span>
              <span class="value">${(mission.lieu || mission.client?.wilaya || '...................').toUpperCase()}</span>
              <span class="label-ar" style="width: 200px;">يسافر الى</span>
            </div>

            <div class="form-row">
              <span class="label-fr" style="width: 250px;">Motif de déplacement</span>
              <span class="value">${(mission.titre || 'MISSION').toUpperCase()} ${mission.client?.raison_sociale ? ' CHEZ ' + mission.client.raison_sociale.toUpperCase() : ''}</span>
              <span class="label-ar" style="width: 250px;">سبب التنقل</span>
            </div>

            <div class="form-row">
              <span class="label-fr" style="width: 200px;">Moyen de transport</span>
              <span class="value">VÉHICULE</span>
              <span class="label-ar" style="width: 200px;">امكانية التنقل</span>
            </div>

            <div class="form-row">
              <span class="label-fr" style="width: 200px;">Date de départ</span>
              <span class="value">${formatDate(dDebut)}</span>
              <span class="label-ar" style="width: 200px;">تاريخ الخروج</span>
            </div>

            <div class="form-row">
              <span class="label-fr" style="width: 200px;">Date de retour</span>
              <span class="value">${formatDate(dFin)}</span>
              <span class="label-ar" style="width: 200px;">تاريخ الدخول</span>
            </div>

            <div class="form-row">
              <span class="label-fr" style="width: 200px;">Nature du titre</span>
              <span class="value">ORDRE DE MISSION</span>
              <span class="label-ar" style="width: 200px;">نوع وثيقة</span>
            </div>

          </div>

          <!-- Footer Signatures -->
          <div style="margin-top: 100px; display: flex; justify-content: space-between; font-family: Arial, sans-serif;">
            <div style="text-align: center; font-weight: bold; width: 40%;">
               Fait à Alger le, ${new Date().toLocaleDateString('fr-FR')}<br/><br/>
               Le Directeur<br/>
               <span style="font-weight: normal; font-size: 14px;">(Cachet et signature)</span>
            </div>
            <div style="text-align: center; font-weight: bold; width: 40%;">
               <br/><br/>
               Visa de la structure d'accueil<br/>
               <span style="font-weight: normal; font-size: 14px;">(Cachet et signature)</span>
            </div>
          </div>
        </div>
      `).join('');

      const printContent = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <title>Ordre de Mission - ${mission.titre}</title>
          <style>
            body { 
              margin: 0;
              padding: 0;
              background: #fff;
            }
            .page {
              padding: 40px;
              box-sizing: border-box;
              min-height: 100vh;
              position: relative;
            }
            .form-body {
              display: flex;
              flex-direction: column;
              gap: 25px;
            }
            .form-row {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              width: 100%;
            }
            .form-row .label-fr {
              white-space: nowrap;
            }
            .form-row .label-ar {
              white-space: nowrap;
              text-align: right;
              direction: rtl;
              font-family: Arial, sans-serif;
              font-weight: bold;
              font-size: 18px;
            }
            .form-row .value {
              flex-grow: 1;
              border-bottom: 2px dotted #000;
              text-align: center;
              padding: 0 15px;
              margin: 0 10px;
              display: inline-block;
              font-weight: bold;
              min-height: 20px;
            }
            @media print {
              html, body {
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
              }
              .page {
                margin: 0;
                border: initial;
                border-radius: initial;
                width: initial;
                min-height: initial;
                box-shadow: initial;
                background: initial;
                page-break-after: always;
              }
              .page:last-child {
                page-break-after: auto;
              }
            }
          </style>
        </head>
        <body>
          ${pagesHtml}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
    } catch (err) {
      console.error('Erreur lors de la génération de impression:', err);
      printWindow.document.body.innerHTML = '<h3 style="color:red">Erreur lors de la préparation du rapport.</h3>';
    }
  }
};

export default missionExportService;
