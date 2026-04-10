"use client";

import { useSettings } from "@/components/SettingsContext";
import { Truck, ShieldCheck, RefreshCw, CreditCard, Star, Box, LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

const ICON_MAP: Record<string, LucideIcon> = {
  truck: Truck,
  shield: ShieldCheck,
  refresh: RefreshCw,
  card: CreditCard,
  star: Star,
  box: Box,
};

export default function TrustBar() {
  const { settings } = useSettings();
  
  // Use settings or fallback to default premium signals
  const signals = settings.trust_signals?.length 
    ? settings.trust_signals 
    : [
        { icon: "truck", title: "Express Shipping", description: "Dispatched in 24 hours" },
        { icon: "refresh", title: "7-Day Exchange", description: "Hassle-free returns" },
        { icon: "shield", title: "Premium Quality", description: "Handpicked collections" },
        { icon: "card", title: "Secure Checkout", description: "Encrypted payments" },
      ];

  return (
    <section className="py-8 bg-background border-y border-foreground/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="flex overflow-x-auto no-scrollbar md:grid md:grid-cols-4 gap-8 md:gap-4 snap-x snap-mandatory">
          {signals.map((signal, idx) => {
            const Icon = ICON_MAP[signal.icon.toLowerCase()] || ShieldCheck;
            return (
              <div 
                key={idx}
                className="flex-none w-[70%] sm:w-[45%] md:w-full flex items-center gap-4 group snap-center"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-foreground/[0.03] border border-foreground/[0.05] flex items-center justify-center transition-all duration-500 group-hover:bg-brand-accent group-hover:border-brand-accent group-hover:scale-110 shadow-sm">
                  <Icon className="text-foreground/60 w-5 h-5 transition-colors duration-500 group-hover:text-white" />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-foreground leading-none mb-1">
                    {signal.title}
                  </h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 leading-tight">
                    {signal.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
