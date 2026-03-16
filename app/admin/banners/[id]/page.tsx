"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";

import { use } from "react";

export default function BannerFormPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const isNew = resolvedParams.id === "new";

    const [title, setTitle] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [position, setPosition] = useState("hero");
    const [isActive, setIsActive] = useState(true);

    const [isLoading, setIsLoading] = useState(false);
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
                setImageUrl(data.banner.image_url || "");
                setLinkUrl(data.banner.link_url || "");
                setPosition(data.banner.position || "hero");
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
        setError("");

        try {
            const res = await fetch(isNew ? `/api/banners` : `/api/banners/${resolvedParams.id}`, {
                method: isNew ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, image_url: imageUrl, link_url: linkUrl, position, is_active: isActive }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save banner");

            router.push("/admin/banners");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    if (isFetching) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/banners" className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    {isNew ? "Create Banner" : "Edit Banner"}
                </h1>
            </div>

            <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                            placeholder="e.g., Summer Sale 2024"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
                        <input
                            type="url"
                            required
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                            placeholder="https://example.com/banner.jpg"
                        />
                        {imageUrl && (
                            <div className="mt-3 aspect-[21/9] rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display='none' }} />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Link URL (Optional)</label>
                        <input
                            type="text"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                            placeholder="e.g., /categories/summer-collection"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                            <select
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                            >
                                <option value="hero">Hero (Top Homepage)</option>
                                <option value="promo_1">Promo Row 1</option>
                                <option value="promo_2">Promo Row 2</option>
                            </select>
                        </div>
                        <div className="flex flex-col justify-end pb-2">
                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={isActive} 
                                        onChange={(e) => setIsActive(e.target.checked)} 
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                                <span className="text-sm font-medium text-gray-900">Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 min-w-[120px]"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
