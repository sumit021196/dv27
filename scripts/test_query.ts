import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testQuery() {
    console.log("Testing products query...");
    const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, id, is_active), product_categories(categories(name, id, is_active)), product_variants(*), product_images(*)")
        .limit(1);

    if (error) {
        console.error("Query Error:", error);
    } else {
        console.log("Query Success, data count:", data?.length);
        console.log("Sample Data:", JSON.stringify(data?.[0], null, 2));
    }
}

testQuery();
