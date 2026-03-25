
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSettings() {
    const { data, error } = await supabase
        .from('settings')
        .select('*');
    
    if (error) {
        console.error('Error fetching settings:', error);
        return;
    }

    console.log('Current Settings in DB:');
    data.forEach(s => {
        console.log(`Key: ${s.key}, Type: ${s.type}, Value:`, s.value);
    });
}

checkSettings();
