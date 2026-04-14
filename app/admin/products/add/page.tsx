"use client";

import { useState, useEffect, useRef } from "react";
import { 
    UploadCloud, CheckCircle2, ArrowLeft, Loader2, Plus, 
    Trash2, Video, Save, ChevronRight, ChevronLeft, Layout, 
    Zap, Image as ImageIcon, Box, List as ListIcon, ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createProductAction } from "./product.actions";
import { productService } from "@/services/product.service";
import { Category } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import { createClient } from "@/utils/supabase/client";
import { compressImage, uploadToSupabase } from "@/utils/image-utils";
import { cn } from "@/utils/cn";

// Wizard Steps Configuration
const STEPS = [
    { label: "Essentials", icon: Box },
    { label: "Pricing", icon: Zap },
    { label: "Media", icon: ImageIcon },
    { label: "Variants", icon: ListIcon },
    { label: "Review", icon: ShieldCheck }
];

export default function AddProductPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [errorParam, setErrorParam] = useState<string | null>(null);

    // Form Data States
    const [categories, setCategories] = useState<Category[]>([]);
    const [catsLoading, setCatsLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        original_price: "",
        description: "",
        category_id: "",
        category: ""
    });

    const [images, setImages] = useState<{file: File, url: string}[]>([]);
    const [video, setVideo] = useState<{file: File, url: string} | null>(null);
    const [variants, setVariants] = useState<{id: string, size: string, color: string, stock: string, sku: string}[]>([]);
    const [details, setDetails] = useState<{id: string, label: string, value: string}[]>([
        { id: '1', label: 'Material', value: '100% Luxury French Terry Cotton' },
        { id: '2', label: 'Care', value: 'Cold wash / Dry Flat' }
    ]);

    // Refs for safe cleanup
    const processedUrlsRef = useRef<string[]>([]);

    useEffect(() => {
        let isMounted = true;
        const loadCats = async () => {
            try {
                setCatsLoading(true);
                // Call API directly to bypass any potential Supabase client issues during hydration
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

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            images.forEach(img => URL.revokeObjectURL(img.url));
            if (video) URL.revokeObjectURL(video.url);
        };
    }, []);

    // Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "category_id") {
            const selectedCat = categories.find(c => c.id === value);
            setFormData(prev => ({ ...prev, category_id: value, category: selectedCat ? selectedCat.name : "" }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newImages = files.map(file => ({ file, url: URL.createObjectURL(file) }));
        setImages(prev => [...prev, ...newImages]);
    };

    const removeImage = (idx: number) => {
        URL.revokeObjectURL(images[idx].url);
        setImages(prev => prev.filter((_, i) => i !== idx));
    };

    const nextStep = () => {
        if (currentStep === 0 && !formData.name) {
            setErrorParam("Product Name is required.");
            return;
        }
        if (currentStep === 1 && !formData.price) {
            setErrorParam("Price is required.");
            return;
        }
        setErrorParam(null);
        setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    };

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorParam(null);
        setSuccess(false);

        // Validation logic from main
        if (!formData.name || !formData.price) {
            setErrorParam("Name and Price are required.");
            return;
        }

        if (categories.length > 0 && !formData.category_id) {
            setErrorParam("Please select a category.");
            return;
        }

        if (catsLoading) {
            setErrorParam("Please wait for categories to finish loading before saving.");
            return;
        }

        console.log("Client: Form Submission Start", {
            name: formData.name,
            price: formData.price,
            original_price: formData.original_price,
            imagesCount: images.length,
            video: !!video,
            variantsCount: variants.length
        });

        // Hardened save logic
        setLoading(true);
        processedUrlsRef.current = [];

        try {
            console.log("--- Starting Product Save ---");
            const supabase = createClient();
            
            // PRE-FETCH SESSION: Avoid Safari identity-check hangs with a 5s safety timeout
            setStatusMessage("Verifying session...");
            console.log("[Supabase Auth] Pre-fetching session token...");
            
            const sessionPromise = supabase.auth.getSession();
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Auth timeout")), 5000));
            
            let token: string | undefined;
            try {
                const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any;
                token = session?.access_token || undefined;
                console.log("[Supabase Auth] Session verified.");
            } catch (e) {
                console.warn("[Supabase Auth] Session verification timed out or failed, proceeding with anon access.");
                token = undefined;
            }
            
            const finalImageUrls: string[] = [];
            let finalVideoUrl: string | null = null;

            // 1. Video Upload
            if (video) {
                setStatusMessage("Uploading high-res video...");
                finalVideoUrl = await uploadToSupabase(supabase, 'products', video.file, token);
            }

            // 2. Sequential Image Processing
            for (let i = 0; i < images.length; i++) {
                setStatusMessage(`Processing image ${i + 1}/${images.length}...`);
                const compressed = await compressImage(images[i].file);
                
                setStatusMessage(`Uploading image ${i + 1}/${images.length}...`);
                const url = await uploadToSupabase(supabase, 'products', compressed, token);
                finalImageUrls.push(url);
                processedUrlsRef.current.push(url);
            }

            setStatusMessage("Finalizing data...");
            const result = await createProductAction({
                name: formData.name,
                price: Number(formData.price),
                original_price: formData.original_price ? Number(formData.original_price) : undefined,
                description: formData.description,
                category: formData.category,
                category_id: formData.category_id || null,
                imageUrls: finalImageUrls,
                videoUrl: finalVideoUrl,
                variants: JSON.stringify(variants.map(v => ({ 
                    size: v.size, color: v.color, stock: Number(v.stock), sku: v.sku 
                }))),
                details: JSON.stringify(details.reduce((acc, curr) => {
                    if (curr.label.trim()) acc[curr.label.trim()] = curr.value;
                    return acc;
                }, {} as Record<string, string>))
            });

            if (!result.success) throw new Error(result.error);
            
            setSuccess(true);
            setTimeout(() => router.push("/admin/products"), 1500);
        } catch (err: any) {
            console.error("Save Error:", err);
            setErrorParam(err.message || "An unexpected error occurred.");
            setLoading(false);
        }
    };

    // Render Logic for Steps
    const renderStepContent = () => {
        switch (currentStep) {
            case 0: return (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Essentials</h2>
                            {catsLoading && <Loader2 className="animate-spin text-gray-300" size={16} />}
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Product Name</label>
                            <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-black transition-all" placeholder="e.g. Midnight Onyx Hoodie" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Collection</label>
                            <div className="relative">
                                <select name="category_id" value={formData.category_id} onChange={handleInputChange} disabled={catsLoading} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-black transition-all appearance-none disabled:opacity-50">
                                    <option value="">{catsLoading ? "Loading Categories..." : "Select Category"}</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Narrative / Description</label>
                            <textarea name="description" rows={4} value={formData.description} onChange={handleInputChange} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-black transition-all" placeholder="Tell the story of this piece..." />
                        </div>
                    </div>
                </div>
            );
            case 1: return (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Pricing</h2>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Selling Price (₹)</label>
                                <input type="number" inputMode="numeric" name="price" required value={formData.price} onChange={handleInputChange} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-lg font-bold focus:ring-2 focus:ring-black transition-all" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Original Price / MRP (₹)</label>
                                <input type="number" inputMode="numeric" name="original_price" value={formData.original_price} onChange={handleInputChange} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-lg font-medium text-gray-500 line-through focus:ring-2 focus:ring-black transition-all" placeholder="Optional" />
                            </div>
                        </div>
                    </div>
                </div>
            );
            case 2: return (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Media Portfolio</h2>
                        
                        {/* Images */}
                        <div className="space-y-3">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Visuals</label>
                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl p-8 hover:bg-gray-50 transition cursor-pointer group">
                                <UploadCloud size={32} className="text-gray-300 group-hover:text-black transition-colors" />
                                <span className="text-xs font-bold mt-2 uppercase">Select Files</span>
                                <input type="file" multiple accept="image/*" onChange={handleImagesChange} className="hidden" />
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 group">
                                        <img src={img.url} className="w-full h-full object-cover" alt="Product preview" />
                                        <button onClick={(e) => { e.preventDefault(); removeImage(idx); }} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="text-white" size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Video */}
                        <div className="space-y-3">
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Cinematic Video</label>
                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-3xl p-8 hover:bg-gray-50 transition cursor-pointer group">
                                <Video size={32} className="text-gray-300 group-hover:text-black transition-colors" />
                                <span className="text-xs font-bold mt-2 uppercase truncate max-w-full px-4">{video ? video.file.name : "Select Video"}</span>
                                <input type="file" accept="video/mp4,video/webm" onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) setVideo({ file, url: URL.createObjectURL(file) });
                                }} className="hidden" />
                            </label>
                        </div>
                    </div>
                </div>
            );
            case 3: return (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Variants & Stock</h2>
                            <button onClick={() => setVariants(v => [...v, { id: Math.random().toString(36), size: "", color: "", stock: "10", sku: "" }])} className="p-2 bg-black text-white rounded-full"><Plus size={16} /></button>
                        </div>
                        <div className="space-y-3">
                            {variants.map((v) => (
                                <div key={v.id} className="p-4 bg-gray-50 rounded-2xl grid grid-cols-2 gap-3 relative">
                                    <input placeholder="Size (e.g. S)" value={v.size} onChange={e => setVariants(prev => prev.map(item => item.id === v.id ? {...item, size: e.target.value} : item))} className="bg-white p-2 rounded-lg text-xs" />
                                    <input placeholder="Color" value={v.color} onChange={e => setVariants(prev => prev.map(item => item.id === v.id ? {...item, color: e.target.value} : item))} className="bg-white p-2 rounded-lg text-xs" />
                                    <input placeholder="Stock" type="number" value={v.stock} onChange={e => setVariants(prev => prev.map(item => item.id === v.id ? {...item, stock: e.target.value} : item))} className="bg-white p-2 rounded-lg text-xs" />
                                    <button onClick={() => setVariants(prev => prev.filter(i => i.id !== v.id))} className="absolute -top-2 -right-2 bg-white shadow-md rounded-full p-1 text-red-500"><Trash2 size={12} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
            case 4: return (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <h2 className="text-xl font-bold text-gray-900">Final Review</h2>
                        <div className="relative flex justify-center scale-90 origin-top">
                            <ProductCard product={{
                                id: 'p', name: formData.name, price: Number(formData.price), 
                                original_price: Number(formData.original_price), 
                                mediaUrl: images.length > 0 ? images[0].url : undefined
                            }} />
                        </div>
                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                            <ul className="text-[10px] text-blue-700 font-bold uppercase space-y-1">
                                <li>• {images.length} Images will be compressed for Safari</li>
                                <li>• {variants.length} Stock-keeping units (SKU)</li>
                                <li>• Collection: {formData.category || "General"}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-50 flex flex-col z-[60] overflow-hidden">
            {/* Minimal Header */}
            <div className="flex-shrink-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-20">
                <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                    <ArrowLeft size={18} />
                </Link>
                <div className="flex items-center gap-1.5">
                    {STEPS.map((_, i) => (
                        <div key={i} className={cn(
                            "w-1.5 h-1.5 rounded-full transition-all duration-300",
                            i === currentStep ? "w-6 bg-black" : (i < currentStep ? "bg-black/20" : "bg-gray-200")
                        )} />
                    ))}
                </div>
                <div className="w-8" />
            </div>

            {/* Scrollable Wizard Area */}
            <div className="flex-1 overflow-y-auto pt-6 pb-24 px-4 scrollbar-hide">
                <div className="max-w-md mx-auto h-full">
                    {renderStepContent()}
                    {errorParam && <div className="mt-4 p-4 bg-red-50 text-red-700 text-[10px] font-bold uppercase rounded-2xl border border-red-100">{errorParam}</div>}
                </div>
            </div>

            {/* Fixed Navigation Bar */}
            <div className="flex-shrink-0 p-4 bg-white border-t border-gray-100 z-40">
                <div className="max-w-md mx-auto flex gap-3">
                    {currentStep > 0 && (
                        <button onClick={prevStep} className="flex-1 h-14 bg-white border border-gray-200 rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-sm">
                            <ChevronLeft size={14} /> Back
                        </button>
                    )}
                    {currentStep < STEPS.length - 1 ? (
                        <button onClick={nextStep} className="flex-[2] h-14 bg-black text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-xl shadow-black/10 active:scale-95 transition-all">
                            Next Step <ChevronRight size={14} />
                        </button>
                    ) : (
                        <button onClick={handleSubmit} disabled={loading} className="flex-[2] h-14 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                            {loading ? <Loader2 className="animate-spin" size={14} /> : <><Save size={14} /> Push Live</>}
                        </button>
                    )}
                </div>
                <div className="h-[env(safe-area-inset-bottom)]" />
            </div>

            {/* SAVING OVERLAY (Critical for Safari "stuck" prevention) */}
            {loading && (
                <div className="fixed inset-0 bg-white/80 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                    <div className="relative">
                        <div className="w-24 h-24 border-4 border-gray-100 rounded-full animate-pulse" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="animate-spin text-black" size={32} />
                        </div>
                    </div>
                    <p className="mt-8 text-lg font-bold text-gray-900 leading-tight">Syncing with Cloud</p>
                    <p className="mt-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest h-4">{statusMessage}</p>
                    <div className="mt-12 w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-black animate-[loading_2s_ease-in-out_infinite]" />
                    </div>
                    <style jsx>{`
                        @keyframes loading {
                            0% { transform: translateX(-100%); }
                            100% { transform: translateX(100%); }
                        }
                    `}</style>
                </div>
            )}

            {/* SUCCESS OVERLAY */}
            {success && (
                <div className="fixed inset-0 bg-black z-[110] flex flex-col items-center justify-center p-8 text-center animate-in slide-in-from-bottom-full duration-700">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle2 className="text-white" size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Product Live</h2>
                    <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest">Redirecting to inventory...</p>
                </div>
            )}
        </div>
    );
}
