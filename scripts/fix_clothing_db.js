const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bjhuvekaehvyzzptszmq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqaHV2ZWthZWh2eXp6cHRzem1xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzI3ODkxMywiZXhwIjoyMDg4ODU0OTEzfQ.Si9H_lNOKZzHOGr5l6_L8Qb6nP6ZiYeeELfzFqGfAcM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('--- Starting Clothing Database Population ---');

    // 1. Schema update
    const { error: schemaError } = await supabase.rpc('execute_sql_raw', {
        query: 'ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;'
    });
    // Fallback: If RPC execute_sql_raw doesn't exist (common in fresh projects), we suggest the user run it.
    // However, I'll try direct inserts first.

    // 2. Clear existing
    console.log('Clearing old data...');
    await supabase.from('products').delete().neq('id', 0);
    await supabase.from('banners').delete().neq('id', 0);
    await supabase.from('categories').delete().is('id', null); // This is tricky, I'll just upsert.

    // 3. Upsert Categories
    console.log('Upserting Categories...');
    const mainCategories = [
        { id: '5a5b336f-7dfd-46fa-80f8-bdf88c36993d', name: 'New Arrivals', slug: 'new-arrivals', image_url: '/categories/new_arrivals.png' },
        { id: '6e91f292-bad8-4a32-b240-eccf648e03c6', name: 'Topwear', slug: 'topwear', image_url: '/categories/topwear.png' },
        { id: '4f2ce69d-4fc8-4fc4-8383-f848c0f13f88', name: 'Bottomwear', slug: 'bottomwear', image_url: '/categories/bottomwear.png' },
        { id: 'baacb4ae-2de1-4f3e-b699-32f0e7c8db3a', name: 'Outerwear', slug: 'outerwear', image_url: '/categories/outerwear.png' },
        { id: '2ed88c6c-abf6-4824-aa60-50a34fbbc558', name: 'Accessories', slug: 'accessories', image_url: '/categories/accessories.png' },
        { id: 'acc0729a-6edf-4cc5-b4e6-9b1fdadface5', name: 'Sale', slug: 'sale', image_url: '/categories/sale.png' }
    ];
    await supabase.from('categories').upsert(mainCategories);

    // 4. Products
    console.log('Inserting Products...');
    const products = [
        { name: 'Essential Oversized Tee (Black)', slug: 'essential-oversized-tee-black', description: 'Premium 240 GSM heavy cotton oversized t-shirt.', price: 1499, category_id: '6e91f292-bad8-4a32-b240-eccf648e03c6', media_url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop', is_trending: true, is_active: true },
        { name: 'Boxy Fit Heavyweight Tee (Sand)', slug: 'boxy-fit-heavyweight-tee-sand', description: 'Structured boxy fit tee in sand tone.', price: 1599, category_id: '6e91f292-bad8-4a32-b240-eccf648e03c6', media_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop', is_trending: true, is_active: true },
        { name: 'Raw Edge Straight Leg Jeans', slug: 'raw-edge-straight-leg-jeans', description: 'High-quality Japanese denim.', price: 3499, category_id: '4f2ce69d-4fc8-4fc4-8383-f848c0f13f88', media_url: 'https://images.unsplash.com/photo-1542272604-787c38ad5551?q=80&w=800&auto=format&fit=crop', is_trending: true, is_active: true },
        { name: 'Premium Cargo Joggers', slug: 'premium-cargo-joggers', description: 'Versatile cargo joggers.', price: 2999, category_id: '4f2ce69d-4fc8-4fc4-8383-f848c0f13f88', media_url: 'https://images.unsplash.com/photo-1624371414361-e6e9ef0c98bd?q=80&w=800&auto=format&fit=crop', is_trending: true, is_active: true },
        { name: 'Signature Pullover Hoodie (Slate)', slug: 'signature-pullover-hoodie-slate', description: 'Heavyweight fleece-lined hoodie.', price: 3299, category_id: 'baacb4ae-2de1-4f3e-b699-32f0e7c8db3a', media_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop', is_trending: true, is_active: true }
    ];
    await supabase.from('products').insert(products);

    // 5. Banners
    console.log('Inserting Banners...');
    const banners = [
        { title: 'THE NEW STANDARD', subtitle: 'Redefining contemporary streetwear.', image_url: '/banners/hero-streetwear.png', position: 'hero', is_active: true, style_type: 'classic', cta_text: 'Shop Now', link_url: '/products' },
        { title: 'LUXURY ESSENTIALS', subtitle: 'Elevate your everyday.', image_url: '/banners/hero-essentials.png', position: 'hero', is_active: true, style_type: 'modern', cta_text: 'Explore', link_url: '/products' }
    ];
    await supabase.from('banners').insert(banners);

    // 6. Settings
    console.log('Updating Settings...');
    await supabase.from('settings').update({ value: '"THEDV27"' }).eq('key', 'site_name');
    await supabase.from('settings').update({ value: '"NEW ARRIVAL: SEASON 1 DROP • FREE SHIPPING"' }).eq('key', 'ticker_text');

    console.log('--- Database Fixed! ---');
}

run();
