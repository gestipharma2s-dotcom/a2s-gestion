const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'src/components/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const creatorId = '9d2f45a2-14e6-4858-af98-26707bc79982'; // m.madani@a2s-dz.com

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const rawData = `704;SETIF MEDIC SETIF;2019-11-04;2020-11-04;550 000;5
488;YOUGHORTA PHARM (HBI);2018-11-04;2019-11-04;250 000;7
391;SOMEPHARM;2018-03-20;2019-03-20;250 000;7
947;BFM ;2020-12-28;2021-12-28;550 000;3
703;SETIF MEDIC ANNEX TOUGOURT ;2019-11-04;2020-11-04;250 000;6
800;PHARMACIF;2020-02-24;2021-02-24;250 000;6
658;EURL BAK MEDOC PHARM;2019-08-07;2020-08-07;250 000;6
948;SETIF MEDIC2;2020-12-28;2021-12-28;750 000;2
673;BOUMELAH PHARM ORAN;2019-09-19;2020-09-19;250 000;6
754;BELSEM PHARM ;2019-12-24;2020-12-24;250 000;6
702;ROSTY PHARM;2019-11-04;2020-11-04;250 000;6
911;ALGER PHARM CENTER APC BERAKI;2020-11-12;2021-11-12;250 000;5
831;GROUPE SELAMI MEDICAL ;2020-05-26;2021-05-26;250 000;5
826;KENZI PHARM CONSTANTINE ;2020-05-16;2021-05-16;250 000;5
876;PHARMA MARKET ;2020-08-24;2021-08-24;250 000;5
877;KRYSTAL PHARM;2020-08-26;2021-08-26;250 000;5
862;DISPROMED CONSTANTINE;2020-07-07;2021-07-07;250 000;5
855;GOPHARM ;2020-06-14;2021-06-14;250 000;5
960;PARA BEST PHARM;2021-01-13;2022-01-13;250 000;5
860;KHALED PARAPHARM BOUSSEKEN;2020-07-01;2021-07-01;250 000;5
780;PHARMA MEDIC;2020-02-10;2021-02-10;600 000;2
878;PLANTE PHARM ;2020-08-31;2021-08-31;350 000;3
601;SAOULI PHARM;2019-02-28;2020-02-28;170 000;6
1015;EURL BHM SANTE ;2021-06-09;2022-06-09;250 000;4
1009;BEST MEDIC;2021-05-11;2022-05-11;250 000;4
1084;NASSIMA BIOCARE ;2021-10-27;2022-10-27;250 000;4
1190;VITOPHARM;2022-04-17;2023-04-17;500 000;2
1056;GREATPHARM;2021-09-03;2022-09-03;250 000;4
1060;SANACHE PHARM;2021-09-08;2022-09-08;250 000;4
1139;KRARI AHMED SETIF;2022-02-06;2023-02-06;250 000;4
62;EURL PHARCOS;2020-05-16;2021-05-16;900 000;1
1503;BIOREAL SPA;2024-02-11;2025-02-11;837 000;1
628;SARL H MEDICAL ;2019-05-23;2020-05-23;200 000;4
1344;SARL BKM PHARM;2023-02-23;2024-02-23;250 000;3
1226;SADDEK PHARM;2022-07-31;2023-07-31;250 000;3
1075;SARL BIO SAMO SARL ;2021-09-28;2022-09-28;250 000;3
1044;GROSSISTE DJELFA;2021-08-09;2022-08-09;250 000;3
229;HAMIA PHARM;2017-10-16;2018-10-16;250 000;3
1151;EURL PHARM EMINENCE;2022-03-06;2023-03-06;250 000;3
1016;PHONIX PHARM;2021-06-13;2022-06-13;250 000;3
1325;HAMTECH SARL ;2023-01-24;2024-01-24;250 000;3
1331;MAAMRI DJELFA;2023-02-05;2024-02-05;250 000;3
1028;GLOBAL PHARMA INVEST ;2021-09-07;2022-09-07;250 000;3
1260;CHERARAK PHARM;2022-10-17;2023-10-17;250 000;3
1320;SARL SOLTANA PHARM ;2023-01-09;2024-01-09;250 000;3
968;REMIDY PHARM;2021-02-04;2022-02-04;250 000;3
1162;SARL TRANSFER PHARMA SANTE;2022-03-21;2023-03-21;250 000;3
1235;DVMPHARM;2022-09-13;2023-09-13;250 000;3
1201;PROMED ;2022-05-30;2023-05-30;250 000;3
1067;AZURE-PHARM ;2021-09-15;2022-09-15;250 000;3
1197;MKM PHARM;2023-03-05;2024-03-05;250 000;3
991;BEST WEST PHARM;2021-04-07;2022-04-07;650 000;1
1002;MILENNUM;2021-04-29;2022-04-29;650 000;1
465;PH KRARI;2018-09-03;2019-09-03;100 000;6
446;HBI;2018-07-05;2019-07-05;150 000;4
884;GLOBAL PHARM ;2020-09-13;2021-09-13;200 000;3
212;METIDJA SANTE YACINE;2017-09-23;2018-09-23;150 000;4
561;ALPHAREP;2019-01-07;2020-01-07;150 000;4
621;SARL RAYANE PHARM;2019-05-09;2020-05-09;150 000;4
961;YOUSRA PHARM;2021-01-16;2022-01-16;200 000;3
1459;AKEF PHARM CHLEF;2023-12-03;2024-12-03;250 000;2
1418;SARL PHARMA SPOT ;2023-09-19;2024-09-19;250 000;2
1153;SARL RHL PHARMACEUTICAL ;2022-03-10;2023-03-10;250 000;2
1505;EURL H SANTE ;2024-02-15;2025-02-15;250 000;2
1483;RAMZ PHARM ;2024-02-01;2025-02-01;250 000;2
987;DARPHARM;2021-03-22;2022-03-22;250 000;2
1254;SARL JAS MEDIC;2022-10-05;2023-10-05;250 000;2
533;KR DISTRIMED;2018-12-01;2019-12-01;250 000;2
1511;SAICA MED;2024-02-21;2025-02-21;250 000;2
992;ANAISPHARM SELWA;2021-04-11;2022-04-11;250 000;2
1488;BADROU PHARM;2024-01-10;2025-01-10;250 000;2
1115; PARA PREMIUM;2021-12-31;2022-12-31;250 000;2
1396;VK PHARM;2023-07-06;2024-07-06;250 000;2
926;SARL MB PARAPHARM;2020-12-06;2021-12-06;250 000;2
1426;DEVELOPHARM;2023-10-23;2024-10-23;250 000;2
1513;DJANOUB PHARM;2024-02-29;2025-02-28;250 000;2
1404;ARY PHARMA;2023-08-10;2024-08-10;250 000;2
1399;SOUDAN;2023-07-26;2024-07-26;250 000;2
1458;HASSEN/THEVEST PHARM;2023-12-03;2024-12-03;250 000;2
1480;DOTICI PHARM;2023-12-30;2024-12-30;250 000;2
487;S.A.R.L THERAMEDIS;2018-11-01;2019-11-01;100 000;5
1436;ORANPHARM;2023-11-08;2024-11-08;250 000;2
1506;SARL OPTIPHARM;2024-02-15;2025-02-15;250 000;2
1040;CLESTE PHARM;2021-08-03;2022-08-03;250 000;2
1203;EURL TIMLOUKAPHARM;2022-06-08;2023-06-08;450 000;1
558;PHARMATRAK;2019-01-07;2020-01-07;225 000;2
1286;BT PHARM;2022-11-28;2023-11-28;200 000;2
1159;CONFORT PHARM;2022-03-15;2023-03-15;200 000;2
931;SARL DJENDJENPHARM;2020-12-12;2021-12-12;200 000;2
1006;BENCHERKIPHARM;2021-05-20;2022-05-20;100 000;3
904;DEVLOPA PHARM ;2020-10-26;2021-10-26;100 000;3
677;DDPP PHARM;2019-09-19;2020-09-19;150 000;2
1667;BENSALEM DHEAEDDINE;2025-02-26;2026-02-26;250 000;1
1665;BOUIRAMED;2025-02-25;2026-02-25;250 000;1
1317;MSANTE;2022-12-31;2023-12-31;250 000;1
1443;SALLEM DISTRIBUTION;2023-11-16;2024-11-16;250 000;1
1580;BERKOUKPHARM;2024-09-09;2025-09-09;250 000;1
1627;SARL SYNERGO;2024-12-18;2025-12-18;250 000;1
1466;CHELIPARACOS;2023-12-06;2024-12-06;250 000;1
1416;SARL MIPHUSMEDICS;2023-09-17;2024-09-17;250 000;1
1619;HMZ PARAPHARM;2024-12-04;2025-12-04;250 000;1
1666;SAPHARM;2025-02-25;2026-02-25;250 000;1
1489;SARL NEWLIFE DJELFA.;2024-01-14;2025-01-14;250 000;1
1163;IF PHARMA;2022-03-21;2023-03-21;250 000;1
1658;ABDENOUR PHARM;2025-02-16;2026-02-16;250 000;1
1198;SIRO PHARME;2022-05-16;2023-05-16;250 000;1
61;UPROMEDIC;2018-04-03;2019-04-03;250 000;1
1570;QUIBLA PHARM;2024-08-04;2025-08-04;250 000;1
879;RYMAL PHARM ;2020-09-06;2021-09-06;250 000;1
1059;AZ VITA PHARM;2021-09-07;2022-09-07;250 000;1
1635;EAFYPARACOSS;2024-12-30;2025-12-30;250 000;1
1116;DISTRIBUTEUR HYMZ ILLIZI;2021-12-31;2022-12-31;250 000;1
1578;BILLAL CONSTANTINE;2024-09-08;2025-09-08;250 000;1
1613;FK PHARM ;2024-12-02;2025-12-02;250 000;1
1465;CECOMED;2023-12-06;2024-12-06;250 000;1
1628;CASTIMED;2024-12-18;2025-12-18;250 000;1
1591;PARAKOL;2024-10-12;2025-10-12;250 000;1
1560;SARL OF PHARMACEUTICAL PRODUCTS;2024-07-10;2025-07-10;250 000;1
1668;NOBEL MDIC;2025-02-27;2026-02-27;250 000;1
1457;SARL PHARRECOS;2023-12-03;2024-12-03;250 000;1
1656;SARL ALPHA CARE ;2025-02-10;2026-02-10;250 000;1
1422;SARL BNOUDINA;2023-09-24;2024-09-24;250 000;1
1614;PHARMACO ;2024-12-02;2025-12-02;250 000;1
1555;HS SANTE CONSTANTINE ;2024-06-27;2025-06-27;250 000;1
1637;ASVET GHADBAN ;2025-01-07;2026-01-07;250 000;1
1657;DIAMANT PHARMA INVEST;2025-02-16;2026-02-16;250 000;1
1359;PREFERENCES;2023-03-19;2024-03-19;250 000;1
1593;STIF FIRST AKT MEDIC;2024-10-20;2025-10-20;250 000;1
1596;CHADLI PHARM;2024-11-03;2025-11-03;250 000;1
1615;PARAFIKRA;2024-12-02;2025-12-02;250 000;1
1535;CHELYPHARM;2024-04-17;2025-04-17;250 000;1
791;FUSIONPHARM;2021-02-07;2022-02-07;120 000;2
870;BENHADJA PHARM ;2020-08-10;2021-08-10;100 000;2
1236;SARL HPARADIS ;2022-09-15;2023-09-15;100 000;2
969;MEDICAB;2021-02-06;2022-02-06;100 000;2
1377;GLOBAL PHARM TEST ;2023-08-14;2024-08-14;200 000;1
1490;EURL ARAB ROCHDI MEDICAMENTS ;2024-01-21;2025-01-21;200 000;1
1340;NIGAPHARM;2023-02-21;2024-02-21;190 000;1
1161;TELEMCEN PHARM;2022-03-17;2023-03-17;190 000;1
384;UPROMEDIC ALGER;2018-03-18;2019-03-18;150 000;1
383;CASTIPHARM;2018-03-18;2019-03-18;15 000;6
1696;ASSEL PHARM;2025-07-01;2026-07-01;250 000;0
1773;IPM PHARM ;2026-01-10;2027-01-10;250 000;0
1772;SARL BOUKHEMIS MED;2026-01-07;2027-01-07;250 000;0
1708;INNOVPHARM;2025-09-14;2026-09-14;250 000;0
1364;UNICITY;2023-04-10;2024-04-10;460 000;0
1754;NOUH PARA;2025-12-16;2026-12-16;250 000;0
1744;SARL PROMO SCIENCE;2025-11-29;2026-11-29;250 000;0
1785;NOVA PARAPHARM;2026-02-18;2027-02-18;250 000;0
1789;NOVA MEDIC DJELFA;2026-03-02;2027-03-02;250 000;0
1715;AZAR PHARM ;2025-10-01;2026-10-01;250 000;0
827;ABM PHARM;2020-05-16;2021-05-16;1 000 000;0
1707;RAHIMOUPHARM;2025-09-13;2026-09-13;250 000;0
1752;AZAR PARA ALGER;2025-12-09;2026-12-09;250 000;0
1771;BHB PHARMA ;2026-01-04;2027-01-04;250 000;0
1779;AQUAPHARM;2026-02-12;2027-02-12;250 000;0
1775;SOMIE SANTE ;2026-01-18;2027-01-18;250 000;0
1774;BK SANTE;2026-01-18;2027-01-18;250 000;0
1734;GAMLAB PARA;2025-11-19;2026-11-19;250 000;0
1100;VECO PHARM ;2021-11-24;2022-11-24;2 500 000;0
1700;TESNIM PHARM;2025-07-21;2026-07-21;60 000;0
1714;AREA SANT;2025-09-25;2026-09-25;250 000;0
792;PHARMAMEDIC;2025-01-09;2026-01-09;600 000;0
1664;EL QODS PARA;2025-11-20;2026-11-20;250 000;0
1735;BHB PARA;2025-11-19;2026-11-19;250 000;0
1753;GHD ALGERIE ;2025-12-11;2026-12-11;250 000;0
1711;BFM ALGER;2025-09-15;2026-09-15;250 000;0
1674;DISPHARM2;2025-03-17;2026-03-17;250 000;0
1726;BMUS PHARM;2025-11-09;2026-11-09;250 000;0
1712;GB SANTE BFM SETIF;2025-04-10;2026-04-10;250 000;0
1698;MARLIK PARA;2025-07-02;2026-07-02;250 000;0
1725;SILVER ONE;2025-11-09;2026-11-09;250 000;0
1609;EURL CHAKIB PHARM ;2024-11-18;2025-11-18;350 000;0
1743;EURL AVERROES  TRADING PHARMA;2025-11-29;2026-11-29;250 000;0
1778;PME CONSTANTINE ;2026-02-01;2027-02-01;250 000;0`;

