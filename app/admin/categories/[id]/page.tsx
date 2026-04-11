"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Type, Link as LinkIcon, Image as ImageIcon, CheckCircle2, UploadCloud, X as XIcon } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { compressImage, uploadToSupabase } from "@/utils/image-utils";

export default function CategoryFormPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const isNew = resolvedParams.id === "new";

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [isFetching, setIsFetching] = useState(!isNew);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!isNew) {
            fetchCategory();
        }
    }, [isNew, resolvedParams.id]);

    const fetchCategory = async () => {
        try {
            const res = await fetch(`/api/categories/${resolvedParams.id}`);
            const data = await res.json();
            if (data.category) {
                setName(data.category.name);
                setSlug(data.category.slug);
                setImageUrl(data.category.image_url || "");
                setIsActive(data.category.is_active);
            } else {
                setError("Category not found");
            }
        } catch (err: any) {
            setError(err.message || "Failed to load category");
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (isNew && name && !slug) {
            setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    }, [name, isNew]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatusMessage("Finalizing...");
        setError("");

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second safety timeout

        try {
            const res = await fetch(isNew ? `/api/categories` : `/api/categories/${resolvedParams.id}`, {
                method: isNew ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, slug, image_url: imageUrl, is_active: isActive }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save category");

            setStatusMessage("Success! Redirecting...");
            router.push("/admin/categories");
            router.refresh();
        } catch (err: any) {
            clearTimeout(timeoutId);
            if (err.name === 'AbortError') {
                setError("Request timed out. It took too long to save the category. Please check your internet and try again.");
            } else {
                setError(err.message || "An unexpected error occurred.");
            }
            setIsLoading(false);
            setStatusMessage("");
        }
    };

    if (isFetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading category details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <Link 
                    href="/admin/categories" 
                    className="p-3 text-gray-400 hover:text-gray-900 bg-white border border-gray-100 rounded-2xl shadow-sm transition-all hover:scale-110 active:scale-95"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">
                        {isNew ? "Create Category" : "Edit Category"}
                    </h1>
                    <p className="mt-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Organize your products with bold visual headers
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-8">
                    <form id="category-form" onSubmit={handleSave} className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm space-y-8">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                                    <Type size={14} /> Category Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-gray-50 rounded-2xl border-none px-6 py-4 text-gray-900 font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-gray-300"
                                    placeholder="e.g., OVERSIZED TS"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                                    <LinkIcon size={14} /> URL Slug
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    className="w-full bg-gray-50 rounded-2xl border-none px-6 py-4 text-gray-900 font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-gray-300"
                                    placeholder="e.g., oversized-ts"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                                    <ImageIcon size={14} /> Hero Image
                                </label>
                                
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
                                                        const url = await uploadToSupabase(supabase, 'categories', compressed);
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
                                            <UploadCloud className="text-gray-400 group-hover:text-blue-600 transition-colors" size={32} />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Click or drag image to upload</p>
                                        </div>
                                    </div>

                                    {/* URL Input (Optional fallback) */}
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                            <LinkIcon size={14} />
                                        </div>
                                        <input
                                            type="url"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            className="w-full bg-gray-50 rounded-2xl border-none pl-12 pr-6 py-4 text-gray-900 font-bold focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-gray-300 text-xs"
                                            placeholder="...or paste a direct image URL"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                             <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={isActive} 
                                        onChange={(e) => setIsActive(e.target.checked)} 
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                </label>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 px-2">
                                    {isActive ? 'Published' : 'Hidden'}
                                </span>
                             </div>
                             <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase">
                                <CheckCircle2 size={12} /> Live Preview Ready
                             </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-blue-600 px-8 py-4 text-sm font-black text-white shadow-lg hover:bg-blue-700 hover:shadow-blue-200 focus-visible:outline-none disabled:opacity-50 transition-all uppercase tracking-[0.2em]"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        <span>{statusMessage || "Saving..."}</span>
                                    </>
                                ) : (
                                    <><Save size={20} /> {isNew ? "Create" : "Update"} Category</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Preview / Instructions */}
                <div className="space-y-6">
                    <div className="bg-black rounded-3xl p-6 border border-white/5 shadow-2xl">
                        <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">
                            Shop-the-look Preview
                        </h4>
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 group">
                            {imageUrl ? (
                                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover grayscale-[30%]" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700 space-y-2">
                                    <ImageIcon size={32} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">No Image Defined</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                                <h3 className="text-3xl font-black uppercase tracking-tighter text-white leading-none">
                                    {name || "CATEGORY"}
                                </h3>
                            </div>
                        </div>
                        <p className="mt-4 text-[9px] font-bold text-zinc-500 uppercase leading-loose tracking-widest">
                            {name ? `Visual for "${name}" on collection grids.` : "Provide a name to see the display title."}
                        </p>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">
                            Editing Guidelines
                        </h4>
                        <ul className="space-y-3">
                            {["Use clear, bold imagery.", "Keep names descriptive.", "Slugs are generated in Real-time."].map((tip, i) => (
                                <li key={i} className="flex items-start gap-3 text-[10px] font-black text-gray-900 uppercase tracking-widest">
                                    <span className="text-blue-600">•</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
