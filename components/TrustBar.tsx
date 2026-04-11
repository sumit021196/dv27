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
    <section className="py-4 md:py-8 bg-background border-y border-foreground/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
      <div className="max-w-[1440px] mx-auto px-2 md:px-12">
        <div className="grid grid-cols-4 md:grid-cols-4 gap-2 md:gap-8 auto-rows-max">
          {signals.map((signal, idx) => {
            const Icon = ICON_MAP[signal.icon.toLowerCase()] || ShieldCheck;
            return (
              <div 
                key={idx}
                className="flex flex-col md:flex-row items-center text-center md:text-left gap-1.5 md:gap-4 group"
              >
                <div className="flex-shrink-0 w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl bg-foreground/[0.03] border border-foreground/[0.05] flex items-center justify-center transition-all duration-500 group-hover:bg-brand-accent group-hover:border-brand-accent group-hover:scale-110 shadow-sm">
                  <Icon className="text-foreground/60 w-3.5 h-3.5 md:w-5 md:h-5 transition-colors duration-500 group-hover:text-white" />
                </div>
                <div className="flex flex-col items-center md:items-start max-w-full">
                  <h4 className="text-[7px] min-[360px]:text-[8px] md:text-[11px] font-black uppercase tracking-[0.05em] md:tracking-[0.15em] text-foreground leading-tight md:leading-none mb-0 md:mb-1">
                    {signal.title.split(' ').length > 1 ? (
                        <>
                          <span className="block">{signal.title.split(' ')[0]}</span>
                          <span className="block">{signal.title.split(' ').slice(1).join(' ')}</span>
                        </>
                    ) : signal.title}
                  </h4>
                  <p className="hidden md:block text-[10px] font-bold uppercase tracking-widest text-foreground/40 leading-tight">
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
