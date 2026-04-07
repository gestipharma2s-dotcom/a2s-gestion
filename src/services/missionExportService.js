/**
 * Service d'export pour les missions
 * Génère des rapports en PDF et Excel
 */

export const missionExportService = {
  /**
   * Imprime le rapport technique et financier complet de la mission
   */
  printMissionReport: async (mission) => {
    const printWindow = window.open('', '_blank', 'width=900,height=900');
    if (!printWindow) {
      alert("Le navigateur a bloqué l'ouverture de la fenêtre d'impression.");
      return;
    }
    printWindow.document.write('<h2>Génération du rapport complet...</h2>');

    try {
      const { userService } = await import('./userService');
      let users = [];
      try { users = await userService.getAll(); } catch (e) { }

      const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : 'N/A';
      const formatCurrency = (n) => (n || 0).toLocaleString('fr-DZ') + ' DA';

      // Calculs financiers robustes
      const budget = parseFloat(mission.budgetInitial || mission.budget_initial || mission.budget_alloue || 0);

      // Calculer les dépenses à partir des détails si le total n'est pas clair
      let expenses = parseFloat(mission.budget_depense || mission.depenses_reelles || mission.total_expenses || 0);
      const expenseList = Array.isArray(mission.expenses_details) ? mission.expenses_details :
        (Array.isArray(mission.depenses) ? mission.depenses : []);

      if (expenses === 0 && expenseList.length > 0) {
        expenses = expenseList.reduce((sum, e) => sum + (parseFloat(e.montant) || 0), 0);
      }

      const remaining = budget - expenses;
      const calcPercent = budget > 0 ? Math.round((expenses / budget) * 100) : 0;

      console.log('Données Rapport:', { budget, expenses, remaining, count: expenseList.length });

      // Récupération des participants
      const chef = users.find(u => u.id === (mission.chef_mission_id || mission.chefMissionId))?.nom || mission.chef_name || 'Chef de Mission';

      const techComments = Array.isArray(mission.commentaires_techniques) ? mission.commentaires_techniques : [];
      const finComments = Array.isArray(mission.commentaires_financiers) ? mission.commentaires_financiers : [];

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Rapport de Mission - ${mission.titre}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.5; margin: 0; padding: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 30px; }
            .logo-text { font-weight: bold; font-size: 20px; color: #e02a27; }
            .report-title { text-align: center; margin-bottom: 40px; text-transform: uppercase; }
            .report-title h1 { margin: 0; font-size: 24px; border: 2px solid #000; display: inline-block; padding: 10px 40px; }
            
            .section { margin-bottom: 30px; }
            .section-title { background: #f0f0f0; padding: 8px 15px; font-weight: bold; border-left: 5px solid #00763b; margin-bottom: 15px; text-transform: uppercase; font-size: 14px; }
            
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .info-item { display: flex; margin-bottom: 5px; font-size: 14px; }
            .info-label { font-weight: bold; width: 180px; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
            table th, table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            table th { background: #f9f9f9; }
            
            .comment-box { border-left: 3px solid #ddd; padding-left: 15px; margin-bottom: 15px; font-style: italic; font-size: 13px; }
            .comment-meta { color: #666; font-size: 11px; margin-top: 4px; }
            
            .financial-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 10px; }
            .stat-card { padding: 15px; border: 1px solid #eee; border-radius: 5px; text-align: center; }
            .stat-value { font-size: 18px; font-weight: bold; margin-top: 5px; }

            .footer-sig { margin-top: 80px; display: grid; grid-template-columns: 1fr 1fr; gap: 100px; text-align: center; }
            .sig-box { min-height: 120px; border-top: 1px solid #000; padding-top: 10px; font-weight: bold; }

            @media print {
              @page { margin: 1cm; }
              body { padding: 0.5cm; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo-text">A2S - ADVANCED SOFTWARE SOLUTION</div>
              <div style="font-size: 11px;">Rapport de Restitution Mission</div>
            </div>
            <div style="text-align: right; font-size: 12px;">
              Date: ${new Date().toLocaleDateString('fr-FR')}<br/>
              Mission ID: #${mission.id.toString().padStart(4, '0')}
            </div>
          </div>

          <div class="report-title">
            <h1>RAPPORT DE MISSION</h1>
          </div>

          <div class="section">
            <div class="section-title">Informations Générales</div>
            <div class="grid">
              <div>
                <div class="info-item"><span class="info-label">Titre :</span><span class="info-value">${mission.titre}</span></div>
                <div class="info-item"><span class="info-label">Type :</span><span class="info-value">${mission.type}</span></div>
                <div class="info-item"><span class="info-label">Client :</span><span class="info-value">${mission.client?.raison_sociale || 'N/A'}</span></div>
                <div class="info-item"><span class="info-label">Lieu :</span><span class="info-value">${mission.lieu || 'Alger'}</span></div>
              </div>
              <div>
                <div class="info-item"><span class="info-label">Chef de Mission :</span><span class="info-value">${chef}</span></div>
                <div class="info-item"><span class="info-label">Début réelle :</span><span class="info-value">${formatDate(mission.date_debut || mission.dateDebut)}</span></div>
                <div class="info-item"><span class="info-label">Clôture :</span><span class="info-value">${formatDate(mission.date_cloture_reelle || mission.dateCloture)}</span></div>
                <div class="info-item"><span class="info-label">Statut Final :</span><span class="info-value">${mission.statut === 'validee' ? '✅ VALIDÉE' : '✔️ CLÔTURÉE'}</span></div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Volet Technique & Restitution</div>
            ${techComments.length > 0 ? techComments.map(c => `
              <div class="comment-box">
                <div>${c.texte}</div>
                <div class="comment-meta">Ajouté par ${c.auteur} le ${c.date_affichage}</div>
              </div>
            `).join('') : '<p style="font-size: 13px; color: #666;">Aucun commentaire technique enregistré.</p>'}
          </div>

          <div class="section">
            <div class="section-title">Volet Financier & Dépenses</div>
            <div class="financial-summary">
              <div class="stat-card">
                <div style="font-size: 11px; color: #666;">BUDGET INITIAL</div>
                <div class="stat-value">${formatCurrency(budget)}</div>
              </div>
              <div class="stat-card">
                <div style="font-size: 11px; color: #666;">DÉPENSES TOTALES (${calcPercent}%)</div>
                <div class="stat-value" style="color: ${calcPercent > 90 ? '#e02a27' : '#000'}">${formatCurrency(expenses)}</div>
              </div>
              <div class="stat-card">
                <div style="font-size: 11px; color: #666;">SOLDE RESTANT</div>
                <div class="stat-value" style="color: ${remaining < 0 ? '#e02a27' : '#00763b'}">${formatCurrency(remaining)}</div>
              </div>
            </div>

            ${expenseList.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Montant</th>
                    <th>Auteur</th>
                  </tr>
                </thead>
                <tbody>
                  ${expenseList.map(e => `
                    <tr>
                      <td>${e.type}</td>
                      <td>${e.description}</td>
                      <td style="font-weight: bold;">${formatCurrency(e.montant)}</td>
                      <td>${e.auteur}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}

            ${finComments.length > 0 ? `
              <div style="margin-top: 20px;">
                <div style="font-weight: bold; font-size: 13px; margin-bottom: 10px;">Commentaires Financiers:</div>
                ${finComments.map(c => `
                  <div class="comment-box" style="border-left-color: #00763b;">
                    <div>${c.texte}</div>
                    <div class="comment-meta">Par ${c.auteur} le ${c.date_affichage}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <div class="footer-sig">
            <div class="sig-box">Visa Chef de Mission</div>
            <div class="sig-box">Validation Direction / Admin</div>
          </div>

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
    } catch (e) {
      console.error(e);
      printWindow.document.body.innerHTML = '<h3 style="color:red">Erreur lors de la génération du rapport détaillé.</h3>';
    }
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

      const dDebut = mission.date_debut || mission.dateDebut;
      const dFin = mission.date_fin_prevue || mission.dateFin;

      // Build participants
      let pList = [];
      if (mission.participants && mission.participants.length > 0) {
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
