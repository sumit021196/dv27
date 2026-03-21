"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import {
    Menu,
    X,
    ShoppingBag,
    Home,
    Grid3X3,
    TrendingUp,
    User,
    LogOut,
    ChevronDown,
    Search,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { logout } from "@/app/(auth)/auth.actions";
import { User as UserType } from "@supabase/supabase-js";
import Image from "next/image";
import Ticker from "./Ticker";

const navLinks = [
    { href: "/products", label: "Shop All" },
    { href: "/#trending", label: "Trending" },
];

export default function Navbar() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    
    if (pathname.startsWith('/admin')) return null;

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
    const cart = useCart();

    const [user, setUser] = useState<UserType | null>(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);

        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
            subscription.unsubscribe();
        };
    }, [supabase.auth]);

    const totalItems = cart.items.reduce((acc, current) => acc + current.qty, 0);

    return (
        <>
            <div className="fixed inset-x-0 top-0 z-[60]">
                <Ticker />
                <header
                    className={`transition-all duration-300 bg-black border-b border-white/10 ${isScrolled ? "h-14" : "h-16"}`}
                >
                    <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-12">

                        {/* Left: Mobile Menu + Search */}
                        <div className="flex items-center gap-4 flex-1">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                type="button"
                                className="inline-flex items-center justify-center p-2 text-white hover:bg-white/10 rounded-full md:hidden"
                                aria-label="Open menu"
                            >
                                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                            
                            <nav className="hidden md:flex items-center gap-6">
                                {navLinks.map(({ href, label }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors"
                                    >
                                        {label}
                                    </Link>
                                ))}
                            </nav>

                            <button 
                                onClick={() => setSearchOpen(true)}
                                className="p-2 text-white/70 hover:text-white transition-colors"
                            >
                                <Search size={20} />
                            </button>
                        </div>

                        {/* Center: Logo */}
                        <div className="flex justify-center">
                            <Link href="/" className="flex items-center transition-transform hover:scale-110">
                                <Image
                                    src="/logo.svg"
                                    alt="DV27"
                                    width={120}
                                    height={40}
                                    className="h-8 sm:h-10 w-auto invert brightness-0"
                                    priority
                                />
                            </Link>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center justify-end gap-2 sm:gap-4 flex-1">
                            <div className="relative group hidden sm:block">
                                {user ? (
                                    <button
                                        onClick={() => setProfileOpen(!profileOpen)}
                                        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors py-2"
                                    >
                                        <User size={20} />
                                    </button>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors"
                                    >
                                        Account
                                    </Link>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setCartDrawerOpen(true)}
                                className="relative p-2 text-white/70 hover:text-white transition-colors"
                            >
                                <ShoppingBag size={22} />
                                {totalItems > 0 && (
                                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-accent text-[9px] font-black text-black">
                                        {totalItems}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </header>
            </div>

            {/* Search Modal */}
            {searchOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="flex flex-col h-full px-6 pt-24 pb-12 items-center">
                        <button 
                            onClick={() => setSearchOpen(false)}
                            className="absolute top-6 right-6 p-3 text-white/50 hover:text-white transition-colors"
                        >
                            <X size={32} />
                        </button>
                        
                        <div className="w-full max-w-2xl">
                             <input 
                                autoFocus
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && searchQuery.trim()) {
                                        router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                                        setSearchOpen(false);
                                    }
                                }}
                                placeholder="Search products..."
                                className="w-full bg-transparent border-b-2 border-white/20 pb-4 text-4xl sm:text-6xl font-black italic uppercase placeholder:text-white/10 outline-none focus:border-white transition-colors"
                             />
                             <p className="mt-4 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] animate-pulse">
                                Press Enter to search
                             </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Cart Drawer */}
            <CartDrawer open={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />

            {/* Mobile Nav Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[70] bg-black md:hidden animate-in slide-in-from-left duration-300">
                    <div className="p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-12">
                             <Image src="/logo.svg" alt="DV27" width={100} height={30} className="h-8 w-auto invert brightness-0" />
                             <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-white"><X size={30} /></button>
                        </div>
                        
                        <nav className="flex flex-col gap-8">
                             {navLinks.map(({ href, label }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-4xl font-black italic uppercase tracking-tighter text-white hover:text-brand-accent transition-colors"
                                >
                                    {label}
                                </Link>
                            ))}
                            <Link 
                                href="/profile" 
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-4xl font-black italic uppercase tracking-tighter text-white/40"
                            >
                                Account
                            </Link>
                        </nav>

                        <div className="mt-auto pb-12">
                             <button className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-sm">
                                 Logout
                             </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Spacer for fixed header (Ticker + Navbar) */}
            <div className={`transition-all duration-300 ${isScrolled ? "h-24" : "h-28"}`} />
        </>
    );
}
