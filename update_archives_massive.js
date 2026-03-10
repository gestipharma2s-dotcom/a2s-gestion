const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'src/components/.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const cluster20151122 = [
    "Gms pharm",
    "Ouchenane pharm",
    "ETHICARE groupe cher medic",
    "Sk pharm",
    "Aliliche pharm"
];

const cluster20160116 = [
    "Allouane djelfa ",
    "Innova groupe",
    "SARL 2ML diagnostics"
];

const cluster20160114 = [
    "Lab madani"
];

const cluster20160104 = [
    "bbiopharm"
];

async function run() {
    console.log('🚀 Démarrage de la mise à jour massive (Archives Batch 3)...');

    const { data: prospects, error } = await supabase
        .from('prospects')
        .select('id, raison_sociale, created_at');

    if (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }

    // Filtrer ceux qui ont encore la date par défaut
    const targets = prospects.filter(p => p.created_at.includes('2025-12-31'));
    console.log(`🔍 ${targets.length} cibles identifiées.`);

    let updateCount = 0;

    for (const p of targets) {
        let newDate = "2015-04-08"; // Par défaut pour le gros lot d'archives

        if (cluster20151122.some(name => p.raison_sociale.toLowerCase().includes(name.toLowerCase()))) {
            newDate = "2015-11-22";
        } else if (cluster20160116.some(name => p.raison_sociale.toLowerCase().includes(name.toLowerCase()))) {
            newDate = "2016-01-16";
        } else if (cluster20160114.some(name => p.raison_sociale.toLowerCase().includes(name.toLowerCase()))) {
            newDate = "2016-01-14";
        } else if (cluster20160104.some(name => p.raison_sociale.toLowerCase().includes(name.toLowerCase()))) {
            newDate = "2016-01-04";
        }

        const isoDate = new Date(`${newDate}T12:00:00Z`).toISOString();

        const { error: updateError } = await supabase
            .from('prospects')
            .update({ created_at: isoDate })
            .eq('id', p.id);

        if (updateError) {
            console.error(`❌ Erreur update ${p.raison_sociale}:`, updateError.message);
        } else {
            console.log(`✅ ${p.raison_sociale} -> ${newDate}`);
            updateCount++;
        }
    }

    console.log(`\n✨ Terminé ! ${updateCount} mis à jour.`);
}

run();
