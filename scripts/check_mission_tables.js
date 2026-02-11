
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ynoxsibapzatlxhmredp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlub3hzaWJhcHphdGx4aG1yZWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTQ5OTcsImV4cCI6MjA3ODAzMDk5N30.39C4_sEXIeplYHBYPEGa-_pnan-1SHM6cgNJ-FrtsvU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    const tables = ['missions_expenses', 'mission_expenses', 'missions_participants', 'mission_participants'];
    console.log('\n--- VÉRIFICATION DES TABLES ---');

    for (const table of tables) {
        const { error } = await supabase.from(table).select('id').limit(1);
        if (error) {
            console.log(`❌ Table "${table}" : Non trouvée ou erreur (${error.code})`);
        } else {
            console.log(`✅ Table "${table}" : Existe`);
        }
    }
}

checkTables();
