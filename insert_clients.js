const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function getEnvVars() {
    const envPath = path.join(__dirname, '.env.local');
    if (!fs.existsSync(envPath)) return {};
    const content = fs.readFileSync(envPath, 'utf8');
    const vars = {};
    content.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value.length > 0) {
            vars[key.trim()] = value.join('=').trim();
        }
    });
    return vars;
}

const env = getEnvVars();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const rawData = `178;EURL TAGHAST  PHARM;Grossiste PHARM;LOTISSEMENT LES AMENDIERS 173 SOUK AHRAS;;;
61;UPROMEDIC SPA;Grossiste PHARM;ZONE D'ACTIVITEES  5 eme tranche n 24 khalfoune ain arnat setif;SETIF;;
62;EURL PHARCOS;Grossiste PHARM;Nø41 ET 42 LOTISSEMENT DAUPHIN DRARIA;ALGER;DRARIA;
212;METIDJA SANTE YACINE;Grossiste PHARM;BLIDA BENI TAMOU;BLIDA;BENI TAMOU;
229;HAMIA PHARM;Grossiste PHARM;DAR EL BIDA ALGER ;ALGER;;
370;ABDOU CHLEF GROSSISTE;Grossiste PHARM;zone industeriel chlef;CHELF;;
383;CASTIPHARM;Grossiste PHARM;BOU-ISMAIL ;TIPAZA;;
384;UPROMEDIC ALGER;Grossiste PHARM;CITE HOUAOURA SEC 01 G 273 SIDI MOUSSA;ALGER;;
391;SOMEPHARM;Grossiste PHARM;;ALGER;;
446;HBI;Grossiste PHARM;zone industeriel ZERALDA;ALGER;zeralda;
465;PH KRARI;Grossiste PHARM;;AIN-DEFLA;;
487;S.A.R.L THERAMEDIS;Grossiste PHARM;ZIROUD YOUCEF CONSTANTINE ;CONSTANTINE;;
488;YOUGHORTA PHARM (HBI);Grossiste PHARM;ONAMA CONSTANTINE ;CONSTANTINE;;
533;KR DISTRIMED;Grossiste PHARM;;ALGER;DELY-BRAHIM;
558;PHARMATRAK;Grossiste PHARM;BIR TOUTA ALGER;ALGER;;
561;ALPHAREP;Grossiste PHARM;zone industeriel oued semar alger ;ALGER;;
601;SAOULI PHARM;Grossiste PHARM;setif;SETIF;;
621;SARL RAYANE PHARM;Grossiste PHARM;FORT DE L'EAU  ALGER ;;;
628;SARL H MEDICAL ;Grossiste PHARM;BATEAU CASSE;ALGER;FORT DE L EAU;
658;EURL BAK MEDOC PHARM;Grossiste PHARM;DRARIA ;;;
673;BOUMELAH PHARM ORAN;Grossiste PHARM;;ORAN;;
677;DDPP PHARM;Grossiste PHARM;DJELFA CENTRE VILLE ;DJELFA;;
702;ROSTY PHARM;Grossiste PHARM;ONAMA CONSTANTINE ;CONSTANTINE;;
703;SETIF MEDIC ANNEX TOUGOURT ;Grossiste PHARM;;;;
704;SETIF MEDIC SETIF;Grossiste PHARM;;;;
754;BELSEM PHARM ;Grossiste PHARM;BATNA ;BATNA;;
780;PHARMA MEDIC;Grossiste PHARM;Z.A OULED MOHAMED -CHLEF;CHELF;;
791;FUSIONPHARM;Grossiste PHARM;zone industeriel chlef;CHELF;;
792;PHARMAMEDIC;Grossiste PHARM;;;;
800;PHARMACIF;Grossiste PHARM;;;;
826;KENZI PHARM CONSTANTINE ;Grossiste PHARM;zone industeriel CONSTINE ;CONSTANTINE;;
827;ABM PHARM;Grossiste PHARM;zone industeriel oued semar alger ;ALGER;;
831;GROUPE SELAMI MEDICAL ;Grossiste PHARM;CENTRE VILLE;SETIF;;
855;GOPHARM ;Grossiste PHARM;BAB ELOUED ;ALGER;;
860;KHALED PARAPHARM BOUSSEKEN;Grossiste PHARM;;MEDEA;;
862;DISPROMED CONSTANTINE;Grossiste PHARM;CENTRE VILLE CONSTANTINE ;CONSTANTINE;;
870;BENHADJA PHARM ;Grossiste PHARM;AIN DEFLA CENTR VILLE ;AIN-DEFLA;;
876;PHARMA MARKET ;Grossiste PHARM;AIN TEMOUCHENT CENTRE VILLE ;AIN-TEMOUCHENT;;
877;KRYSTAL PHARM;Grossiste PHARM;ONAMA CONSTANTINE ;CONSTANTINE;;
878;PLANTE PHARM ;Grossiste PHARM;BABA ALI ;ALGER;;
879;RYMAL PHARM ;Grossiste PHARM;TOUGGOURT ;OUARGLA;;
884;GLOBAL PHARM ;Grossiste PHARM;SENIA ORAN;ORAN;;
904;DEVLOPA PHARM ;Grossiste PHARM;BARIKA ;BATNA;;
911;ALGER PHARM CENTER APC BERAKI;Grossiste PHARM;;;;
926;SARL MB PARAPHARM;Grossiste PHARM;;;;
931;SARL DJENDJENPHARM;Grossiste PHARM;;JIJEL;TAHIR;
947;BFM ;Grossiste PHARM;;BOUIRA;;
948;SETIF MEDIC2;Grossiste PHARM;;SETIF;;
960;PARA BEST PHARM;Grossiste PHARM;;;;
961;YOUSRA PHARM;Grossiste PHARM;;CONSTANTINE;;
968;REMIDY PHARM;Grossiste PHARM;;;;
969;MEDICAB;Grossiste PHARM;;AIN-DEFLA;;
987;DARPHARM;Grossiste PHARM;;;;
991;BEST WEST PHARM;Grossiste PHARM;;;;
992;ANAISPHARM SELWA;Grossiste PHARM;;;;
1002;MILENNUM;Grossiste PHARM;;;;
1004;BEST MEDIC;Grossiste PHARM;;;;
1006;BENCHERKIPHARM;Grossiste PHARM;;;;
1009;BEST MEDIC;Grossiste PHARM;;;;
1013;PHARMA DEVELOP CONSTANTINE;Grossiste PHARM;;;;
1015;EURL BHM SANTE ;Grossiste PHARM;;;;
1016;PHONIX PHARM;Grossiste PHARM;;;;
1028;GLOBAL PHARMA INVEST ;Grossiste PHARM;;;;
1040;CLESTE PHARM;Grossiste PHARM;;;;
1044;GROSSISTE DJELFA;Grossiste PHARM;;;;
1056;GREATPHARM;Grossiste PHARM;;;;
1059;AZ VITA PHARM;Grossiste PHARM;;;;
1060;SANACHE PHARM;Grossiste PHARM;;;;
1067;AZURE-PHARM ;Grossiste PHARM;;;;
1075;SARL BIO SAMO SARL ;Grossiste PHARM;;;;
1084;NASSIMA BIOCARE ;Grossiste PHARM;;;;
1100;VECO PHARM ;Grossiste PHARM;;;;
1115; PARA PREMIUM;Grossiste PHARM;;;;
1116;DISTRIBUTEUR HYMZ ILLIZI;Grossiste PHARM;;ILLIZI;;
1139;KRARI AHMED SETIF;Grossiste PHARM;;;;
1151;EURL PHARM EMINENCE;Grossiste PHARM;;CONSTANTINE;;
1153;SARL RHL PHARMACEUTICAL ;Grossiste PHARM;;;;
1159;CONFORT PHARM;Grossiste PHARM;;;;
1160;PHARMAT CONFORT;Grossiste PHARM;;BLIDA;;
1161;TELEMCEN PHARM;Grossiste PHARM;;;;
1162;SARL TRANSFER PHARMA SANTE;Grossiste PHARM;;;;
1163;IF PHARMA;Grossiste PHARM;;;;
1190;VITOPHARM;Grossiste PHARM;;;;
1197;MKM PHARM;Grossiste PHARM;;;;
1198;SIRO PHARME;Grossiste PHARM;;;;
1201;PROMED ;Grossiste PHARM;;;;
1203;EURL TIMLOUKAPHARM;Grossiste PHARM;;;;
1226;SADDEK PHARM;Grossiste PHARM;;;;
1227;COSMIPHARM;Grossiste PHARM;;;;
1235;DVMPHARM;Grossiste PHARM;;;;
1236;SARL HPARADIS ;Grossiste PHARM;;TIPAZA;;
1254;SARL JAS MEDIC;Grossiste PHARM;;;;
1260;CHERARAK PHARM;Grossiste PHARM;;;;
1280;DIOUAN ;Grossiste PHARM;;;;
1286;BT PHARM;Grossiste PHARM;;;;
1317;MSANTE;Grossiste PHARM;;;;
1320;SARL SOLTANA PHARM ;Grossiste PHARM;;;;
1325;HAMTECH SARL ;Grossiste PHARM;;;;
1331;MAAMRI DJELFA;Grossiste PHARM;;;;
1340;NIGAPHARM;Grossiste PHARM;;;;
1344;SARL BKM PHARM;Grossiste PHARM;;;;
1359;PREFERENCES;Grossiste PHARM;;ORAN;;
1364;UNICITY;Grossiste PHARM;;;;
1377;GLOBAL PHARM TEST ;Grossiste PHARM;;;;
1396;VK PHARM;Grossiste PHARM;;;;
1399;SOUDAN;Grossiste PHARM;;;;
1404;ARY PHARMA;Grossiste PHARM;;;;
1416;SARL MIPHUSMEDICS;Grossiste PHARM;;;;
1418;SARL PHARMA SPOT ;Grossiste PHARM;;SKIKDA;;
1422;SARL BNOUDINA;Grossiste PHARM;;BATNA;;
1426;DEVELOPHARM;Grossiste PHARM;;BLIDA;;
1436;ORANPHARM;Grossiste PHARM;;ORAN;;
1443;SALLEM DISTRIBUTION;Grossiste PHARM;;GHARDAIA;;
1457;SARL PHARRECOS;Grossiste PHARM;;ALGER;DRARIA;
1458;HASSEN/THEVEST PHARM;Grossiste PHARM;;ALGER;;
1459;AKEF PHARM CHLEF;Grossiste PHARM;;CHELF;;
1465;CECOMED;Grossiste PHARM;;ALGER;;
1466;CHELIPARACOS;Grossiste PHARM;;CHELF;;
1480;DOTICI PHARM;Grossiste PHARM;;B.B.ARRERIDJ;;
1483;RAMZ PHARM ;Grossiste PHARM;;CONSTANTINE;;
1488;BADROU PHARM;Grossiste PHARM;;CONSTANTINE;;
1489;SARL NEWLIFE DJELFA.;Grossiste PHARM;;DJELFA;;
1490;EURL ARAB ROCHDI MEDICAMENTS ;Grossiste PHARM;;SETIF;;
1503;BIOREAL SPA;Grossiste PHARM;;ALGER;;
1505;EURL H SANTE ;Grossiste PHARM;;CHELF;;
1506;SARL OPTIPHARM;Grossiste PHARM;;SETIF;;
1511;SAICA MED;Grossiste PHARM;;M'SILA;;
1513;DJANOUB PHARM;Grossiste PHARM;;LAGHOUAT;;
1535;CHELYPHARM;Grossiste PHARM;;CHELF;;
1555;HS SANTE CONSTANTINE ;Grossiste PHARM;;CONSTANTINE;;
1560;SARL OF PHARMACEUTICAL PRODUCTS;Grossiste PHARM;;;;
1570;QUIBLA PHARM;Grossiste PHARM;;DJELFA;;
1578;BILLAL CONSTANTINE;Grossiste PHARM;;CONSTANTINE;;
1580;BERKOUKPHARM;Grossiste PHARM;;ALGER;;
1591;PARAKOL;Grossiste PHARM;;ALGER;;
1593;STIF FIRST AKT MEDIC;Grossiste PHARM;;SETIF;;
1596;CHADLI PHARM;Grossiste PHARM;;MASCARA;;
1609;EURL CHAKIB PHARM ;Grossiste PHARM;18 coop hadjia mahnia bir el djir oran;ORAN;;
1613;FK PHARM ;Grossiste PHARM;;ALGER;;
1614;PHARMACO ;Grossiste PHARM;;TLEMCEN;;
1615;PARAFIKRA;Grossiste PHARM;;CHELF;;
1619;HMZ PARAPHARM;Grossiste PHARM;;ALGER;;
1627;SARL SYNERGO;Grossiste PHARM;;ALGER;;
1628;CASTIMED;Grossiste PHARM;;TIPAZA;BOU-ISMAIL;
1635;EAFYPARACOSS;Grossiste PHARM;;ORAN;;
1637; ASVET GHADBAN ;Grossiste PHARM;;M'SILA;;
1656;SARL ALPHA CARE ;Grossiste PHARM;;ALGER;;
1657;DIAMANT PHARMA INVEST;Grossiste PHARM;;B.B.ARRERIDJ;;
1658;ABDENOUR PHARM;Grossiste PHARM;;ANNABA;;
1664;EL QODS PARA;Grossiste PHARM;;ALGER;;
1665;BOUIRAMED;Grossiste PHARM;;BOUIRA;;
1666;SAPHARM;Grossiste PHARM;;BOUIRA;;
1667;BENSALEM DHEAEDDINE;Grossiste PHARM;;B.B.ARRERIDJ;;
1668;NOBEL MDIC;Grossiste PHARM;;ALGER;;
1674;DISPHARM2;Grossiste PHARM;;ALGER;;
1690;BIOPHARM ;Grossiste PHARM;;BLIDA;;
1696;ASSEL PHARM;Grossiste PHARM;;RELIZANE;;
1700;TESNIM PHARM;Grossiste PHARM;;ALGER;;
1707;RAHIMOUPHARM;Grossiste PHARM;;ALGER;;
1708;INNOVPHARM;Grossiste PHARM;;BATNA;;
1711;BFM ALGER;Grossiste PHARM;;ALGER;;
1712;GB SANTE BFM SETIF;Grossiste PHARM;;SETIF;;
1714;AREA SANT;Grossiste PHARM;;ORAN;;
1715;AZAR PHARM ;Grossiste PHARM;;ORAN;;
1725;SILVER ONE;Grossiste PHARM;;BOUMERDES;;
1726;BMUS PHARM;Grossiste PHARM;;BLIDA;;
1734;GAMLAB PARA;Grossiste PHARM;;ALGER;;
1735;BHB PARA;Grossiste PHARM;;ALGER;;
1743;EURL AVERROES  TRADING PHARMA;Grossiste PHARM;;DJELFA;;
1744;SARL PROMO SCIENCE;Grossiste PHARM;;EL-OUED;;
1752;AZAR PARA ALGER;Grossiste PHARM;;ALGER;;
1753;GHD ALGERIE ;Grossiste PHARM;;ALGER;;
1754;NOUH PARA;Grossiste PHARM;;ALGER;;
1757;BFM PARA;Grossiste PHARM;;BOUIRA;;`;

