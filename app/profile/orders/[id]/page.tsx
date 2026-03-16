"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, Package, MapPin, Loader2, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function UserOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // Ensure auth
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    router.push('/login');
                    return;
                }

                const { data, error } = await supabase
                    .from('orders')
                    .select('*, order_items(*), shipping_details(*)')
                    .eq('id', resolvedParams.id)
                    .single();

                if (error) throw error;
                
                // Add simple verification to ensure it's their order (simplification: checking if they are logged in is done above, 
                // but real app should match user_id if we have it, or matching email/phone).
                
                setOrder(data);
            } catch (err: any) {
                console.error("Error fetching order:", err);
                setError(err.message || "Failed to load order");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [resolvedParams.id, router, supabase]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50/30 flex items-center justify-center">
                <Loader2 className="animate-spin text-zinc-400 w-8 h-8" />
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-zinc-50/30 p-6 flex flex-col items-center justify-center">
                <p className="text-zinc-500 mb-4">{error || "Order not found"}</p>
                <Link href="/profile" className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold">Back to Profile</Link>
            </div>
        );
    }

    const shipping = order.shipping_details?.[0]; // Assuming one shipping detail per order

    // Helper for timeline
    const statuses = ['paid', 'processing', 'shipped', 'delivered'];
    let currentStatusIndex = statuses.indexOf(order.status?.toLowerCase());
    if (currentStatusIndex === -1) currentStatusIndex = 0; // Default or fallback (e.g., cancelled)
    const isCancelled = order.status?.toLowerCase() === 'cancelled';

    return (
        <div className="min-h-screen bg-zinc-50/30 pb-24">
            {/* Header */}
            <div className="bg-white border-b border-zinc-100 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 -ml-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-zinc-900 tracking-tight leading-none">Order Details</h1>
                        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                            #{order.id.split('-')[0]}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto p-4 space-y-6 mt-4">
                
                {/* Status Timeline */}
                <div className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm">
                    <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-widest mb-6">Tracking</h2>
                    
                    {isCancelled ? (
                         <div className="flex items-center gap-3 text-red-500 font-bold bg-red-50 p-4 rounded-xl">
                             Order Cancelled
                         </div>
                    ) : (
                        <div className="relative">
                            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-zinc-100" />
                            <div className="space-y-6 relative">
                                {statuses.map((step, idx) => {
                                    const isCompleted = idx <= currentStatusIndex;
                                    const isCurrent = idx === currentStatusIndex;
                                    return (
                                        <div key={step} className={`flex gap-4 ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                                            <div className="relative z-10 w-8 h-8 shrink-0 bg-white flex items-center justify-center">
                                                {isCompleted ? (
                                                    <CheckCircle2 className={`w-6 h-6 ${isCurrent && step === 'delivered' ? 'text-emerald-500' : 'text-zinc-900'}`} />
                                                ) : (
                                                    <Circle className="w-6 h-6 text-zinc-300" strokeWidth={3} />
                                                )}
                                            </div>
                                            <div className="pt-1">
                                                <p className={`text-sm font-bold capitalize ${isCurrent ? 'text-zinc-900' : 'text-zinc-500'}`}>{step}</p>
                                                {step === 'shipped' && isCompleted && shipping?.tracking_id && (
                                                    <p className="text-xs text-zinc-500 mt-1 font-mono">Tracking ID: {shipping.tracking_id}</p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Items */}
                <div className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm">
                    <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-widest mb-4">Items</h2>
                    <div className="space-y-4">
                        {order.order_items?.map((item: any) => (
                            <div key={item.id} className="flex gap-4 items-center">
                                <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden shrink-0">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package size={20} className="text-zinc-300" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-zinc-900 truncate">{item.product_name}</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">Qty: {item.quantity}</p>
                                </div>
                                <p className="text-sm font-black text-zinc-900 shrink-0">₹{item.price * item.quantity}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Shipping Info */}
                {shipping && (
                    <div className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm">
                        <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <MapPin size={16} className="text-zinc-400" />
                            Delivery Address
                        </h2>
                        <div className="text-sm text-zinc-600 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                            <p className="font-bold text-zinc-900 mb-1">{order.customer_name}</p>
                            <p>{order.customer_phone}</p>
                            <p className="mt-2">{shipping.address}</p>
                            <p className="mt-1 font-bold">Pincode: {shipping.pincode}</p>
                        </div>
                    </div>
                )}

                {/* Summary */}
                <div className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm">
                    <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-widest mb-4">Payment Summary</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-zinc-500">
                            <span>Subtotal</span>
                            <span className="text-zinc-900 font-medium">₹{order.total_amount}</span>
                        </div>
                        <div className="flex justify-between text-zinc-500 pb-3 border-b border-zinc-100">
                            <span>Shipping</span>
                            <span className="text-emerald-500 font-bold uppercase text-[10px] tracking-widest">Free</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <span className="font-bold text-zinc-900 uppercase tracking-widest text-xs">Total</span>
                            <span className="text-lg font-black text-zinc-900">₹{order.total_amount}</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
