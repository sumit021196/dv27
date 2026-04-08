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

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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

                            <button
                                type="button"
                                onClick={() => cart.openCart()}
                                className="relative p-2 text-foreground/70 hover:text-foreground transition-colors"
                            >
                                <ShoppingBag size={22} />
                                {totalItems > 0 && (
                                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-accent text-[9px] font-black text-white">
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
                <div className="fixed inset-0 z-[70] bg-background md:hidden animate-in slide-in-from-left duration-500">
                    <div className="flex flex-col h-full relative overflow-hidden">
                        
                        {/* Header */}
                        <div className="p-6 flex items-center justify-between border-b border-foreground/5 bg-background/80 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-3">
                                {menuStep !== 'main' && (
                                    <button 
                                        onClick={() => setMenuStep('main')}
                                        className="p-2 -ml-2 text-foreground/50 hover:text-foreground transition-colors"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                )}
                                <Image src="/logo.svg" alt="DV27" width={80} height={24} className="h-6 w-auto animate-logo-flip" />
                            </div>
                            <button onClick={() => {
                                setMobileMenuOpen(false);
                                setTimeout(() => setMenuStep('main'), 300);
                            }} className="p-2 text-foreground/50 hover:text-foreground">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Wizard Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-8">
                            <div className="relative h-full">
                                {/* Step 1: Main Menu */}
                                <div className={`transition-all duration-500 flex flex-col gap-2 ${menuStep === 'main' ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 absolute inset-0 pointer-events-none'}`}>
                                    <div className="mb-4">
                                        <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em] mb-4">Navigation</p>
                                        <div className="grid gap-2">
                                            <Link
                                                href="/products"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="group flex items-center justify-between p-4 bg-foreground/[0.03] hover:bg-foreground/[0.06] rounded-2xl transition-all"
                                            >
                                                <span className="text-xl font-black uppercase tracking-tight text-foreground">Explore All</span>
                                                <ChevronRight size={20} className="text-foreground/20 group-hover:text-foreground/50 transition-colors" />
                                            </Link>
                                            
                                            <button
                                                onClick={() => setMenuStep('categories')}
                                                className="group flex items-center justify-between p-4 bg-foreground/[0.03] hover:bg-foreground/[0.06] rounded-2xl transition-all text-left"
                                            >
                                                <span className="text-xl font-black uppercase tracking-tight text-foreground">Categories</span>
                                                <ChevronRight size={20} className="text-foreground/20 group-hover:text-foreground/50 transition-colors" />
                                            </button>

                                            <Link
                                                href="/products?category=sale"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="group flex items-center justify-between p-4 bg-foreground/[0.03] hover:bg-foreground/[0.06] rounded-2xl transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl font-black uppercase tracking-tight text-foreground">Archive Sale</span>
                                                    <span className="px-2 py-0.5 bg-brand-red text-[8px] font-black text-white rounded-full animate-pulse uppercase tracking-widest">Sale</span>
                                                </div>
                                                <ChevronRight size={20} className="text-foreground/20 group-hover:text-foreground/50 transition-colors" />
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em] mb-4">Account</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <Link
                                                href={user ? (isAdmin ? "/admin" : "/profile") : "/login"}
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="flex flex-col gap-3 p-4 bg-foreground/[0.03] rounded-2xl hover:bg-foreground/[0.06] transition-all"
                                            >
                                                <User size={20} className="text-foreground/40" />
                                                <span className="text-xs font-black uppercase tracking-widest text-foreground">
                                                    {user ? (isAdmin ? "Admin" : "Profile") : "Login"}
                                                </span>
                                            </Link>
                                            <Link
                                                href="/profile?tab=orders"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="flex flex-col gap-3 p-4 bg-foreground/[0.03] rounded-2xl hover:bg-foreground/[0.06] transition-all"
                                            >
                                                <Package size={20} className="text-foreground/40" />
                                                <span className="text-xs font-black uppercase tracking-widest text-foreground">Orders</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 2: Categories */}
                                <div className={`transition-all duration-500 flex flex-col gap-2 ${menuStep === 'categories' ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 absolute inset-0 pointer-events-none'}`}>
                                    <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-[0.2em] mb-4 text-center">Select Category</p>
                                    <div className="grid gap-2">
                                        {categories
                                            .filter(cat => cat.name.toLowerCase() !== 'sale')
                                            .map((cat) => (
                                                <Link
                                                    key={cat.id}
                                                    href={`/products?category=${cat.slug}`}
                                                    onClick={() => {
                                                        setMobileMenuOpen(false);
                                                        setMenuStep('main');
                                                    }}
                                                    className="flex items-center justify-between p-4 border border-foreground/5 hover:border-foreground/20 rounded-2xl transition-all group"
                                                >
                                                    <span className="text-lg font-bold text-foreground/70 group-hover:text-foreground transition-colors uppercase tracking-tight">{cat.name}</span>
                                                    <ChevronRight size={16} className="text-foreground/10 group-hover:text-foreground/40" />
                                                </Link>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Products Footer */}
                        <div className="mt-auto bg-foreground/[0.02] border-t border-foreground/5 p-6 pb-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">Recently Added</h3>
                                <Link 
                                    href="/products" 
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-[10px] font-bold text-brand-accent uppercase tracking-widest hover:underline"
                                >
                                    View All
                                </Link>
                            </div>
                            
                            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2 snap-x">
                                {recentProducts.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/product/${product.id}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex-shrink-0 w-32 snap-start group"
                                    >
                                        <div className="aspect-[4/5] rounded-xl overflow-hidden bg-foreground/5 mb-2 relative border border-foreground/5 group-hover:border-foreground/20 transition-all">
                                            {product.media_url ? (
                                                <Image 
                                                    src={product.media_url} 
                                                    alt={product.name} 
                                                    fill 
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-foreground/10">NO IMAGE</div>
                                            )}
                                        </div>
                                        <p className="text-[10px] font-bold text-foreground/80 truncate uppercase tracking-tight">{product.name}</p>
                                        <p className="text-[9px] font-black text-brand-accent">₹{product.price}</p>
                                    </Link>
                                ))}
                                {recentProducts.length === 0 && (
                                    <div className="flex gap-4">
                                        {[1,2,3].map(i => (
                                            <div key={i} className="w-32 h-40 bg-foreground/5 animate-pulse rounded-xl" />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {user && (
                                <button
                                    onClick={async () => {
                                        cart.clear();
                                        await logout();
                                        setMobileMenuOpen(false);
                                        router.push('/');
                                    }}
                                    className="mt-6 w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-2xl transition-all border border-red-500/10"
                                >
                                    Logout Account
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Spacer for fixed header (Ticker + Navbar) */}
            <div className={`transition-all duration-300 ${isScrolled ? "h-24" : "h-28"}`} />
        </>
    );
}
