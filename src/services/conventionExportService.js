import { getWilayaName } from '../constants/wilayas';

/**
 * Service d'export pour les conventions LOGIPHARM
 * Génère une convention complète de 6 pages en HTML pour impression
 */

export const conventionExportService = {
  /**
   * Imprime la convention LOGIPHARM pour une installation
   * @param {Object} installation - L'objet installation avec client et montants
   */
  printConvention: (installation) => {
    const printWindow = window.open('', '_blank', 'width=900,height=900');
    if (!printWindow) {
      alert("Le navigateur a bloqué l'ouverture de la fenêtre d'impression.");
      return;
    }

    const client = installation.client || {};
    const dateInstallation = installation.date_installation ? new Date(installation.date_installation) : new Date();
    const dateStr = dateInstallation.toLocaleDateString('fr-FR');
    const monthYearStr = dateInstallation.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase();
    const annexesList = installation.applications_annexes || [];
    const montantBase = installation.montant || 0;
    const montantAnnexes = annexesList.reduce((acc, a) => acc + (parseFloat(a.montant) || 0), 0);
    const montantTotal = montantBase + montantAnnexes;
    const representantClient = client.contact || "...........................";

    const rawWilaya = client.wilaya ? String(client.wilaya).trim() : '';
    let wilayaDisplay = '................';
    if (rawWilaya) {
      if (/^\d{1,2}$/.test(rawWilaya)) {
        wilayaDisplay = getWilayaName(rawWilaya) || rawWilaya;
      } else if (rawWilaya.includes('-')) {
        wilayaDisplay = rawWilaya.split('-').pop().trim();
      } else {
        wilayaDisplay = rawWilaya;
      }
    }

    const formatCurrency = (n) => (n || 0).toLocaleString('fr-DZ') + ' DA';

    // Générer la liste HTML des applications annexes
    const annexesHtml = (installation.applications_annexes && installation.applications_annexes.length > 0)
      ? installation.applications_annexes.map(annexe => `<li><strong>${annexe.nom.toUpperCase()}</strong></li>`).join('\n            ')
      : `<li><strong>Aucune application annexe supplémentaire (Version Standard)</strong></li>`;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Convention LOGIPHARM - ${client.raison_sociale || 'Client'}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap');
          
          @page {
            size: A4;
            margin: 0;
          }
          body {
            font-family: 'Century Gothic', 'Montserrat', Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
            color: #222;
            font-size: 11pt;
            line-height: 1.5;
          }
          .page {
            width: 210mm;
            min-height: 297mm;
            padding: 25mm 20mm;
            margin: 10mm auto;
            background: white;
            box-shadow: 0 0 15px rgba(0,0,0,0.1);
            box-sizing: border-box;
            position: relative;
            page-break-after: always;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #003366;
            padding-bottom: 15px;
            margin-bottom: 40px;
          }
          .logo-area {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .logo-img {
            height: 60px;
            object-fit: contain;
          }
          .logo-text-box {
            display: flex;
            flex-direction: column;
          }
          .logo-main {
            font-size: 28pt;
            font-weight: 900;
            color: #0088cc;
            letter-spacing: -1px;
            line-height: 1;
          }
          .logo-sub {
            font-size: 8pt;
            font-weight: bold;
            color: #333;
            letter-spacing: 1px;
          }
          .company-info {
            text-align: right;
            font-size: 8.5pt;
            color: #555;
            line-height: 1.3;
          }
          .title-page {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 180mm;
            text-align: center;
          }
          .main-title-box {
            border: 1px solid #ddd;
            padding: 40px 60px;
            background: #fafafa;
            border-radius: 8px;
            box-shadow: inset 0 0 10px rgba(0,0,0,0.02);
          }
          .main-title {
            font-size: 26pt;
            font-weight: bold;
            margin: 0;
            color: #333;
          }
          .erp-highlight {
            color: #0088cc;
            font-weight: 900;
            text-decoration: underline;
          }
          .date-bottom {
            margin-top: 100px;
            font-weight: bold;
            font-size: 14pt;
            color: #666;
          }
          .article-title {
            font-weight: bold;
            text-decoration: underline;
            text-transform: uppercase;
            margin-top: 30px;
            margin-bottom: 15px;
            color: #003366;
            font-size: 12pt;
            border-left: 4px solid #0088cc;
            padding-left: 10px;
          }
          .clause-text {
            text-align: justify;
            margin-bottom: 12px;
          }
          .module-list {
            list-style-type: none;
            padding-left: 15px;
            margin-bottom: 20px;
          }
          .module-list li {
            margin-bottom: 8px;
            position: relative;
            padding-left: 20px;
          }
          .module-list li:before {
            content: "•";
            position: absolute;
            left: 0;
            color: #0088cc;
            font-size: 14pt;
            line-height: 1;
          }
          .site-prices {
            margin-left: 20px;
            font-weight: bold;
          }
          .site-prices div {
            margin-bottom: 5px;
          }
          .check-mark {
            color: #00c853;
            margin-right: 5px;
          }
          .total-box {
            background-color: #f0f7ff;
            padding: 15px;
            border-radius: 6px;
            margin-top: 20px;
            border: 1px solid #cce5ff;
            font-size: 13pt;
          }
          .signature-section {
            margin-top: 60px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40mm;
          }
          .sig-box {
            text-align: center;
          }
          .sig-label {
            font-weight: bold;
            margin-bottom: 40px;
            text-decoration: underline;
            font-size: 10pt;
            color: #003366;
          }
          .sig-placeholder {
            height: 100px;
            border-bottom: 1px dotted #ccc;
            margin-bottom: 10px;
          }
          .sig-company {
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12pt;
          }
          .sig-address {
            font-size: 8pt;
            color: #666;
            margin-top: 5px;
          }
          @media print {
            body { background: none; }
            .page { margin: 0; box-shadow: none; border: none; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <!-- PAGE 1: Couverture -->
        <div class="page">
          <div class="header">
            <div class="logo-area">
              <div class="logo-text-box">
                <span class="logo-main">A2S</span>
                <span class="logo-sub">Advanced Software Solution</span>
              </div>
            </div>
            <div class="company-info">
              <strong>SARL ADVANCED SOFTWARE SOLUTION</strong><br>
              Centre Commercial Mohammadia MALL - Les Bananiers<br>
              Bordj el Kiffan - Alger | Tél: 023 93 06 07<br>
              Email: contact@a2s-dz.com
            </div>
          </div>
          <div class="title-page">
            <div class="main-title-box">
              <h1 class="main-title">
                Contrat de Mise en Œuvre de<br>
                l'ERP <span class="erp-highlight">« LOGIPHARM »</span>
              </h1>
            </div>
            <div class="date-bottom">
              ${monthYearStr}
            </div>
          </div>
        </div>

        <!-- PAGE 2: Introduction et Objet -->
        <div class="page">
          <div class="header">
            <div class="logo-area">
              <div class="logo-text-box"><span class="logo-main">A2S</span></div>
            </div>
          </div>
          
          <div class="clause-text"><strong>Entre :</strong></div>
          <div class="clause-text" style="background: #f9f9f9; padding: 15px; border-radius: 4px; border: 1px solid #eee;">
            <strong>${(client.forme_juridique || '')} ${(client.raison_sociale || '...................................................').toUpperCase()}</strong>, Sis à : ${(client.adresse || '...................................................')}, ${wilayaDisplay}, Algérie.<br>
            ${client.nif ? `NIF : ${client.nif} | ` : ''} ${client.rc ? `RC : ${client.rc} | ` : ''} ${client.ai ? `AI : ${client.ai} | ` : ''} ${client.nis ? `NIS : ${client.nis}` : ''}<br>
            Ci-après désigné par <strong>« le Client »</strong> Représentée par <strong>${representantClient}</strong>, Directeur Général.
          </div>
          
          <div class="clause-text" style="margin: 15px 0;"><strong>D'une part</strong></div>
          <div class="clause-text"><strong>Et :</strong></div>
          
          <div class="clause-text" style="background: #f9f9f9; padding: 15px; border-radius: 4px; border: 1px solid #eee;">
            <strong>ADVANCED SOFTWARE SOLUTION</strong> Sis au<br>
            Centre Commercial Mohammadia MALL - Les Bananiers - Bordj el Kiffan - Alger<br>
            Tél: 023 93 06 07 Email: dg@a2s-dz.com, ci-après désignée par <strong>« le Fournisseur »</strong><br>
            Représentée par Monsieur <strong>MADANI M'hammed</strong>, Gérant.
          </div>
          
          <div class="clause-text" style="margin: 15px 0;"><strong>D'autre part</strong></div>
          <div class="clause-text" style="margin-top: 20px; font-style: italic;">Il a été arrêté et convenu ce qui suit :</div>

          <div class="article-title">ARTICLE 1 : OBJET DE LA CONVENTION</div>
          <div class="clause-text">
            La présente convention a pour objet la fourniture et la mise en place en licences illimitées de l'ERP <strong>« LOGIPHARM »</strong> dédié à la Gestion complète d'une distribution pharmaceutique et parapharmaceutique, contenant les modules suivants :
          </div>
          <ul class="module-list">
            <li><strong>GESTION COMMERCIALE, STOCK, TRESORERIE, EXPEDITIONS.</strong></li>
            <li><strong>GESTION DES ACHATS ET IMPORTATION.</strong></li>
            <li><strong>GESTION MULTI-DOSSIERS ET MULTI-DEPOTS.</strong></li>
            <li><strong>GESTION DES MGX.</strong></li>
          </ul>
        </div>

        <!-- PAGE 3: Modules Suite et Prestations -->
        <div class="page">
          <div class="header">
            <div class="logo-area">
              <div class="logo-text-box"><span class="logo-main">A2S</span></div>
            </div>
          </div>
          
          <ul class="module-list">
            ${annexesHtml}
          </ul>


          <div class="clause-text" style="font-size: 10pt; background: #fffde7; padding: 10px; border: 1px dashed #ffd54f;">
            💡 <em>Le détail des coûts du logiciel et prestations de formation et d'assistance sont repris dans l'Annexe de la présente convention.</em>
          </div>

          <div class="article-title">ARTICLE 2 : PRESTATIONS A CHARGE DU FOURNISSEUR</div>
          
          <div class="clause-text"><strong>1. Livraison, Implémentation & mise en place :</strong></div>
          <div class="clause-text">Le Fournisseur s'engage à assurer :</div>
          <ul class="module-list">
            <li>L’implémentation et la mise en place du Logiciel objet de la présente convention par ses propres techniciens chez le « Client » en mettant à disposition le personnel nécessaire à cette opération pendant toutes les étapes de mise en place (migration des données, formation, tests unitaires, mise en place et mise en production), le temps nécessaire jusqu'à la mise en place définitive et mise en production.</li>
          </ul>
          <div class="clause-text">Cette livraison fera l’objet d’une réception provisoire matérialisée par un Procès-Verbal d'Installation.</div>

          <div class="clause-text"><strong>2. Formation :</strong></div>
          <div class="clause-text">Le Fournisseur s'engage à assurer :</div>
          <ul class="module-list">
            <li>La formation des gestionnaires sur l'utilisation parfaite du logiciel objet de la présente convention en vulgarisant toutes les fonctionnalités jusqu'au moindre détail.</li>
            <li>La fourniture d'un manuel d'utilisateur complet.</li>
          </ul>

          <div class="clause-text"><strong>3. Propriété des logiciels :</strong></div>
          <div class="clause-text">Le Fournisseur conserve la propriété du Logiciel fourni. Toutefois, les licences fournies sont la propriété du client et lui garantissent l'utilisation à vie du logiciel fourni.</div>

          <div class="clause-text"><strong>4. Maintenance du Logiciel :</strong></div>
          <div class="clause-text">Au titre de la maintenance, le fournisseur s'engage à assurer gratuitement pendant une année (1 an) :</div>
          <ul class="module-list">
            <li>La conformité du logiciel aux spécifications fonctionnelles d'une gestion intégrée d'une distribution pharmaceutique dans le respect de la réglementation algérienne.</li>
            <li>Le service de support téléphonique pour traiter tout dysfonctionnement éventuel.</li>
          </ul>
        </div>

        <!-- PAGE 4: Maintenance Suite et Paiement -->
        <div class="page">
          <div class="header">
            <div class="logo-area">
              <div class="logo-text-box"><span class="logo-main">A2S</span></div>
            </div>
          </div>
          
          <div class="clause-text">
            La mise à disposition des Nouvelles Versions avec de nouvelles fonctionnalités est payante et fera l'objet d'un avenant de "Support et de mise à jour" après l'épuisement de l'année de garantie gratuite.
          </div>

          <div class="article-title">ARTICLE 4 : DOCUMENTS CONTRACTUELS</div>
          <div class="clause-text">Sont expressément désignés comme documents contractuels :</div>
          <ul class="module-list">
            <li>La présente convention</li>
            <li>L'annexe : offre commerciale / offre technique</li>
          </ul>

          <div class="article-title">ARTICLE 5 : MONTANT & CONDITIONS DE PAIEMENT</div>
          <div class="clause-text">Le montant de la présente convention se présente comme suit :</div>
          <div class="clause-text"><strong>Licences ERP :</strong></div>
          
          <div class="total-box">
            <strong>MONTANT TOTAL : ${formatCurrency(montantTotal)} HT</strong>
          </div>

          <div class="clause-text" style="margin-top: 25px;">Les modalités de paiement sont arrêtées comme suit :</div>
          <ul class="module-list">
            <li><strong>60 %</strong> du montant global dès la signature de la présente convention.</li>
            <li><strong>40 %</strong> du montant sera réglé en <strong>Quatre (4) mensualités</strong> égales successives exigibles à compter de la signature de ladite convention (par chèques dotés).</li>
          </ul>

          <div class="clause-text" style="background: #f1f8e9; padding: 15px; border-radius: 4px; border: 1px solid #dcedc8; margin-top: 20px;">
            Les factures sont payables à l'ordre de : <strong>SARL ADVANCED SOFTWARE SOLUTION</strong><br>
            Banque : <strong>SOCIÉTÉ GÉNÉRALE BORDJ EL KIFFAN</strong><br>
            RIB N° : <strong>0210001911200340/402</strong>
          </div>
        </div>

        <!-- PAGE 5: Litiges et Dispositions -->
        <div class="page">
          <div class="header">
            <div class="logo-area">
              <div class="logo-text-box"><span class="logo-main">A2S</span></div>
            </div>
          </div>

          <div class="article-title">ARTICLE 6 : LITIGES</div>
          <div class="clause-text">
            Tout désaccord entre les parties surgissant dans l'interprétation ou l'exécution de la présente convention sera autant que possible réglé à l'amiable. A défaut, le différend sera soumis à la compétence du tribunal territorialement compétent.
          </div>

          <div class="article-title">ARTICLE 7 : DISPOSITIONS GENERALES</div>
          <div class="clause-text">
            Les dispositions de la présente convention et de son annexe expriment seules l'accord intervenu entre les parties. Elles annulent et remplacent toutes autres dispositions, correspondances ou accords antérieurs s'appliquant à la présente convention.
          </div>

          <div class="article-title">ARTICLE 8 : ELECTION DE DOMICILE</div>
          <div class="clause-text">
            Sauf accord contraire, toute notification faite par l’une des parties à l’autre pour les besoins de la présente convention sera adressée par écrit (courrier ou e-mail).
          </div>

          <div class="article-title">ARTICLE 9 : ENTREE EN VIGUEUR</div>
          <div class="clause-text">
            La présente convention entre en vigueur dès sa signature par les deux parties, pour une durée d'une année (1 an).
          </div>
        </div>

        <!-- PAGE 6: Signatures -->
        <div class="page">
          <div class="header">
            <div class="logo-area">
              <div class="logo-text-box"><span class="logo-main">A2S</span></div>
            </div>
          </div>

          <div class="clause-text" style="text-align: right; margin-top: 50px; font-weight: bold; font-size: 14pt;">
            Fait à ALGER, le ${dateStr}
          </div>

          <div class="signature-section">
            <div class="sig-box">
              <div class="sig-label">PAR LE CLIENT</div>
              <div class="sig-placeholder"></div>
              <div class="sig-company">${(client.raison_sociale || '.......................................').toUpperCase()}</div>
              <div class="sig-address">${wilayaDisplay.toUpperCase()}</div>
            </div>
            <div class="sig-box">
              <div class="sig-label">PAR LE FOURNISSEUR</div>
              <div class="sig-placeholder"></div>
              <div class="sig-company">SARL ADVANCED SOFTWARE SOLUTION</div>
              <div class="sig-address">MOHAMMADIA MALL, BORDJ EL KIFFAN, ALGER</div>
            </div>
          </div>
          
          <div style="position: absolute; bottom: 20mm; left: 0; right: 0; text-align: center; font-size: 9pt; color: #999;">
            Page 6 sur 6 - Convention LOGIPHARM
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 600);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
};

export default conventionExportService;
