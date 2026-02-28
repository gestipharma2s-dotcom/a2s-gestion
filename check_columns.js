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

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching prospects:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('COLUMNS_LIST:' + Object.keys(data[0]).join(','));
    } else {
        console.log('Table is empty');
    }
}

checkColumns();
