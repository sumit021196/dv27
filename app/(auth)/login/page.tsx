
"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "../auth.actions";
import { ArrowRight, Loader2, Sparkles, Smartphone, Mail } from "lucide-react";
import dynamic from "next/dynamic";
const PhoneAuth = dynamic(() => import("@/components/auth/PhoneAuth"), { ssr: false, loading: () => <div className="p-4 text-center text-sm text-gray-500">Loading mobile login...</div> });

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const result = await login(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-black rounded-xl flex items-center justify-center mb-4">
                        <Sparkles className="text-white h-6 w-6" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Log in to your DV27 account.
                    </p>
                </div>

                <div className="flex p-1 bg-gray-100 rounded-2xl mb-8">
                    <button 
                        onClick={() => setAuthMethod("email")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition ${authMethod === 'email' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Mail className="h-4 w-4" />
                        Email
                    </button>
                    <button 
                        onClick={() => setAuthMethod("phone")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition ${authMethod === 'phone' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Smartphone className="h-4 w-4" />
                        Mobile
                    </button>
                </div>

                {authMethod === "email" ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                                {error}
                            </div>
                        )}
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition"
                                    placeholder="you@example.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <div className="text-sm">
                                <Link href="#" className="font-medium text-gray-500 hover:text-black">
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition disabled:opacity-70"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <PhoneAuth mode="login" />
                )}

                <div className="text-center text-sm mt-8">
                    <span className="text-gray-500">New around here? </span>
                    <Link href="/signup" className="font-bold text-black hover:underline underline-offset-4">
                        Create an account
                    </Link>
                </div>
            </div>
        </div>
    );
}