const lines = rawData.trim().split('\n');

async function insertClients() {
    const clientsToInsert = lines.map(line => {
        const [no, raisonSociale, typeClient, adresse, wilaya, ville, formeJuridique] = line.split(';');

        // Concatenate extra info into contact if not available elsewhere
        const contactInfo = [adresse, ville, formeJuridique].filter(Boolean).join(', ') || 'N/A';

        return {
            raison_sociale: raisonSociale || '',
            secteur: (typeClient || 'GROSSISTE PHARM').toUpperCase().trim(),
            wilaya: wilaya || '',
            contact: contactInfo,
            statut: 'actif', // User said "TABLE CLIENT PAS PROSPECTS"
            temperature: 'brulant', // High interest because they are already clients
            telephone: '',
            email: ''
        };
    });

    console.log(`Preparing to insert ${clientsToInsert.length} clients...`);

    // Insert in batches of 50 to avoid issues
    const batchSize = 50;
    for (let i = 0; i < clientsToInsert.length; i += batchSize) {
        const batch = clientsToInsert.slice(i, i + batchSize);
        const { data, error } = await supabase.from('prospects').insert(batch);
        if (error) {
            console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
        } else {
            console.log(`Inserted batch ${i / batchSize + 1}`);
        }
    }
}

insertClients();
