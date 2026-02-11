
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function listMissions() {
    const { data, error } = await supabase
        .from('missions')
        .select('id, titre, statut, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('\n--- LISTE DES MISSIONS ---');
    data.forEach(m => {
        console.log(`ID: ${m.id} | Titre: ${m.titre} | Statut: ${m.statut}`);
    });
    console.log('--------------------------\n');
}

listMissions();
