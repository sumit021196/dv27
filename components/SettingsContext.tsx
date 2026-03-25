"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface Settings {
  site_name?: string;
  ticker_text?: string;
  theme_colors?: {
    primary?: string;
    accent?: string;
    text?: string;
  };
  contact_info?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  social_links?: {
    instagram?: string;
    youtube?: string;
    facebook?: string;
    twitter?: string;
  };
  whatsapp_number?: string;
  store_status?: string;
  maintenance_mode?: string;
  shipping_threshold?: number;
  seo_meta?: {
    description?: string;
    keywords?: string;
  };
  instagram_reels?: string[];
}

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        applyThemeColors(data.settings.theme_colors);
      }
    } catch (error) {
      console.error("Failed to load global settings", error);
    } finally {
      setLoading(false);
    }
  };

  const applyThemeColors = (colors: any) => {
    if (!colors) return;
    const root = document.documentElement;
    if (colors.primary) root.style.setProperty('--background', colors.primary);
    if (colors.accent) root.style.setProperty('--brand-accent', colors.accent);
    if (colors.text) root.style.setProperty('--foreground', colors.text);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
