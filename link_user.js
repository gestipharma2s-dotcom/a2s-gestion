const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'src/components/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function linkUser() {
    const email = 'a.daoudi@a2s-dz.com';
    const authId = 'b4d5ce1e-b762-4005-84fc-db88157b2727';

    console.log(`Linking user: ${email} with auth_id: ${authId}`);

    const pagesVisibles = [
        'dashboard',
        'prospects',
        'clients',
        'installations',
        'abonnements',
        'paiements',
        'support',
        'applications',
        'utilisateurs'
    ];

    const newUser = {
        nom: 'DAOUDI',
        email: email,
        role: 'super_admin', // Providing super_admin for the user as they wanted an admin account
        auth_id: authId,
        pages_visibles: pagesVisibles,
        can_create_prospects: true,
        can_edit_prospects: true,
        can_delete_prospects: true,
        can_create_clients: true,
        can_edit_clients: true,
        can_delete_clients: true,
        can_create_installations: true,
        can_edit_installations: true,
        can_delete_installations: true,
        can_create_abonnements: true,
        can_edit_abonnements: true,
        can_delete_abonnements: true,
        can_create_paiements: true,
        can_edit_paiements: true,
        can_delete_paiements: true,
        can_create_support: true,
        can_edit_support: true,
        can_delete_support: true,
        can_create_missions: true,
        can_edit_missions: true,
        can_delete_missions: true,
        can_close_missions: true,
        can_validate_missions: true,
        can_create_alertes: true,
        can_edit_alertes: true,
        can_delete_alertes: true,
        can_create_applications: true,
        can_edit_applications: true,
        can_delete_applications: true
    };

    const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select();

    if (error) {
        console.error('Error linking user:', error);
        return;
    }

    console.log('User linked successfully:');
    console.log(JSON.stringify(data, null, 2));
}

linkUser();
