import { AdminSidebar } from "@/components/admin/Sidebar";
import { ReactNode } from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

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
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
            <AdminSidebar />

            <main className="flex-1 overflow-y-auto w-full transition-all duration-300 md:ml-64">
                <div className="p-4 md:p-8 mt-0 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
