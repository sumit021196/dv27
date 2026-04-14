"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
    LayoutDashboard, 
    Package, 
    ShoppingCart, 
    Users, 
    List, 
    Star, 
    Image as ImageIcon, 
    Settings, 
    UploadCloud, 
    Ticket,
    LogOut
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useRouter } from "next/navigation";
import { logout } from "@/app/(auth)/auth.actions";

const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Categories", href: "/admin/categories", icon: List },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Reviews", href: "/admin/reviews", icon: Star },
    { name: "Customers", href: "/admin/users", icon: Users },
    { name: "Banners", href: "/admin/banners", icon: ImageIcon },
    { name: "Media", href: "/admin/media", icon: UploadCloud },
    { name: "Coupons", href: "/admin/coupons", icon: Ticket },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminBottomNav() {
    const pathname = usePathname();
    const router = useRouter();

    // Hide bottom nav for focal wizard screens
    if (pathname === "/admin/products/add" || pathname.includes("/admin/products/edit")) {
        return null;
    }
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleLogout = async () => {
        await logout();
        router.push("/");
    };

    // Scroll active item into view
    useEffect(() => {
        if (scrollRef.current) {
            const activeItem = scrollRef.current.querySelector('[data-active="true"]');
            if (activeItem) {
                activeItem.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }
    }, [pathname]);

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
            <div 
                ref={scrollRef}
                className="flex overflow-x-auto overflow-y-hidden scrollbar-hide py-2 px-3 gap-2 no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            data-active={isActive}
                            className={cn(
                                "flex flex-col items-center justify-center min-w-[70px] py-1 px-2 rounded-xl transition-all duration-300 flex-shrink-0",
                                isActive 
                                    ? "bg-blue-600 text-white shadow-sm" 
                                    : "text-gray-500 hover:bg-gray-50"
                            )}
                        >
                            <Icon size={18} className={cn("mb-1", isActive ? "text-white" : "text-gray-400")} />
                            <span className={cn("text-[10px] font-medium whitespace-nowrap", isActive ? "text-white" : "text-gray-500")}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="flex flex-col items-center justify-center min-w-[70px] py-1 px-2 rounded-xl transition-all duration-300 flex-shrink-0 text-red-500 hover:bg-red-50"
                >
                    <LogOut size={18} className="mb-1 text-red-400" />
                    <span className="text-[10px] font-medium whitespace-nowrap text-red-500">
                        Logout
                    </span>
                </button>
            </div>
            {/* Safe area inset for modern iPhones */}
            <div className="h-[env(safe-area-inset-bottom)] bg-white" />
        </div>
    );
}
