"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User as UserIcon, Save, ArrowLeft, MapPin, Phone, User, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [profile, setProfile] = useState({
        full_name: "",
        phone_number: "",
        default_address: "",
        default_pincode: "",
        avatar_url: ""
    });

    useEffect(() => {
        const getInitialData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            
            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .maybeSingle();

            if (data) {
                setProfile({
                    full_name: data.full_name || "",
                    phone_number: data.phone_number || "",
                    default_address: data.default_address || "",
                    default_pincode: data.default_pincode || "",
                    avatar_url: data.avatar_url || ""
                });
            }
            setLoading(false);
        };
        getInitialData();
    }, [supabase, router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from("profiles")
            .upsert({
                id: user.id,
                ...profile,
                updated_at: new Date().toISOString()
            });

        if (!error) {
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } else {
            console.error("Error saving profile:", error);
            alert("Failed to save changes. Please try again.");
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="w-6 h-6 border-2 border-muted border-t-foreground rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* ── Dynamic Header ── */}
            <div className="px-6 pt-10 pb-6 flex items-center gap-4 bg-background sticky top-0 z-20 border-b border-foreground/5">
                <Link href="/profile" className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-600 active:scale-90 transition-transform">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-xl font-bold text-zinc-900 tracking-tight">Account Settings</h1>
            </div>

            <main className="px-6 py-8 max-w-2xl mx-auto">
                <form onSubmit={handleSave} className="space-y-8">
                    
                    {/* ── Avatar Section ── */}
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className="w-24 h-24 bg-zinc-50 rounded-3xl flex items-center justify-center overflow-hidden border border-foreground/10 relative">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon size={32} className="text-zinc-300" />
                            )}
                        </div>
                        <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Avatar customization coming soon</p>
                    </div>

                    {/* ── Fields Section ── */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-foreground transition-colors" size={18} />
                                <input 
                                    type="text" 
                                    value={profile.full_name}
                                    onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                                    placeholder="Enter your full name"
                                    className="w-full bg-zinc-50 border border-foreground/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold focus:outline-none focus:border-foreground/20 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Phone Number</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-foreground transition-colors" size={18} />
                                <input 
                                    type="tel" 
                                    value={profile.phone_number}
                                    onChange={(e) => setProfile({...profile, phone_number: e.target.value})}
                                    placeholder="+91-XXXXX-XXXXX"
                                    className="w-full bg-zinc-50 border border-foreground/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold focus:outline-none focus:border-foreground/20 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-3 space-y-2">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Default Address</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-4 text-zinc-300 group-focus-within:text-foreground transition-colors" size={18} />
                                    <textarea 
                                        rows={3}
                                        value={profile.default_address}
                                        onChange={(e) => setProfile({...profile, default_address: e.target.value})}
                                        placeholder="Flat, House no, Building, Company, Apartment"
                                        className="w-full bg-zinc-50 border border-foreground/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-semibold focus:outline-none focus:border-foreground/20 focus:bg-white transition-all resize-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Pincode</label>
                                <input 
                                    type="text" 
                                    value={profile.default_pincode}
                                    onChange={(e) => setProfile({...profile, default_pincode: e.target.value})}
                                    placeholder="XXXXXX"
                                    className="w-full bg-zinc-50 border border-foreground/5 rounded-2xl py-4 px-4 text-sm font-semibold focus:outline-none focus:border-foreground/20 focus:bg-white transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Action Footer ── */}
                    <div className="pt-8">
                        <button 
                            type="submit" 
                            disabled={saving}
                            className={`w-full py-5 rounded-3xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
                                success 
                                ? "bg-emerald-500 text-white" 
                                : "bg-foreground text-background hover:opacity-90 active:bg-zinc-800"
                            }`}
                        >
                            {saving ? (
                                <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                            ) : success ? (
                                <>
                                    <CheckCircle2 size={18} />
                                    <span>Changes Saved</span>
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    <span>Save Profile</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
