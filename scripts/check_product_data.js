const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProductFields() {
    const { data: products } = await supabase.from('products').select('*').limit(3);
    fs.writeFileSync('product_data.json', JSON.stringify(products, null, 2));
    console.log("Product data saved to product_data.json");
}

checkProductFields();
