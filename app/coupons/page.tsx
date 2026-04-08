"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Ticket, Copy, CheckCircle2, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";

export default function CouponsPage() {
    const supabase = createClient();
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    useEffect(() => {
        const fetchCoupons = async () => {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .eq('active', true)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setCoupons(data);
            }
            setLoading(false);
        };
        fetchCoupons();
    }, [supabase]);

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* ── Minimal Header ── */}
            <div className="px-6 pt-10 pb-6 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-xl z-20 border-b border-foreground/5">
                <Link href="/profile" className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-600 active:scale-90 transition-transform">
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-black text-foreground tracking-tighter uppercase">Extra Savings</h1>
                    <Sparkles size={16} className="text-brand-accent animate-pulse" />
                </div>
            </div>

            <main className="px-6 py-8 max-w-2xl mx-auto space-y-6">
                {coupons.length === 0 ? (
                    <div className="text-center py-20 bg-muted rounded-3xl border border-dashed border-foreground/10">
                        <Ticket className="w-12 h-12 mx-auto text-muted-foreground/20 mb-4" />
                        <h2 className="text-lg font-bold text-foreground">No active offers</h2>
                        <p className="text-sm text-muted-foreground mt-1 px-10">We're curating new drops and deals for you. Check back soon!</p>
                        <Link href="/products" className="mt-8 inline-block px-8 py-4 bg-foreground text-background text-xs font-black uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all">
                            Browse Collection
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {coupons.map((coupon) => (
                            <div 
                                key={coupon.id} 
                                className="group relative bg-zinc-50 border border-foreground/5 rounded-3xl p-6 transition-all hover:bg-white hover:border-foreground/10 hover:shadow-xl hover:shadow-zinc-200/50"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-brand-accent uppercase tracking-widest bg-brand-accent/5 px-2 py-0.5 rounded-lg border border-brand-accent/10">
                                                {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground">
                                            Save big on your next order
                                        </h3>
                                        <p className="text-xs font-semibold text-muted-foreground">
                                            {coupon.min_order_value > 0 ? `Valid on orders above ₹${coupon.min_order_value}` : 'No minimum order required'}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-zinc-300 border border-foreground/5">
                                        <Ticket size={24} />
                                    </div>
                                </div>

                                <div className="mt-6 flex items-center justify-between gap-4 p-2 bg-white border border-foreground/5 rounded-2xl">
                                    <div className="px-3">
                                        <span className="font-mono text-sm font-bold tracking-widest text-foreground uppercase">{coupon.code}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleCopy(coupon.code)}
                                        className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            copiedCode === coupon.code 
                                            ? "bg-emerald-500 text-white" 
                                            : "bg-foreground text-background hover:bg-zinc-800"
                                        }`}
                                    >
                                        {copiedCode === coupon.code ? (
                                            <>
                                                <CheckCircle2 size={12} />
                                                <span>COPIED</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={12} />
                                                <span>COPY</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                
                                {/* Decorative "Ticket Cut" Circles */}
                                <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-background rounded-full border-r border-foreground/5" />
                                <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-background rounded-full border-l border-foreground/5" />
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
