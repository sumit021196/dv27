import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function test() {
  const { data, error } = await supabase
    .from("categories")
    .select(`
        id, 
        name,
        slug,
        is_active,
        product_categories ( count )
    `)
    .limit(2);

  console.log("Error:", error);
  console.log("Data:", JSON.stringify(data, null, 2));
}

test();
