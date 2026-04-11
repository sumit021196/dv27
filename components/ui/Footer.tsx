"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { useSettings } from "@/components/SettingsContext";

export default function Footer() {
  const { settings } = useSettings();
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="bg-background border-t border-foreground/5 pt-12 md:pt-20 pb-12 transition-colors duration-500">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-10 md:mb-20">
          <div className="space-y-4 md:space-y-8 flex flex-col items-center md:items-start text-center md:text-left">
             <h2 className="text-4xl font-black tracking-tighter uppercase text-foreground">
               {settings.site_name || "THE DV27"}
             </h2>
             <p className="text-xs font-medium text-foreground/40 leading-relaxed uppercase tracking-widest max-w-[240px]">
                 {settings.tagline || "Providing premium streetwear for the bold and contemporary soul."}
             </p>
          </div>
          
          <div className="space-y-3 md:space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Company</h4>
             <nav className="flex flex-col items-center md:items-start gap-4">
                <Link href="/about" className="text-xs font-bold text-foreground/40 hover:text-foreground uppercase tracking-widest transition-colors">About Us</Link>
                <Link href="/contact" className="text-xs font-bold text-foreground/40 hover:text-foreground uppercase tracking-widest transition-colors">Contact</Link>
                <Link href="/careers" className="text-xs font-bold text-foreground/40 hover:text-foreground uppercase tracking-widest transition-colors">Careers</Link>
             </nav>
          </div>

          <div className="space-y-3 md:space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Support</h4>
             <nav className="flex flex-col items-center md:items-start gap-4">
                <Link href="/shipping" className="text-xs font-bold text-foreground/40 hover:text-foreground uppercase tracking-widest transition-colors">Shipping & Delivery</Link>
                <Link href="/returns" className="text-xs font-bold text-foreground/40 hover:text-foreground uppercase tracking-widest transition-colors">Return Policy</Link>
                <Link href="/track" className="text-xs font-bold text-foreground/40 hover:text-foreground uppercase tracking-widest transition-colors">Track Order</Link>
             </nav>
          </div>

          <div className="space-y-3 md:space-y-6 text-center md:text-right">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Social</h4>
             <div className="flex justify-center md:justify-end gap-6 items-center flex-wrap">
                {settings.social_links?.instagram && (
                  <Link href={settings.social_links.instagram} target="_blank" className="text-xs font-black uppercase tracking-widest text-foreground/40 hover:text-brand-accent transition-colors">Instagram</Link>
                )}
                {settings.social_links?.youtube && (
                  <Link href={settings.social_links.youtube} target="_blank" className="text-xs font-black uppercase tracking-widest text-foreground/40 hover:text-brand-red transition-colors">Youtube</Link>
                )}
                {settings.social_links?.facebook && (
                  <Link href={settings.social_links.facebook} target="_blank" className="text-xs font-black uppercase tracking-widest text-foreground/40 hover:text-blue-600 transition-colors">Facebook</Link>
                )}
                {settings.social_links?.twitter && (
                  <Link href={settings.social_links.twitter} target="_blank" className="text-xs font-black uppercase tracking-widest text-foreground/40 hover:text-sky-400 transition-colors">Twitter</Link>
                )}
                {(!settings.social_links || Object.keys(settings.social_links).length === 0) && (
                  <span className="text-xs font-medium text-foreground/20 tracking-widest uppercase">Coming Soon</span>
                )}
             </div>
          </div>
        </div>

        {/* Partners Section */}
        <div className="flex flex-col items-center gap-4 md:gap-6 mb-8 md:mb-12 py-6 md:py-8 border-y border-foreground/5">
            <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-foreground/30">Trusted Partners</h4>
            <div className="flex items-center justify-center gap-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" 
                    alt="Razorpay" 
                    className="h-5 md:h-7 w-auto"
                />
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Delhivery_logo.svg" 
                    alt="Delhivery" 
                    className="h-4 md:h-6 w-auto"
                />
            </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 text-[9px] font-black uppercase tracking-[0.3em] text-foreground/20">
          <p>© {new Date().getFullYear()} {settings.copyright_text || `${settings.site_name || "DV27"}. All rights reserved.`}</p>
          <div className="flex gap-8">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
