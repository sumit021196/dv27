import type { Metadata } from "next";
import { Assistant, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SignupPrompt from "@/components/SignupPrompt";
import { CartProvider } from "@/components/cart/CartContext";
import { WishlistProvider } from "@/components/wishlist/WishlistContext";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import AnalyticsTracker from "@/components/AnalyticsTracker";

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export async function generateMetadata() {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    // Use revalidate instead of no-store for better performance
    const res = await fetch(`${siteUrl}/api/settings`, { 
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!res.ok) throw new Error('Failed to fetch settings');
    
    const data = await res.json();
    const settings = data.settings || {};
    const seo = settings.seo_meta || {};
    
    return {
      title: settings.site_name || "DV27",
      description: seo.description || "Curated wardrobe essentials for the contemporary soul. Redefining modern elegance.",
      keywords: seo.keywords || "streetwear, fashion, dv27",
    };
  } catch (e) {
    console.error("Metadata error:", e);
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
        className={`${assistant.variable} ${jetbrainsMono.variable} antialiased`}
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
