const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'src/components/.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase.from('prospects').select('id, raison_sociale, created_at');
    if (error) {
        console.error(error);
    } else {
        console.log(JSON.stringify(data));
    }
}

run();
