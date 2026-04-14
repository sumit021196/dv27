"use client";

import { useState, useEffect, useRef } from "react";
import { UploadCloud, CheckCircle2, ArrowLeft, Loader2, Plus, Trash2, Video, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createProductAction } from "./product.actions";
import { productService } from "@/services/product.service";
import { Category } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import { createClient } from "@/utils/supabase/client";
import { compressImage, uploadToSupabase } from "@/utils/image-utils";


const INITIAL_FORM_DATA = {
    name: "",
    price: "",
    original_price: "",
    description: "",
    category: "",
    category_id: "",
};

export default function AddProductPage() {
    const router = useRouter();
    const isSubmitting = useRef(false);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [errorParam, setErrorParam] = useState<string | null>(null);

    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);

    // Advanced Media & Variants State
    const [images, setImages] = useState<{file: File, url: string}[]>([]);
    const [video, setVideo] = useState<{file: File, url: string} | null>(null);
    const [variants, setVariants] = useState<{id: string, size: string, color: string, stock: string, sku: string}[]>([]);
    const [details, setDetails] = useState<{id: string, label: string, value: string}[]>([
        { id: '1', label: 'Material', value: '100% Luxury French Terry Cotton' },
        { id: '2', label: 'Care', value: 'Cold wash / Dry Flat' }
    ]);

    const [catsLoading, setCatsLoading] = useState(true);

    const sessionTokenRef = useRef<string | undefined>();

    useEffect(() => {
        let isMounted = true;
        
        // Pre-fetch Auth Token once on mount so we never hit the Safari DB lock during upload.
        const preFetchSession = async () => {
            const supabase = createClient();
            try {
                const { data } = await supabase.auth.getSession();
                if (isMounted) sessionTokenRef.current = data.session?.access_token;
            } catch (e) {
                console.warn("[Auth] Failed to prefetch session", e);
            }
        };
        preFetchSession();

        const loadCats = async () => {
            try {
                setCatsLoading(true);
                const res = await fetch('/api/categories');
                if (!res.ok) throw new Error("Failed to fetch categories");
                const data = await res.json();
                if (isMounted) {
                    setCategories(data.categories || []);
                    setErrorParam(null);
                }
            } catch (err: any) {
                console.error("Error loading categories:", err);
                if (isMounted) {
                    setErrorParam("Failed to load categories. Please check your network or refresh the page.");
                }
            } finally {
                if (isMounted) setCatsLoading(false);
            }
        };
        loadCats();

        return () => { isMounted = false; };
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

    const addDetail = () => {
        setDetails(prev => [...prev, { id: Math.random().toString(36).substring(7), label: "", value: "" }]);
    };

    const updateDetail = (id: string, field: 'label' | 'value', val: string) => {
        setDetails(prev => prev.map(d => d.id === id ? { ...d, [field]: val } : d));
    };

    const removeDetail = (id: string) => {
        setDetails(prev => prev.filter(d => d.id !== id));
    };

    const resetAllState = () => {
        console.log("[State Cleanup] Resetting form and clearing memory for next product...");
        
        // 1. Clear media URLs from browser memory
        images.forEach(img => URL.revokeObjectURL(img.url));
        if (video) URL.revokeObjectURL(video.url);
        
        // 2. Reset basic form states
        setFormData(INITIAL_FORM_DATA);
        setImages([]);
        setVideo(null);
        setVariants([]);
        setDetails([
            { id: '1', label: 'Material', value: '100% Luxury French Terry Cotton' },
            { id: '2', label: 'Care', value: 'Cold wash / Dry Flat' }
        ]);
        
        // 3. Clear UI feedback
        setSuccess(false);
        setErrorParam(null);
        setStatusMessage("");
        
        // Scroll to top automatically
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 1. Transaction Lock: Prevent double-hits on the server
        if (isSubmitting.current) return;
        isSubmitting.current = true;

        setErrorParam(null);
        setSuccess(false);

        // Validation checks
        if (!formData.name || !formData.price) {
            setErrorParam("Name and Price are required.");
            isSubmitting.current = false;
            return;
        }

        if (categories.length > 0 && !formData.category_id) {
            setErrorParam("Please select a category.");
            isSubmitting.current = false;
            return;
        }

        setLoading(true);

        try {
            console.log("--- Starting Sequential Product Save ---");
            const supabase = createClient();

            // 2. Auth Context
            let token = sessionTokenRef.current;
            if (!token) {
                setStatusMessage("Verifying session fallback...");
                const { data } = await supabase.auth.getSession();
                token = data.session?.access_token || undefined;
            }

            const finalImageUrls: string[] = [];
            let finalVideoUrl: string | null = null;

            // 3. Sequential Media Processing
            if (video?.file) {
                setStatusMessage("Syncing video...");
                finalVideoUrl = await uploadToSupabase(supabase, 'products', video.file, token);
            }

            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                setStatusMessage(`Processing image ${i + 1}/${images.length}...`);
                const compressedFile = await compressImage(img.file);
                
                setStatusMessage(`Syncing image ${i + 1}/${images.length}...`);
                const publicUrl = await uploadToSupabase(supabase, 'products', compressedFile, token);
                finalImageUrls.push(publicUrl);
            }

            setStatusMessage("Registering product...");

            // 4. Register with Server Action
            const result = await createProductAction({
                name: formData.name,
                price: Number(formData.price),
                original_price: formData.original_price ? Number(formData.original_price) : undefined,
                description: formData.description,
                category: formData.category,
                category_id: formData.category_id || null,
                imageUrls: finalImageUrls,
                videoUrl: finalVideoUrl,
                variants: JSON.stringify(variants.map(v => ({ size: v.size, color: v.color, stock: Number(v.stock), sku: v.sku }))),
                details: JSON.stringify(details.reduce((acc, curr) => {
                    if (curr.label.trim()) acc[curr.label.trim()] = curr.value;
                    return acc;
                }, {} as Record<string, string>))
            });

            if (!result.success) throw new Error(result.error);

            // 5. Success Flow: Halt execution here to let user decide next steps
            setSuccess(true);
            setLoading(false);
            isSubmitting.current = false;

        } catch (err: any) {
            console.error("Submission Failure:", err);
            setErrorParam(err?.message || "An unexpected error occurred during the save process.");
            setLoading(false);
            isSubmitting.current = false;
        } finally {
            setStatusMessage("");
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Fixed Header section */}
            <div className="flex-shrink-0 mb-4 px-1">
                <div className="flex items-center gap-3">
                    <Link href="/admin/products" className="p-2 hover:bg-white/80 bg-gray-100 rounded-full transition-colors text-gray-500">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">Add Clothing Product</h1>
                        <p className="text-[10px] md:text-sm text-gray-500">New product with variants & media.</p>
                    </div>
                </div>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide pb-32 md:pb-12">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                {/* Left Column: Form Details & Variants */}
                <div className="col-span-1 lg:col-span-2 space-y-4 md:space-y-6">
                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 md:space-y-6">
                        <h2 className="text-md md:text-lg font-semibold text-gray-900 border-b pb-2">Basic Info</h2>
                        <div className="space-y-3 md:space-y-4">
                            <div>
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                                <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full border-gray-200 rounded-xl shadow-sm focus:ring-black text-sm p-3 border" placeholder="e.g. Classic Denim Jacket" />
                            </div>
                            <div>
                                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea name="description" rows={3} value={formData.description} onChange={handleInputChange} className="w-full border-gray-200 rounded-xl shadow-sm focus:ring-black text-sm p-3 border" placeholder="Material, care instructions..." />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        <div className="col-span-1 sm:col-span-2"><h2 className="text-md md:text-lg font-semibold text-gray-900 border-b pb-2">Pricing & Category</h2></div>
                        <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Selling Price (₹) *</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center"><span className="text-gray-500 text-sm">₹</span></div>
                                <input type="number" name="price" required min="0" step="0.01" value={formData.price} onChange={handleInputChange} className="w-full pl-8 border-gray-200 rounded-xl shadow-sm focus:ring-black text-sm p-3 border" placeholder="0.00" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Original Price / MRP (₹)</label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center"><span className="text-gray-500 text-sm">₹</span></div>
                                <input type="number" name="original_price" min="0" step="0.01" value={formData.original_price} onChange={handleInputChange} className="w-full pl-8 border-gray-200 rounded-xl shadow-sm focus:ring-black text-sm p-3 border" placeholder="0.00" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">Category {catsLoading && <Loader2 className="inline animate-spin ml-2 h-3 w-3" />}</label>
                            <select name="category_id" disabled={catsLoading} value={formData.category_id} onChange={handleInputChange} className="w-full border-gray-200 rounded-xl shadow-sm focus:ring-black text-sm p-3 border disabled:bg-gray-50">
                                <option value="">{catsLoading ? "Loading..." : "Select Category"}</option>
                                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Variants Section */}
                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 md:space-y-6">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h2 className="text-md md:text-lg font-semibold text-gray-900">Product Variants</h2>
                            <button type="button" onClick={addVariant} className="flex items-center text-xs bg-black text-white px-3 py-1.5 rounded-lg font-medium transition">
                                <Plus size={14} className="mr-1" /> Add Variant
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
                    {/* Product Details Section */}
                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 md:space-y-6 mt-6">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h2 className="text-md md:text-lg font-semibold text-gray-900">Product Details (Tabs)</h2>
                            <button type="button" onClick={addDetail} className="flex items-center text-xs bg-black text-white px-3 py-1.5 rounded-lg font-medium transition">
                                <Plus size={14} className="mr-1" /> Add Detail
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500">These will appear in the "Details" tab on the product page as key-value pairs (e.g. Material: Cotton).</p>
                        <div className="space-y-3">
                            {details.map((d) => (
                                <div key={d.id} className="flex gap-3 items-center bg-gray-50 p-3 rounded-xl border border-gray-100 relative group">
                                    <div className="flex-1">
                                        <input type="text" value={d.label} onChange={(e) => updateDetail(d.id, "label", e.target.value)} placeholder="Label (e.g. Material)" className="w-full text-xs border-gray-300 rounded-lg p-2 border" />
                                    </div>
                                    <div className="flex-[2]">
                                        <input type="text" value={d.value} onChange={(e) => updateDetail(d.id, "value", e.target.value)} placeholder="Value (e.g. 100% Cotton)" className="w-full text-xs border-gray-300 rounded-lg p-2 border" />
                                    </div>
                                    <button type="button" onClick={() => removeDetail(d.id)} className="text-red-500 p-1 hover:bg-red-50 rounded-full">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Media & Submit */}
                <div className="col-span-1 lg:col-span-1 space-y-4 md:space-y-6">
                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-md md:text-lg font-semibold text-gray-900 border-b pb-2">Images</h2>
                        <div className="mt-2 flex justify-center px-4 py-6 border-2 border-gray-200 border-dashed rounded-xl hover:bg-gray-50 transition cursor-pointer relative overflow-hidden group">
                            <div className="text-center">
                                <UploadCloud className="mx-auto h-8 w-8 text-gray-400 group-hover:text-black transition" />
                                <div className="mt-2 text-xs text-gray-600">
                                    <label className="cursor-pointer font-medium text-black hover:text-gray-700">
                                        <span>Select images</span>
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

                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-md md:text-lg font-semibold text-gray-900 border-b pb-2">Video (Optional)</h2>
                        <div className="mt-2 flex justify-center px-4 py-6 border-2 border-gray-200 border-dashed rounded-xl hover:bg-gray-50 transition cursor-pointer relative overflow-hidden group">
                            <div className="text-center">
                                <Video className="mx-auto h-8 w-8 text-gray-400 group-hover:text-black transition" />
                                <div className="mt-2 text-xs text-gray-600">
                                    <label className="cursor-pointer font-medium text-black hover:text-gray-700">
                                        <span>Upload Video</span>
                                        <input type="file" className="sr-only" accept="video/mp4,video/webm" onChange={handleVideoChange} />
                                    </label>
                                </div>
                            </div>
                        </div>
                        {video && (
                            <div className="relative mt-4 rounded-xl overflow-hidden group">
                                <video src={video.url} className="w-full h-auto aspect-video bg-black" controls />
                                <button type="button" onClick={removeVideo} className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-600 shadow-sm opacity-0 group-hover:opacity-100 transition">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <h2 className="text-md md:text-lg font-semibold text-gray-900 border-b pb-2">Product Card Preview</h2>
                        <div className="flex justify-center p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <div className="w-full max-w-[280px]">
                                <ProductCard 
                                    product={{
                                        id: 'preview',
                                        name: formData.name || "Product Name",
                                        price: Number(formData.price) || 0,
                                        original_price: formData.original_price ? Number(formData.original_price) : undefined,
                                        mediaUrl: images.length > 0 ? images[0].url : undefined
                                    }} 
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center italic">This is how your product will appear on the shop page.</p>
                    </div>

                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                        {errorParam && <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-100">{errorParam}</div>}
                        {success ? (
                            <div className="flex flex-col items-center gap-3 bg-green-50 p-6 rounded-xl border border-green-100 text-center">
                                <div className="flex items-center gap-2 text-green-700">
                                    <CheckCircle2 size={24} />
                                    <span className="font-bold text-lg">Product Saved!</span>
                                </div>
                                <p className="text-xs text-green-600">The product is now live.</p>
                                <button type="button" onClick={resetAllState} className="mt-2 w-full bg-black text-white px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-gray-800 transition shadow-sm">
                                    Add Another Product
                                </button>
                                <Link href="/admin/products" className="text-xs font-medium text-gray-500 underline mt-2 hover:text-black transition">
                                    Return to Product List
                                </Link>
                            </div>
                        ) : (
                            <button type="submit" disabled={loading} className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-70 disabled:cursor-not-allowed transition-all">
                                {loading ? <><Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" /> Saving...</> : 'Save Product Data'}
                            </button>
                        )}
                    </div>
                </div>
            </form>
            </div>
        </div>
    );
}
