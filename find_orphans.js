const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'src/components/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findOrphans() {
    const { data: authUsers, error: err1 } = await supabase.from('users_auth').select('id, email');
    const { data: publicUsers, error: err2 } = await supabase.from('users').select('auth_id, email');

    const publicAuthIds = new Set(publicUsers.map(u => u.auth_id));

    const orphans = authUsers.filter(u => !publicAuthIds.has(u.id));

    if (orphans.length > 0) {
        console.log('Found orphan auth records (no profile in public.users):');
        console.log(JSON.stringify(orphans, null, 2));
    } else {
        console.log('No orphan auth records found.');
    }
}

findOrphans();
