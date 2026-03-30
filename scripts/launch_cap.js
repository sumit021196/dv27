const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bjhuvekaehvyzzptszmq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqaHV2ZWthZWh2eXp6cHRzem1xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzI3ODkxMywiZXhwIjoyMDg4ODU0OTEzfQ.Si9H_lNOKZzHOGr5l6_L8Qb6nP6ZiYeeELfzFqGfAcM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function launch() {
    console.log('--- Starting Signature V1 Cap Launch ---');

    // 1. Ensure Accessories Category exists
    console.log('Ensuring Accessories category exists...');
    const { data: accessoryCat } = await supabase
        .from('categories')
        .upsert({ 
            name: 'Accessories', 
            slug: 'accessories', 
            image_url: '/products/cap_lifestyle.png' 
        }, { onConflict: 'slug' })
        .select()
        .single();

    const categoryId = accessoryCat.id;

    // 2. Insert the Product
    console.log('Inserting V1 Signature Cap...');
    // We'll use media_url for the main image and description for now if additional_images column isn't added yet.
    // Or I'll just add it via the script if possible (but we can't run SQL easily).
    // I'll put the extra images into the description as a JSON string for now to be safe, 
    // OR I will just use the columns I have.
    
    const { data: product } = await supabase
        .from('products')
        .insert({
            name: 'V1 Signature Distressed Cap',
            slug: 'v1-signature-cap',
            description: 'Premium heavyweight cotton baseball cap featuring the signature "dv27" embroidery. Distressed detailing for an authentic streetwear edge. Features an adjustable strap with custom silver hardware.',
            price: 1999,
            media_url: '/products/cap_front.png',
            category_id: categoryId,
            is_trending: true,
            is_active: true,
            rating: 5
        })
        .select()
        .single();
    
    // 3. Insert Product Variants (Sizes)
    console.log('Adding variants...');
    await supabase.from('product_variants').insert([
        { product_id: product.id, name: 'One Size', stock: 100 }
    ]);

    // 4. Insert Hero Banner
    console.log('Adding Hero Banner...');
    await supabase.from('banners').insert({
        title: 'V1 SIGNATURE CAP',
        subtitle: 'The definitive accessory for the modern rebel. Limited edition cap drop now live.',
        image_url: '/products/cap_lifestyle.png',
        position: 'hero',
        style_type: 'split',
        cta_text: 'Shop the Drop',
        link_url: `/products/${product.id}`,
        is_active: true
    });

    console.log('--- Cap Launch Successful! ---');
}

launch();
