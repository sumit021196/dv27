"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Plus, Pencil, Trash2, Loader2, Search } from "lucide-react";
import { Product } from "@/types/product";
import { cn } from "@/utils/cn";

export function ProductsManagement({ initialProducts }: { initialProducts: Product[] }) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const pageSize = 5;

    const handleDelete = async (id: string | number) => {
        if (!confirm("Are you sure you want to permanently delete this product?")) return;
        
        setIsDeleting(String(id));
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error("Failed to delete product");
            
            setProducts(products.filter(p => String(p.id) !== String(id)));
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Failed to delete the product.");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleToggle = async (id: string | number, field: 'is_active' | 'is_trending', value: boolean) => {
        setProducts(prev => prev.map(p => 
            String(p.id) === String(id) ? { ...p, [field]: value } : p
        ));

        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: value }),
            });
            if (!res.ok) throw new Error("Failed to update product");
        } catch (error) {
            console.error("Error updating product:", error);
            setProducts(prev => prev.map(p => 
                String(p.id) === String(id) ? { ...p, [field]: !value } : p
            ));
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const visibleProducts = filteredProducts.slice(0, page * pageSize);
    const hasMore = visibleProducts.length < filteredProducts.length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search catalog..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                </div>
                <Link
                    href="/admin/products/add"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm active:scale-95"
                >
                    <Plus size={18} />
                    Add Product
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Product</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Pricing</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Active</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Trending</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {visibleProducts.map((product) => (
                                <tr key={product.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-gray-100 overflow-hidden relative border border-gray-100">
                                                {product.media_url ? (
                                                    <img src={product.media_url} className="object-cover w-full h-full" alt={product.name} />
                                                ) : <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={20} /></div>}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate max-w-[240px]">{product.name}</p>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">{product.category_name || "No Category"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-gray-900">₹{product.price}</p>
                                        {product.original_price && product.original_price > product.price && (
                                            <p className="text-[10px] text-gray-400 line-through">₹{product.original_price}</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleToggle(product.id, 'is_active', !product.is_active)}
                                            className={cn(
                                                "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none",
                                                product.is_active ? 'bg-blue-600' : 'bg-gray-200'
                                            )}
                                        >
                                            <span className={cn(
                                                "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200",
                                                product.is_active ? 'translate-x-4' : 'translate-x-0'
                                            )} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleToggle(product.id, 'is_trending', !product.is_trending)}
                                            className={cn(
                                                "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none",
                                                product.is_trending ? 'bg-amber-500' : 'bg-gray-200'
                                            )}
                                        >
                                            <span className={cn(
                                                "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200",
                                                product.is_trending ? 'translate-x-4' : 'translate-x-0'
                                            )} />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/products/${product.id}`} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                                <Pencil size={18} />
                                            </Link>
                                            <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                                {isDeleting === String(product.id) ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="md:hidden divide-y divide-gray-100">
                    {visibleProducts.map((product) => (
                        <div key={product.id} className="p-4 space-y-4">
                            <div className="flex items-center gap-4">
                                <img src={product.media_url} className="h-14 w-14 rounded-xl object-cover bg-gray-50" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                                    <p className="text-xs text-blue-600 font-bold mt-1">₹{product.price}</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Link href={`/admin/products/${product.id}`} className="p-2 bg-gray-50 rounded-lg text-gray-400"><Pencil size={16} /></Link>
                                    <button onClick={() => handleDelete(product.id)} className="p-2 bg-gray-50 rounded-lg text-gray-400"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {hasMore && (
                    <div className="p-6 border-t border-gray-100 flex justify-center">
                        <button 
                            onClick={() => setPage(p => p + 1)}
                            className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline"
                        >
                            Load More
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
