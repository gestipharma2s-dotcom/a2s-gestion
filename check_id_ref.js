const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'src/components/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRef() {
    const { data, error } = await supabase
        .from('users_auth')
        .select('*')
        .eq('id', '9d2f45a2-14e6-4858-af98-26707bc79982');

    if (data && data.length > 0) {
        console.log('User found in users_auth with same ID.');
    } else {
        console.log('User NOT found in users_auth with same ID.');
    }
}

checkRef();
