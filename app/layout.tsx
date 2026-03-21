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

export const metadata: Metadata = {
  title: "DV27",
  description: "Curated wardrobe essentials for the contemporary soul. Redefining modern elegance.",
};

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
        <WishlistProvider>
          <CartProvider>
            <AnalyticsTracker />
            <Navbar />
            {children}
            <Footer />
            <SignupPrompt />
          </CartProvider>
        </WishlistProvider>
      </body>
    </html>
  );
}
