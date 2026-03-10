const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'src/components/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAuthTable() {
    console.log('Checking users_auth table:');
    const { data, error } = await supabase
        .from('users_auth')
        .select('*')
        .ilike('email', 'a.daoudi@a2s-dz.com');

    if (error) {
        console.warn('users_auth table might not exist or error:', error.message);
        return;
    }

    console.log(JSON.stringify(data, null, 2));
}

checkAuthTable();
