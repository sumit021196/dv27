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
        <div className="flex min-h-screen bg-white font-sans text-gray-900 border-box">
            <AdminSidebar />

            <main className="flex-1 flex flex-col min-h-screen w-full transition-all duration-300 md:ml-64 relative bg-gray-50 pb-20 md:pb-0">
                {/* Content Area - Natural Scroll */}
                <div className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </div>

                {/* Global Mobile Bottom Navigation */}
                <AdminBottomNav />
            </main>
        </div>
    );
}
