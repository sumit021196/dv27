"use client";

import { useEffect, useState } from "react";
import { 
    Settings, Save, Loader2, Megaphone, Smartphone, Info, 
    Palette, Share2, Globe, ShieldCheck, Truck, MessageCircle,
    ChevronRight
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useSettings } from "@/components/SettingsContext";

export default function AdminSettingsPage() {
    const { refreshSettings } = useSettings();
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState<string>("identity");

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
                setSettings((prev: any) => ({ ...prev, [key]: value }));
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

    const sections = [
        { id: "identity", label: "Identity", icon: <Info size={18} /> },
        { id: "design", label: "Design", icon: <Palette size={18} /> },
        { id: "contact", label: "Contact", icon: <Smartphone size={18} /> },
        { id: "social", label: "Social", icon: <Share2 size={18} /> },
        { id: "store", label: "Store", icon: <ShieldCheck size={18} /> },
        { id: "seo", label: "SEO", icon: <Globe size={18} /> },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="animate-spin text-blue-600 h-10 w-10 mb-4" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Loading configurations...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Page Header - Fixed */}
            <div className="flex-shrink-0 mb-6">
                <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl flex items-center gap-2">
                    <Settings className="text-blue-600 h-6 w-6 lg:h-8 lg:w-8" />
                    Global Settings
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    Configure your entire storefront from one place.
                </p>
            </div>

            {/* Mobile Horizontal Section Tabs */}
            <div className="md:hidden flex overflow-x-auto gap-2 pb-4 mb-4 no-scrollbar flex-shrink-0">
                {sections.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                            activeSection === s.id 
                                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" 
                                : "bg-white text-gray-500 border-gray-100"
                        )}
                    >
                        {s.icon}
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-12">
                <div className={cn(
                    "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8",
                    "md:block md:space-y-8" // Desktop stack layout
                )}>
                    {/* Identity Section */}
                    {(!activeSection || activeSection === "identity" || window.innerWidth >= 768) && (
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
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Site Name</label>
                                    <input 
                                        type="text" 
                                        value={settings.site_name || ""} 
                                        onChange={(e) => setSettings({...settings, site_name: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-bold text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-2">
                                        <MessageCircle className="h-3 w-3" /> WhatsApp Number (with country code)
                                    </label>
                                    <input 
                                        type="text" 
                                        value={settings.whatsapp_number || ""} 
                                        onChange={(e) => setSettings({...settings, whatsapp_number: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-bold text-sm"
                                        placeholder="e.g. 919876543210"
                                    />
                                </div>
                            </div>
                        </SettingCard>
                    )}

                    {/* Announcement Ticker Section */}
                    {(!activeSection || activeSection === "identity" || window.innerWidth >= 768) && (
                        <SettingCard 
                            title="Announcement Ticker" 
                            icon={<Megaphone className="h-5 w-5 text-orange-500" />}
                            description="Scrolling text shown globally."
                            onSave={() => handleSave('ticker_text', settings.ticker_text, 'text')}
                            isSaving={saving === 'ticker_text'}
                            isSuccess={success === 'ticker_text'}
                        >
                            <div className="space-y-2">
                                <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Ticker Text</label>
                                <textarea 
                                    value={settings.ticker_text || ""} 
                                    onChange={(e) => setSettings({...settings, ticker_text: e.target.value})}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-medium text-sm resize-none"
                                    placeholder="Separate messages with • bullet points..."
                                />
                            </div>
                        </SettingCard>
                    )}

                    {/* Design Section */}
                    {(!activeSection || activeSection === "design" || window.innerWidth >= 768) && (
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
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Primary Color</label>
                                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-100">
                                        <input 
                                            type="color" 
                                            value={settings.theme_colors?.primary || "#000000"} 
                                            onChange={(e) => {
                                                const newColors = { ...(settings.theme_colors || {}) };
                                                newColors.primary = e.target.value;
                                                setSettings({...settings, theme_colors: newColors});
                                            }}
                                            className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 overflow-hidden shadow-sm"
                                        />
                                        <span className="font-mono text-xs font-bold uppercase">{settings.theme_colors?.primary || "#000000"}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Accent Color</label>
                                    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl border border-gray-100">
                                        <input 
                                            type="color" 
                                            value={settings.theme_colors?.accent || "#FF00FF"} 
                                            onChange={(e) => {
                                                const newColors = { ...(settings.theme_colors || {}) };
                                                newColors.accent = e.target.value;
                                                setSettings({...settings, theme_colors: newColors});
                                            }}
                                            className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 overflow-hidden shadow-sm"
                                        />
                                        <span className="font-mono text-xs font-bold uppercase">{settings.theme_colors?.accent || "#FF00FF"}</span>
                                    </div>
                                </div>
                            </div>
                        </SettingCard>
                    )}

                    {/* Contact Section */}
                    {(!activeSection || activeSection === "contact" || window.innerWidth >= 768) && (
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
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Support Email</label>
                                        <input 
                                            type="email" 
                                            value={settings.contact_info?.email || ""} 
                                            onChange={(e) => {
                                                const newInfo = { ...(settings.contact_info || {}) };
                                                newInfo.email = e.target.value;
                                                setSettings({...settings, contact_info: newInfo});
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-bold text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Support Phone</label>
                                        <input 
                                            type="text" 
                                            value={settings.contact_info?.phone || ""} 
                                            onChange={(e) => {
                                                const newInfo = { ...(settings.contact_info || {}) };
                                                newInfo.phone = e.target.value;
                                                setSettings({...settings, contact_info: newInfo});
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-bold text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Store Address</label>
                                    <input 
                                        type="text" 
                                        value={settings.contact_info?.address || ""} 
                                        onChange={(e) => {
                                            const newInfo = { ...(settings.contact_info || {}) };
                                            newInfo.address = e.target.value;
                                            setSettings({...settings, contact_info: newInfo});
                                        }}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-bold text-sm"
                                    />
                                </div>
                            </div>
                        </SettingCard>
                    )}

                    {/* Social Section */}
                    {(!activeSection || activeSection === "social" || window.innerWidth >= 768) && (
                        <SettingCard 
                            title="Social Media" 
                            icon={<Share2 className="h-5 w-5 text-blue-500" />}
                            description="Connect your social profiles."
                            onSave={() => handleSave('social_links', settings.social_links, 'json')}
                            isSaving={saving === 'social_links'}
                            isSuccess={success === 'social_links'}
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {['instagram', 'youtube', 'facebook', 'twitter'].map((platform) => (
                                    <div key={platform}>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1 capitalize">{platform}</label>
                                        <input 
                                            type="text" 
                                            value={settings.social_links?.[platform] || ""} 
                                            onChange={(e) => {
                                                const newLinks = { ...(settings.social_links || {}) };
                                                newLinks[platform] = e.target.value;
                                                setSettings({...settings, social_links: newLinks});
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-bold text-sm"
                                            placeholder={`https://${platform}.com/...`}
                                        />
                                    </div>
                                ))}
                            </div>
                        </SettingCard>
                    )}

                    {/* Store Configuration Section */}
                    {(!activeSection || activeSection === "store" || window.innerWidth >= 768) && (
                        <SettingCard 
                            title="Store Ops" 
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
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Status</label>
                                        <select 
                                            value={settings.store_status || "open"}
                                            onChange={(e) => setSettings({...settings, store_status: e.target.value})}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-sm appearance-none"
                                        >
                                            <option value="open">Open</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Maintenance</label>
                                        <select 
                                            value={settings.maintenance_mode || "false"}
                                            onChange={(e) => setSettings({...settings, maintenance_mode: e.target.value})}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold text-sm appearance-none"
                                        >
                                            <option value="false">Off</option>
                                            <option value="true">On</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-2">
                                        <Truck className="h-3 w-3" /> Free Shipping Threshold (₹)
                                    </label>
                                    <input 
                                        type="number" 
                                        value={settings.shipping_threshold || ""} 
                                        onChange={(e) => setSettings({...settings, shipping_threshold: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-bold text-sm"
                                    />
                                </div>
                            </div>
                        </SettingCard>
                    )}

                    {/* SEO Section */}
                    {(!activeSection || activeSection === "seo" || window.innerWidth >= 768) && (
                        <SettingCard 
                            title="SEO & Search" 
                            icon={<Globe className="h-5 w-5 text-cyan-500" />}
                            description="How your site appears in search engines."
                            onSave={() => handleSave('seo_meta', settings.seo_meta, 'json')}
                            isSaving={saving === 'seo_meta'}
                            isSuccess={success === 'seo_meta'}
                        >
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Meta Description</label>
                                    <textarea 
                                        value={settings.seo_meta?.description || ""} 
                                        onChange={(e) => {
                                            const newMeta = { ...(settings.seo_meta || {}) };
                                            newMeta.description = e.target.value;
                                            setSettings({...settings, seo_meta: newMeta});
                                        }}
                                        rows={2}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none resize-none font-medium text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Keywords</label>
                                    <input 
                                        type="text" 
                                        value={settings.seo_meta?.keywords || ""} 
                                        onChange={(e) => {
                                            const newMeta = { ...(settings.seo_meta || {}) };
                                            newMeta.keywords = e.target.value;
                                            setSettings({...settings, seo_meta: newMeta});
                                        }}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-bold text-sm"
                                        placeholder="gifts, shopping, jewelry..."
                                    />
                                </div>
                            </div>
                        </SettingCard>
                    )}
                </div>
            </div>
        </div>
    );
}

function SettingCard({ title, icon, description, children, onSave, isSaving, isSuccess }: any) {
    return (
        <div className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            {isSuccess && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-green-500 animate-in slide-in-from-top duration-300" />
            )}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4 pr-10">
                    <div className="p-3 rounded-2xl bg-gray-50 group-hover:scale-110 group-hover:bg-blue-50 transition-all duration-500 text-blue-600 shadow-sm">
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-sm md:text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2 uppercase">
                            {title}
                            {isSuccess && <span className="text-[8px] text-green-500 font-black tracking-widest px-1.5 py-0.5 bg-green-50 rounded-full border border-green-100 animate-pulse">SAVED</span>}
                        </h3>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-widest">{description}</p>
                    </div>
                </div>
                <button 
                    onClick={onSave}
                    disabled={isSaving}
                    className={cn(
                        "absolute top-4 right-4 p-3 rounded-xl border transition-all duration-300 shadow-sm grow-0 shrink-0",
                        isSuccess 
                            ? "bg-green-50 border-green-100 text-green-600" 
                            : "bg-white border-gray-100 text-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 active:scale-95"
                    )}
                >
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                </button>
            </div>
            {children}
        </div>
    );
}
