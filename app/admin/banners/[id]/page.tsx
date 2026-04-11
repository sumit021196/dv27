"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Type, MousePointer2, Layout, Zap, Image as ImageIcon, UploadCloud } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { createClient } from "@/utils/supabase/client";
import { compressImage, uploadToSupabase } from "@/utils/image-utils";

export default function BannerFormPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const isNew = resolvedParams.id === "new";

    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [ctaText, setCtaText] = useState("Shop Now");
    const [position, setPosition] = useState("hero");
    const [styleType, setStyleType] = useState("default");
    const [isActive, setIsActive] = useState(true);

    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [isFetching, setIsFetching] = useState(!isNew);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isNew) {
            fetchBanner();
        }
    }, [isNew, resolvedParams.id]);

    const fetchBanner = async () => {
        try {
            const res = await fetch(`/api/banners/${resolvedParams.id}`);
            const data = await res.json();
            if (data.banner) {
                setTitle(data.banner.title || "");
                setSubtitle(data.banner.subtitle || "");
                setImageUrl(data.banner.image_url || "");
                setLinkUrl(data.banner.link_url || "");
                setCtaText(data.banner.cta_text || "Shop Now");
                setPosition(data.banner.position || "hero");
                setStyleType(data.banner.style_type || "default");
                setIsActive(data.banner.is_active);
            } else {
                setError("Banner not found");
            }
        } catch (err: any) {
            setError(err.message || "Failed to load banner");
        } finally {
            setIsFetching(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatusMessage("Finalizing...");
        setError("");

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second safety timeout

        try {
            const res = await fetch(isNew ? `/api/banners` : `/api/banners/${resolvedParams.id}`, {
                method: isNew ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    title, 
                    subtitle, 
                    image_url: imageUrl, 
                    link_url: linkUrl, 
                    cta_text: ctaText, 
                    position, 
                    style_type: styleType, 
                    is_active: isActive 
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save banner");

            setStatusMessage("Success! Redirecting...");
            router.push("/admin/banners");
            router.refresh();
        } catch (err: any) {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') {
                setError("Request timed out. It took too long to save the banner. Please check your internet and try again.");
            } else {
                setError(err.message || "An unexpected error occurred.");
            }
            setIsLoading(false);
            setStatusMessage("");
        }
    };

    if (isFetching) return <div className="p-8 flex justify-center min-h-[400px] items-center"><Loader2 className="animate-spin text-blue-600 h-10 w-10" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex items-center gap-4">
                <Link href="/admin/banners" className="p-2 -ml-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-gray-100">
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">
                        {isNew ? "Create Banner" : "Edit Banner"}
                    </h1>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Configure your hero section & promo spots</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 animate-bounce">
                            {error}
                        </div>
                    )}

                    {/* ── Visual Config ── */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                        <div className="flex items-center gap-2 mb-2 text-blue-600">
                             <Layout size={20} />
                             <h2 className="text-sm font-black uppercase tracking-widest">Layout & Image</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Banner Asset</label>
                                
                                <div className="space-y-4">
                                    {/* Native Upload Option */}
                                    <div className="relative group overflow-hidden bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 hover:border-blue-400 transition-all p-8 text-center cursor-pointer">
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    try {
                                                        setIsLoading(true);
                                                        const supabase = createClient();
                                                        setStatusMessage("Compressing...");
                                                        const compressed = await compressImage(file);
                                                        setStatusMessage("Uploading...");
                                                        const url = await uploadToSupabase(supabase, 'banners', compressed);
                                                        setImageUrl(url);
                                                    } catch (err: any) {
                                                        setError("Upload failed: " + err.message);
                                                    } finally {
                                                        setIsLoading(false);
                                                        setStatusMessage("");
                                                    }
                                                }
                                            }}
                                        />
                                        <div className="flex flex-col items-center gap-2">
                                            <UploadCloud className="mx-auto h-8 w-8 text-gray-400 group-hover:text-blue-600 transition-all" />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Click or drag banner image</p>
                                        </div>
                                    </div>

                                    {/* URL Input (Optional fallback) */}
                                    <input
                                        type="url"
                                        required
                                        value={imageUrl}
                                        onChange={(e) => setImageUrl(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all font-mono text-[10px] bg-gray-50"
                                        placeholder="...or paste an image link"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Position</label>
                                    <select
                                        value={position}
                                        onChange={(e) => setPosition(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all font-bold appearance-none bg-gray-50"
                                    >
                                        <option value="hero">Main Hero</option>
                                        <option value="promo_1">Promo Row 1</option>
                                        <option value="promo_2">Promo Row 2</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Style Preset</label>
                                    <select
                                        value={styleType}
                                        onChange={(e) => setStyleType(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all font-bold appearance-none bg-blue-50 text-blue-700"
                                    >
                                        <option value="default">Default Overlay</option>
                                        <option value="wtflex_bold">WTFlex Bold (Center)</option>
                                        <option value="split">Split Layout (Left Text)</option>
                                        <option value="video">Video Background</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Content Overlays ── */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                        <div className="flex items-center gap-2 mb-2 text-purple-600">
                             <Type size={20} />
                             <h2 className="text-sm font-black uppercase tracking-widest">Text Overlays</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Main Heading</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all font-black uppercase"
                                    placeholder="e.g. SUMMER DROP"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sub-heading / Description</label>
                                <textarea
                                    value={subtitle}
                                    onChange={(e) => setSubtitle(e.target.value)}
                                    rows={2}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all font-medium resize-none"
                                    placeholder="Enter secondary text..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* ── Call to Action ── */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                        <div className="flex items-center gap-2 mb-2 text-green-600">
                             <MousePointer2 size={20} />
                             <h2 className="text-sm font-black uppercase tracking-widest">Action Buttons</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Button Text</label>
                                <input
                                    type="text"
                                    value={ctaText}
                                    onChange={(e) => setCtaText(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all font-bold"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Target URL</label>
                                <input
                                    type="text"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all font-mono text-sm bg-gray-50"
                                    placeholder="/shop"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={isActive} 
                                        onChange={(e) => setIsActive(e.target.checked)} 
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                </label>
                                <span className="text-xs font-black uppercase tracking-widest text-gray-500">Banner Visibility</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Multi-Preview ── */}
                    <div className="bg-black rounded-3xl p-8 shadow-2xl relative overflow-hidden min-h-[250px] group">
                         <div className="absolute top-4 right-4 z-20">
                             <span className="px-2 py-1 bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase rounded-full">Live Preview</span>
                         </div>

                        {imageUrl ? (
                            <div className="absolute inset-0 z-0">
                                <img src={imageUrl} alt="banner" className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center border-4 border-dashed border-white/10 rounded-3xl m-2">
                                <ImageIcon size={60} className="text-white/5" />
                            </div>
                        )}

                        <div className="relative z-10 flex flex-col items-center justify-center text-center h-full pt-10">
                            {styleType === 'wtflex_bold' ? (
                                <>
                                    <h3 className="text-white text-4xl font-black tracking-tighter uppercase leading-none drop-shadow-2xl">
                                        {title || "YOUR HEADING"}
                                    </h3>
                                    <p className="text-blue-400 text-xs font-black uppercase tracking-[0.2em] mt-2">
                                        {subtitle || "Secondary tagline goes here"}
                                    </p>
                                    <button className="mt-8 px-10 py-4 bg-white text-black text-sm font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1">
                                        {ctaText}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-white text-2xl font-bold">
                                        {title || "Untitled Banner"}
                                    </h3>
                                    <p className="text-gray-300 text-sm mt-1 max-w-[80%] mx-auto">
                                        {subtitle || "Preview of your banner content..."}
                                    </p>
                                    <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">
                                        {ctaText}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-8 py-5 text-lg font-black text-white shadow-xl hover:bg-blue-500 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    <span>{statusMessage || "Saving..."}</span>
                                </>
                            ) : (
                                <><Zap size={24} /> {isNew ? "Create" : "Flash Save"}</>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
