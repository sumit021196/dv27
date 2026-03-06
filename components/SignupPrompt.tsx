"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SignupPrompt() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("loginPrompt:dismissed");
    const seen = sessionStorage.getItem("loginPrompt:seen");
    if (!dismissed && !seen) {
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const closeForSession = () => {
    sessionStorage.setItem("loginPrompt:seen", "true");
    setOpen(false);
  };

  const dismissForever = () => {
    localStorage.setItem("loginPrompt:dismissed", "true");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={closeForSession}
        aria-hidden
      />
      <div className="absolute inset-x-0 top-10 mx-auto w-[92%] max-w-md rounded-2xl bg-white shadow-2xl border">
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Sign up to personalize
              </h3>
              <p className="mt-1 text-sm text-gray-900">
                Save favorites, faster checkout, and track orders seamlessly.
              </p>
            </div>
            <button
              aria-label="Close"
              onClick={closeForSession}
              className="ml-4 rounded-full border px-2.5 py-1 text-sm text-gray-800 hover:bg-gray-50"
            >
              ×
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <Link
              href="/signup"
              className="inline-flex w-full items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-white font-semibold hover:bg-brand-strong transition"
            >
              Create account
            </Link>
            <button
              onClick={dismissForever}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 transition"
            >
              Don’t show again
            </button>
            <button
              onClick={closeForSession}
              className="w-full text-sm text-foreground underline underline-offset-4"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
