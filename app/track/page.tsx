"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from 'react';
import { Search, Package, Truck, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/utils/cn";

function TrackOrderContent() {
    const searchParams = useSearchParams();
    const idParam = searchParams.get('id');
    const [query, setQuery] = useState(idParam || "");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (idParam) {
            handleTrack(idParam);
        }
    }, [idParam]);

    const handleTrack = async (trackId?: string) => {
        const idToTrack = trackId || query;
        if (!idToTrack.trim()) return;
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = await fetch(`/api/track?id=${encodeURIComponent(idToTrack.trim())}`);
            const data = await res.json();
            if (data.success) {
                setResult(data);
            } else {
                setError(data.error || "Could not find order. Please check the ID.");
            }
        } catch (err) {
            setError("Failed to fetch tracking info. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-background pt-32 pb-20 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 px-2">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-accent mb-4">Post-Purchase</p>
                        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-foreground">
                            Track <span className="text-foreground/10">Order</span>
                        </h1>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-2xl mb-20 group px-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                        placeholder="Order ID / AWB #"
                        className="w-full bg-transparent border-b-2 border-foreground/10 py-6 text-2xl md:text-4xl font-black uppercase outline-none focus:border-brand-accent transition-all placeholder:text-foreground/5 text-foreground pr-16"
                    />
                    <button
                        onClick={() => handleTrack()}
                        disabled={loading || !query.trim()}
                        className="absolute right-2 bottom-6 p-4 bg-foreground text-background rounded-2xl hover:bg-brand-accent hover:text-white transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {loading ? <Loader2 size={24} className="animate-spin" /> : <ArrowRight size={24} />}
                    </button>
                    <p className="mt-4 text-[10px] font-bold text-foreground/20 uppercase tracking-[0.2em]">
                        Check your confirmation email for the tracking ID.
                    </p>
                </div>

                {/* Status States */}
                <div className="px-2">
                    {error && (
                        <div className="flex items-center gap-3 p-6 bg-red-500/5 border border-red-500/10 rounded-[2.5rem] text-red-500 animate-in fade-in slide-in-from-top-4 duration-500">
                            <AlertCircle size={24} />
                            <p className="text-xs font-black uppercase tracking-widest">{error}</p>
                        </div>
                    )}

                    {result && (
                        <div className="grid gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {/* Order Summary Card */}
                            <div className="bg-muted/30 rounded-[3rem] p-8 md:p-12 border border-foreground/5 relative overflow-hidden">
                                <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-2">Order Status</p>
                                            <div className="flex items-center gap-3">
                                                <span className={cn(
                                                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                    result.order.status === 'paid' ? "bg-emerald-500/10 text-emerald-500" : "bg-brand-accent/10 text-brand-accent"
                                                )}>
                                                    {result.order.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">Customer</p>
                                            <p className="text-xl font-black uppercase text-foreground">{result.order.customer_name}</p>
                                        </div>
                                    </div>
                                    <div className="md:text-right space-y-6">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">Order Date</p>
                                            <p className="text-lg font-bold text-foreground">{format(new Date(result.order.created_at), 'PPP')}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">Total Amount</p>
                                            <p className="text-3xl font-black tracking-tighter text-foreground">₹{result.order.total_amount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12 scale-150 pointer-events-none">
                                    <Package size={300} />
                                </div>
                            </div>

                            {/* Shipment Info */}
                            <div className="bg-background rounded-[3rem] p-8 md:p-12 border border-foreground/5 shadow-2xl shadow-foreground/[0.02]">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="p-4 bg-foreground text-background rounded-2xl shadow-xl shadow-foreground/10">
                                        <Truck size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
                                            {result.shipping?.tracking_id ? "Shipment Live" : "Preparing Shipment"}
                                        </h2>
                                        {result.shipping?.tracking_id && (
                                            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1">
                                                {result.shipping.partner} • AWB: {result.shipping.tracking_id}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-10">
                                    {/* Static Timeline based on Order Status */}
                                    <div className="flex gap-6 items-start relative pb-10">
                                        <div className="absolute left-[11px] top-6 w-[2px] h-[calc(100%-12px)] bg-foreground/5" />
                                        <div className="z-10 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg shadow-emerald-500/20">
                                            <CheckCircle2 size={12} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Order Confirmed</p>
                                            <p className="text-sm font-bold text-foreground/60">We have received your order</p>
                                        </div>
                                    </div>

                                    {result.order.status === 'paid' && (
                                         <div className="flex gap-6 items-start relative">
                                            <div className="absolute left-[11px] top-6 w-[2px] h-[calc(100%-12px)] bg-foreground/5" />
                                            <div className="z-10 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg shadow-emerald-500/20">
                                                <CheckCircle2 size={12} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Payment Verified</p>
                                                <p className="text-sm font-bold text-foreground/60">Order is being processed for dispatch</p>
                                            </div>
                                        </div>
                                    )}

                                    {result.shipping?.tracking_id ? (
                                         <div className="flex gap-6 items-start">
                                            <div className="z-10 bg-brand-accent text-white rounded-full p-1.5 shadow-lg shadow-brand-accent/20 flex items-center justify-center">
                                                <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-brand-accent uppercase tracking-widest mb-1">In Transit</p>
                                                <p className="text-sm font-bold text-foreground/60">Handed over to carrier partner</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex gap-6 items-start">
                                            <div className="z-10 bg-foreground/10 text-foreground/30 rounded-full p-1.5">
                                                <Package size={12} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-1">Pending Dispatch</p>
                                                <p className="text-sm font-bold text-foreground/20">Awaiting label generation</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {result.shipping?.estimated_delivery && (
                                    <div className="mt-12 p-8 bg-brand-accent/5 rounded-3xl border border-brand-accent/10">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-accent/60 mb-2">Estimated Arrival</p>
                                        <p className="text-2xl font-black text-brand-accent uppercase tracking-tight">{result.shipping.estimated_delivery}</p>
                                    </div>
                                )}
                             </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

export default function TrackOrderPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background pt-32 pb-20">
                <Loader2 className="animate-spin text-foreground/20 w-12 h-12" />
            </div>
        }>
            <TrackOrderContent />
        </Suspense>
    );
}
