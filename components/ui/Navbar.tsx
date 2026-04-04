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
    Package,
    LayoutDashboard,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { logout } from "@/app/(auth)/auth.actions";
import { User as UserType } from "@supabase/supabase-js";
import Image from "next/image";
import Ticker from "./Ticker";
import { productService } from "@/services/product.service";
import { Category } from "@/types/product";



import { useSettings } from "@/components/SettingsContext";

export default function Navbar() {
    const { settings } = useSettings();
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const cart = useCart();

    const [user, setUser] = useState<UserType | null>(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);

        const fetchInitialData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', user.id)
                    .single();
                setIsAdmin(!!profile?.is_admin);
            } else {
                setIsAdmin(false);
            }

            // Fetch Categories
            try {
                const cats = await productService.getCategories();
                setCategories(cats);
            } catch (err) {
                console.error("Failed to fetch nav categories", err);
            }
        };
        fetchInitialData();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const newUser = session?.user ?? null;
            setUser(newUser);
            if (newUser) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', newUser.id)
                    .single();
                setIsAdmin(!!profile?.is_admin);
            } else {
                setIsAdmin(false);
            }
        });

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (profileOpen && !target.closest('.profile-container')) {
                setProfileOpen(false);
            }
        };

        window.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("mousedown", handleClickOutside);
            subscription.unsubscribe();
        };
    }, [supabase.auth, profileOpen]);

    if (pathname.startsWith('/admin')) return null;
    const totalItems = cart.items.reduce((acc, current) => acc + current.qty, 0);

    return (
        <>
            <div className="fixed inset-x-0 top-0 z-[60]">
                <Ticker />
                <header
                    className={`transition-all duration-300 bg-background/80 backdrop-blur-xl border-b border-foreground/5 ${isScrolled ? "h-14" : "h-16"}`}
                >
                    <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-12">

                        {/* Left: Mobile Menu + Search */}
                        <div className="flex items-center gap-4 flex-1">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                type="button"
                                className="inline-flex items-center justify-center p-2 text-foreground hover:bg-foreground/5 rounded-full md:hidden"
                                aria-label="Open menu"
                            >
                                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>

                            <nav className="hidden md:flex items-center gap-6">
                                <Link 
                                    href="/products" 
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70 hover:text-foreground transition-colors"
                                >
                                    Shop All
                                </Link>
                                {categories
                                    .filter(cat => cat.name.toLowerCase() !== 'sale')
                                    .map((cat) => (
                                        <Link
                                            key={cat.id}
                                            href={`/products?category=${cat.slug}`}
                                            className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70 hover:text-foreground transition-colors"
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                <Link 
                                    href="/products?category=sale" 
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-red hover:text-brand-red transition-colors"
                                >
                                    Sale
                                </Link>
                            </nav>

                            <button
                                onClick={() => setSearchOpen(true)}
                                className="p-2 text-foreground/70 hover:text-foreground transition-colors"
                            >
                                <Search size={20} />
                            </button>
                        </div>

                        {/* Center: Logo */}
                        <div className="flex justify-center perspective-1000">
                            <Link href="/" className="flex items-center transition-all hover:scale-110">
                                <Image
                                    src="/logo.svg"
                                    alt={settings.site_name || "DV27"}
                                    width={120}
                                    height={40}
                                    className="h-8 sm:h-10 w-auto animate-logo-flip"
                                    priority
                                />
                            </Link>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center justify-end gap-2 sm:gap-4 flex-1">
                            <div className="relative profile-container">
                                {user ? (
                                    <>
                                        <button
                                            onClick={() => setProfileOpen(!profileOpen)}
                                            className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors py-2"
                                        >
                                            <User size={20} />
                                        </button>

                                        {/* Profile Dropdown */}
                                        {profileOpen && (
                                            <div className="absolute right-0 top-full mt-2 w-48 bg-background/95 backdrop-blur-xl border border-foreground/10 rounded-2xl shadow-2xl py-2 animate-in fade-in zoom-in duration-200 overflow-hidden z-[100]">
                                                <div className="px-4 py-3 border-b border-foreground/5 mb-1">
                                                    <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                                {isAdmin ? (
                                                    <Link
                                                        href="/admin"
                                                        onClick={() => setProfileOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-brand-accent hover:bg-brand-accent/5 transition-colors"
                                                    >
                                                        <LayoutDashboard size={16} />
                                                        Admin Dashboard
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        href="/profile"
                                                        onClick={() => setProfileOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors"
                                                    >
                                                        <User size={16} />
                                                        Profile
                                                    </Link>
                                                )}
                                                <Link
                                                    href="/profile?tab=orders"
                                                    onClick={() => setProfileOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-colors"
                                                >
                                                    <Package size={16} />
                                                    My Orders
                                                </Link>
                                                <button
                                                    onClick={async () => {
                                                        cart.clear();
                                                        await logout();
                                                        setProfileOpen(false);
                                                        router.push('/');
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-500/5 transition-colors"
                                                >
                                                    <LogOut size={16} />
                                                    Logout
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="p-2 text-foreground/70 hover:text-foreground transition-colors"
                                    >
                                        <User size={20} />
                                    </Link>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => cart.openCart()}
                                className="relative p-2 text-foreground/70 hover:text-foreground transition-colors"
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
                <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-3xl animate-in fade-in duration-300">
                    <div className="flex flex-col h-full px-6 pt-24 pb-12 items-center">
                        <button
                            onClick={() => setSearchOpen(false)}
                            className="absolute top-6 right-6 p-3 text-foreground/50 hover:text-foreground transition-colors"
                        >
                            <X size={32} />
                        </button>

                        <div className="w-full max-w-2xl text-center">
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
                                className="w-full bg-transparent border-b-2 border-foreground/20 pb-4 text-4xl sm:text-6xl font-black uppercase placeholder:text-foreground/10 outline-none focus:border-foreground transition-colors text-center"
                            />
                            <p className="mt-8 text-[10px] font-bold text-foreground/30 uppercase tracking-[0.3em] animate-pulse">
                                Press Enter to search
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Cart Drawer */}
            <CartDrawer />

            {/* Mobile Nav Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[70] bg-background md:hidden animate-in slide-in-from-left duration-300">
                    <div className="p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-12 perspective-1000">
                            <Image src="/logo.svg" alt="DV27" width={100} height={30} className="h-8 w-auto animate-logo-flip" />
                            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-foreground"><X size={30} /></button>
                        </div>

                        <nav className="flex flex-col gap-8">
                           <Link
                                href="/products"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-4xl font-black uppercase tracking-tighter text-foreground hover:text-brand-accent transition-colors"
                            >
                                Shop All
                            </Link>
                            {categories
                                .filter(cat => cat.name.toLowerCase() !== 'sale')
                                .map((cat) => (
                                    <Link
                                        key={cat.id}
                                        href={`/products?category=${cat.slug}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-4xl font-black uppercase tracking-tighter text-foreground hover:text-brand-accent transition-colors"
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            <Link
                                href="/products?category=sale"
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-4xl font-black uppercase tracking-tighter text-brand-red hover:text-brand-red transition-colors"
                            >
                                Sale
                            </Link>
                            <Link
                                href={user ? (isAdmin ? "/admin" : "/profile") : "/login"}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-4xl font-black uppercase tracking-tighter text-foreground hover:text-brand-accent transition-colors"
                            >
                                {user ? (isAdmin ? "Admin" : "Profile") : "Account"}
                            </Link>
                        </nav>

                        <div className="mt-auto pb-12">
                            <button
                                onClick={() => {
                                    cart.clear();
                                    logout();
                                }}
                                className="w-full py-4 bg-foreground text-background font-black uppercase tracking-widest text-sm"
                            >
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
