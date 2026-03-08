"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createProductAction } from "./product.actions";
import { productService } from "@/services/product.service";
import { Category } from "@/types/product";
import { useEffect } from "react";

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
        size: "", // comma separated for variants
    });
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        const loadCats = async () => {
            try {
                const data = await productService.getCategories();
                setCategories(data);
            } catch (err) {
                console.error("Failed to load categories", err);
            }
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreview(objectUrl);

            // Free memory when component unmounts
            return () => URL.revokeObjectURL(objectUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorParam(null);
        setSuccess(false);

        if (!formData.name || !formData.price) {
            setErrorParam("Name and Price are required.");
            return;
        }

        setLoading(true);
        try {
            const result = await createProductAction({
                name: formData.name,
                price: Number(formData.price),
                description: formData.description,
                category: formData.category,
                category_id: formData.category_id,
                size: formData.size,
                image: file
            });

            if (!result.success) {
                throw new Error(result.error);
            }

            setSuccess(true);

            // Delay redirect slightly to show success animation
            setTimeout(() => {
                router.push("/admin/products");
            }, 1500);

        } catch (err: any) {
            const message = err?.message || "An unexpected error occurred.";
            setErrorParam(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/products"
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                >
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                    <p className="text-sm text-gray-500">Create a new product listing in your catalog.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Form Details */}
                <div className="col-span-1 lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Info</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border"
                                    placeholder="e.g. Elegant Rose Bouquet"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border"
                                    placeholder="Describe the product details, material, care instructions etc."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="col-span-1 sm:col-span-2">
                            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Pricing & Formatting</h2>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) <span className="text-red-500">*</span></label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">₹</span>
                                </div>
                                <input
                                    type="number"
                                    name="price"
                                    required
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="w-full pl-8 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleInputChange}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border bg-white"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                                Categories must be created in the Category Manager first.
                            </p>
                        </div>

                        <div className="col-span-1 sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Variants / Sizes</label>
                            <input
                                type="text"
                                name="size"
                                value={formData.size}
                                onChange={handleInputChange}
                                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-3 border"
                                placeholder="e.g. Small, Medium, Large (Comma separated)"
                            />
                            <p className="mt-1 text-xs text-gray-500">Separate multiple variants with commas.</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Media & Submit */}
                <div className="col-span-1 lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Product Image</h2>

                        <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer relative overflow-hidden">
                            <div className="space-y-1 text-center">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="mx-auto h-40 object-cover rounded-md shadow-sm" />
                                ) : (
                                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                )}
                                <div className="flex text-sm text-gray-600 justify-center mt-4">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                        <span>{preview ? 'Change Image' : 'Upload a file'}</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                                    </label>
                                </div>
                                {!preview && <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        {errorParam && (
                            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                                {errorParam}
                            </div>
                        )}

                        {success ? (
                            <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-lg border border-green-100">
                                <CheckCircle2 size={24} />
                                <span className="font-medium">Product added successfully!</span>
                            </div>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Product'
                                )}
                            </button>
                        )}
                    </div>
                </div>

            </form>
        </div>
    );
}
