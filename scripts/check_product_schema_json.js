const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const results = {};

    const { data: variantCols } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'product_variants');
    results.product_variants_columns = variantCols;

     const { data: productCols } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'products');
    results.products_columns = productCols;

    const { data: topProducts } = await supabase.from('products').select('id, name').limit(10);
    results.top_products = topProducts;

    if (topProducts && topProducts.length > 0) {
        const productIds = topProducts.map(p => p.id);
        const { data: variants } = await supabase.from('product_variants').select('*').in('product_id', productIds);
        results.variants_data = variants;
    }

    fs.writeFileSync('schema_results.json', JSON.stringify(results, null, 2));
    console.log("Schema check complete. Saved to schema_results.json");
}

checkSchema();
