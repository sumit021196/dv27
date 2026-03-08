"use client";

import { useCart } from "./CartContext";
import { FALLBACK_IMG } from "@/utils/images";
import { MessageCircle, ShoppingBag, X, Trash2, Plus, Minus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
    const cart = useCart();
    const total = cart.items.reduce((s, i) => s + i.price * i.qty, 0);

    // Prevent background scroll when drawer is open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-300 ease-out">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="text-brand" size={20} />
                        <h2 className="text-lg font-bold text-foreground">Your Cart ({cart.items.length})</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {cart.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <ShoppingBag className="text-gray-300" size={32} />
                            </div>
                            <p className="text-gray-900 font-medium">Your cart is empty</p>
                            <p className="text-gray-500 text-sm mt-1">Add some gifts to get started!</p>
                            <button
                                onClick={onClose}
                                className="mt-6 rounded-xl bg-foreground text-background px-6 py-2.5 font-semibold text-sm hover:bg-foreground/90 transition"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        cart.items.map((item) => (
                            <div key={item.id} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                                <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
                                    <img
                                        src={item.image || FALLBACK_IMG}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                                    />
                                </div>
                                <div className="flex flex-1 flex-col justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground line-clamp-1">{item.name}</h3>
                                        <p className="text-xs font-semibold text-brand mt-1">₹{item.price}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-100">
                                            <button
                                                onClick={() => cart.add({ id: item.id, name: item.name, price: item.price, image: item.image }, -1)}
                                                disabled={item.qty <= 1}
                                                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white disabled:opacity-30 transition"
                                            >
                                                <Minus size={12} strokeWidth={3} />
                                            </button>
                                            <span className="w-6 text-center text-xs font-bold">{item.qty}</span>
                                            <button
                                                onClick={() => cart.add({ id: item.id, name: item.name, price: item.price, image: item.image }, 1)}
                                                className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white transition"
                                            >
                                                <Plus size={12} strokeWidth={3} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => cart.remove(item.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {cart.items.length > 0 && (
                    <div className="border-t bg-gray-50/50 p-6 space-y-4">
                        <div className="flex items-center justify-between text-base font-bold text-foreground">
                            <span>Total Amount</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-gray-500">Shipping and taxes will be calculated at checkout.</p>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <Link
                                href="/cart"
                                onClick={onClose}
                                className="flex h-12 items-center justify-center rounded-2xl border bg-white font-bold text-foreground hover:bg-gray-50 transition shadow-sm"
                            >
                                View Bag
                            </Link>
                            <Link
                                href="/cart"
                                onClick={onClose}
                                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-brand font-bold text-white hover:bg-brand-strong transition shadow-lg shadow-brand/20 text-sm"
                            >
                                Checkout
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
