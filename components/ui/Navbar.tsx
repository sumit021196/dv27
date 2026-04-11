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
import { Category, Product } from "@/types/product";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TapScale from "./TapScale";
import { useSettings } from "@/components/SettingsContext";

// Cache navigation data to prevent redundant fetches across session
let navDataCache: { categories: any[], recent: any[] } | null = null;

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
    const [recentProducts, setRecentProducts] = useState<Product[]>([]);
    const [menuStep, setMenuStep] = useState<'main' | 'categories'>('main');
    const router = useRouter();
    const supabase = createClient();

    // Initial Data Fetch & Auth Listener
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);

        const fetchInitialData = async () => {
            try {
                // 1. Auth Sync
                const { data: { user: currentUser } } = await supabase.auth.getUser();
                if (currentUser) {
                    setUser(currentUser);
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('is_admin')
                        .eq('id', currentUser.id)
                        .single();
                    setIsAdmin(!!profile?.is_admin);
                }

                // 2. Data Cache Handling
                if (!navDataCache) {
                    const [cats, recent] = await Promise.all([
                        productService.getCategories(),
                        productService.getNewArrivals(6)
                    ]);
                    navDataCache = { categories: cats, recent };
                }
                
                setCategories(navDataCache.categories);
                setRecentProducts(navDataCache.recent);

            } catch (err) {
                console.error("Failed to fetch nav data", err);
            }
        };

        fetchInitialData();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
            const newUser = session?.user ?? null;
            setUser(newUser);
            
            if (event === 'SIGNED_IN' && newUser) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', newUser.id)
                    .single();
                setIsAdmin(!!profile?.is_admin);
            } else if (event === 'SIGNED_OUT') {
                setIsAdmin(false);
            }
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
            subscription.unsubscribe();
        };
    }, []); // Only run on mount

    // Click Outside Handling
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (profileOpen && !target.closest('.profile-container')) {
                setProfileOpen(false);
            }
        };

        if (profileOpen) {
            window.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            window.removeEventListener("mousedown", handleClickOutside);
        };
    }, [profileOpen]);

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
                            <TapScale>
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    type="button"
                                    className="inline-flex items-center justify-center p-2 text-foreground hover:bg-foreground/5 rounded-full md:hidden"
                                    aria-label="Open menu"
                                >
                                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                                </button>
                            </TapScale>

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

                            <TapScale>
                                <button
                                    onClick={() => setSearchOpen(true)}
                                    className="p-2 text-foreground/70 hover:text-foreground transition-colors"
                                >
                                    <Search size={20} />
                                </button>
                            </TapScale>
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
                            <div className="hidden md:block relative profile-container">
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

                            <TapScale>
                                <button
                                    type="button"
                                    onClick={() => cart.openCart()}
                                    className="relative p-2 text-foreground/70 hover:text-foreground transition-colors"
                                >
                                    <ShoppingBag size={22} />
                                    <AnimatePresence>
                                        {totalItems > 0 && (
                                            <motion.span 
                                                key="cart-badge"
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                                                className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-accent text-[9px] font-black text-white"
                                            >
                                                {totalItems}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </button>
                            </TapScale>
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
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed inset-0 z-[100] bg-background md:hidden"
                    >
                        <div className="flex flex-col h-full relative overflow-hidden">
                            
                            {/* Header */}
                            <div className="px-4 py-3 flex items-center justify-between border-b border-foreground/5 bg-background sticky top-0 z-10 shrink-0">
                                <div className="flex items-center gap-2">
                                    <AnimatePresence mode="wait">
                                        {menuStep !== 'main' && (
                                            <motion.button 
                                                key="back-button"
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.5 }}
                                                onClick={() => setMenuStep('main')}
                                                className="p-1.5 -ml-1.5 text-foreground/50 hover:text-foreground transition-colors"
                                            >
                                                <ArrowLeft size={18} />
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                    <Image src="/logo.svg" alt="DV27" width={70} height={20} className="h-5 w-auto" />
                                </div>
                                <button onClick={() => {
                                    setMobileMenuOpen(false);
                                    setTimeout(() => setMenuStep('main'), 300);
                                }} className="p-1.5 text-foreground/50 hover:text-foreground">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 overflow-hidden flex flex-col px-4 py-4 min-h-0">
                                <div className="relative flex-1 flex flex-col min-h-0">
                                    <AnimatePresence mode="wait">
                                        {/* Step 1: Main Menu */}
                                        {menuStep === 'main' && (
                                            <motion.div 
                                                key="main-menu"
                                                initial={{ x: -20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                exit={{ x: -20, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="flex flex-col gap-1.5 flex-1"
                                            >
                                                <div className="mb-2 shrink-0">
                                                    <p className="text-[8.5px] font-black text-foreground/30 uppercase tracking-[0.2em] mb-2">Navigation</p>
                                                    <div className="grid gap-1.5">
                                                        <TapScale>
                                                            <Link
                                                                href="/products"
                                                                onClick={() => setMobileMenuOpen(false)}
                                                                className="group flex items-center justify-between p-3 bg-foreground/[0.02] active:bg-foreground/[0.05] rounded-xl transition-all border border-foreground/[0.02]"
                                                            >
                                                                <span className="text-sm font-black uppercase tracking-tight text-foreground">Explore All</span>
                                                                <ChevronRight size={16} className="text-foreground/20" />
                                                            </Link>
                                                        </TapScale>
                                                        
                                                        <TapScale>
                                                            <button
                                                                onClick={() => setMenuStep('categories')}
                                                                className="group flex items-center justify-between p-3 bg-foreground/[0.02] active:bg-foreground/[0.05] rounded-xl transition-all border border-foreground/[0.02] text-left w-full"
                                                            >
                                                                <span className="text-sm font-black uppercase tracking-tight text-foreground">Categories</span>
                                                                <ChevronRight size={16} className="text-foreground/20" />
                                                            </button>
                                                        </TapScale>
                                                        <TapScale>
                                                            <Link
                                                                href="/products?category=sale"
                                                                onClick={() => setMobileMenuOpen(false)}
                                                                className="group flex items-center justify-between p-3 bg-foreground/[0.02] active:bg-foreground/[0.05] rounded-xl transition-all border border-foreground/[0.02]"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-black uppercase tracking-tight text-foreground">Archive Sale</span>
                                                                    <span className="px-1.5 py-0.5 bg-brand-red text-[6.5px] font-black text-white rounded-full uppercase tracking-widest">Sale</span>
                                                                </div>
                                                                <ChevronRight size={16} className="text-foreground/20" />
                                                            </Link>
                                                        </TapScale>
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-h-0 flex flex-col">
                                                    <p className="text-[8.5px] font-black text-foreground/30 uppercase tracking-[0.2em] mb-2">Account</p>
                                                    <div className="grid grid-cols-2 gap-1.5 shrink-0">
                                                        <TapScale>
                                                            <Link
                                                                href={user ? (isAdmin ? "/admin" : "/profile") : "/login"}
                                                                onClick={() => setMobileMenuOpen(false)}
                                                                className="flex items-center gap-2.5 p-3 bg-foreground/[0.02] rounded-xl active:bg-foreground/[0.05] transition-all border border-foreground/[0.02]"
                                                            >
                                                                <User size={16} className="text-foreground/40" />
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-foreground">
                                                                    {user ? (isAdmin ? "Admin" : "Profile") : "Login"}
                                                                </span>
                                                            </Link>
                                                        </TapScale>
                                                        <TapScale>
                                                            <Link
                                                                href="/profile?tab=orders"
                                                                onClick={() => setMobileMenuOpen(false)}
                                                                className="flex items-center gap-2.5 p-3 bg-foreground/[0.02] rounded-xl active:bg-foreground/[0.05] transition-all border border-foreground/[0.02]"
                                                            >
                                                                <Package size={16} className="text-foreground/40" />
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-foreground">Orders</span>
                                                            </Link>
                                                        </TapScale>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Step 2: Categories */}
                                        {menuStep === 'categories' && (
                                            <motion.div 
                                                key="categories-menu"
                                                initial={{ x: 20, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                exit={{ x: 20, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="flex flex-col gap-1.5 h-full"
                                            >
                                                <p className="text-[8.5px] font-black text-foreground/30 uppercase tracking-[0.2em] mb-2 text-center">Select Category</p>
                                                <div className="grid gap-1.5 overflow-y-auto pr-1 no-scrollbar flex-1">
                                                    {categories
                                                        .filter(cat => cat.name.toLowerCase() !== 'sale')
                                                        .map((cat) => (
                                                            <TapScale key={cat.id}>
                                                                <button
                                                                    onClick={() => {
                                                                        router.push(`/products?category=${cat.slug}`);
                                                                        setMobileMenuOpen(false);
                                                                        setMenuStep('main');
                                                                    }}
                                                                    className="flex items-center justify-between p-3.5 border border-foreground/5 active:border-foreground/20 rounded-xl transition-all group text-left w-full"
                                                                >
                                                                    <span className="text-xs font-bold text-foreground/70 uppercase tracking-tight">{cat.name}</span>
                                                                    <ChevronRight size={14} className="text-foreground/10" />
                                                                </button>
                                                            </TapScale>
                                                        ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Footer (Recent + Logout) */}
                            <div className="shrink-0 bg-foreground/[0.01] border-t border-foreground/5 p-4 py-3">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-[8.5px] font-black uppercase tracking-[0.3em] text-foreground/40">Recently Added</h3>
                                    <Link 
                                        href="/products" 
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-[8.5px] font-bold text-brand-accent uppercase tracking-widest hover:underline"
                                    >
                                        View All
                                    </Link>
                                </div>
                                
                                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 px-0.5 snap-x min-h-[100px]">
                                    {recentProducts.slice(0, 4).map((product) => (
                                        <Link
                                            key={product.id}
                                            href={`/product/${product.id}`}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex-shrink-0 w-24 snap-start group"
                                        >
                                            <div className="aspect-[4/5] rounded-lg overflow-hidden bg-foreground/5 mb-1.5 relative border border-foreground/[0.02]">
                                                {product.media_url ? (
                                                    <Image 
                                                        src={product.media_url} 
                                                        alt={product.name} 
                                                        fill 
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[7px] font-black text-foreground/10">N/A</div>
                                                )}
                                            </div>
                                            <p className="text-[8px] font-bold text-foreground/70 truncate uppercase tracking-tight leading-none mb-0.5">{product.name}</p>
                                            <p className="text-[7.5px] font-black text-brand-accent leading-none">₹{product.price}</p>
                                        </Link>
                                    ))}
                                    {recentProducts.length === 0 && (
                                        <div className="flex gap-2.5">
                                            {[1,2,3].map(i => (
                                                <div key={i} className="w-24 h-28 bg-foreground/5 animate-pulse rounded-lg" />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {user && (
                                    <TapScale>
                                        <button
                                            onClick={async () => {
                                                cart.clear();
                                                await logout();
                                                setMobileMenuOpen(false);
                                                router.push('/');
                                            }}
                                            className="mt-3 w-full py-3 text-[8.5px] font-black uppercase tracking-[0.3em] text-red-500 bg-red-500/5 active:bg-red-500/10 rounded-xl transition-all border border-red-500/10"
                                        >
                                            Logout Account
                                        </button>
                                    </TapScale>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Spacer for fixed header (Ticker + Navbar) */}
            <div className={`transition-all duration-300 ${isScrolled ? "h-24" : "h-28"}`} />
        </>
    );
}
