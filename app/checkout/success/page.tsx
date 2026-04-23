"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Package, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from 'react';

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        const id = searchParams.get('order_id');
        if (id) {
            setOrderId(id);
        } else {
            // Unlikely, but if someone navigates here directly without an order ID
            const timeout = setTimeout(() => router.push('/products'), 3000);
            return () => clearTimeout(timeout);
        }
    }, [searchParams, router]);

    if (!orderId) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="animate-spin text-zinc-300 w-12 h-12 mb-4" />
                <h1 className="text-xl font-bold text-zinc-900">Validating your order...</h1>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-zinc-50/30 flex items-center justify-center p-4 py-24">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center border border-zinc-100/50">
                {/* Checkmark Animation or Icon */}
                <div className="mx-auto w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8 shrink-0">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>

                <h1 className="text-3xl font-black tracking-tight text-zinc-900 mb-2">Order Confirmed!</h1>
                <p className="text-zinc-500 font-medium mb-8">
                    Thank you for your purchase. Your stylish new gear is being prepared for shipment.
                </p>

                {/* Order ID Box */}
                <div className="bg-zinc-50 rounded-2xl p-6 mb-8 border border-zinc-100">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-1">
                        Order Reference
                    </p>
                    <p className="font-mono text-zinc-900 font-bold break-all">
                        {orderId.split('-')[0].toUpperCase()}
                    </p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Link 
                        href={`/track?id=${orderId}`}
                        className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white rounded-2xl px-6 py-4 font-bold hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200"
                    >
                        <Package size={18} />
                        Track Order Status
                    </Link>
                    
                    <Link 
                        href="/products"
                        className="w-full justify-center group flex items-center gap-2 rounded-2xl px-6 py-4 font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-all"
                    >
                        Continue Shopping
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
                
                <p className="text-xs text-zinc-400 mt-8 font-medium">
                    We'll email you a shipping confirmation with your tracking number as soon as your order leaves our warehouse.
                </p>
            </div>
        </main>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-zinc-50/30">
                <Loader2 className="animate-spin text-zinc-300 w-12 h-12" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
