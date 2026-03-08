"use client";
import { useState, useEffect } from "react";
import { productService } from "@/services/product.service";
import { Category } from "@/types/product";
import { Plus, Tag, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin" className="p-2 hover:bg-white rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Add Category Form */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-blue-600" />
                            Add New Category
                        </h2>
                        <form onSubmit={handleAddCategory} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Luxury Mugs"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    required
                                />
                            </div>
                            {error && (
                                <p className="text-red-500 text-sm">{error}</p>
                            )}
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Category"}
                            </button>
                        </form>
                    </div>

                    {/* Categories List */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Tag className="w-5 h-5 text-blue-600" />
                            Existing Categories
                        </h2>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {categories.length === 0 ? (
                                    <p className="text-gray-500 text-center py-4">No categories found.</p>
                                ) : (
                                    categories.map((cat) => (
                                        <div
                                            key={cat.id}
                                            className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-all"
                                        >
                                            <span className="font-medium text-gray-700">{cat.name}</span>
                                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                                                {cat.slug}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
