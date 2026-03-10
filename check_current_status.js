const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'src/components/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkStatus() {
    const email = 'a.daoudi@a2s-dz.com';
    console.log(`Checking status for: ${email}`);

    const { data: authData } = await supabase.from('users_auth').select('*').ilike('email', email);
    const { data: publicData } = await supabase.from('users').select('*').ilike('email', email);

    console.log('--- AUTH DATA (users_auth) ---');
    console.log(JSON.stringify(authData, null, 2));

    console.log('\n--- PUBLIC DATA (users) ---');
    console.log(JSON.stringify(publicData, null, 2));
}

checkStatus();
