"use client";

import { useEffect, useState } from "react";
import { 
    Settings, Save, Loader2, Megaphone, Smartphone, Info, 
    Palette, Share2, Globe, ShieldCheck, Truck, MessageCircle 
} from "lucide-react";
import { cn } from "@/utils/cn";

import { useSettings } from "@/components/SettingsContext";

export default function AdminSettingsPage() {
    const { refreshSettings } = useSettings();
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

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

    const handleSave = async (key: string, value: any, type: string = 'text') => {
        setSaving(key);
        setSuccess(null);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value, type }),
            });
            if (res.ok) {
                setSuccess(key);
                setTimeout(() => setSuccess(null), 3000);
                // Update local state to ensure consistency
                setSettings((prev: any) => ({ ...prev, [key]: value }));
                // Refresh global settings context
                refreshSettings();
            } else {
                alert('Failed to save setting');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(null);
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
                        Manage your website&#39;s text, design, and configurations from one place.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* ── Site Identity ── */}
                <SettingCard 
                    title="Site Identity" 
                    icon={<Info className="h-5 w-5 text-blue-500" />}
                    description="Main branding and contact entry points."
                    onSave={() => {
                        handleSave('site_name', settings.site_name, 'text');
                        handleSave('whatsapp_number', settings.whatsapp_number, 'text');
                    }}
                    isSaving={saving === 'site_name' || saving === 'whatsapp_number'}
                    isSuccess={success === 'site_name' || success === 'whatsapp_number'}
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Site Name</label>
                            <input 
                                type="text" 
                                value={settings.site_name || ""} 
                                onChange={(e) => setSettings({...settings, site_name: e.target.value})}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <MessageCircle className="h-3 w-3" /> WhatsApp Number (with country code)
                            </label>
                            <input 
                                type="text" 
                                value={settings.whatsapp_number || ""} 
                                onChange={(e) => setSettings({...settings, whatsapp_number: e.target.value})}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="e.g. 919876543210"
                            />
                        </div>
                    </div>
                </SettingCard>

                {/* ── Announcement Ticker ── */}
                <SettingCard 
                    title="Announcement Ticker" 
                    icon={<Megaphone className="h-5 w-5 text-orange-500" />}
                    description="Scrolling text shown globally."
                    onSave={() => handleSave('ticker_text', settings.ticker_text, 'text')}
                    isSaving={saving === 'ticker_text'}
                    isSuccess={success === 'ticker_text'}
                >
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ticker Text</label>
                        <textarea 
                            value={settings.ticker_text || ""} 
                            onChange={(e) => setSettings({...settings, ticker_text: e.target.value})}
                            rows={3}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                            placeholder="Separate messages with • bullet points..."
                        />
                    </div>
                </SettingCard>

                {/* ── Theme Colors ── */}
                <SettingCard 
                    title="Website Design" 
                    icon={<Palette className="h-5 w-5 text-purple-500" />}
                    description="Customize the visual colors of your store."
                    onSave={() => handleSave('theme_colors', settings.theme_colors, 'json')}
                    isSaving={saving === 'theme_colors'}
                    isSuccess={success === 'theme_colors'}
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Primary Color</label>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="color" 
                                    value={settings.theme_colors?.primary || "#000000"} 
                                    onChange={(e) => {
                                        const newColors = { ...(settings.theme_colors || {}) };
                                        newColors.primary = e.target.value;
                                        setSettings({...settings, theme_colors: newColors});
                                    }}
                                    className="w-10 h-10 rounded cursor-pointer border-0 p-0 overflow-hidden"
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
                                    onChange={(e) => {
                                        const newColors = { ...(settings.theme_colors || {}) };
                                        newColors.accent = e.target.value;
                                        setSettings({...settings, theme_colors: newColors});
                                    }}
                                    className="w-10 h-10 rounded cursor-pointer border-0 p-0 overflow-hidden"
                                />
                                <span className="font-mono text-sm uppercase">{settings.theme_colors?.accent || "#FF00FF"}</span>
                            </div>
                        </div>
                    </div>
                </SettingCard>

                {/* ── Contact Info ── */}
                <SettingCard 
                    title="Contact Details" 
                    icon={<Smartphone className="h-5 w-5 text-green-500" />}
                    description="Details shown in footer and contact pages."
                    onSave={() => handleSave('contact_info', settings.contact_info, 'json')}
                    isSaving={saving === 'contact_info'}
                    isSuccess={success === 'contact_info'}
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Support Email</label>
                                <input 
                                    type="email" 
                                    value={settings.contact_info?.email || ""} 
                                    onChange={(e) => {
                                        const newInfo = { ...(settings.contact_info || {}) };
                                        newInfo.email = e.target.value;
                                        setSettings({...settings, contact_info: newInfo});
                                    }}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Support Phone</label>
                                <input 
                                    type="text" 
                                    value={settings.contact_info?.phone || ""} 
                                    onChange={(e) => {
                                        const newInfo = { ...(settings.contact_info || {}) };
                                        newInfo.phone = e.target.value;
                                        setSettings({...settings, contact_info: newInfo});
                                    }}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Store Address</label>
                            <input 
                                type="text" 
                                value={settings.contact_info?.address || ""} 
                                onChange={(e) => {
                                    const newInfo = { ...(settings.contact_info || {}) };
                                    newInfo.address = e.target.value;
                                    setSettings({...settings, contact_info: newInfo});
                                }}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                            />
                        </div>
                    </div>
                </SettingCard>

                {/* ── Social Links ── */}
                <SettingCard 
                    title="Social Media" 
                    icon={<Share2 className="h-5 w-5 text-pink-500" />}
                    description="Connect your social profiles."
                    onSave={() => handleSave('social_links', settings.social_links, 'json')}
                    isSaving={saving === 'social_links'}
                    isSuccess={success === 'social_links'}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Instagram URL</label>
                            <input 
                                type="text" 
                                value={settings.social_links?.instagram || ""} 
                                onChange={(e) => {
                                    const newLinks = { ...(settings.social_links || {}) };
                                    newLinks.instagram = e.target.value;
                                    setSettings({...settings, social_links: newLinks});
                                }}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">YouTube URL</label>
                            <input 
                                type="text" 
                                value={settings.social_links?.youtube || ""} 
                                onChange={(e) => {
                                    const newLinks = { ...(settings.social_links || {}) };
                                    newLinks.youtube = e.target.value;
                                    setSettings({...settings, social_links: newLinks});
                                }}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Facebook URL</label>
                            <input 
                                type="text" 
                                value={settings.social_links?.facebook || ""} 
                                onChange={(e) => {
                                    const newLinks = { ...(settings.social_links || {}) };
                                    newLinks.facebook = e.target.value;
                                    setSettings({...settings, social_links: newLinks});
                                }}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Twitter URL</label>
                            <input 
                                type="text" 
                                value={settings.social_links?.twitter || ""} 
                                onChange={(e) => {
                                    const newLinks = { ...(settings.social_links || {}) };
                                    newLinks.twitter = e.target.value;
                                    setSettings({...settings, social_links: newLinks});
                                }}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                            />
                        </div>
                    </div>
                </SettingCard>

                {/* ── Instagram Reels ── */}
                <SettingCard 
                    title="Instagram Reels" 
                    icon={<Smartphone className="h-5 w-5 text-pink-600" />}
                    description="Add Instagram Reel URLs for the homepage slider."
                    onSave={() => handleSave('instagram_reels', settings.instagram_reels || [], 'json')}
                    isSaving={saving === 'instagram_reels'}
                    isSuccess={success === 'instagram_reels'}
                >
                    <div className="space-y-4">
                        {(settings.instagram_reels || []).map((url: string, index: number) => (
                            <div key={index} className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={url} 
                                    onChange={(e) => {
                                        const newReels = [...(settings.instagram_reels || [])];
                                        newReels[index] = e.target.value;
                                        setSettings({...settings, instagram_reels: newReels});
                                    }}
                                    placeholder="https://www.instagram.com/reels/..."
                                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                                />
                                <button 
                                    onClick={() => {
                                        const newReels = (settings.instagram_reels || []).filter((_: any, i: number) => i !== index);
                                        setSettings({...settings, instagram_reels: newReels});
                                    }}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-bold"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button 
                            onClick={() => {
                                const newReels = [...(settings.instagram_reels || []), ""];
                                setSettings({...settings, instagram_reels: newReels});
                            }}
                            className="w-full py-2 border-2 border-dashed border-gray-200 text-gray-400 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-all font-medium text-sm"
                        >
                            + Add Reel URL
                        </button>
                        <p className="text-[10px] text-gray-400">
                            Tip: Use standard Reel URLs like https://www.instagram.com/reels/C8wXy_yv2kS/
                        </p>
                    </div>
                </SettingCard>

                {/* ── Store Configuration ── */}
                <SettingCard 
                    title="Store Configuration" 
                    icon={<ShieldCheck className="h-5 w-5 text-indigo-500" />}
                    description="Operational status and shipping rules."
                    onSave={() => {
                        handleSave('store_status', settings.store_status, 'text');
                        handleSave('maintenance_mode', settings.maintenance_mode, 'text');
                        handleSave('shipping_threshold', settings.shipping_threshold, 'number');
                    }}
                    isSaving={saving === 'store_status' || saving === 'shipping_threshold'}
                    isSuccess={success === 'store_status' || success === 'shipping_threshold'}
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Store Status</label>
                                <select 
                                    value={settings.store_status || "open"}
                                    onChange={(e) => setSettings({...settings, store_status: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                                >
                                    <option value="open">Open</option>
                                    <option value="closed">Closed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Maintenance Mode</label>
                                <select 
                                    value={settings.maintenance_mode || "false"}
                                    onChange={(e) => setSettings({...settings, maintenance_mode: e.target.value})}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                                >
                                    <option value="false">Off</option>
                                    <option value="true">On</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Truck className="h-3 w-3" /> Free Shipping Threshold (₹)
                            </label>
                            <input 
                                type="number" 
                                value={settings.shipping_threshold || ""} 
                                onChange={(e) => setSettings({...settings, shipping_threshold: e.target.value})}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                            />
                        </div>
                    </div>
                </SettingCard>

                {/* ── SEO & Meta ── */}
                <SettingCard 
                    title="SEO & Meta" 
                    icon={<Globe className="h-5 w-5 text-cyan-500" />}
                    description="How your site appears in search engines."
                    onSave={() => handleSave('seo_meta', settings.seo_meta, 'json')}
                    isSaving={saving === 'seo_meta'}
                    isSuccess={success === 'seo_meta'}
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Meta Description</label>
                            <textarea 
                                value={settings.seo_meta?.description || ""} 
                                onChange={(e) => {
                                    const newMeta = { ...(settings.seo_meta || {}) };
                                    newMeta.description = e.target.value;
                                    setSettings({...settings, seo_meta: newMeta});
                                }}
                                rows={2}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Keywords (comma separated)</label>
                            <input 
                                type="text" 
                                value={settings.seo_meta?.keywords || ""} 
                                onChange={(e) => {
                                    const newMeta = { ...(settings.seo_meta || {}) };
                                    newMeta.keywords = e.target.value;
                                    setSettings({...settings, seo_meta: newMeta});
                                }}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                            />
                        </div>
                    </div>
                </SettingCard>
            </div>
        </div>
    );
}

function SettingCard({ title, icon, description, children, onSave, isSaving, isSuccess }: any) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            {isSuccess && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-green-500 animate-in slide-in-from-top duration-300" />
            )}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-gray-50 group-hover:scale-110 transition-transform duration-300">
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h3>
                        <p className="text-xs text-gray-400 font-medium mt-0.5">{description}</p>
                    </div>
                </div>
                <button 
                    onClick={onSave}
                    disabled={isSaving}
                    className={cn(
                        "p-2 rounded-xl border transition-all duration-300",
                        isSuccess 
                            ? "bg-green-50 border-green-200 text-green-600" 
                            : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                    )}
                >
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                </button>
            </div>
            {children}
        </div>
    );
}
