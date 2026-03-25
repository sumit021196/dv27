"use client";

import { MessageCircle } from "lucide-react";
import { useSettings } from "@/components/SettingsContext";

export default function WhatsAppButton() {
    const { settings } = useSettings();
    const phoneNumber = settings.whatsapp_number;

    if (!phoneNumber) return null;

    // Clean phone number (remove +, spaces, dashes)
    const cleanNumber = phoneNumber.replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/${cleanNumber}`;

    return (
        <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-8 right-8 z-[50] group"
            aria-label="Contact on WhatsApp"
        >
            <div className="relative flex items-center justify-center">
                {/* Ping Animation */}
                <div className="absolute inset-0 animate-ping rounded-full bg-green-500/40 opacity-75"></div>
                
                {/* Button */}
                <div className="relative flex items-center gap-3 bg-green-500 text-white p-4 rounded-2xl shadow-2xl hover:bg-green-600 transition-all hover:scale-110 active:scale-95 duration-300">
                    <MessageCircle size={24} fill="white" />
                    <span className="hidden group-hover:block text-xs font-black uppercase tracking-widest whitespace-nowrap">
                        Chat with us
                    </span>
                </div>
            </div>
        </a>
    );
}
