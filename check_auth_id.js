const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'src/components/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAuthId() {
    const { data, error } = await supabase
        .from('users_auth')
        .select('*')
        .eq('id', 'f2133ee6-433c-4447-af57-1705e465d3b2');

    console.log(JSON.stringify(data, null, 2));
}

checkAuthId();
