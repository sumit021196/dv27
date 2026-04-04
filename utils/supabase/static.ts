import { createClient } from "@supabase/supabase-js";

/**
 * A static Supabase client that strictly avoids using cookies() or Next.js server-side dynamic APIs.
 * This client is safe to use in Server Components and Layouts for fetching PUBLIC DATA (Settings, Profiles, Products)
 * without inadvertently opting the entire route into Dynamic Rendering (force-dynamic).
 * Using this allows the Next.js router to properly cache HTML statically (SSG).
 */
export const getStaticClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
};
