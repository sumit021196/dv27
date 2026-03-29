"use client";

import { useState, useEffect } from "react";
import { UploadCloud, CheckCircle2, ArrowLeft, Loader2, Plus, Trash2, Video } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createProductAction } from "./product.actions";
import { productService } from "@/services/product.service";
import { Category } from "@/types/product";

export default function AddProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorParam, setErrorParam] = useState<string | null>(null);

    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        description: "",
        category: "",
        category_id: "",
    });

    // Advanced Media & Variants State
    const [images, setImages] = useState<{file: File, url: string}[]>([]);
    const [video, setVideo] = useState<{file: File, url: string} | null>(null);
    const [variants, setVariants] = useState<{id: string, size: string, color: string, stock: string, sku: string}[]>([]);

    useEffect(() => {
        const loadCats = async () => {
            try {
                const data = await productService.getCategories();
                setCategories(data);
            } catch (err) { }
        };
        loadCats();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "category_id") {
            const selectedCat = categories.find(c => c.id === value);
            setFormData(prev => ({
                ...prev,
                category_id: value,
                category: selectedCat ? selectedCat.name : ""
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const newImages = files.map(file => ({
                file,
                url: URL.createObjectURL(file)
            }));
            setImages(prev => [...prev, ...newImages]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => {
            const newArr = [...prev];
            URL.revokeObjectURL(newArr[index].url);
            newArr.splice(index, 1);
            return newArr;
        });
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (video) URL.revokeObjectURL(video.url);
            setVideo({ file, url: URL.createObjectURL(file) });
        }
    };

    const removeVideo = () => {
        if (video) URL.revokeObjectURL(video.url);
        setVideo(null);
    };

    const addVariant = () => {
        setVariants(prev => [...prev, { id: Math.random().toString(36).substring(7), size: "", color: "", stock: "0", sku: "" }]);
    };

    const updateVariant = (id: string, field: string, value: string) => {
        setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    const removeVariant = (id: string) => {
        setVariants(prev => prev.filter(v => v.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorParam(null);
        setSuccess(false);

        if (!formData.name || !formData.price) {
            setErrorParam("Name and Price are required.");
            return;
        }

        console.log("Client: Form Submission Start", {
            name: formData.name,
            price: formData.price,
            imagesCount: images.length,
            video: !!video,
            variantsCount: variants.length
        });

        setLoading(true);
        try {
            const result = await createProductAction({
                name: formData.name,
                price: Number(formData.price),
                description: formData.description,
                category: formData.category,
                category_id: formData.category_id || null,
                images: images.map(img => img.file),
                video: video?.file || null,
                variants: JSON.stringify(variants.map(v => ({ size: v.size, color: v.color, stock: Number(v.stock), sku: v.sku })))
            });

            console.log("Client: Action Result", result);

            if (!result.success) throw new Error(result.error);
            setSuccess(true);
            setTimeout(() => router.push("/admin/products"), 1500);
        } catch (err: any) {
            console.error("Client: Submission Error", err);
            setErrorParam(err?.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex items-center gap-4">
                <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add Clothing Product</h1>
                    <p className="text-sm text-gray-500">Create a new product with multiple variants and media.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Form Details & Variants */}
                <div className="col-span-1 lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Info</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                                <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-black sm:text-sm p-3 border" placeholder="e.g. Classic Denim Jacket" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea name="description" rows={4} value={formData.description} onChange={handleInputChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-black sm:text-sm p-3 border" placeholder="Material, care instructions..." />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="col-span-1 sm:col-span-2"><h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Pricing & Category</h2></div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center"><span className="text-gray-500 sm:text-sm">₹</span></div>
                                <input type="number" name="price" required min="0" step="0.01" value={formData.price} onChange={handleInputChange} className="w-full pl-8 border-gray-300 rounded-lg shadow-sm focus:ring-black sm:text-sm p-3 border" placeholder="0.00" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select name="category_id" value={formData.category_id} onChange={handleInputChange} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-black sm:text-sm p-3 border">
                                <option value="">Select Category</option>
                                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Variants Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h2 className="text-lg font-semibold text-gray-900">Product Variants</h2>
                            <button type="button" onClick={addVariant} className="flex items-center text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg font-medium transition">
                                <Plus size={16} className="mr-1" /> Add Variant
                            </button>
                        </div>
                        {variants.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">No variants added. Click 'Add Variant' to add sizes, colors, and stock.</p>
                        ) : (
                            <div className="space-y-4">
                                {variants.map((v) => (
                                    <div key={v.id} className="grid grid-cols-4 gap-3 items-end bg-gray-50 p-4 rounded-xl border border-gray-100 relative group">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Size</label>
                                            <input type="text" value={v.size} onChange={(e) => updateVariant(v.id, "size", e.target.value)} placeholder="S, M, L..." className="w-full text-sm border-gray-300 rounded-md p-2 border" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                                            <input type="text" value={v.color} onChange={(e) => updateVariant(v.id, "color", e.target.value)} placeholder="Red, #FFF" className="w-full text-sm border-gray-300 rounded-md p-2 border" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Stock</label>
                                            <input type="number" min="0" value={v.stock} onChange={(e) => updateVariant(v.id, "stock", e.target.value)} className="w-full text-sm border-gray-300 rounded-md p-2 border" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
                                            <input type="text" value={v.sku} onChange={(e) => updateVariant(v.id, "sku", e.target.value)} placeholder="SKU-123" className="w-full text-sm border-gray-300 rounded-md p-2 border" />
                                        </div>
                                        <button type="button" onClick={() => removeVariant(v.id)} className="absolute -top-2 -right-2 bg-white border border-gray-200 text-red-500 p-1.5 rounded-full shadow-sm hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Media & Submit */}
                <div className="col-span-1 lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Images</h2>
                        <div className="mt-2 flex justify-center px-4 py-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition cursor-pointer relative overflow-hidden">
                            <div className="text-center">
                                <UploadCloud className="mx-auto h-10 w-10 text-gray-400 group-hover:text-black transition" />
                                <div className="mt-2 text-sm text-gray-600">
                                    <label className="cursor-pointer font-medium text-black hover:text-gray-700">
                                        <span>Select multiple images</span>
                                        <input type="file" multiple className="sr-only" accept="image/*" onChange={handleImagesChange} />
                                    </label>
                                </div>
                            </div>
                        </div>
                        {images.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mt-4">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative group rounded-md overflow-hidden bg-gray-100 aspect-square">
                                        <img src={img.url} alt={`Preview ${idx}`} className="object-cover w-full h-full" />
                                        <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="text-white" size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Video (Optional)</h2>
                        <div className="mt-2 flex justify-center px-4 py-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition cursor-pointer relative overflow-hidden">
                            <div className="text-center">
                                <Video className="mx-auto h-10 w-10 text-gray-400" />
                                <div className="mt-2 text-sm text-gray-600">
                                    <label className="cursor-pointer font-medium text-black hover:text-gray-700">
                                        <span>{video ? 'Change Video' : 'Upload Video File'}</span>
                                        <input type="file" className="sr-only" accept="video/mp4,video/webm" onChange={handleVideoChange} />
                                    </label>
                                </div>
                            </div>
                        </div>
                        {video && (
                            <div className="relative mt-4 rounded-md overflow-hidden group">
                                <video src={video.url} className="w-full h-auto aspect-video bg-black" controls />
                                <button type="button" onClick={removeVideo} className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        {errorParam && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border">{errorParam}</div>}
                        {success ? (
                            <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-lg border">
                                <CheckCircle2 size={24} />
                                <span className="font-medium">Product saved!</span>
                            </div>
                        ) : (
                            <button type="submit" disabled={loading} className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-70 disabled:cursor-not-allowed transition-all">
                                {loading ? <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> Saving...</> : 'Save Product Data'}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
}