async function importData() {
    const lines = rawData.split('\n');
    const today = new Date();
    console.log(`Starting import of ${lines.length} clients...`);

    for (let line of lines) {
        if (!line.trim()) continue;
        const parts = line.split(';');
        if (parts.length < 5) continue;

        const numClient = parts[0].trim();
        const raisonSociale = parts[1].trim();
        const dateAchatStr = parts[2].trim();
        const prixAnStr = parts[4].trim().replace(/\s/g, '');
        const prixAn = parseFloat(prixAnStr);

        console.log(`Processing: ${raisonSociale}`);

        // 1. Insert/Update Client
        const { data: existingClient } = await supabase
            .from('prospects')
            .select('id')
            .eq('raison_sociale', raisonSociale)
            .maybeSingle();

        let clientId;
        const clientPayload = {
            raison_sociale: raisonSociale,
            contact: '-',
            telephone: '-',
            email: '-',
            secteur: 'AUTRE',
            statut: 'actif',
            cree_le: dateAchatStr,
            created_at: dateAchatStr,
            created_by: creatorId,
            solde_initial: 0,
            temperature: 'brulant'
        };

        if (existingClient) {
            clientId = existingClient.id;
            await supabase.from('prospects').update(clientPayload).eq('id', clientId);
        } else {
            const { data: newClient, error: insertError } = await supabase
                .from('prospects')
                .insert([clientPayload])
                .select()
                .maybeSingle();
            if (insertError) {
                console.error(`Error inserting client ${raisonSociale}:`, insertError);
                continue;
            }
            clientId = newClient.id;
        }

        // 2. Create Ghost Installation
        const { data: existingInst } = await supabase
            .from('installations')
            .select('id')
            .eq('client_id', clientId)
            .maybeSingle();

        let installationId;
        if (existingInst) {
            installationId = existingInst.id;
        } else {
            const { data: newInst, error: instError } = await supabase
                .from('installations')
                .insert([{
                    client_id: clientId,
                    date_installation: dateAchatStr,
                    application_installee: 'Logipharm',
                    montant: prixAn, // Using prixAn for both as placeholder to avoid null
                    montant_abonnement: prixAn,
                    created_by: creatorId,
                    statut: 'terminee',
                    type: 'acquisition'
                }])
                .select()
                .maybeSingle();
            if (instError) {
                console.error(`Error creating installation for ${raisonSociale}:`, instError);
                continue;
            }
            installationId = newInst.id;
        }

        // 3. Generate Abonnements
        let nextAboDate = new Date(dateAchatStr);
        nextAboDate.setFullYear(nextAboDate.getFullYear() + 1); // 1st year free

        while (nextAboDate <= today) {
            const dateDebut = new Date(nextAboDate);
            const dateFin = new Date(dateDebut);
            dateFin.setFullYear(dateFin.getFullYear() + 1);

            const dateDebutStr = dateDebut.toISOString().split('T')[0];
            const dateFinStr = dateFin.toISOString().split('T')[0];

            const { data: existingAbo } = await supabase
                .from('abonnements')
                .select('id')
                .eq('installation_id', installationId)
                .eq('date_debut', dateDebutStr)
                .limit(1);

            if (!existingAbo || existingAbo.length === 0) {
                let statut = 'expire';
                if (dateFin > today) {
                    statut = 'actif';
                    const alertDate = new Date();
                    alertDate.setDate(alertDate.getDate() + 30);
                    if (dateFin <= alertDate) statut = 'en_alerte';
                }

                const { error: aboError } = await supabase
                    .from('abonnements')
                    .insert([{
                        installation_id: installationId,
                        date_debut: dateDebutStr,
                        date_fin: dateFinStr,
                        statut: statut
                    }]);

                if (aboError) console.error(`Error creating abonnement for ${raisonSociale} [${dateDebutStr}]:`, aboError);
                else console.log(`   + Added abonnement for ${raisonSociale}: ${dateDebutStr}`);
            }

            nextAboDate.setFullYear(nextAboDate.getFullYear() + 1);
        }
    }
    console.log('Import finished.');
}

importData();
