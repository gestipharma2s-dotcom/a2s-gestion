const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'src/components/.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const mapping = {
    "UPROMEDIC SPA": "2026-01-18",
    "BFM ALGER": "2025-09-15",
    "PHS CONSTANTINE": "2026-02-01",
    "EURL BHM SANTE": "2021-04-08",
    "VECO PHARM": "2025-06-16",
    "NOBEL MDIC": "2025-05-11",
    "HADJOU PHARM": "2026-01-18",
    "NOUH PARA": "2025-12-16",
    "NOVA MEDIC DELTA": "2026-05-04",
    "ORAY PHARM": "2018-11-08",
    "HASSEN/THEVEST PHARM": "2020-12-03",
    "SAICA MED": "2024-02-21",
    "HMK PARA PHARM": "2024-12-04",
    "IPM PHARM": "2026-01-18",
    "BMB PHARMA": "2026-01-04",
    "EAFYPARACOSS": "2024-12-18",
    "BILLAL CONSTANTINE": "2024-04-08",
    "SARL MS MEDIC": "2024-02-29",
    "HS SANTE CONSTANTINE": "2024-06-17",
    "ADEL MEDIC": "2016-03-27",
    "AZAR PARA ALGER": "2025-12-08",
    "EURL PHARCOS": "2024-07-29",
    "VK PHARM": "2021-02-03",
    "BENELDJ PHARM": "2023-10-10",
    "SETIF MEDIC2": "2024-03-01",
    "PHARMA MEDIC": "2023-10-24",
    "EURL PHARM EMINENCE": "2021-05-08",
    "HADJA PHARM": "2024-03-03",
    "SETIF MEDIC SETIF": "2021-12-10",
    "SILVER ONE": "2015-11-05",
    "GHD ALGERIE": "2021-12-11",
    "BMUS PHARM": "2015-11-05",
    "MOUI PHARM": "2015-09-05",
    "VETER PHARM": "2021-02-24",
    "DIAMANT PHARMA INVEST": "2024-02-18",
    "ABIK PHARM": "2015-02-12",
    "SARL ORTHO PARM": "2022-02-04",
    "PHARMACIF": "2024-02-24",
    "BIOPRO PHARM": "2024-01-08",
    "IONZI PHARMA CONSTANTINE": "2020-05-11",
    "AZAR PHARM ": "2025-10-01",
    "AQUA PHARM": "2016-03-12",
    "ISAM PHARM": "2020-05-13",
    "STIF FIRST AKT MEDIC": "2025-12-01",
    "BEST MEDIC": "2026-02-01",
    "SARL PHARM DELTA": "2024-01-14",
    "PH PHARM": "2022-08-13",
    "SADDEK PHARM": "2022-02-21",
    "AB SANTE": "2026-01-15",
    "HAMADI PHARM": "2018-03-30",
    "BIOREAL SPA": "2022-02-04",
    "CHEY PHARM": "2015-10-21",
    "EURL H SANTE ": "2015-05-13",
    "MANAMIIH ET SA": "2021-02-05",
    "BB SANTE": "2021-02-14",
    "SARL ME PHARMA WAH": "2015-09-03",
    "BIOCHIMIE ET ANALYSES": "2021-04-08",
    "DASRI PHARM": "2021-04-08",
    "CLESTE PHARM": "2021-04-08",
    "SARL PHARRECOS": "2015-04-08",
    "IF PHARMA": "2021-04-08",
    "ALPHAREP": "2021-04-08",
    "QUIBLA PHARM": "2015-04-08",
    "SARL BIO SAMO SARL ": "2015-05-13",
    "DARPHARM": "2015-03-18",
    "MAAMRI DJELFA": "2022-05-28",
    "NOJA PHARM": "2025-12-16",
    "SAOULI PHARM": "2021-02-11",
    "SARL MB PARAPHARM": "2026-01-04",
    "SARL DJENDJENPHARM": "2021-02-11",
    "REMIDY PHARM": "2021-04-08",
    "MEDICAB": "2023-10-13",
    "YOUGHORTA PHARM (HBI)": "2020-12-03",
    "UPROMEDIC ALGER": "2015-11-04",
    "SARL ALPHA CARE ": "2015-11-21",
    "EURL TAGHAST  PHARM": "2014-03-01",
    "HAMIA PHARM": "2024-03-01",
    "SARL HPARADIS ": "2022-02-02",
    "SIRO PHARME": "2022-01-18",
    "METIDJA SANTE YACINE": "2022-02-02",
    "BENHADJA PHARM ": "2022-10-24",
    "SARL PHARMA SPOT ": "2024-09-19",
    "CHADLI PHARM": "2015-11-04",
    "BT PHARM": "2024-01-18",
    "PREFERENCES": "2015-10-02",
    "CHELYPHARM": "2015-01-18",
    "SARL MIPHUSMEDICS": "2024-02-11",
    "NOVA MEDIC DELTA": "2023-01-04"
};

async function run() {
    console.log('🚀 Démarrage de la mise à jour des dates de création (Pass 2)...');

    const { data: prospects, error } = await supabase.from('prospects').select('id, raison_sociale');

    if (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }

    let updateCount = 0;
    let failCount = 0;

    for (const [name, date] of Object.entries(mapping)) {
        const prospect = prospects.find(p =>
            p.raison_sociale.toLowerCase().trim() === name.toLowerCase().trim()
        );

        if (prospect) {
            const isoDate = new Date(`${date}T12:00:00Z`).toISOString();

            const { error: updateError } = await supabase
                .from('prospects')
                .update({ created_at: isoDate })
                .eq('id', prospect.id);

            if (updateError) {
                console.error(`❌ Erreur update ${name}:`, updateError.message);
                failCount++;
            } else {
                console.log(`✅ ${name} updated to ${date}`);
                updateCount++;
            }
        } else {
            console.warn(`⚠️ Prospect non trouvé: "${name}"`);
            failCount++;
        }
    }

    console.log(`\n✨ Terminé ! ${updateCount} mis à jour, ${failCount} ignorés.`);
}

run();
