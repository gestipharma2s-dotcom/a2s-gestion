const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'src/components/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUser() {
    const email = 'a.daoudi@a2s-dz.com';
    console.log(`Checking user: ${email}`);

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email);

    if (error) {
        console.error('Error fetching user:', error);
        return;
    }

    if (!data || data.length === 0) {
        console.log('User not found in public.users table.');
    } else {
        console.log('User found in public.users table:');
        console.log(JSON.stringify(data[0], null, 2));
    }
}

checkUser();
