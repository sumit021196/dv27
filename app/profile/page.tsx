
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
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", user.id)
                    .single();
                setProfile(profile);

                // Fetch user specific orders
                try {
                    const res = await fetch('/api/my-orders');
                    const data = await res.json();
                    if(data.orders) setOrders(data.orders);
                } catch(e) {
                    console.error("Error fetching orders:", e);
                }
            }
            setLoading(false);
        };
        getProfile();
    }, [supabase]);

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
                            {profile?.full_name?.split(' ')[0] || "Hi there!"}
                        </h1>
                        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                            Member Level 01
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
                        <p className="text-lg font-bold text-foreground">0</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Orders</p>
                    </div>
                    <div className="bg-muted rounded-2xl p-4 text-center">
                        <p className="text-lg font-bold text-foreground">12</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Wishlist</p>
                    </div>
                    <div className="bg-muted rounded-2xl p-4 text-center">
                        <p className="text-lg font-bold text-foreground">350</p>
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

                    <MenuLink icon={Heart} label="My Favorites" count="12" />
                    <MenuLink icon={Ticket} label="Coupons & Offers" />
                    <MenuLink icon={MapPin} label="Saved Addresses" />
                    <MenuLink icon={CreditCard} label="Payment Methods" />
                    <MenuLink icon={Settings} label="Personal Details" />
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

function MenuLink({ icon: Icon, label, count, onClick, variant = "default" }: any) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-zinc-50 active:bg-zinc-100 transition-all group"
        >
            <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-zinc-50 text-zinc-500 group-hover:bg-white'
                    }`}>
                    <Icon size={18} strokeWidth={2.2} />
                </div>
                <span className={`text-[15px] font-semibold tracking-tight ${variant === 'danger' ? 'text-red-600' : 'text-zinc-800'
                    }`}>{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {count && (
                    <span className="text-[12px] font-bold text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded-lg">{count}</span>
                )}
                <ChevronRight size={16} className="text-zinc-300 group-hover:translate-x-1 transition-transform" />
            </div>
        </button>
    );
}
