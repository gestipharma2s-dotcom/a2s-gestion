const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'src/components/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function cleanUser() {
    const email = 'a.daoudi@a2s-dz.com';
    console.log(`Cleaning up user: ${email}`);

    // 1. Delete from public.users first (profile)
    const { error: err1 } = await supabase
        .from('users')
        .delete()
        .eq('email', email);

    if (err1) console.error('Error deleting public user:', err1);
    else console.log('Successfully deleted from public.users.');

    // 2. Delete from users_auth (credentials)
    const { error: err2 } = await supabase
        .from('users_auth')
        .delete()
        .eq('email', email);

    if (err2) console.error('Error deleting auth user:', err2);
    else console.log('Successfully deleted from users_auth.');
}

cleanUser();
