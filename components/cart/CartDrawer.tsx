"use client";

import { useCart } from "./CartContext";
import { FALLBACK_IMG } from "@/utils/images";
import { ShoppingBag, X, Trash2, Plus, Minus, Ticket, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CartDrawer() {
    const cart = useCart();
    const { isOpen, closeCart, items, discount, coupon, showConfetti, setShowConfetti } = cart;
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const total = Math.max(0, subtotal - discount);

    // Prevent background scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [isOpen]);

    // Handle Confetti Effect (Simple Framer Motion Alternative for now)
    useEffect(() => {
        if (showConfetti) {
            const timer = setTimeout(() => setShowConfetti(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showConfetti, setShowConfetti]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={closeCart}
                    />

                    {/* Drawer Panel */}
                    <motion.div 
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative flex h-full w-full max-w-md flex-col bg-background shadow-2xl"
                    >
                        {/* Celebration / Confetti Overlay */}
                        {showConfetti && (
                            <div className="absolute inset-0 pointer-events-none z-[110] overflow-hidden">
                                {[...Array(20)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ 
                                            top: "50%", 
                                            left: "50%", 
                                            scale: 0,
                                            rotate: 0,
                                            opacity: 1 
                                        }}
                                        animate={{ 
                                            top: `${Math.random() * 100}%`, 
                                            left: `${Math.random() * 100}%`,
                                            scale: Math.random() * 1.5,
                                            rotate: Math.random() * 360,
                                            opacity: 0
                                        }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="absolute w-3 h-3 rounded-full"
                                        style={{ backgroundColor: ['#FF00BF', '#00FFFF', '#FFD700', '#7FFF00'][i % 4] }}
                                    />
                                ))}
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                    className="absolute inset-0 flex items-center justify-center flex-col gap-2"
                                >
                                    <div className="bg-brand-accent text-white px-6 py-3 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2">
                                        <CheckCircle2 size={20} />
                                        Coupon Applied!
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {/* Header */}
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="text-brand-accent" size={20} />
                                <h2 className="text-lg font-black uppercase tracking-tighter text-foreground">Your Bag ({items.length})</h2>
                            </div>
                            <button
                                onClick={closeCart}
                                className="rounded-full p-2 text-foreground/40 hover:bg-foreground/5 hover:text-foreground transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                        <ShoppingBag className="text-muted-foreground/30" size={32} />
                                    </div>
                                    <p className="text-foreground font-black uppercase tracking-tighter">Your bag is empty</p>
                                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mt-2">Add some pieces to your bag to get started!</p>
                                    <button
                                        onClick={closeCart}
                                        className="mt-8 rounded-xl bg-foreground text-background px-8 py-3 font-black text-[10px] uppercase tracking-widest hover:bg-brand-accent hover:text-white transition"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            ) : (
                                items.map((item) => (
                                    <div key={item.id} className="flex gap-4 border-b border-foreground/5 pb-4 last:border-0 last:pb-0">
                                        <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                                            <img
                                                src={item.image || FALLBACK_IMG}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                                onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                                            />
                                        </div>
                                        <div className="flex flex-1 flex-col justify-between">
                                            <div>
                                                <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground line-clamp-1">{item.name}</h3>
                                                {(item.size || item.color) && (
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase mt-0.5">
                                                        {item.size && <span>Size: {item.size}</span>}
                                                        {item.size && item.color && <span className="mx-1">•</span>}
                                                        {item.color && <span>Color: {item.color}</span>}
                                                    </p>
                                                )}
                                                <p className="text-sm font-black text-brand-accent mt-1 italic tracking-tighter">₹{item.price}</p>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-1 bg-muted rounded-lg p-1 border border-foreground/5">
                                                    <button
                                                        onClick={() => cart.add({ id: item.id, name: item.name, price: item.price, image: item.image, variant_id: item.variant_id, size: item.size, color: item.color }, -1)}
                                                        disabled={item.qty <= 1}
                                                        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-background disabled:opacity-30 transition"
                                                    >
                                                        <Minus size={10} strokeWidth={4} />
                                                    </button>
                                                    <span className="w-6 text-center text-xs font-black">{item.qty}</span>
                                                    <button
                                                        onClick={() => cart.add({ id: item.id, name: item.name, price: item.price, image: item.image, variant_id: item.variant_id, size: item.size, color: item.color }, 1)}
                                                        className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-background transition"
                                                    >
                                                        <Plus size={10} strokeWidth={4} />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => cart.remove(item.id)}
                                                    className="text-foreground/20 hover:text-brand-red transition-colors"
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
                        {items.length > 0 && (
                            <div className="border-t border-foreground/5 bg-muted/30 p-6 space-y-4">
                                {/* Coupon Display */}
                                {coupon ? (
                                    <div className="flex items-center justify-between bg-brand-accent/10 border border-brand-accent/20 rounded-xl p-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-brand-accent rounded-lg text-white">
                                                <Ticket size={14} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-wider text-brand-accent">{coupon}</p>
                                                <p className="text-[8px] font-bold text-muted-foreground uppercase">Applied Successfully</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-black text-brand-accent">-₹{discount}</span>
                                    </div>
                                ) : (
                                    <div className="group flex items-center justify-between border border-dashed border-foreground/10 rounded-xl p-3 hover:border-brand-accent/50 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Ticket size={14} className="text-muted-foreground" />
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider italic">Add a coupon code?</p>
                                        </div>
                                        <p className="text-[10px] font-black uppercase text-brand-accent cursor-pointer">Apply</p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-brand-accent">
                                            <span>Discount</span>
                                            <span>-₹{discount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between text-xl font-black uppercase tracking-tighter text-foreground pt-1 border-t border-foreground/5">
                                        <span>Total</span>
                                        <span>₹{total.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <Link
                                        href="/cart"
                                        onClick={closeCart}
                                        className="flex h-14 items-center justify-center rounded-2xl border border-foreground/10 bg-background font-black text-[10px] uppercase tracking-widest text-foreground hover:bg-muted transition shadow-sm"
                                    >
                                        View Bag
                                    </Link>
                                    <Link
                                        href="/cart"
                                        onClick={closeCart}
                                        className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-foreground font-black text-[10px] uppercase tracking-widest text-background hover:bg-brand-accent hover:text-white transition shadow-lg"
                                    >
                                        Checkout
                                    </Link>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
