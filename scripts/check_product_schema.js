const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log("--- product_variants Table ---");
    const { data: variantCols, error: err1 } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'product_variants');
    if (err1) console.error(err1);
    else console.log(variantCols);

    console.log("\n--- products Table ---");
     const { data: productCols, error: err2 } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'products');
    if (err2) console.error(err2);
    else console.log(productCols);

    const { data: topProducts } = await supabase.from('products').select('id, name').limit(5);
    console.log("\n--- Top Products ---");
    console.log(topProducts);

    if (topProducts && topProducts.length > 0) {
        const { data: variants } = await supabase.from('product_variants').select('*').eq('product_id', topProducts[0].id);
        console.log("\n--- Variants for first product ---");
        console.log(variants);
    }
}

checkSchema();
