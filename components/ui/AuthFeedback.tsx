"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X, Sparkles } from "lucide-react";

export default function AuthFeedback() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [show, setShow] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const signup = searchParams.get("signup");
        const login = searchParams.get("login");

        if (signup === "success") {
            setMessage("Welcome to DV27! Your account has been created.");
            setShow(true);
            // Remove the param from URL without refreshing
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete("signup");
            router.replace(`?${newParams.toString()}`, { scroll: false });
        } else if (login === "success") {
            setMessage("Welcome back!");
            setShow(true);
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete("login");
            router.replace(`?${newParams.toString()}`, { scroll: false });
        }
    }, [searchParams, router]);

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm px-4"
                >
                    <div className="bg-black text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                                <Sparkles className="text-brand-accent h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-0.5">Notification</p>
                                <p className="text-sm font-bold leading-tight">{message}</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShow(false)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
