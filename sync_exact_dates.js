const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'src/components/.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const mappings = [
    { name: "UPROMEDIC SPA", date: "2026-01-18" },
    { name: "BFM ALGER", date: "2025-09-15" },
    { name: "PHS CONSTANTINE", date: "2026-02-01" },
    { name: "EURL BHM SANTE", date: "2021-04-08" },
    { name: "VECO PHARM", date: "2025-06-16" },
    { name: "NOBEL MDIC", date: "2025-05-11" },
    { name: "HADJOU PHARM", date: "2026-01-18" },
    { name: "NOUH PARA", date: "2025-12-16" },
    { name: "NOVA MEDIC DELTA", date: "2026-05-04" },
    { name: "ORAY PHARM", date: "2018-11-08" },
    { name: "HASSEN/THEVEST PHARM", date: "2020-12-03" },
    { name: "SAICA MED", date: "2024-02-21" },
    { name: "HMZ PARAPHARM", date: "2024-12-04" },
    { name: "IPM PHARM", date: "2026-01-18" },
    { name: "BHB PHARMA", date: "2026-01-04" },
    { name: "EAFYPARACOSS", date: "2024-12-18" },
    { name: "BILLAL CONSTANTINE", date: "2024-04-08" },
    { name: "SARL JAS MEDIC", date: "2024-02-29" },
    { name: "HS SANTE CONSTANTINE", date: "2024-06-17" },
    { name: "NOBEL MDIC", date: "2026-02-27" },
    { name: "AZAR PARA ALGER", date: "2015-12-08" },
    { name: "EURL PHARCOS", date: "2024-07-29" },
    { name: "VK PHARM", date: "2021-02-03" },
    { name: "DEVLOPA PHARM", date: "2023-10-10" },
    { name: "EURL PHARCOS", date: "2021-09-09" },
    { name: "SETIF MEDIC2", date: "2024-03-01" },
    { name: "PHARMA MEDIC", date: "2023-10-24" },
    { name: "EURL PHARM EMINENCE", date: "2021-05-08" },
    { name: "HADJA PHARM", date: "2024-03-03" },
    { name: "BFM ALGER", date: "2026-01-02" },
    { name: "SETIF MEDIC SETIF", date: "2021-12-10" },
    { name: "SILVER ONE", date: "2015-11-05" },
    { name: "GHD ALGERIE", date: "2021-12-11" },
    { name: "BMUS PHARM", date: "2015-11-05" },
    { name: "MOUI PHARM", date: "2015-09-05" },
    { name: "VITOPHARM", date: "2026-02-18" },
    { name: "VITOPHARM", date: "2021-02-24" },
    { name: "EURL PHARCOS", date: "2024-04-08" },
    { name: "DIAMANT PHARMA INVEST", date: "2024-02-18" },
    { name: "ABIK PHARM", date: "2015-02-12" },
    { name: "SARL OPTIPHARM", date: "2023-04-03" },
    { name: "PHARMACIF", date: "2024-02-24" },
    { name: "PHONIX PHARM", date: "2024-01-08" },
    { name: "KENZI PHARM CONSTANTINE", date: "2020-05-11" },
    { name: "AZAR PHARM", date: "2025-10-01" },
    { name: "BADROU PHARM", date: "2023-10-27" },
    { name: "AQUA PHARM", date: "2016-03-12" },
    { name: "SETIF MEDIC SETIF", date: "2015-08-05" },
    { name: "ISAM PHARM", date: "2020-05-13" },
    { name: "STIF FIRST AKT MEDIC", date: "2015-12-01" },
    { name: "BEST MEDIC", date: "2015-03-18" },
    { name: "SARL PHARM DELTA", date: "2024-01-14" },
    { name: "PH PHARM", date: "2022-08-13" },
    { name: "SADDEK PHARM", date: "2022-02-21" },
    { name: "AB SANTE", date: "2026-01-15" },
    { name: "HAMADI PHARM", date: "2018-03-30" },
    { name: "BIOREM SPA", date: "2022-02-04" },
    { name: "CHELYPHARM", date: "2015-10-21" },
    { name: "BFM ALGER", date: "2024-01-04" },
    { name: "EURL H SANTE", date: "2015-05-13" },
    { name: "MAAMRI DJELFA", date: "2022-05-28" },
    { name: "BB SANTE", date: "2021-02-14" },
    { name: "SARL ME PHARMA WAH", date: "2015-09-03" },
    { name: "SARL OPTIPHARM", date: "2025-08-05" },
    { name: "BIOCHIMIE ET ANALYSES", date: "2021-04-08" },
    { name: "DASRI PHARM", date: "2021-04-08" },
    { name: "CLESTE PHARM", date: "2021-04-08" },
    { name: "SARL PHARRECOS", date: "2015-04-08" },
    { name: "IF PHARMA", date: "2021-04-08" },
    { name: "ALPHAREP", date: "2021-04-08" },
    { name: "QUIBLA PHARM", date: "2015-04-08" },
    { name: "SARL BIO SAMO SARL", date: "2015-05-13" },
    { name: "MAAMRI DJELFA", date: "2024-01-08" },
    { name: "NOJA PHARM", date: "2015-12-16" },
    { name: "SAOULI PHARM", date: "2021-02-11" },
    { name: "SARL DJENDJENPHARM", date: "2015-11-21" },
    { name: "SARL BNOUDINA", date: "2015-11-21" },
    { name: "REMIDY PHARM", date: "2021-04-08" },
    { name: "RYMAL PHARM", date: "2015-09-05" },
    { name: "VECO PHARM", date: "2015-09-05" },
    { name: "DARPHARM", date: "2015-03-18" },
    { name: "AREASANT", date: "2026-05-01" },
    { name: "RYMAL PHARM", date: "2021-01-09" },
    { name: "EURL PHARM EMINENCE", date: "2022-08-05" },
    { name: "HADIL PHARM", date: "2021-12-10" },
    { name: "PLANTE PHARM", date: "2015-09-05" },
    { name: "BFM ALGER", date: "2015-11-04" },
    { name: "SARL ALPHA CARE", date: "2015-11-21" },
    { name: "VECO PHARM", date: "2015-03-03" },
    { name: "EURL PHARCOS", date: "2024-03-10" },
    { name: "HAMIA PHARM", date: "2024-03-01" },
    { name: "SARL HPARADIS", date: "2022-02-02" },
    { name: "SIRO PHARME", date: "2022-01-18" },
    { name: "METIDJA SANTE YACINE", date: "2022-02-02" },
    { name: "BENHADJA PHARM", date: "2022-10-24" },
    { name: "VECO PHARM", date: "2025-06-18" },
    { name: "SARL PHARMA SPOT", date: "2024-09-19" },
    { name: "CHADLI PHARM", date: "2015-11-04" },
    { name: "BT PHARM", date: "2024-01-18" },
    { name: "PREFERENCES", date: "2015-10-02" },
    { name: "NOVA MEDIC DELTA", date: "2026-05-02" },
    { name: "CHELIPARACOS", date: "2020-10-18" },
    { name: "SARL MIPHUSMEDICS", date: "2024-02-11" },
    { name: "MEDICAB", date: "2023-04-11" }
];

async function run() {
    console.log('🚀 Final Creation Date Sync using exact file values...');
    const { data: prospects, error } = await supabase.from('prospects').select('id, raison_sociale');
    if (error) { console.error(error); process.exit(1); }

    let updateCount = 0;
    for (const mapping of mappings) {
        const prospect = prospects.find(p => p.raison_sociale.toLowerCase().trim() === mapping.name.toLowerCase().trim());
        if (prospect) {
            const isoDate = new Date(`${mapping.date}T12:00:00Z`).toISOString();
            const { error: updateError } = await supabase.from('prospects').update({ created_at: isoDate }).eq('id', prospect.id);
            if (!updateError) {
                console.log(`✅ Fixed: ${mapping.name} -> ${mapping.date}`);
                updateCount++;
            } else {
                console.error(`❌ Error updating ${mapping.name}:`, updateError.message);
            }
        } else {
            // console.warn(`⚠️ Skipped: ${mapping.name} (not found in DB)`);
        }
    }
    console.log(`\n✨ Finished. Total exact updates: ${updateCount}`);
}
run();
