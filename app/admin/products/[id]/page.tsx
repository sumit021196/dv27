"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus, Trash2, UploadCloud, Video, CheckCircle2, Save } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { Category } from "@/types/product";
import { createClient } from "@/utils/supabase/client";
import { updateProductAction } from "./product.actions";
import { productService } from "@/services/product.service";
import { compressImage, uploadToSupabase } from "@/utils/image-utils";


export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const productId = resolvedParams.id;

    // Loading states
    const [isFetching, setIsFetching] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    // Form data
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [originalPrice, setOriginalPrice] = useState("");
    const [stock, setStock] = useState("0");
    const [categoryId, setCategoryId] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [isTrending, setIsTrending] = useState(false);
    
    // Media State
    // We store images as an array of objects that can either have a URL (existing) or a File (new)
    const [images, setImages] = useState<{ url: string; file?: File }[]>([]);
    const [video, setVideo] = useState<{ url: string; file?: File } | null>(null);

    // Dynamic Parts
    const [variants, setVariants] = useState<{ id: string; size: string; color: string; stock: string; sku: string }[]>([]);
    const [details, setDetails] = useState<{ id: string; label: string; value: string }[]>([]);

    const [categories, setCategories] = useState<Category[]>([]);
    const [catsLoading, setCatsLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const loadInitialData = async () => {
            try {
                // 1. Load categories
                setCatsLoading(true);
                try {
                    const resCats = await fetch('/api/categories');
                    if (!resCats.ok) throw new Error("Failed to fetch categories");
                    const dataCats = await resCats.json();
                    if (isMounted) {
                        const allCats: Category[] = dataCats.categories || [];
                        setCategories(allCats.filter(c => c.is_active));
                    }
                } catch (catErr) {
                    console.error("Failed to load categories:", catErr);
                } finally {
                    if (isMounted) setCatsLoading(false);
                }

                // 2. Load product
                const res = await fetch(`/api/products/${productId}`);
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
                    setIsActive(p.is_active);
                    setIsTrending(p.is_trending);

                    // Details
                    if (p.details) {
                        const detailArr = Object.entries(p.details).map(([label, value]) => ({
                            id: Math.random().toString(36).substring(7),
                            label,
                            value: String(value)
                        }));
                        setDetails(detailArr);
                    }

                    // Variants - fetch separately since maybeSingle might not include them in simple API
                    const { data: variantsData } = await createClient().from('product_variants').select('*').eq('product_id', productId);
                    if (variantsData) {
                        setVariants(variantsData.map((v: any) => ({
                            id: v.id.toString(),
                            size: v.size || "",
                            color: v.color || "",
                            stock: v.stock.toString(),
                            sku: v.sku || ""
                        })));
                    }

                    // Images - fetch from product_images table
                    const { data: imagesData } = await createClient().from('product_images').select('*').eq('product_id', productId).order('display_order');
                    if (imagesData && imagesData.length > 0) {
                        setImages(imagesData.map((img: any) => ({ url: img.image_url })));
                    } else if (p.media_url) {
                        // Fallback to main media_url if no product_images entry
                        setImages([{ url: p.media_url }]);
                    }

                    // Video
                    if (p.video_url) {
                        setVideo({ url: p.video_url });
                    }
                } else {
                    setError("Product not found");
                }
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError(err.message || "Failed to load product");
            } finally {
                setIsFetching(false);
            }
        };

        loadInitialData();
    }, [productId]);

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
            if (newArr[index].file) {
                URL.revokeObjectURL(newArr[index].url);
            }
            newArr.splice(index, 1);
            return newArr;
        });
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (video?.file) URL.revokeObjectURL(video.url);
            setVideo({ file, url: URL.createObjectURL(file) });
        }
    };

    const removeVideo = () => {
        if (video?.file) URL.revokeObjectURL(video.url);
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

    const addDetail = () => {
        setDetails(prev => [...prev, { id: Math.random().toString(36).substring(7), label: "", value: "" }]);
    };

    const updateDetail = (id: string, field: 'label' | 'value', val: string) => {
        setDetails(prev => prev.map(d => d.id === id ? { ...d, [field]: val } : d));
    };

    const removeDetail = (id: string) => {
        setDetails(prev => prev.filter(d => d.id !== id));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (categories.length > 0 && !categoryId) {
            setError("Please select a category.");
            return;
        }

        if (catsLoading) {
            setError("Please wait for categories to finish loading before saving.");
            return;
        }

        setIsLoading(true);
        setError("");
        setSuccess(false);

        try {
            const supabase = createClient();
            const finalImageUrls: string[] = [];
            let finalVideoUrl = video?.url || null;

            // 1. Upload Video if it's a new file
            if (video?.file) {
                setStatusMessage("Uploading video...");
                finalVideoUrl = await uploadToSupabase(supabase, 'products', video.file);
            }

            // 2. Handle Images (existing vs new)
            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                if (img.file) {
                    // New upload
                    setStatusMessage(`Compressing image ${i + 1}/${images.length}...`);
                    const compressedFile = await compressImage(img.file);
                    
                    setStatusMessage(`Uploading image ${i + 1}/${images.length}...`);
                    const publicUrl = await uploadToSupabase(supabase, 'products', compressedFile);
                    finalImageUrls.push(publicUrl);
                } else {
                    // Existing URL
                    finalImageUrls.push(img.url);
                }
            }
            
            setStatusMessage("Saving product changes...");

            // 3. Call Server Action
            const result = await updateProductAction(productId, {
                name,
                slug,
                description,
                price: parseFloat(price),
                original_price: originalPrice ? parseFloat(originalPrice) : null,
                stock: parseInt(stock, 10),
                category_id: categoryId || null,
                imageUrls: finalImageUrls,
                videoUrl: finalVideoUrl,
                isActive,
                isTrending,
                variants: JSON.stringify(variants.map(v => ({ size: v.size, color: v.color, stock: Number(v.stock), sku: v.sku }))),
                details: JSON.stringify(details.reduce((acc, curr) => {
                    if (curr.label.trim()) acc[curr.label.trim()] = curr.value;
                    return acc;
                }, {} as Record<string, string>))
            });

            if (!result.success) throw new Error(result.error);

            setSuccess(true);
            setTimeout(() => {
                router.push("/admin/products");
                router.refresh();
            }, 1000);

        } catch (err: any) {
            console.error("Save error:", err);
            setError(err.message || "Failed to save product");
        } finally {
            setIsLoading(false);
            setStatusMessage("");
        }
    };

    if (isFetching) return <div className="p-8 flex justify-center h-screen items-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 mb-4 px-1">
                <div className="flex items-center gap-3">
                    <Link href="/admin/products" className="p-2 hover:bg-white/80 bg-gray-100 rounded-full transition-colors text-gray-500">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">Edit Product</h1>
                        <p className="text-[10px] md:text-sm text-gray-500">Modify details, variants, and gallery.</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide pb-32 md:pb-12">
                <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                    {/* Left Column */}
                    <div className="col-span-1 lg:col-span-2 space-y-4 md:space-y-6">
                        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 md:space-y-6">
                            <h2 className="text-md md:text-lg font-semibold text-gray-900 border-b pb-2">Basic Info</h2>
                            <div className="space-y-3 md:space-y-4">
                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full border-gray-200 rounded-xl shadow-sm focus:ring-black text-sm p-3 border" />
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Slug *</label>
                                    <input type="text" required value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} className="w-full border-gray-200 rounded-xl shadow-sm focus:ring-black text-sm p-3 border" />
                                </div>
                                <div>
                                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border-gray-200 rounded-xl shadow-sm focus:ring-black text-sm p-3 border" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                            <div className="col-span-1 sm:col-span-2"><h2 className="text-md md:text-lg font-semibold text-gray-900 border-b pb-2">Pricing & Inventory</h2></div>
                            <div>
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Selling Price (₹) *</label>
                                <input type="number" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border-gray-200 rounded-xl shadow-sm focus:ring-black text-sm p-3 border" />
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
                                <input type="number" step="0.01" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className="w-full border-gray-200 rounded-xl shadow-sm focus:ring-black text-sm p-3 border" />
                            </div>
                            <div className="col-span-1 sm:col-span-2">
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Global Stock (if no variants)</label>
                                <input type="number" required value={stock} onChange={(e) => setStock(e.target.value)} className="w-full border-gray-200 rounded-xl shadow-sm focus:ring-black text-sm p-3 border" />
                            </div>
                        </div>

                        {/* Variants */}
                        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 md:space-y-6">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h2 className="text-md md:text-lg font-semibold text-gray-900">Product Variants</h2>
                                <button type="button" onClick={addVariant} className="flex items-center text-xs bg-black text-white px-3 py-1.5 rounded-lg font-medium transition active:scale-95">
                                    <Plus size={14} className="mr-1" /> Add Variant
                                </button>
                            </div>
                            <div className="space-y-4">
                                {variants.map((v) => (
                                    <div key={v.id} className="grid grid-cols-4 gap-3 items-end bg-gray-50 p-4 rounded-xl border border-gray-100 relative group">
                                        <div>
                                            <label className="block text-[10px] font-medium text-gray-700 mb-1">Size</label>
                                            <input type="text" value={v.size} onChange={(e) => updateVariant(v.id, "size", e.target.value)} className="w-full text-xs border-gray-300 rounded-md p-2 border" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-medium text-gray-700 mb-1">Color</label>
                                            <input type="text" value={v.color} onChange={(e) => updateVariant(v.id, "color", e.target.value)} className="w-full text-xs border-gray-300 rounded-md p-2 border" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-medium text-gray-700 mb-1">Stock</label>
                                            <input type="number" value={v.stock} onChange={(e) => updateVariant(v.id, "stock", e.target.value)} className="w-full text-xs border-gray-300 rounded-md p-2 border" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-medium text-gray-700 mb-1">SKU</label>
                                            <input type="text" value={v.sku} onChange={(e) => updateVariant(v.id, "sku", e.target.value)} className="w-full text-xs border-gray-300 rounded-md p-2 border" />
                                        </div>
                                        <button type="button" onClick={() => removeVariant(v.id)} className="absolute -top-2 -right-2 bg-white border border-gray-200 text-red-500 p-1.5 rounded-full shadow-sm hover:bg-red-50 transition-opacity">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 md:space-y-6">
                            <div className="flex justify-between items-center border-b pb-2">
                                <h2 className="text-md md:text-lg font-semibold text-gray-900">Tabs / Specs</h2>
                                <button type="button" onClick={addDetail} className="flex items-center text-xs bg-black text-white px-3 py-1.5 rounded-lg font-medium transition">
                                    <Plus size={14} className="mr-1" /> Add Detail
                                </button>
                            </div>
                            <div className="space-y-3">
                                {details.map((d) => (
                                    <div key={d.id} className="flex gap-3 items-center bg-gray-50 p-3 rounded-xl border border-gray-100 relative group">
                                        <input type="text" value={d.label} onChange={(e) => updateDetail(d.id, "label", e.target.value)} placeholder="Label" className="flex-1 text-xs border-gray-300 rounded-lg p-2 border" />
                                        <input type="text" value={d.value} onChange={(e) => updateDetail(d.id, "value", e.target.value)} placeholder="Value" className="flex-[2] text-xs border-gray-300 rounded-lg p-2 border" />
                                        <button type="button" onClick={() => removeDetail(d.id)} className="text-red-500 p-1 hover:bg-red-50 rounded-full"><Trash2 size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-span-1 space-y-4 md:space-y-6">
                        {/* Media */}
                        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                            <h2 className="text-md md:text-lg font-semibold text-gray-900 border-b pb-2">Media Gallery</h2>
                            <div className="mt-2 flex justify-center px-4 py-6 border-2 border-gray-200 border-dashed rounded-xl hover:bg-gray-50 transition cursor-pointer relative group">
                                <div className="text-center">
                                    <UploadCloud className="mx-auto h-8 w-8 text-gray-400 group-hover:text-black transition" />
                                    <div className="mt-2 text-xs text-gray-600">
                                        <label className="cursor-pointer font-medium text-black">
                                            <span>Upload images</span>
                                            <input type="file" multiple className="sr-only" accept="image/*" onChange={handleImagesChange} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 mt-4">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative group rounded-md overflow-hidden bg-gray-100 aspect-square border">
                                        <img src={img.url} alt={`Preview ${idx}`} className="object-cover w-full h-full" />
                                        <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="text-white" size={16} />
                                        </button>
                                        {idx === 0 && <span className="absolute bottom-1 left-1 bg-black/70 text-[8px] text-white px-1 rounded">Primary</span>}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-50">
                                <h3 className="text-xs font-semibold text-gray-700 mb-2">Video</h3>
                                <div className="flex justify-center p-4 border-2 border-gray-200 border-dashed rounded-xl hover:bg-gray-50 transition relative group">
                                    <div className="text-center">
                                        <Video className="mx-auto h-6 w-6 text-gray-400 group-hover:text-black" />
                                        <label className="cursor-pointer text-[10px] font-medium text-black block mt-1">
                                            <span>{video ? "Change Video" : "Upload Video"}</span>
                                            <input type="file" className="sr-only" accept="video/mp4,video/webm" onChange={handleVideoChange} />
                                        </label>
                                    </div>
                                </div>
                                {video && (
                                    <div className="relative mt-2 rounded-xl overflow-hidden bg-black aspect-video group">
                                        <video src={video.url} className="w-full h-full" controls />
                                        <button type="button" onClick={removeVideo} className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition"><Trash2 size={12} /></button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Status & Category */}
                        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Category {catsLoading && <Loader2 className="inline animate-spin ml-2 h-3 w-3" />}</label>
                                <select disabled={catsLoading} value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full border-gray-200 rounded-xl text-sm p-3 border disabled:bg-gray-50">
                                    <option value="">{catsLoading ? "Loading..." : "Select Category"}</option>
                                    {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Active</span>
                                <button type="button" onClick={() => setIsActive(!isActive)} className={`h-6 w-11 rounded-full border-2 transition-colors ${isActive ? 'bg-blue-600 border-blue-600' : 'bg-gray-200 border-gray-200'}`}>
                                    <div className={`h-5 w-5 rounded-full bg-white shadow transform transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Trending</span>
                                <button type="button" onClick={() => setIsTrending(!isTrending)} className={`h-6 w-11 rounded-full border-2 transition-colors ${isTrending ? 'bg-amber-500 border-amber-500' : 'bg-gray-200 border-gray-200'}`}>
                                    <div className={`h-5 w-5 rounded-full bg-white shadow transform transition-transform ${isTrending ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 sticky bottom-4">
                            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100">{error}</div>}
                            {success ? (
                                <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-xl border border-green-100">
                                    <CheckCircle2 size={24} />
                                    <span className="font-medium text-sm">Update Saved!</span>
                                </div>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            <span className="flex flex-col items-center">
                                                <span>Saving...</span>
                                                {statusMessage && <span className="text-[10px] opacity-70 font-medium">{statusMessage}</span>}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
