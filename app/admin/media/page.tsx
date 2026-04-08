"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, Trash2, Copy, Loader2, Filter, ExternalLink, X, Check, Clock, HardDrive } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/utils/cn";

export default function AdminMediaPage() {
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        fetchMedia();
    }, []);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/media');
            const data = await res.json();
            if (data.files) setFiles(data.files);
        } catch (error) {
            console.error("Failed to load media", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (bucket: string, name: string, id: string) => {
        if (!confirm('Are you sure you want to delete this file? This cannot be undone.')) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/media?bucket=${bucket}&file=${name}`, { method: 'DELETE' });
            if (res.ok) {
                setFiles(files.filter(f => f.id !== id));
            } else {
                alert('Failed to delete file');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(null);
        }
    };

    const copyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopied(url);
        setTimeout(() => setCopied(null), 2000);
    };

    const filteredFiles = filter === "all" ? files : files.filter(f => f.bucket === filter);

    const filterOptions = ["all", "products", "categories", "banners"];

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Page Header - Fixed */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl flex items-center gap-2">
                        <ImageIcon className="text-blue-600 h-6 w-6 lg:h-8 lg:w-8" />
                        Media Manager
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                        {files.length} assets in storage
                    </p>
                </div>
            </div>

            {/* Filter Bar - Fixed */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar flex-shrink-0">
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                    {filterOptions.map(opt => (
                        <button 
                            key={opt}
                            onClick={() => setFilter(opt)}
                            className={cn(
                                "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                                filter === opt 
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-100" 
                                    : "text-gray-400 hover:bg-gray-50"
                            )}
                        >
                            {opt === 'all' ? 'All Assets' : opt}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area - Scrollable Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-8">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center p-12">
                        <Loader2 className="animate-spin text-blue-600 h-10 w-10 mb-4" />
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Scanning storage...</p>
                    </div>
                ) : filteredFiles.length === 0 ? (
                    <div className="h-full bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center flex flex-col items-center justify-center">
                        <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <ImageIcon className="text-gray-200" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 uppercase">No media found</h3>
                        <p className="text-xs text-gray-400 mt-2 uppercase">Try switching filters or upload new content.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-6">
                        {filteredFiles.map((file) => (
                            <div key={file.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col relative">
                                <div className="aspect-square relative bg-gray-50 overflow-hidden">
                                    <img 
                                        src={file.publicUrl} 
                                        alt={file.name} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    
                                    {/* Quick Actions Overlay */}
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-around">
                                        <button 
                                            onClick={() => copyToClipboard(file.publicUrl)}
                                            className="p-2 bg-white/20 hover:bg-white text-white hover:text-blue-600 rounded-full transition-all backdrop-blur-md"
                                            title="Copy URL"
                                        >
                                            {copied === file.publicUrl ? <Check size={16} strokeWidth={3} /> : <Copy size={16} strokeWidth={3} />}
                                        </button>
                                        <a 
                                            href={file.publicUrl} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="p-2 bg-white/20 hover:bg-white text-white hover:text-blue-600 rounded-full transition-all backdrop-blur-md"
                                            title="View Full"
                                        >
                                            <ExternalLink size={16} strokeWidth={3} />
                                        </a>
                                        <button 
                                            onClick={() => handleDelete(file.bucket, file.name, file.id)}
                                            className="p-2 bg-white/20 hover:bg-red-500 text-white rounded-full transition-all backdrop-blur-md"
                                            title="Delete"
                                            disabled={deleting === file.id}
                                        >
                                            {deleting === file.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} strokeWidth={3} />}
                                        </button>
                                    </div>

                                    <div className="absolute top-2 left-2 flex gap-1.5 pointer-events-none">
                                        <span className="px-1.5 py-0.5 bg-black/60 text-white text-[7px] font-black uppercase tracking-widest rounded-full backdrop-blur-md border border-white/10">
                                            {file.bucket}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-2.5 bg-white space-y-1">
                                    <p className="text-[9px] font-bold text-gray-900 truncate uppercase tracking-tight" title={file.name}>{file.name}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 text-[8px] font-black text-gray-400">
                                            <HardDrive size={8} />
                                            {(file.metadata?.size / 1024).toFixed(0)}KB
                                        </div>
                                        <div className="flex items-center gap-1 text-[8px] font-black text-gray-400">
                                            <Clock size={8} />
                                            {formatDistanceToNow(new Date(file.created_at), { addSuffix: false })}
                                        </div>
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
