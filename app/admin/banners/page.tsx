"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Image as ImageIcon, Plus, Pencil, Trash2, Loader2, Zap, Layout } from "lucide-react";

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
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-gray-900 uppercase flex items-center gap-3">
                        <ImageIcon className="text-blue-600" size={32} />
                        Banners & Hero
                    </h1>
                    <p className="mt-1 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Manage your homepage visual identity and promo displays
                    </p>
                </div>
                <Link
                    href="/admin/banners/new"
                    className="inline-flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-2xl transition-all shadow-lg hover:shadow-blue-200 active:scale-95 uppercase tracking-widest"
                >
                    <Plus size={20} />
                    New Banner
                </Link>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Fetching visual assets...</p>
                </div>
            ) : banners.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-20 text-center shadow-sm">
                    <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <ImageIcon className="text-gray-200" size={48} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 uppercase">Your storefront is empty</h3>
                    <p className="text-sm font-medium text-gray-400 mt-2 max-w-sm mx-auto uppercase tracking-wide">Add bold banners to grab your customers attention and drive sales.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {banners.map((banner) => (
                        <div key={banner.id} className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col relative">
                            {/* Badge for Position */}
                             <div className="absolute top-4 left-4 z-10 flex gap-2">
                                <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-widest rounded-full backdrop-blur-md shadow-sm ${banner.is_active ? 'bg-green-500/80 text-white' : 'bg-gray-500/80 text-white'}`}>
                                    {banner.is_active ? 'Active' : 'Draft'}
                                </span>
                                <span className="px-2 py-1 bg-black/60 text-white text-[9px] font-black uppercase tracking-widest rounded-full backdrop-blur-md">
                                    {banner.position}
                                </span>
                            </div>

                            <div className="aspect-[16/9] relative bg-gray-100 overflow-hidden">
                                <img 
                                    src={banner.image_url} 
                                    alt={banner.title || 'Banner'} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    onError={(e) => { e.currentTarget.style.display='none' }} 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </div>

                            <div className="p-6 flex flex-col flex-1 justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        {banner.style_type === 'wtflex_bold' && <Zap size={14} className="text-blue-600" />}
                                        <h3 className="font-black text-gray-900 uppercase tracking-tighter truncate leading-tight" title={banner.title}>
                                            {banner.title || "Untitled Banner"}
                                        </h3>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] line-clamp-1">
                                        {banner.subtitle || "No subtitle provided"}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-1.5">
                                        <Layout size={12} className="text-gray-400" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            {banner.style_type || 'default'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link 
                                            href={`/admin/banners/${banner.id}`} 
                                            className="p-2.5 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-110 active:scale-95"
                                        >
                                            <Pencil size={18} />
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(banner.id)} 
                                            className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-110 active:scale-95"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
