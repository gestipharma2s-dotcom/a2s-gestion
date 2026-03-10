const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'src/components/.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const dataToImport = [
    { "date": "2026-01-18", "client": "UPROMEDIC SPA", "solde": 4914700.00 },
    { "date": "2025-09-15", "client": "BFM ALGER", "solde": 4261535.00 },
    { "date": "2026-02-01", "client": "PHS CONSTANTINE", "solde": 2400000.00 },
    { "date": "2021-04-08", "client": "EURL BHM SANTE", "solde": 1800000.00 },
    { "date": "2025-06-16", "client": "VECO PHARM", "solde": 1606000.00 },
    { "date": "2025-05-11", "client": "NOBEL MDIC", "solde": 1400000.00 },
    { "date": "2026-01-18", "client": "HADJOU PHARM", "solde": 1400000.00 },
    { "date": "2025-12-16", "client": "NOUH PARA", "solde": 1330001.00 },
    { "date": "2026-05-04", "client": "NOVA MEDIC DELTA", "solde": 1250000.00 },
    { "date": "2018-11-08", "client": "ORAY PHARM", "solde": 1200000.00 },
    { "date": "2020-12-03", "client": "HASSEN/THEVEST PHARM", "solde": 1127000.00 },
    { "date": "2024-02-21", "client": "SAICA MED", "solde": 1125000.00 },
    { "date": "2024-12-04", "client": "HMZ PARAPHARM", "solde": 1100000.00 },
    { "date": "2026-01-18", "client": "IPM PHARM", "solde": 1011100.00 },
    { "date": "2026-01-04", "client": "BMB PHARMA", "solde": 1000000.00 },
    { "date": "2024-12-18", "client": "EAFYPARACOSS", "solde": 1000000.00 },
    { "date": "2024-04-08", "client": "BILLAL CONSTANTINE", "solde": 1000000.00 },
    { "date": "2024-02-29", "client": "SARL JAS MEDIC", "solde": 1000000.00 },
    { "date": "2024-06-17", "client": "HS SANTE CONSTANTINE", "solde": 1000000.00 },
    { "date": "2026-02-27", "client": "ADEL MEDIC", "solde": 1000000.00 },
    { "date": "2025-12-08", "client": "AZAR PARA ALGER", "solde": 900000.00 },
    { "date": "2024-07-29", "client": "EURL PHARCOS", "solde": 900000.00 },
    { "date": "2021-02-03", "client": "VK PHARM", "solde": 800000.00 },
    { "date": "2023-10-10", "client": "BENELDJ PHARM", "solde": 800000.00 },
    { "date": "2024-03-01", "client": "SETIF MEDIC2", "solde": 750000.00 },
    { "date": "2023-10-24", "client": "PHARMA MEDIC", "solde": 720000.00 },
    { "date": "2021-05-08", "client": "EURL PHARM EMINENCE", "solde": 700000.00 },
    { "date": "2024-03-03", "client": "HADJA PHARM", "solde": 690000.00 },
    { "date": "2026-01-02", "client": "BPM ALGER", "solde": 676000.00 },
    { "date": "2021-12-10", "client": "SETIF MEDIC SETIF", "solde": 650000.00 },
    { "date": "2015-11-05", "client": "SILVER ONE", "solde": 600000.00 },
    { "date": "2021-12-11", "client": "GHD ALGERIE", "solde": 600000.00 },
    { "date": "2015-11-05", "client": "BMUS PHARM", "solde": 600000.00 },
    { "date": "2015-09-05", "client": "MOUI PHARM", "solde": 600000.00 },
    { "date": "2026-02-18", "client": "VETER PHARM", "solde": 596000.00 },
    { "date": "2021-02-24", "client": "VITOPHARM", "solde": 596000.00 },
    { "date": "2024-04-08", "client": "EURL PHARCOS", "solde": 500000.00 },
    { "date": "2024-02-18", "client": "DIAMANT PHARMA INVEST", "solde": 500000.00 },
    { "date": "2015-02-12", "client": "ABIK PHARM", "solde": 450000.00 },
    { "date": "2022-02-04", "client": "SARL ORTHO PARM", "solde": 450000.00 },
    { "date": "2024-02-24", "client": "PHARMACIF", "solde": 450000.00 },
    { "date": "2024-01-08", "client": "PHONIX PHARM", "solde": 400000.00 },
    { "date": "2020-05-11", "client": "KENZI PHARM CONSTANTINE", "solde": 400000.00 },
    { "date": "2025-10-01", "client": "AZAR PHARM", "solde": 400000.00 },
    { "date": "2023-10-27", "client": "BADROU PHARM", "solde": 370000.00 },
    { "date": "2016-03-12", "client": "AQUA PHARM", "solde": 354000.00 },
    { "date": "2015-08-05", "client": "SETIF MEDIC SETIF", "solde": 350000.00 },
    { "date": "2020-05-13", "client": "ISAM PHARM", "solde": 340000.00 },
    { "date": "2025-12-01", "client": "STIF FIRST AKT MEDIC", "solde": 300000.00 },
    { "date": "2015-03-18", "client": "BEST MEDIC", "solde": 300000.00 },
    { "date": "2024-01-14", "client": "SARL PHARM DELTA", "solde": 300000.00 },
    { "date": "2022-08-13", "client": "PH PHARM", "solde": 300000.00 },
    { "date": "2022-02-21", "client": "SADDEK PHARM", "solde": 300000.00 },
    { "date": "2026-01-15", "client": "AB SANTE", "solde": 300000.00 },
    { "date": "2018-03-30", "client": "HAMADI PHARM", "solde": 297500.00 },
    { "date": "2022-02-04", "client": "BIOREM SPA", "solde": 257500.00 },
    { "date": "2015-10-21", "client": "CHELYPHARM", "solde": 210000.00 },
    { "date": "2015-11-04", "client": "BIM ALGER", "solde": 276000.00 },
    { "date": "2021-04-08", "client": "CLESTE PHARM", "solde": 250000.00 },
    { "date": "2015-04-08", "client": "SARL PHARRECOS", "solde": 250000.00 },
    { "date": "2021-04-08", "client": "IF PHARMA", date: "2015-04-08", "solde": 250000.00 },
    { "date": "2021-04-08", "client": "ALPHAREP", "solde": 250000.00 },
    { "date": "2015-04-08", "client": "QUIBLA PHARM", "solde": 250000.00 },
    { "date": "2015-05-13", "client": "SARL BIO SAMO SARL", "solde": 240000.00 },
    { "date": "2015-12-16", "client": "NOJA PHARM", "solde": 220000.00 },
    { "date": "2021-02-11", "client": "SAOULI PHARM", "solde": 214500.00 }
];

async function importClients() {
    console.log("🚀 Démarrage de l'importation massive des clients...");

    let successCount = 0;
    let errorCount = 0;

    for (const item of dataToImport) {
        const insertData = {
            raison_sociale: item.client,
            contact: item.client,
            telephone: "Non renseigné", // Champ obligatoire dans le schéma Supabase
            statut: 'actif',
            solde_initial: item.solde,
            created_at: new Date(item.date).toISOString(),
            temperature: 'chaud',
            secteur: 'AUTRE'
        };

        const { data, error } = await supabase
            .from('prospects')
            .insert([insertData]);

        if (error) {
            console.error(`❌ Erreur pour ${item.client}:`, error.message);
            errorCount++;
        } else {
            console.log(`✅ Importé: ${item.client} (Solde: ${item.solde})`);
            successCount++;
        }
    }

    console.log(`\n✨ Importation terminée !`);
    console.log(`📈 Succès: ${successCount}`);
    console.log(`⚠️ Erreurs: ${errorCount}`);
}

importClients();
