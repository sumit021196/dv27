const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateTheme() {
    const newColors = {
        primary: "#FFFFFF",
        text: "#121212",
        accent: "#FF00FF"
    };

    const { data, error } = await supabase
        .from('settings')
        .update({ value: newColors, updated_at: new Date() })
        .eq('key', 'theme_colors')
        .select();

    if (error) {
        console.error("Error updating theme:", error);
    } else {
        console.log("Theme updated successfully:", data);
    }
}

updateTheme();
