
const { createClient } = require('@supabase/supabase-client');
require('dotenv').config();

// Configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erreur: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY manquants dans le .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function repairStatuses() {
    console.log('🚀 Démarrage de la réparation des statuts clients...');

    try {
        // 1. Récupérer tous les clients actifs
        const { data: clients, error: fetchError } = await supabase
            .from('prospects')
            .select('id, raison_sociale, statut, historique_actions')
            .eq('statut', 'actif');

        if (fetchError) throw fetchError;

        console.log(`📊 ${clients.length} clients actifs trouvés. Vérification en cours...`);

        let repairedCount = 0;

        for (const client of clients) {
            // a. Vérifier dans la table prospect_history
            const { data: historyEntries, error: historyError } = await supabase
                .from('prospect_history')
                .select('id')
                .eq('prospect_id', client.id)
                .eq('type_action', 'installation');

            if (historyError) {
                console.error(`⚠️ Erreur lecture historique pour ${client.raison_sociale}:`, historyError.message);
                continue;
            }

            // b. Vérifier dans le JSON legacy
            let jsonInstallations = [];
            try {
                const jsonHistory = client.historique_actions ? JSON.parse(client.historique_actions) : [];
                jsonInstallations = jsonHistory.filter(h => h.action === 'installation');
            } catch (e) {
                jsonInstallations = [];
            }

            const totalInst = (historyEntries?.length || 0) + jsonInstallations.length;

            if (totalInst === 0) {
                console.log(`📉 RÉPARATION: ${client.raison_sociale} n'a aucune installation. Rétrogradation en PROSPECT.`);

                const { error: updateError } = await supabase
                    .from('prospects')
                    .update({ statut: 'prospect' })
                    .eq('id', client.id);

                if (updateError) {
                    console.error(`❌ Échec mise à jour pour ${client.raison_sociale}:`, updateError.message);
                } else {
                    repairedCount++;
                }
            } else {
                // console.log(`✅ ${client.raison_sociale} est valide (${totalInst} installation(s)).`);
            }
        }

        console.log('\n✨ Réparation terminée !');
        console.log(`✅ Nombre de clients rétrogradés en prospects: ${repairedCount}`);

    } catch (error) {
        console.error('❌ Erreur fatale lors de la réparation:', error);
    }
}

repairStatuses();
