"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, Trash2, Copy, Loader2, Filter, ExternalLink, X, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl flex items-center gap-2">
                        <ImageIcon className="text-blue-600" />
                        Media Manager
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        View and manage all images used across your website.
                    </p>
                </div>
                
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                    <button 
                        onClick={() => setFilter("all")}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === 'all' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        All
                    </button>
                    <button 
                        onClick={() => setFilter("products")}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === 'products' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Products
                    </button>
                    <button 
                        onClick={() => setFilter("categories")}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === 'categories' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Categories
                    </button>
                    <button 
                        onClick={() => setFilter("banners")}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === 'banners' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        Banners
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <Loader2 className="animate-spin text-blue-600 h-10 w-10" />
                    <p className="text-sm font-medium text-gray-500">Scanning storage buckets...</p>
                </div>
            ) : filteredFiles.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-sm">
                    <div className="mx-auto w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <ImageIcon className="text-gray-300" size={40} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No media found</h3>
                    <p className="text-sm text-gray-500 mt-2">Try switching filters or upload new content via the manager.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredFiles.map((file) => (
                        <div key={file.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                            <div className="aspect-square relative bg-gray-50 p-2 overflow-hidden">
                                <img 
                                    src={file.publicUrl} 
                                    alt={file.name} 
                                    className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                    <button 
                                        onClick={() => copyToClipboard(file.publicUrl)}
                                        className="p-2 bg-white rounded-full text-gray-900 hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110"
                                        title="Copy URL"
                                    >
                                        {copied === file.publicUrl ? <Check size={18} /> : <Copy size={18} />}
                                    </button>
                                    <a 
                                        href={file.publicUrl} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="p-2 bg-white rounded-full text-gray-900 hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110"
                                        title="Open Link"
                                    >
                                        <ExternalLink size={18} />
                                    </a>
                                    <button 
                                        onClick={() => handleDelete(file.bucket, file.name, file.id)}
                                        className="p-2 bg-white rounded-full text-red-600 hover:bg-red-600 hover:text-white transition-all transform hover:scale-110"
                                        title="Delete"
                                        disabled={deleting === file.id}
                                    >
                                        {deleting === file.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                    </button>
                                </div>
                                <span className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 text-white text-[10px] font-black uppercase tracking-widest rounded-full backdrop-blur-md">
                                    {file.bucket}
                                </span>
                            </div>
                            <div className="p-3 space-y-1">
                                <p className="text-[10px] font-bold text-gray-900 truncate" title={file.name}>{file.name}</p>
                                <div className="flex items-center justify-between text-[9px] font-bold text-gray-400">
                                    <span>{(file.metadata?.size / 1024).toFixed(1)} KB</span>
                                    <span>{formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
