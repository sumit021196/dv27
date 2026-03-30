"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useSettings } from "@/components/SettingsContext";

export default function Footer() {
  const { settings } = useSettings();
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="bg-background border-t border-foreground/5 pt-20 pb-12 transition-colors duration-500">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-8">
             <h2 className="text-4xl font-black tracking-tighter uppercase text-foreground">
               {settings.site_name || "THE DV27"}
             </h2>
             <p className="text-xs font-medium text-foreground/40 leading-relaxed uppercase tracking-widest max-w-[240px]">
                 Providing premium streetwear for the bold and contemporary soul.
             </p>
          </div>
          
          <div className="space-y-6">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Company</h4>
             <nav className="flex flex-col gap-4">
                <Link href="/about" className="text-xs font-bold text-foreground/40 hover:text-foreground uppercase tracking-widest transition-colors">About Us</Link>
                <Link href="/contact" className="text-xs font-bold text-foreground/40 hover:text-foreground uppercase tracking-widest transition-colors">Contact</Link>
                <Link href="/careers" className="text-xs font-bold text-foreground/40 hover:text-foreground uppercase tracking-widest transition-colors">Careers</Link>
             </nav>
          </div>

          <div className="space-y-6">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Support</h4>
             <nav className="flex flex-col gap-4">
                <Link href="/shipping" className="text-xs font-bold text-foreground/40 hover:text-foreground uppercase tracking-widest transition-colors">Shipping & Delivery</Link>
                <Link href="/returns" className="text-xs font-bold text-foreground/40 hover:text-foreground uppercase tracking-widest transition-colors">Exchange & Returns</Link>
                <Link href="/track" className="text-xs font-bold text-foreground/40 hover:text-foreground uppercase tracking-widest transition-colors">Track Order</Link>
             </nav>
          </div>

          <div className="space-y-6 text-right lg:text-right">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Social</h4>
             <div className="flex justify-end gap-6 items-center flex-wrap">
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
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-foreground/5 text-[9px] font-black uppercase tracking-[0.3em] text-foreground/20">
          <p>© {new Date().getFullYear()} {settings.site_name || "DV27"}. All rights reserved.</p>
          <div className="flex gap-8">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
