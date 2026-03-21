"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className="bg-black border-t border-white/10 pt-20 pb-12">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="space-y-8">
             <h2 className="text-4xl font-black italic tracking-tighter uppercase text-white">THE DV27</h2>
             <p className="text-xs font-medium text-white/40 leading-relaxed uppercase tracking-widest max-w-[240px]">
                 Providing premium streetwear for the bold and contemporary soul.
             </p>
          </div>
          
          <div className="space-y-6">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Company</h4>
             <nav className="flex flex-col gap-4">
                <Link href="/about" className="text-xs font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">About Us</Link>
                <Link href="/contact" className="text-xs font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Contact</Link>
                <Link href="/careers" className="text-xs font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Careers</Link>
             </nav>
          </div>

          <div className="space-y-6">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Support</h4>
             <nav className="flex flex-col gap-4">
                <Link href="/shipping" className="text-xs font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Shipping & Delivery</Link>
                <Link href="/returns" className="text-xs font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Exchange & Returns</Link>
                <Link href="/track" className="text-xs font-bold text-white/40 hover:text-white uppercase tracking-widest transition-colors">Track Order</Link>
             </nav>
          </div>

          <div className="space-y-6 text-right lg:text-right">
             <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Social</h4>
             <div className="flex justify-end gap-6 items-center">
                <Link href="#" className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-brand-accent italic">Instagram</Link>
                <Link href="#" className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-brand-red italic">Youtube</Link>
             </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
          <p>© {new Date().getFullYear()} DV27. All rights reserved.</p>
          <div className="flex gap-8">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
