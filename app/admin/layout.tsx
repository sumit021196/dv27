import { AdminSidebar } from "@/components/admin/Sidebar";
import { AdminBottomNav } from "@/components/admin/BottomNav";
import { ReactNode } from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Check role from profiles
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    if (!profile?.is_admin) {
        redirect("/");
    }


    return (
        <div className="flex h-[100dvh] bg-white overflow-hidden font-sans text-gray-900 border-box select-none">
            <AdminSidebar />

            <main className="flex-1 flex flex-col min-h-0 w-full transition-all duration-300 md:ml-64 relative bg-gray-50">
                {/* Content Area - Locked Viewport */}
                <div className="flex-1 flex flex-col min-h-0 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-hidden">
                    {children}
                </div>

                {/* Global Mobile Bottom Navigation */}
                <AdminBottomNav />
            </main>
        </div>
    );
}
