"use client";

import { useEffect, useState } from "react";
import { Settings, Save, Loader2, Megaphone, Smartphone, Info, Palette } from "lucide-react";
import { cn } from "@/utils/cn";

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.settings) setSettings(data.settings);
        } catch (error) {
            console.error("Failed to load settings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (key: string, value: any) => {
        setSaving(true);
        setSuccess(false);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value }),
            });
            if (res.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                alert('Failed to save setting');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl flex items-center gap-3">
                        <Settings className="text-blue-600" />
                        Global Site Settings
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Manage your website&#39;s text, design, and contact details from one place.
                    </p>
                </div>
                {success && (
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium animate-in zoom-in duration-300">
                        Changes saved successfully!
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* ── General Identity ── */}
                <SettingCard 
                    title="Site Identity" 
                    icon={<Info className="h-5 w-5 text-blue-500" />}
                    description="The main name and branding of your store."
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Site Name</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={settings.site_name || ""} 
                                    onChange={(e) => setSettings({...settings, site_name: e.target.value})}
                                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                                <button 
                                    onClick={() => handleSave('site_name', settings.site_name)}
                                    disabled={saving}
                                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <Save size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </SettingCard>

                {/* ── Ticker / Announcements ── */}
                <SettingCard 
                    title="Announcement Ticker" 
                    icon={<Megaphone className="h-5 w-5 text-orange-500" />}
                    description="Scrolling text shown at the top and bottom of the website."
                >
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ticker Text</label>
                        <div className="space-y-3">
                            <textarea 
                                value={settings.ticker_text || ""} 
                                onChange={(e) => setSettings({...settings, ticker_text: e.target.value})}
                                rows={3}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                                placeholder="Separate messages with • bullet points..."
                            />
                            <button 
                                onClick={() => handleSave('ticker_text', settings.ticker_text)}
                                disabled={saving}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save size={18} />}
                                Save Announcement
                            </button>
                        </div>
                    </div>
                </SettingCard>

                {/* ── Theme Colors ── */}
                <SettingCard 
                    title="Website Design" 
                    icon={<Palette className="h-5 w-5 text-purple-500" />}
                    description="Replicate [wtflex.in] design styles here."
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Primary Color</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="color" 
                                    value={settings.theme_colors?.primary || "#000000"} 
                                    className="w-10 h-10 rounded cursor-pointer"
                                />
                                <span className="font-mono text-sm uppercase">{settings.theme_colors?.primary || "#000000"}</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Accent Color</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="color" 
                                    value={settings.theme_colors?.accent || "#FF00FF"} 
                                    className="w-10 h-10 rounded cursor-pointer"
                                />
                                <span className="font-mono text-sm uppercase">{settings.theme_colors?.accent || "#FF00FF"}</span>
                            </div>
                        </div>
                        <div className="col-span-2 pt-2">
                             <p className="text-[10px] text-gray-400 font-medium">Coming soon: Full theme management support.</p>
                        </div>
                    </div>
                </SettingCard>

                {/* ── Contact Info ── */}
                <SettingCard 
                    title="Contact Details" 
                    icon={<Smartphone className="h-5 w-5 text-green-500" />}
                    description="Address and social links shown in the footer."
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Support Email</label>
                                <input 
                                    type="email" 
                                    value={settings.contact_info?.email || ""} 
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Support Phone</label>
                                <input 
                                    type="text" 
                                    value={settings.contact_info?.phone || ""} 
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                                    disabled
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium italic">Edit these via the direct database for now (Coming to UI soon).</p>
                    </div>
                </SettingCard>
            </div>
        </div>
    );
}

function SettingCard({ title, icon, description, children }: any) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-2xl bg-gray-50 group-hover:scale-110 transition-transform duration-300">
                    {icon}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h3>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{description}</p>
                </div>
            </div>
            {children}
        </div>
    );
}
