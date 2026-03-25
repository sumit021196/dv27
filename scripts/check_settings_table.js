const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSettings() {
    const { data: settings, error } = await supabase
        .from('settings')
        .select('*');
    if (error) {
        console.error(error);
    } else {
        console.log(JSON.stringify(settings, null, 2));
    }
}

checkSettings();
