"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Image as ImageIcon, Plus, Pencil, Trash2, Loader2 } from "lucide-react";

export default function AdminBannersPage() {
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const res = await fetch('/api/banners');
            const data = await res.json();
            if (data.banners) setBanners(data.banners);
        } catch (error) {
            console.error("Failed to load banners", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;
        try {
            const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setBanners(banners.filter(b => b.id !== id));
            } else {
                alert('Failed to delete banner');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl flex items-center gap-2">
                        <ImageIcon className="text-blue-600" />
                        Banners
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Manage homepage hero images and promotional banners.
                    </p>
                </div>
                <Link
                    href="/admin/banners/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    Add Banner
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>
                ) : banners.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium text-gray-900">No banners found</p>
                        <p className="mt-1">Add your first promotional banner to the homepage.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {banners.map((banner) => (
                            <div key={banner.id} className="group rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all flex flex-col">
                                <div className="aspect-[16/9] relative bg-gray-100 border-b border-gray-200 overflow-hidden">
                                    <img src={banner.image_url} alt={banner.title || 'Banner'} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display='none' }} />
                                    {!banner.is_active && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                                            <span className="px-3 py-1 bg-white/20 text-white font-semibold rounded-full text-xs backdrop-blur-md border border-white/30">
                                                Inactive
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 truncate" title={banner.title}>{banner.title || "Untitled Banner"}</h3>
                                        <div className="flex items-center justify-between mt-1 text-xs">
                                            <span className="text-gray-500 font-mono capitalize px-2 py-0.5 bg-gray-100 rounded">
                                                {banner.position}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                                        <Link href={`/admin/banners/${banner.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Pencil size={18} />
                                        </Link>
                                        <button onClick={() => handleDelete(banner.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
