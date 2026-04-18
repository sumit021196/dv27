
"use client";

import { useState, useEffect, useRef } from "react";
import { auth } from "@/utils/firebase/config";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { Loader2, Smartphone, User, ArrowRight, RotateCcw, AlertCircle, Info } from "lucide-react";
import { signInWithPhone } from "@/app/(auth)/auth.actions";

interface PhoneAuthProps {
    mode?: "login" | "signup";
}

export default function PhoneAuth({ mode = "login" }: PhoneAuthProps) {
    const [fullName, setFullName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
    const [resendTimer, setResendTimer] = useState(0);
    const recaptchaRef = useRef<any>(null);

    // Update resend timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    // Initialize reCAPTCHA on mount
    useEffect(() => {
        if (typeof window !== 'undefined' && !recaptchaRef.current) {
            try {
                const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
                    size: "invisible",
                    callback: () => {
                        // reCAPTCHA solved
                    },
                    "expired-callback": () => {
                        setError("reCAPTCHA expired. Please verify again.");
                    }
                });
                
                verifier.render().then(() => {
                    recaptchaRef.current = verifier;
                }).catch(err => {
                    console.error("reCAPTCHA Render Error:", err);
                    setError("Security check failed to load. Please ensure you are on localhost:3000.");
                });
            } catch (err: any) {
                console.error("reCAPTCHA Setup Error:", err);
            }
        }

        return () => {
            if (recaptchaRef.current) {
                try {
                    recaptchaRef.current.clear();
                    recaptchaRef.current = null;
                } catch (e) {}
            }
        };
    }, []);

    async function handleSendOtp() {
        if (mode === "signup" && !fullName.trim()) return setError("Please enter your full name.");
        if (!phoneNumber || phoneNumber.length < 10) return setError("Please enter a valid 10-digit phone number.");
        
        setLoading(true);
        setError(null);
        try {
            if (!recaptchaRef.current) {
                throw new Error("Security check is not ready. Please refresh the page.");
            }

            const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`;
            const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaRef.current);
            setConfirmationResult(result);
            setStep("otp");
            setResendTimer(60); 
        } catch (err: any) {
            console.error("Firebase Auth Error:", err);
            let msg = "Failed to send OTP. Please try again.";
            
            if (err.code === "auth/invalid-app-credential") {
                msg = "Domain verification failed. Access via 'localhost:3000' and check Firebase Authorized Domains.";
            } else if (err.code === "auth/too-many-requests") {
                msg = "Too many requests. Please try again later.";
            }
            
            setError(msg);
            
            // Reset reCAPTCHA on error
            if (window.grecaptcha && typeof window.grecaptcha.reset === 'function') {
                try {
                    window.grecaptcha.reset();
                } catch(e) {}
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleVerifyOtp() {
        if (!otp || otp.length < 6) return setError("Please enter the 6-digit OTP.");
        setLoading(true);
        setError(null);
        try {
            if (!confirmationResult) throw new Error("Verification session expired. Please resend OTP.");
            const result = await confirmationResult.confirm(otp);
            const user = result.user;
            
            // verified! Now sync with Supabase
            if (user.phoneNumber) {
                const syncResult = await signInWithPhone(user.phoneNumber, user.uid, mode === "signup" ? fullName : undefined);
                if (syncResult?.error) {
                    setError(syncResult.error);
                }
            }
        } catch (err: any) {
            console.error("OTP Error:", err);
            setError("Invalid OTP. Please check and try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-4">
            <div id="recaptcha-container"></div>
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm border border-red-100 flex gap-2 items-start animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {step === "phone" ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                    {mode === "signup" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                                Full Name
                            </label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-black transition-colors" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                            Mobile Number
                        </label>
                        <div className="relative group">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 text-sm font-medium">
                                +91
                            </span>
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                                className="block w-full pl-13 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
                                placeholder="9876543210"
                                maxLength={10}
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSendOtp}
                        disabled={loading || phoneNumber.length < 10 || (mode === 'signup' && !fullName)}
                        className="w-full flex justify-center items-center py-4 px-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-black/5"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                            <>
                                Send OTP
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </button>
                    
                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex gap-3 items-center text-[11px] text-blue-600 leading-relaxed">
                        <Info className="h-4 w-4 shrink-0" />
                        <p>Standard security check is required. If the checkbox doesn't appear, please refresh or check your internet connection.</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-center">
                        <p className="text-sm text-gray-500">
                            Sent verification code to <span className="font-bold text-black">+91 {phoneNumber}</span>
                        </p>
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1.5 ml-1">
                            <label className="block text-sm font-medium text-gray-700">
                                Verification Code
                            </label>
                            <button 
                                onClick={() => setStep("phone")}
                                className="text-xs font-bold text-gray-400 hover:text-black transition-colors underline underline-offset-4"
                            >
                                Change Number
                            </button>
                        </div>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            className="block w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 focus:ring-4 focus:ring-black/5 focus:border-black transition-all outline-none text-center tracking-[0.5em] text-3xl font-black"
                            placeholder="••••••"
                            maxLength={6}
                        />
                    </div>
                    <button
                        onClick={handleVerifyOtp}
                        disabled={loading || otp.length < 6}
                        className="w-full flex justify-center items-center py-4 px-4 bg-black text-white font-bold rounded-2xl hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-black/5"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Verify & Continue"}
                    </button>

                    <div className="text-center pt-2">
                        {resendTimer > 0 ? (
                            <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">
                                Resend in <span className="text-black">{resendTimer}s</span>
                            </p>
                        ) : (
                            <button
                                onClick={handleSendOtp}
                                disabled={loading}
                                className="text-sm font-bold text-black hover:opacity-70 transition-opacity flex items-center justify-center gap-1.5 mx-auto"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Resend verification code
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

declare global {
    interface Window {
        recaptchaVerifier: any;
        grecaptcha: any;
    }
}
