"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/components/cart/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import {
    Menu,
    X,
    ShoppingBag,
    Home,
    Grid3X3,
    TrendingUp,
    Zap,
} from "lucide-react";

const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products", label: "Shop All", icon: Grid3X3 },
    { href: "/#trending", label: "Trending", icon: TrendingUp },
];

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
    const cart = useCart();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const totalItems = cart.items.reduce((acc, current) => acc + current.qty, 0);

    return (
        <>
            <header
                className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${isScrolled
                        ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-zinc-200/60"
                        : "bg-transparent"
                    }`}
            >
                <div className="mx-auto flex h-14 md:h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">

                    {/* Left: Hamburger (mobile) + Logo */}
                    <div className="flex items-center gap-3">
                        {/* Hamburger - mobile only */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            type="button"
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 transition-colors md:hidden"
                            aria-label="Open menu"
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? (
                                <X size={22} strokeWidth={2} />
                            ) : (
                                <Menu size={22} strokeWidth={2} />
                            )}
                        </button>

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-1.5 transition-transform hover:scale-105">
                            <Zap size={18} className="text-stone-900 fill-stone-900" />
                            <span className="text-xl font-extrabold tracking-tighter text-stone-900">
                                DV27
                            </span>
                        </Link>
                    </div>

                    {/* Center: Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
                            >
                                <Icon size={15} strokeWidth={2} />
                                {label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right: Cart Button */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setCartDrawerOpen(true)}
                            aria-label={`Cart (${totalItems} items)`}
                            className="relative flex items-center justify-center w-9 h-9 rounded-lg text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 transition-colors"
                        >
                            <ShoppingBag size={22} strokeWidth={1.8} />
                            {totalItems > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-[10px] font-bold text-white ring-2 ring-white">
                                    {totalItems > 9 ? "9+" : totalItems}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Cart Drawer */}
            <CartDrawer open={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />

            {/* ── Mobile Slide-in Menu ── */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-[60] bg-zinc-900/40 backdrop-blur-sm md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <div
                        className="fixed inset-y-0 left-0 z-[70] w-72 bg-white px-5 py-6 shadow-2xl flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-1.5">
                                <Zap size={18} className="text-stone-900 fill-stone-900" />
                                <span className="text-xl font-extrabold tracking-tighter text-stone-900">DV27</span>
                            </div>
                            <button
                                type="button"
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <X size={20} strokeWidth={2} />
                            </button>
                        </div>

                        {/* Nav Links */}
                        <nav className="flex flex-col gap-1 flex-1">
                            {navLinks.map(({ href, label, icon: Icon }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 active:bg-zinc-100 transition-colors"
                                >
                                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-100">
                                        <Icon size={16} strokeWidth={2} className="text-zinc-600" />
                                    </span>
                                    {label}
                                </Link>
                            ))}
                        </nav>

                        {/* Cart CTA at bottom */}
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                setCartDrawerOpen(true);
                            }}
                            className="mt-6 flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-stone-900 text-white font-semibold text-sm hover:bg-stone-800 active:bg-stone-950 transition-colors"
                        >
                            <ShoppingBag size={16} strokeWidth={2} />
                            View Cart
                            {totalItems > 0 && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-stone-900 text-[10px] font-bold">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Spacer for fixed header */}
            <div className="h-14 md:h-16" />
        </>
    );
}
