"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/components/cart/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";

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
                className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-zinc-200/50" : "bg-transparent"
                    }`}
            >
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            type="button"
                            className="inline-flex items-center justify-center p-2 text-zinc-900 md:hidden"
                            aria-expanded={mobileMenuOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>
                        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
                            <span className="text-xl font-extrabold tracking-tight text-foreground">
                                Palak <span className="text-brand">Gift</span>
                            </span>
                        </Link>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-sm font-semibold text-zinc-900 hover:text-brand transition-colors">
                            Home
                        </Link>
                        <Link href="/products" className="text-sm font-semibold text-zinc-900 hover:text-brand transition-colors">
                            Shop All
                        </Link>
                        <Link href="/#trending" className="text-sm font-semibold text-zinc-900 hover:text-brand transition-colors">
                            Trending
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin/add-product"
                            className="hidden md:block text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                        >
                            Admin
                        </Link>
                        <button
                            type="button"
                            onClick={() => setCartDrawerOpen(true)}
                            className="relative group p-2 text-zinc-900 hover:text-brand transition-colors"
                        >
                            <span className="sr-only">Cart</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                            {totalItems > 0 && (
                                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* Cart Drawer */}
            <CartDrawer open={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />

            {/* Mobile menu, show/hide based on menu state. */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-sm md:hidden" onClick={() => setMobileMenuOpen(false)}>
                    <div className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white px-6 py-6 shadow-xl animate-in slide-in-from-left duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <Link href="/" className="-m-1.5 p-1.5" onClick={() => setMobileMenuOpen(false)}>
                                <span className="text-xl font-extrabold tracking-tight text-foreground">
                                    Palak <span className="text-brand">Gift</span>
                                </span>
                            </Link>
                            <button
                                type="button"
                                className="-m-2.5 rounded-md p-2.5 text-zinc-900 hover:bg-zinc-100 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span className="sr-only">Close menu</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="mt-8 flow-root">
                            <div className="space-y-4 py-6 text-lg font-semibold text-zinc-900">
                                <Link href="/" className="-mx-3 block rounded-lg px-3 py-2 hover:bg-zinc-50" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                                <Link href="/products" className="-mx-3 block rounded-lg px-3 py-2 hover:bg-zinc-50" onClick={() => setMobileMenuOpen(false)}>Shop All</Link>
                                <Link href="/#trending" className="-mx-3 block rounded-lg px-3 py-2 hover:bg-zinc-50" onClick={() => setMobileMenuOpen(false)}>Trending</Link>
                            </div>
                            <div className="space-y-4 py-6 border-t border-zinc-200">
                                <Link href="/admin/add-product" className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-zinc-600 hover:bg-zinc-50" onClick={() => setMobileMenuOpen(false)}>Admin</Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Spacer to prevent content from hiding under fixed navbar */}
            <div className="h-16" />
        </>
    );
}
