
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
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
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any>(null);
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
            }
            setLoading(false);
        };
        getProfile();
    }, [supabase]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-6 h-6 border-2 border-zinc-100 border-t-zinc-900 rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
                <div className="w-16 h-16 bg-zinc-50 rounded-3xl flex items-center justify-center mb-6">
                    <ShieldCheck className="text-zinc-300" size={32} />
                </div>
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Login Required</h1>
                <p className="text-zinc-500 mt-2 text-center text-sm max-w-[280px]">
                    Please sign in to access your orders and account settings.
                </p>
                <Link
                    href="/login"
                    className="mt-8 w-full max-w-[200px] py-4 bg-zinc-900 text-white text-sm font-bold rounded-2xl hover:bg-zinc-800 transition active:scale-[0.98] flex items-center justify-center"
                >
                    Go to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* ── Compact Header ── */}
            <div className="px-6 pt-10 pb-6 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-20 border-b border-zinc-50">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center overflow-hidden border border-zinc-50">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon size={24} className="text-zinc-400" />
                            )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black border-2 border-white rounded-full flex items-center justify-center">
                            <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
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
                    <div className="bg-zinc-50 rounded-2xl p-4 text-center">
                        <p className="text-lg font-bold text-zinc-900">0</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">Orders</p>
                    </div>
                    <div className="bg-zinc-50 rounded-2xl p-4 text-center">
                        <p className="text-lg font-bold text-zinc-900">12</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">Wishlist</p>
                    </div>
                    <div className="bg-zinc-50 rounded-2xl p-4 text-center">
                        <p className="text-lg font-bold text-zinc-900">350</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">Points</p>
                    </div>
                </div>

                {/* ── Active Order Card (Compact) ── */}
                <section>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">Ongoing Order</h2>
                        <Link href="#" className="text-xs font-bold text-zinc-400">View all</Link>
                    </div>
                    <div className="bg-zinc-900 rounded-3xl p-6 text-white flex items-center justify-between shadow-lg shadow-zinc-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                <Package className="text-white/60" size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white/50 mb-0.5">Order #3928</p>
                                <p className="text-sm font-bold">Awaiting shipment</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-white/40" />
                    </div>
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
                    <MenuLink icon={LogOut} label="Sign Out" onClick={() => logout()} variant="danger" />
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
