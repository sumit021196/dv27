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
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
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

    // Prevent background scrolling when search or mobile menu is open
    useEffect(() => {
        if (searchOpen || mobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [searchOpen, mobileMenuOpen]);

    // Close mobile menu and search overlay on route changes
    useEffect(() => {
        setMobileMenuOpen(false);
        setSearchOpen(false);
    }, [pathname]);

    // Sync Recent Searches from LocalStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("recentSearches");
            if (stored) {
                try {
                    setRecentSearches(JSON.parse(stored));
                } catch (e) {
                    console.error("Failed to parse recent searches", e);
                }
            }
        }
    }, [searchOpen]);

    const addRecentSearch = (query: string) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        
        const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem("recentSearches", JSON.stringify(updated));
    };

    const removeRecentSearch = (query: string) => {
        const updated = recentSearches.filter(s => s !== query);
        setRecentSearches(updated);
        localStorage.setItem("recentSearches", JSON.stringify(updated));
    };

    const clearAllRecent = () => {
        setRecentSearches([]);
        localStorage.removeItem("recentSearches");
    };

    // Debounce searchQuery input
    useEffect(() => {
        const trimmed = searchQuery.trim();
        if (!trimmed) {
            setDebouncedQuery("");
            setSearchResults([]);
            setSuggestions([]);
            return;
        }
        
        // Only show skeleton loader if the search term has actually changed
        if (trimmed !== debouncedQuery) {
            setIsLoading(true);
        }

        const timer = setTimeout(() => {
            setDebouncedQuery(trimmed);
        }, 250); // fast 250ms debounce for premium UX feel
        return () => clearTimeout(timer);
    }, [searchQuery, debouncedQuery]);

    // Fetch live search results and suggestions when debouncedQuery changes
    useEffect(() => {
        if (!debouncedQuery) {
            setIsLoading(false);
            return;
        }

        const fetchResults = async () => {
            try {
                // Fetch up to 6 matching products for the live results drawer
                const results = await productService.getFilteredProducts({
                    search: debouncedQuery,
                    limit: 6
                }) || [];
                setSearchResults(results);

                const queryLower = debouncedQuery.toLowerCase();

                // Auto-generate smart suggestions (matching categories + product names) safely
                const matchingCategories = (Array.isArray(categories) ? categories : [])
                    .filter(c => c && typeof c.name === 'string' && c.name.toLowerCase().includes(queryLower))
                    .map(c => c.name);

                const nameMatches = (Array.isArray(results) ? results : [])
                    .filter(p => p && typeof p.name === 'string')
                    .map(p => p.name)
                    .filter(name => name.toLowerCase().includes(queryLower))
                    .slice(0, 3);

                const combined = Array.from(new Set([...matchingCategories, ...nameMatches])).slice(0, 4);
                setSuggestions(combined);
            } catch (err) {
                console.error("Real-time search fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [debouncedQuery, categories]);

    if (pathname.startsWith('/admin')) return null;
    const totalItems = cart.items.reduce((acc, current) => acc + current.qty, 0);

    return (
        <>
            <div className="fixed inset-x-0 top-0 z-[60]">
                <Ticker />
                <header
                    className={`transition-all duration-300 bg-background/80 backdrop-blur-xl border-b border-foreground/12 ${isScrolled ? "h-14" : "h-16"}`}
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
                                <Link
                                    href="/track"
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70 hover:text-foreground transition-colors ml-4"
                                >
                                    Track Order
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
                                            <div className="absolute right-0 top-full mt-2 w-48 bg-background/95 backdrop-blur-xl border border-foreground/18 rounded-2xl shadow-2xl py-2 animate-in fade-in zoom-in duration-200 overflow-hidden z-[100]">
                                                <div className="px-4 py-3 border-b border-foreground/12 mb-1">
                                                    <p className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest truncate">
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
                <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-3xl animate-in fade-in duration-300 overflow-y-auto no-scrollbar flex flex-col justify-start">
                    {/* Search Container */}
                    <div className="w-full max-w-4xl mx-auto flex flex-col h-full px-4 sm:px-8 py-6 sm:py-10">
                        
                        {/* Search Input Bar (Sticky / Header) */}
                        <div className="flex items-center gap-3 sm:gap-4 border-b border-foreground/18 pb-4 sm:pb-6 shrink-0 relative">
                            <Search size={22} className="text-foreground/60 shrink-0" />
                            <input
                                autoFocus
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && searchQuery.trim()) {
                                        addRecentSearch(searchQuery);
                                        router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                                        setSearchOpen(false);
                                    }
                                }}
                                placeholder="Search items, caps, denims..."
                                className="flex-1 bg-transparent text-xl sm:text-3xl font-black uppercase placeholder:text-foreground/45 outline-none focus:placeholder:text-foreground/25 text-foreground transition-all duration-300"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="p-1 hover:bg-foreground/5 rounded-full text-foreground/60 hover:text-foreground transition-all shrink-0"
                                    title="Clear input"
                                >
                                    <X size={18} />
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setSearchOpen(false);
                                }}
                                className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-foreground/60 hover:text-foreground hover:bg-foreground/5 px-3 py-1.5 rounded-lg transition-all shrink-0 ml-1 sm:ml-2"
                            >
                                Close
                            </button>
                        </div>

                        {/* Scrollable Results Pane */}
                        <div className="flex-1 overflow-y-auto no-scrollbar py-6 sm:py-8 min-h-0">
                            
                            {/* Loading State */}
                            {isLoading ? (
                                <div className="space-y-6 animate-pulse">
                                    <div className="h-6 w-32 bg-foreground/5 rounded-lg" />
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="h-4 w-3/4 bg-foreground/5 rounded-lg" />
                                        ))}
                                    </div>
                                    <div className="h-px bg-foreground/5 my-8" />
                                    <div className="h-6 w-24 bg-foreground/5 rounded-lg" />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="flex gap-3 items-center">
                                                <div className="w-12 h-14 bg-foreground/5 rounded-lg" />
                                                <div className="space-y-2 flex-1">
                                                    <div className="h-4 w-32 bg-foreground/5 rounded-lg" />
                                                    <div className="h-3 w-16 bg-foreground/5 rounded-lg" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : !searchQuery.trim() ? (
                                /* Default Empty Query Panel */
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
                                    
                                    {/* Left Panel: Recent & Popular */}
                                    <div className="space-y-8 md:col-span-1">
                                        {/* Recent Searches */}
                                        {recentSearches.length > 0 && (
                                            <div>
                                                <div className="flex items-center justify-between mb-4">
                                                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/50">Recent Searches</p>
                                                    <button 
                                                        onClick={clearAllRecent}
                                                        className="text-[8px] font-bold uppercase tracking-widest text-brand-red hover:underline"
                                                    >
                                                        Clear All
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    {recentSearches.map((term, i) => (
                                                        <div key={i} className="flex items-center justify-between group">
                                                            <button
                                                                onClick={() => {
                                                                    setSearchQuery(term);
                                                                    addRecentSearch(term);
                                                                }}
                                                                className="text-left text-xs font-bold text-foreground/60 hover:text-foreground transition-colors flex items-center gap-2"
                                                            >
                                                                <span className="w-1.5 h-1.5 bg-foreground/10 group-hover:bg-brand-accent rounded-full transition-colors" />
                                                                {term}
                                                            </button>
                                                            <button 
                                                                onClick={() => removeRecentSearch(term)}
                                                                className="text-[10px] text-foreground/45 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 px-2"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Popular Categories */}
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/50 mb-4">Popular Categories</p>
                                            <div className="flex flex-wrap gap-2">
                                                {categories.slice(0, 6).map((cat) => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => {
                                                            router.push(`/products?category=${cat.slug}`);
                                                            setSearchOpen(false);
                                                        }}
                                                        className="px-3.5 py-2 rounded-xl bg-foreground/[0.03] border border-foreground/[0.02] hover:bg-foreground/[0.06] text-[10px] font-black uppercase tracking-widest text-foreground/70 hover:text-foreground transition-all duration-300"
                                                    >
                                                        {cat.name}
                                                    </button>
                                                ))}
                                                {categories.length === 0 && ["Outerwear", "Tops", "Accessories", "Bottoms", "Knitwear", "Sale"].map((catName) => (
                                                    <button
                                                        key={catName}
                                                        onClick={() => {
                                                            router.push(`/products?category=${catName.toLowerCase()}`);
                                                            setSearchOpen(false);
                                                        }}
                                                        className="px-3.5 py-2 rounded-xl bg-foreground/[0.03] border border-foreground/[0.02] hover:bg-foreground/[0.06] text-[10px] font-black uppercase tracking-widest text-foreground/70 hover:text-foreground transition-all duration-300"
                                                    >
                                                        {catName}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Panel: Trending Drops (takes 2 cols on md screens) */}
                                    <div className="md:col-span-2 space-y-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/50">Trending Drops</p>
                                            <Link 
                                                href="/products" 
                                                onClick={() => setSearchOpen(false)}
                                                className="text-[8px] font-black uppercase tracking-widest text-brand-accent hover:underline"
                                            >
                                                Shop All
                                            </Link>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {recentProducts.slice(0, 4).map((product) => (
                                                <Link
                                                    key={product.id}
                                                    href={`/product/${product.slug || product.id}`}
                                                    onClick={() => {
                                                        addRecentSearch(product.name);
                                                        setSearchOpen(false);
                                                    }}
                                                    className="flex items-center gap-4 p-3 rounded-2xl bg-foreground/[0.01] hover:bg-foreground/[0.04] border border-foreground/[0.02] transition-all group"
                                                >
                                                    <div className="relative aspect-[3/4] w-12 sm:w-16 rounded-xl bg-foreground/5 overflow-hidden shrink-0 border border-foreground/[0.02]">
                                                        {product.media_url ? (
                                                            <Image
                                                                src={product.media_url}
                                                                alt={product.name}
                                                                fill
                                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-foreground/45">N/A</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-xs font-black uppercase tracking-tight text-foreground/80 group-hover:text-foreground transition-colors truncate">
                                                            {product.name}
                                                        </h4>
                                                        <p className="text-[9px] font-bold uppercase tracking-widest text-foreground/50 mt-0.5">
                                                            {product.category_name || "Piece"}
                                                        </p>
                                                        <p className="text-xs font-black text-brand-accent mt-1">
                                                            ₹{(product.price || 0).toLocaleString("en-IN")}
                                                        </p>
                                                    </div>
                                                    <ChevronRight size={14} className="text-foreground/35 group-hover:text-foreground/45 transition-colors shrink-0 mr-1" />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : searchResults.length === 0 ? (
                                /* No results state */
                                <div className="text-center py-16 sm:py-24 max-w-md mx-auto flex flex-col items-center">
                                    <div className="w-16 h-16 bg-foreground/[0.02] border border-foreground/[0.05] rounded-2xl flex items-center justify-center mb-6 text-foreground/50">
                                        <Search size={28} />
                                    </div>
                                    <h3 className="text-lg font-black uppercase tracking-tight text-foreground">No Pieces Found</h3>
                                    <p className="mt-2 text-[10px] font-bold text-foreground/60 uppercase tracking-[0.2em] leading-relaxed">
                                        We couldn't find any results for "{searchQuery}". Double-check spelling or explore other categories.
                                    </p>
                                    <div className="mt-8 flex flex-wrap gap-2 justify-center">
                                        {categories.slice(0, 4).map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => {
                                                    router.push(`/products?category=${cat.slug}`);
                                                    setSearchOpen(false);
                                                }}
                                                className="px-3 py-1.5 rounded-lg bg-foreground/[0.03] text-[9px] font-bold uppercase tracking-widest text-foreground/60 hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                /* Active results display */
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
                                    
                                    {/* Left Panel: Autocomplete Suggestions */}
                                    <div className="md:col-span-1 space-y-6">
                                        {suggestions.length > 0 && (
                                            <div>
                                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/50 mb-4">Suggestions</p>
                                                <div className="space-y-1">
                                                    {suggestions.map((sug, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => {
                                                                setSearchQuery(sug);
                                                                addRecentSearch(sug);
                                                            }}
                                                            className="w-full text-left p-2.5 rounded-xl hover:bg-foreground/[0.03] text-xs font-bold text-foreground/75 hover:text-foreground transition-all duration-300 flex items-center gap-2.5 group"
                                                        >
                                                            <Search size={12} className="text-foreground/45 group-hover:text-brand-accent transition-colors" />
                                                            <span>
                                                                {/* Highlight match */}
                                                                {sug.toLowerCase().startsWith(searchQuery.toLowerCase()) ? (
                                                                    <>
                                                                        <span className="font-black text-foreground">{sug.slice(0, searchQuery.length)}</span>
                                                                        <span className="text-foreground/50">{sug.slice(searchQuery.length)}</span>
                                                                    </>
                                                                ) : (
                                                                    sug
                                                                )}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/50 mb-3">Refine Search</p>
                                            <p className="text-[10px] text-foreground/60 font-bold uppercase tracking-[0.2em] leading-relaxed">
                                                Press <kbd className="px-1.5 py-0.5 rounded bg-foreground/5 font-black text-[9px]">Enter</kbd> to see all matching clothing drops.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right Panel: Product Results */}
                                    <div className="md:col-span-2 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/50">
                                                Matching Products ({searchResults.length})
                                            </p>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {searchResults.map((product) => (
                                                <Link
                                                    key={product.id}
                                                    href={`/product/${product.slug || product.id}`}
                                                    onClick={() => {
                                                        addRecentSearch(product.name);
                                                        setSearchOpen(false);
                                                    }}
                                                    className="flex items-center gap-4 p-3 rounded-2xl bg-foreground/[0.01] hover:bg-foreground/[0.04] border border-foreground/[0.02] transition-all group"
                                                >
                                                    <div className="relative aspect-[3/4] w-14 rounded-xl bg-foreground/5 overflow-hidden shrink-0 border border-foreground/[0.02]">
                                                        {product.media_url ? (
                                                            <Image
                                                                src={product.media_url}
                                                                alt={product.name}
                                                                fill
                                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-foreground/45">N/A</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-xs font-black uppercase tracking-tight text-foreground/80 group-hover:text-foreground transition-colors truncate">
                                                            {product.name}
                                                        </h4>
                                                        <p className="text-[9px] font-bold uppercase tracking-widest text-foreground/50 mt-0.5">
                                                            {product.category_name || "Piece"}
                                                        </p>
                                                        <p className="text-xs font-black text-brand-accent mt-1">
                                                            ₹{(product.price || 0).toLocaleString("en-IN")}
                                                        </p>
                                                    </div>
                                                    <ChevronRight size={14} className="text-foreground/35 group-hover:text-foreground/45 transition-colors shrink-0 mr-1" />
                                                </Link>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => {
                                                addRecentSearch(searchQuery);
                                                router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                                                setSearchOpen(false);
                                            }}
                                            className="w-full py-4 rounded-2xl bg-foreground text-background hover:bg-brand-accent hover:text-white text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-300 text-center flex items-center justify-center gap-2.5 shadow-xl shadow-foreground/5 hover:scale-[1.01]"
                                        >
                                            View All Results for "{searchQuery}"
                                            <ChevronRight size={12} />
                                        </button>
                                    </div>
                                </div>
                            )}

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
                            <div className="px-4 py-3 flex items-center justify-between border-b border-foreground/12 bg-background sticky top-0 z-10 shrink-0">
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
                                                    <p className="text-[8.5px] font-black text-foreground/50 uppercase tracking-[0.2em] mb-2">Navigation</p>
                                                    <div className="grid gap-1.5">
                                                        <TapScale>
                                                            <Link
                                                                href="/products"
                                                                onClick={() => setMobileMenuOpen(false)}
                                                                className="group flex items-center justify-between p-3 bg-foreground/[0.02] active:bg-foreground/[0.05] rounded-xl transition-all border border-foreground/[0.02]"
                                                            >
                                                                <span className="text-sm font-black uppercase tracking-tight text-foreground">Explore All</span>
                                                                <ChevronRight size={16} className="text-foreground/45" />
                                                            </Link>
                                                        </TapScale>
                                                        
                                                        <TapScale>
                                                            <button
                                                                onClick={() => setMenuStep('categories')}
                                                                className="group flex items-center justify-between p-3 bg-foreground/[0.02] active:bg-foreground/[0.05] rounded-xl transition-all border border-foreground/[0.02] text-left w-full"
                                                            >
                                                                <span className="text-sm font-black uppercase tracking-tight text-foreground">Categories</span>
                                                                <ChevronRight size={16} className="text-foreground/45" />
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
                                                                <ChevronRight size={16} className="text-foreground/45" />
                                                            </Link>
                                                        </TapScale>
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-h-0 flex flex-col">
                                                    <p className="text-[8.5px] font-black text-foreground/50 uppercase tracking-[0.2em] mb-2">Account & Support</p>
                                                    <div className="grid grid-cols-2 gap-1.5 shrink-0 mb-1.5">
                                                        <TapScale>
                                                            <Link
                                                                href={user ? (isAdmin ? "/admin" : "/profile") : "/login"}
                                                                onClick={() => setMobileMenuOpen(false)}
                                                                className="flex items-center gap-2.5 p-3 bg-foreground/[0.02] rounded-xl active:bg-foreground/[0.05] transition-all border border-foreground/[0.02]"
                                                            >
                                                                <User size={16} className="text-foreground/60" />
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
                                                                <Package size={16} className="text-foreground/60" />
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-foreground">Orders</span>
                                                            </Link>
                                                        </TapScale>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-1.5 shrink-0">
                                                        <TapScale>
                                                            <Link
                                                                href="/track"
                                                                onClick={() => setMobileMenuOpen(false)}
                                                                className="flex items-center gap-2.5 p-3 bg-foreground/[0.02] rounded-xl active:bg-foreground/[0.05] transition-all border border-foreground/[0.02]"
                                                            >
                                                                <Package size={16} className="text-foreground/60" />
                                                                <span className="text-xs font-black uppercase tracking-tight text-foreground/80">Track Order</span>
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
                                                <p className="text-[8.5px] font-black text-foreground/50 uppercase tracking-[0.2em] mb-2 text-center">Select Category</p>
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
                                                                    className="flex items-center justify-between p-3.5 border border-foreground/12 active:border-foreground/20 rounded-xl transition-all group text-left w-full"
                                                                >
                                                                    <span className="text-xs font-bold text-foreground/70 uppercase tracking-tight">{cat.name}</span>
                                                                    <ChevronRight size={14} className="text-foreground/25" />
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
                            <div className="shrink-0 bg-foreground/[0.01] border-t border-foreground/12 p-4 py-3">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-[8.5px] font-black uppercase tracking-[0.3em] text-foreground/60">Recently Added</h3>
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
                                                    <div className="w-full h-full flex items-center justify-center text-[7px] font-black text-foreground/25">N/A</div>
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
