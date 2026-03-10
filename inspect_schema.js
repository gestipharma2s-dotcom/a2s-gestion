const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'src/components/.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase.rpc('inspect_table', { table_name: 'paiements' });
    // Since I don't follow if Rpc 'inspect_table' exists, I'll just try to select one row from relevant tables to see keys

    console.log('--- Columns in paiements ---');
    const { data: pData } = await supabase.from('paiements').select('*').limit(1);
    if (pData && pData.length > 0) console.log(Object.keys(pData[0]));

    console.log('--- Columns in interventions ---');
    const { data: iData } = await supabase.from('interventions').select('*').limit(1);
    if (iData && iData.length > 0) console.log(Object.keys(iData[0]));

    console.log('--- Columns in installations ---');
    const { data: instData } = await supabase.from('installations').select('*').limit(1);
    if (instData && instData.length > 0) console.log(Object.keys(instData[0]));
}

run();
