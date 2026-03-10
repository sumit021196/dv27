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
    User,
    LogOut,
    ChevronDown,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { logout } from "@/app/(auth)/auth.actions";
import { User as UserType } from "@supabase/supabase-js";
import Image from "next/image";

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

    const [user, setUser] = useState<UserType | null>(null);
    const [profileOpen, setProfileOpen] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);

        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
            subscription.unsubscribe();
        };
    }, [supabase.auth]);

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
                        <Link href="/" className="flex items-center transition-transform hover:scale-105">
                            <Image
                                src="/logo.svg"
                                alt="DV27"
                                width={48}
                                height={48}
                                className="h-10 w-auto"
                                priority
                            />
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

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        {/* User Profile / Login */}
                        <div className="relative">
                            {user ? (
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-zinc-100 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200">
                                        <User size={18} className="text-zinc-600" />
                                    </div>
                                    <ChevronDown size={14} className={`text-zinc-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                                </button>
                            ) : (
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-semibold text-zinc-700 hover:text-zinc-900 transition-colors"
                                >
                                    Log in
                                </Link>
                            )}

                            {/* Dropdown Menu */}
                            {profileOpen && user && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setProfileOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-zinc-100 py-2 z-50 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-zinc-50 mb-1">
                                            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Account</p>
                                            <p className="text-sm font-bold text-zinc-900 truncate">{user.email}</p>
                                        </div>
                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                                            onClick={() => setProfileOpen(false)}
                                        >
                                            <User size={16} />
                                            Your Profile
                                        </Link>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setProfileOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                        >
                                            <LogOut size={16} />
                                            Sign out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

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
                            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                                <Image
                                    src="/logo.svg"
                                    alt="DV27"
                                    width={48}
                                    height={48}
                                    className="h-10 w-auto"
                                />
                            </Link>
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
