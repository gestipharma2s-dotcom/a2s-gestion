const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function getEnvVars() {
    const envPath = path.join(__dirname, '.env.local');
    if (!fs.existsSync(envPath)) return {};
    const content = fs.readFileSync(envPath, 'utf8');
    const vars = {};
    content.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value.length > 0) {
            vars[key.trim()] = value.join('=').trim();
        }
    });
    return vars;
}

const env = getEnvVars();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .eq('statut', 'actif')
        .ilike('raison_sociale', '%TAGHAST%')
        .limit(1);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('VERIFY_RESULT:', JSON.stringify(data, null, 2));
}

verify();
