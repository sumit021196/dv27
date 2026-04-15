import { updateSession } from "@/utils/supabase/middleware";
import { createClient } from "@/utils/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;

  // 1. Update session (refreshes auth cookie) — this calls getUser() internally
  const response = await updateSession(request);

  // 2. Protect /admin routes — reuse the already-refreshed session
  if (nextUrl.pathname.startsWith("/admin")) {
    const supabase = await createClient();
    // getUser() is safe to call here; server client has no lock contention
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check role
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL("/", request.url));
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
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
