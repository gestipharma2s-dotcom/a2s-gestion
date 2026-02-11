
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ynoxsibapzatlxhmredp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlub3hzaWJhcHphdGx4aG1yZWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTQ5OTcsImV4cCI6MjA3ODAzMDk5N30.39C4_sEXIeplYHBYPEGa-_pnan-1SHM6cgNJ-FrtsvU';

const supabase = createClient(supabaseUrl, supabaseKey);

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
