import type { Metadata } from "next";
import { Bodoni_Moda, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SignupPrompt from "@/components/SignupPrompt";
import { CartProvider } from "@/components/cart/CartContext";
import { WishlistProvider } from "@/components/wishlist/WishlistContext";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import AnalyticsTracker from "@/components/AnalyticsTracker";

const bodoniModa = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

import { createStaticClient } from "@/utils/supabase/server";

export async function generateMetadata() {
  try {
    const supabase = createStaticClient();
    const { data: settingsData, error } = await supabase
      .from('settings')
      .select('key, value');

    if (error) throw error;

    const settingsMap = settingsData?.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {}) || {};

    const seo = settingsMap.seo_meta || {};
    
    return {
      title: settingsMap.site_name || "DV27",
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
        className={`${bodoniModa.variable} ${jetbrainsMono.variable} antialiased`}
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
