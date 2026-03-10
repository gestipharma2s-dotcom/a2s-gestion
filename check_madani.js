const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'src/components/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkMadani() {
    const { data, error } = await supabase
        .from('users')
        .select('id, nom, email, role, auth_id')
        .eq('email', 'm.madani@a2s-dz.com')
        .single();

    console.log(JSON.stringify(data, null, 2));
}

checkMadani();
