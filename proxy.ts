import { updateSession } from "@/utils/supabase/middleware";
import { createClient } from "@/utils/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
    const { nextUrl } = request;
    
    // 1. Update session (refreshes auth cookie)
    let response = await updateSession(request);
    
    // 2. Protect /admin routes
    if (nextUrl.pathname.startsWith('/admin')) {
        try {
            const supabase = await createClient();
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error || !user) {
                return NextResponse.redirect(new URL('/login', request.url));
            }
            
            // Check role
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();
                
            if (!profile?.is_admin) {
                return NextResponse.redirect(new URL('/', request.url));
            }
        } catch (err) {
            console.error("Admin protection error:", err);
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
