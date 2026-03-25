import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SignupPrompt from "@/components/SignupPrompt";
import { CartProvider } from "@/components/cart/CartContext";
import { WishlistProvider } from "@/components/wishlist/WishlistContext";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import AnalyticsTracker from "@/components/AnalyticsTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/settings`, { cache: 'no-store' });
    const data = await res.json();
    const settings = data.settings || {};
    const seo = settings.seo_meta || {};
    
    return {
      title: settings.site_name || "DV27",
      description: seo.description || "Curated wardrobe essentials for the contemporary soul. Redefining modern elegance.",
      keywords: seo.keywords || "streetwear, fashion, dv27",
    };
  } catch (e) {
    return {
      title: "DV27",
      description: "Curated wardrobe essentials for the contemporary soul. Redefining modern elegance.",
    };
  }
}

import { SettingsProvider } from "@/components/SettingsContext";

import WhatsAppButton from "@/components/ui/WhatsAppButton";
import AuthFeedback from "@/components/ui/AuthFeedback";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SettingsProvider>
          <WishlistProvider>
            <CartProvider>
              <AnalyticsTracker />
              <Navbar />
              {children}
              <Footer />
              <Suspense fallback={null}>
                <AuthFeedback />
              </Suspense>
              <SignupPrompt />
              <WhatsAppButton />
            </CartProvider>
          </WishlistProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
