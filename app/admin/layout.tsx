import { AdminSidebar } from "@/components/admin/Sidebar";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
            <AdminSidebar />

            <main className="flex-1 overflow-y-auto w-full transition-all duration-300 md:ml-64">
                <div className="p-4 md:p-8 mt-14 md:mt-0 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
