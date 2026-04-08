
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useCart } from "@/components/cart/CartContext";
import {
    User as UserIcon,
    Package,
    Settings,
    LogOut,
    Clock,
    MapPin,
    CreditCard,
    ChevronRight,
    ShieldCheck,
    Bell,
    Heart,
    Ticket
} from "lucide-react";
import { logout } from "../(auth)/auth.actions";
import Link from "next/link";

export default function ProfilePage() {
    const cart = useCart();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [couponCount, setCouponCount] = useState(0);
    const [points, setPoints] = useState(0);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        let isSynced = false;

        const fetchData = async (currentUser: User) => {
            if (isSynced) return;
            isSynced = true;
            
            setUser(currentUser);
            
            // 1. Fetch profile with explicit columns to avoid 406 error
            const { data: profileData, error: profileError } = await supabase
                .from("profiles")
                .select("id, full_name, phone_number, default_address, default_pincode, avatar_url, is_admin")
                .eq("id", currentUser.id)
                .maybeSingle();

            if (profileError) {
                console.error("Profile fetch error:", profileError);
            }
            setProfile(profileData);

            // 2. Fetch specific data in parallel for speed
            try {
                const [ordersRes, wishlistRes, couponsRes] = await Promise.all([
                    fetch('/api/my-orders').then(res => res.json()).catch(() => ({ orders: [] })),
                    supabase.from('wishlist').select('*', { count: 'exact', head: true }).eq('user_id', currentUser.id),
                    supabase.from('coupons').select('*', { count: 'exact', head: true }).eq('active', true)
                ]);

                if (ordersRes.orders) {
                    setOrders(ordersRes.orders);
                    const totalSpent = ordersRes.orders
                        .filter((o: any) => o.status === 'paid' || o.status === 'delivered')
                        .reduce((acc: number, o: any) => acc + (o.total_amount || 0), 0);
                    setPoints(Math.floor(totalSpent / 100));
                }

                if (!wishlistRes.error && wishlistRes.count !== null) {
                    setWishlistCount(wishlistRes.count);
                }

                if (!couponsRes.error && couponsRes.count !== null) {
                    setCouponCount(couponsRes.count);
                }
            } catch (e) {
                console.error("Error fetching detail data:", e);
            } finally {
                setLoading(false);
            }
        };

        // Check current session immediately
        supabase.auth.getUser().then(({ data: { user: currentUser } }: { data: { user: User | null } }) => {
            if (currentUser) {
                fetchData(currentUser as User);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes to handle "first load" session sync
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            if (session?.user) {
                fetchData(session.user as User);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    // Simple logic for membership level
    const getMemberLevel = (orderCount: number) => {
        if (orderCount >= 10) return "Executive Member";
        if (orderCount >= 5) return "Privilege Member";
        if (orderCount >= 1) return "Silver Member";
        return "Member Level 01";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-6 h-6 border-2 border-muted border-t-foreground rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
                <div className="w-16 h-16 bg-muted rounded-3xl flex items-center justify-center mb-6">
                    <ShieldCheck className="text-muted-foreground/30" size={32} />
                </div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Login Required</h1>
                <p className="text-muted-foreground mt-2 text-center text-sm max-w-[280px]">
                    Please sign in to access your orders and account settings.
                </p>
                <Link
                    href="/login"
                    className="mt-8 w-full max-w-[200px] py-4 bg-foreground text-background text-sm font-bold rounded-2xl hover:opacity-90 transition active:scale-[0.98] flex items-center justify-center"
                >
                    Go to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* ── Compact Header ── */}
            <div className="px-6 pt-10 pb-6 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-xl z-20 border-b border-foreground/5">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center overflow-hidden border border-foreground/5">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon size={24} className="text-muted-foreground" />
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-foreground border-2 border-background rounded-full flex items-center justify-center">
                            <div className="w-1 h-1 bg-background rounded-full animate-pulse" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-zinc-900 tracking-tight leading-none">
                            {profile?.full_name?.split(' ')[0] || user.email?.split('@')[0] || "Explorer"}
                        </h1>
                        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                            {getMemberLevel(orders.length)}
                        </p>
                    </div>
                </div>
                <button className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-600 active:scale-90 transition-transform">
                    <Bell size={20} />
                </button>
            </div>

            <div className="px-6 space-y-8 mt-6 max-w-2xl mx-auto">

                {/* ── Quick Stats Grid ── */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted rounded-2xl p-4 text-center">
                        <p className="text-lg font-bold text-foreground">{orders.length}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Orders</p>
                    </div>
                    <Link href="/wishlist" className="bg-muted rounded-2xl p-4 text-center hover:bg-zinc-200 transition-colors">
                        <p className="text-lg font-bold text-foreground">{wishlistCount}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Wishlist</p>
                    </Link>
                    <div className="bg-muted rounded-2xl p-4 text-center">
                        <p className="text-lg font-bold text-foreground">{points}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Points</p>
                    </div>
                </div>

                {/* ── Active Order Card (Compact) ── */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">My Orders</h2>
                        <span className="text-xs font-bold text-muted-foreground">{orders.length} total</span>
                    </div>
                    
                    {orders.length === 0 ? (
                         <div className="bg-muted border border-foreground/5 border-dashed rounded-3xl p-8 text-center flex flex-col items-center">
                            <Package className="text-muted-foreground/30 w-10 h-10 mb-3" />
                            <p className="text-sm font-bold text-muted-foreground">No orders yet</p>
                            <Link href="/products" className="text-xs font-bold text-brand-accent mt-2">Start shopping</Link>
                         </div>
                    ) : (
                        <div className="space-y-3">
                            {orders.slice(0, 3).map((order) => (
                                <Link 
                                    href={`/profile/orders/${order.id}`} 
                                    key={order.id} 
                                    className="bg-background border border-foreground/5 hover:border-foreground/10 rounded-3xl p-5 flex items-center justify-between shadow-sm transition-colors block"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                            order.status === 'delivered' ? 'bg-emerald-50' : 
                                            order.status === 'cancelled' ? 'bg-red-50' : 'bg-foreground text-background'
                                        }`}>
                                            <Package className={
                                                order.status === 'delivered' ? 'text-emerald-500' : 
                                                order.status === 'cancelled' ? 'text-red-500' : 'text-background'
                                            } size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                                                Order #{order.id.split('-')[0]}
                                            </p>
                                            <p className="text-sm font-bold text-foreground capitalize">
                                                {order.status}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="text-sm font-black text-foreground">₹{order.total_amount}</p>
                                        <ChevronRight size={18} className="text-muted-foreground/30" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* ── Menu List (Category Style) ── */}
                <div className="space-y-2">
                    <h2 className="text-xs font-bold text-zinc-300 uppercase tracking-widest px-2 mb-4">Account Essentials</h2>

                    <MenuLink 
                        icon={Heart} 
                        label="My Favorites" 
                        count={wishlistCount > 0 ? wishlistCount.toString() : null} 
                        href="/wishlist" 
                    />
                    <MenuLink 
                        icon={Ticket} 
                        label="Coupons & Offers" 
                        count={couponCount > 0 ? couponCount.toString() : null} 
                        href="/coupons"
                    />
                    <MenuLink 
                        icon={MapPin} 
                        label="Saved Addresses" 
                        count={profile?.default_address ? "1" : "0"} 
                        href="/profile/settings"
                    />
                    <MenuLink 
                        icon={CreditCard} 
                        label="Payment Methods" 
                        href="/profile/settings"
                    />
                    <MenuLink 
                        icon={Settings} 
                        label="Personal Details" 
                        href="/profile/settings"
                    />
                </div>

                {/* ── Support & Security ── */}
                <div className="space-y-2 pt-4">
                    <h3 className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.2em] px-2 mb-4">Help & Security</h3>
                    <MenuLink icon={ShieldCheck} label="Privacy & Security" />
                    <MenuLink icon={LogOut} label="Sign Out" onClick={() => {
                        cart.clear();
                        logout();
                    }} variant="danger" />
                </div>

                {/* ── Footer Branding ── */}
                <div className="text-center pt-8 opacity-20 grayscale scale-75">
                    <img src="/logo.svg" alt="DV27" className="h-8 mx-auto mb-2" />
                    <p className="text-[10px] font-bold tracking-widest uppercase">Version 1.0.4</p>
                </div>
            </div>
        </div>
    );
}

function MenuLink({ icon: Icon, label, count, onClick, href, variant = "default" }: any) {
    const content = (
        <div className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 active:bg-zinc-100 transition-all group">
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-zinc-50 text-zinc-500 group-hover:bg-white'
                    }`}>
                    <Icon size={18} strokeWidth={2.2} />
                </div>
                <span className={`text-[15px] font-semibold tracking-tight ${variant === 'danger' ? 'text-red-600' : 'text-zinc-800'
                    }`}>{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {count !== undefined && count !== null && (
                    <span className="text-[12px] font-bold text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded-lg">{count}</span>
                )}
                <ChevronRight size={16} className="text-zinc-300 group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
    );

    if (href) {
        return <Link href={href} className="block">{content}</Link>;
    }

    return (
        <button onClick={onClick} className="w-full text-left">
            {content}
        </button>
    );
}
