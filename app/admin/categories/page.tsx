"use client";
import { useState, useEffect } from "react";
import { productService } from "@/services/product.service";
import { Category } from "@/types/product";
import { Plus, Tag, ArrowLeft, Loader2, Search } from "lucide-react";
import Link from "next/link";

export default function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await productService.getCategories();
            setCategories(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setSaving(true);
        setError(null);
        const slug = name.toLowerCase().trim().replace(/\s+/g, '-');

        try {
            const newCat = await productService.createCategory(name, slug);
            if (newCat) {
                setCategories([...categories, newCat]);
                setName("");
            } else {
                setError("Failed to create category. It might already exist.");
            }
        } catch (err) {
            setError("An error occurred while saving.");
        } finally {
            setSaving(false);
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            {/* Sticky Header */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">Categories</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid lg:grid-cols-12 gap-6 items-start">

                    {/* List Section - Prioritized on Mobile */}
                    <div className="lg:col-span-7 order-2 lg:order-1 space-y-4">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* List Header with Search */}
                            <div className="p-4 border-b border-gray-100 bg-white space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold flex items-center gap-2">
                                        <Tag className="w-5 h-5 text-blue-600" />
                                        Manage Categories
                                    </h2>
                                    <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                                        {categories.length} Total
                                    </span>
                                </div>

                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search categories..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="p-2">
                                {loading ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-600/60" />
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {filteredCategories.length === 0 ? (
                                            <div className="py-12 text-center">
                                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <Search className="w-6 h-6 text-gray-300" />
                                                </div>
                                                <p className="text-gray-500 text-sm">
                                                    {searchQuery ? "No categories matching your search" : "No categories found"}
                                                </p>
                                            </div>
                                        ) : (
                                            filteredCategories.map((cat) => (
                                                <div
                                                    key={cat.id}
                                                    className="group flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all cursor-default"
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-gray-800">{cat.name}</span>
                                                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                                                            slug: {cat.slug}
                                                        </span>
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                                                            ACTIVE
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Add Form Section - Right Sidebar on Desktop */}
                    <div className="lg:col-span-5 order-1 lg:order-2">
                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky lg:top-24">
                            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <div className="p-1.5 bg-blue-50 rounded-lg">
                                    <Plus className="w-4 h-4 text-blue-600" />
                                </div>
                                Create New Category
                            </h2>
                            <form onSubmit={handleAddCategory} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        Category name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter category name..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-sm placeholder:text-gray-400"
                                        required
                                        autoComplete="off"
                                    />
                                </div>
                                {error && (
                                    <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                                        <p className="text-red-600 text-xs font-medium">{error}</p>
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/20"
                                >
                                    {saving ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <span>Add Category</span>
                                            <Plus className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                                <p className="text-[10px] text-gray-400 text-center px-4">
                                    Adding a category will make it immediately available for product tagging.
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
