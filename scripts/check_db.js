const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bjhuvekaehvyzzptszmq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqaHV2ZWthZWh2eXp6cHRzem1xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzI3ODkxMywiZXhwIjoyMDg4ODU0OTEzfQ.Si9H_lNOKZzHOGr5l6_L8Qb6nP6ZiYeeELfzFqGfAcM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('--- Checking Database Content ---');
    
    const { data: categories } = await supabase.from('categories').select('*');
    console.log('Categories Count:', categories?.length);
    if (categories?.length > 0) {
        console.log('Category 0 Sample:', categories[0]);
    }
    
    const { data: banners } = await supabase.from('banners').select('*');
    console.log('Banners Count:', banners?.length);
    if (banners?.length > 0) {
        console.log('Banner 0 Sample:', banners[0]);
    }
}

check();
