const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'src/components/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testVerify() {
    const email = 'a.daoudi@a2s-dz.com';
    // I don't know the password, but I can check what the RPC returns for a known user if I want to debug the RPC logic itself.
    // But let's just see if the user is now "findable" by the logic.

    console.log('Testing RPC verify_user_password for existence...');

    const { data, error } = await supabase.rpc('verify_user_password', {
        p_email: email,
        p_password: 'wrong_password' // This should return is_valid: false but at least return a record
    });

    if (error) {
        console.error('RPC Error:', error);
        return;
    }

    console.log('RPC Result:', JSON.stringify(data, null, 2));
}

testVerify();
