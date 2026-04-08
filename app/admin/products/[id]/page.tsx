"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { Category } from "@/types/product";

import { use } from "react";

export default function ProductFormPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const isNew = resolvedParams.id === "add" || resolvedParams.id === "new";

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [originalPrice, setOriginalPrice] = useState("");
    const [stock, setStock] = useState("0");
    const [categoryId, setCategoryId] = useState("");
    const [mediaUrl, setMediaUrl] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [isTrending, setIsTrending] = useState(false);
    const [details, setDetails] = useState<{id: string, label: string, value: string}[]>([]);

    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        // Load categories first
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                if(data.categories) {
                    setCategories(data.categories.filter((c: any) => c.is_active));
                }
            })
            .catch(console.error);

        // Then load product if editing
        if (!isNew) {
            fetchProduct();
        } else {
            setIsFetching(false);
            setDetails([
                { id: '1', label: 'Material', value: '100% Luxury French Terry Cotton' },
                { id: '2', label: 'Care', value: 'Cold wash / Dry Flat' }
            ]);
        }
    }, [isNew, resolvedParams.id]);

    const fetchProduct = async () => {
        try {
            const res = await fetch(`/api/products/${resolvedParams.id}`);
            const data = await res.json();
            if (data.product) {
                const p = data.product;
                setName(p.name);
                setSlug(p.slug);
                setDescription(p.description || "");
                setPrice(p.price.toString());
                setOriginalPrice(p.original_price?.toString() || "");
                setStock(p.stock.toString());
                setCategoryId(p.category_id || "");
                setMediaUrl(p.media_url || "");
                setIsActive(p.is_active);
                setIsTrending(p.is_trending);
                if (p.details) {
                    const detailArr = Object.entries(p.details).map(([label, value]) => ({
                        id: Math.random().toString(36).substring(7),
                        label,
                        value: String(value)
                    }));
                    setDetails(detailArr);
                }
            } else {
                setError("Product not found");
            }
        } catch (err: any) {
            setError(err.message || "Failed to load product");
        } finally {
            setIsFetching(false);
        }
    };

    // Auto-generate slug from name if slug is untouched
    useEffect(() => {
        if (isNew && name && !slug) {
            setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    }, [name, isNew]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch(isNew ? `/api/products` : `/api/products/${resolvedParams.id}`, {
                method: isNew ? 'POST' : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    slug,
                    description,
                    price,
                    original_price: originalPrice || null,
                    stock,
                    category_id: categoryId === "" ? null : categoryId,
                    media_url: mediaUrl,
                    is_active: isActive,
                    is_trending: isTrending,
                    details: details.reduce((acc, curr) => {
                        if (curr.label.trim()) acc[curr.label.trim()] = curr.value;
                        return acc;
                    }, {} as Record<string, string>)
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to save product");

            router.push("/admin/products");
            router.refresh();
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    const addDetail = () => {
        setDetails(prev => [...prev, { id: Math.random().toString(36).substring(7), label: "", value: "" }]);
    };

    const updateDetail = (id: string, field: 'label' | 'value', val: string) => {
        setDetails(prev => prev.map(d => d.id === id ? { ...d, [field]: val } : d));
    };

    const removeDetail = (id: string) => {
        setDetails(prev => prev.filter(d => d.id !== id));
    };

    if (isFetching) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/products" className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    {isNew ? "Create Product" : "Edit Product"}
                </h1>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Details</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                            <input
                                type="text"
                                required
                                value={slug}
                                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                rows={4}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all resize-y"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Inventory</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₹) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    min="0"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Original Price / MRP (₹)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={originalPrice}
                                    onChange={(e) => setOriginalPrice(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={stock}
                                    onChange={(e) => setStock(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Product Details Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <div className="flex justify-between items-center border-b pb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Product Details (Tabs)</h2>
                            <button type="button" onClick={addDetail} className="flex items-center text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium transition hover:bg-blue-500">
                                <Plus size={14} className="mr-1" /> Add Detail
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500">Add key-value pairs that will appear in the "Details" tab on the storefront.</p>
                        <div className="space-y-3">
                            {details.map((d) => (
                                <div key={d.id} className="flex gap-3 items-center bg-gray-50 p-3 rounded-xl border border-gray-100 relative group">
                                    <div className="flex-1">
                                        <input type="text" value={d.label} onChange={(e) => updateDetail(d.id, "label", e.target.value)} placeholder="Label (e.g. Material)" className="w-full text-sm border-gray-300 rounded-lg p-2 border" />
                                    </div>
                                    <div className="flex-[2]">
                                        <input type="text" value={d.value} onChange={(e) => updateDetail(d.id, "value", e.target.value)} placeholder="Value (e.g. 100% Cotton)" className="w-full text-sm border-gray-300 rounded-lg p-2 border" />
                                    </div>
                                    <button type="button" onClick={() => removeDetail(d.id)} className="text-red-500 p-1 hover:bg-red-50 rounded-full">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Details */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Media</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Image URL</label>
                            <input
                                type="url"
                                value={mediaUrl}
                                onChange={(e) => setMediaUrl(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                                placeholder="https://..."
                            />
                            {mediaUrl && (
                                <div className="mt-3 aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                                    <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display='none' }} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Organization</h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                            >
                                <option value="">Select a category...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
                        
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">Active (Visible)</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900">Trending Section</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={isTrending} onChange={(e) => setIsTrending(e.target.checked)} />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Product</>}
                    </button>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Card Preview</h2>
                        <div className="flex justify-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                             <div className="w-full max-w-[240px]">
                                <ProductCard 
                                    product={{
                                        id: resolvedParams.id || 'preview',
                                        name: name || "Product Name",
                                        price: Number(price) || 0,
                                        original_price: originalPrice ? Number(originalPrice) : undefined,
                                        mediaUrl: mediaUrl || undefined
                                    }} 
                                />
                             </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
