"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Image as ImageIcon, Plus, Pencil, Trash2, Loader2, Zap, Layout, Clock } from "lucide-react";
import { cn } from "@/utils/cn";

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
        <div className="flex flex-col h-full min-h-0">
            {/* Page Header - Fixed */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl flex items-center gap-2">
                        <ImageIcon className="text-blue-600 h-6 w-6 lg:h-8 lg:w-8" />
                        Banners & Hero
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                        {banners.length} visual assets active
                    </p>
                </div>
                <Link
                    href="/admin/banners/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all shadow-md active:scale-95"
                >
                    <Plus size={18} />
                    New Banner
                </Link>
            </div>

            {/* Content Area - Scrollable Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-8">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center p-12">
                        <Loader2 className="animate-spin text-blue-600 h-10 w-10 mb-4" />
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest text-[10px]">Fetching assets...</p>
                    </div>
                ) : banners.length === 0 ? (
                    <div className="h-full bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center flex flex-col items-center justify-center">
                        <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <ImageIcon className="text-gray-200" size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 uppercase">Your storefront is empty</h3>
                        <p className="text-xs font-medium text-gray-400 mt-2 max-w-sm mx-auto uppercase tracking-wide">Add bold banners to grab your customers attention and drive sales.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
                        {banners.map((banner) => (
                            <div key={banner.id} className="group bg-white rounded-2xl md:rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col relative">
                                {/* Badges */}
                                <div className="absolute top-3 left-3 z-10 flex gap-2">
                                    <span className={cn(
                                        "px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full backdrop-blur-md shadow-sm border border-white/20",
                                        banner.is_active ? 'bg-green-500/80 text-white' : 'bg-gray-500/80 text-white'
                                    )}>
                                        {banner.is_active ? 'Active' : 'Draft'}
                                    </span>
                                    <span className="px-2 py-0.5 bg-black/60 text-white text-[8px] font-black uppercase tracking-widest rounded-full backdrop-blur-md border border-white/10">
                                        Pos: {banner.position}
                                    </span>
                                </div>

                                <div className="aspect-[16/9] relative bg-gray-100 overflow-hidden">
                                    <img 
                                        src={banner.image_url} 
                                        alt={banner.title || 'Banner'} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                        onError={(e) => { e.currentTarget.style.display='none' }} 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                                    
                                    <div className="absolute bottom-3 left-3 right-3 text-white">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            {banner.style_type === 'wtflex_bold' && <Zap size={12} className="text-yellow-400 fill-yellow-400" />}
                                            <h3 className="font-bold text-sm uppercase tracking-tight truncate" title={banner.title}>
                                                {banner.title || "Untitled Banner"}
                                            </h3>
                                        </div>
                                        <p className="text-[9px] font-medium text-white/70 line-clamp-1 uppercase tracking-wider">
                                            {banner.subtitle || "No subtitle"}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-3 md:p-4 flex items-center justify-between bg-white border-t border-gray-50">
                                    <div className="flex items-center gap-1.5">
                                        <Layout size={12} className="text-gray-400" />
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                            {banner.style_type || 'default'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link 
                                            href={`/admin/banners/${banner.id}`} 
                                            className="p-2 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                        >
                                            <Pencil size={16} />
                                        </Link>
                                        <button 
                                            onClick={() => handleDelete(banner.id)} 
                                            className="p-2 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
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
