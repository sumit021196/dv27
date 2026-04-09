"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { productService } from "@/services/product.service";
import { Product } from "@/types/product";

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const pageSize = 10;

    useEffect(() => {
        async function loadProducts() {
            try {
                const data = await productService.getProducts(true);
                // Sort by created_at descending (newest first)
                const sorted = data.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
                setProducts(sorted);
            } catch (error) {
                console.error("Failed to load products", error);
            } finally {
                setLoading(false);
            }
        }
        loadProducts();
    }, []);

    const handleDelete = async (id: string | number) => {
        if (!confirm("Are you sure you want to permanently delete this product?")) return;
        
        setIsDeleting(String(id));
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error("Failed to delete product");
            
            // Remove from local state
            setProducts(products.filter(p => String(p.id) !== String(id)));
        } catch (error) {
            console.error("Error deleting product:", error);
            alert("Failed to delete the product. Make sure you are an admin.");
        } finally {
            setIsDeleting(null);
        }
    };

    const handleToggle = async (id: string | number, field: 'is_active' | 'is_trending', value: boolean) => {
        // Optimistic update
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
            // Revert on error
            setProducts(prev => prev.map(p => 
                String(p.id) === String(id) ? { ...p, [field]: !value } : p
            ));
            alert("Failed to update product status.");
        }
    };

    const visibleProducts = products.slice(0, page * pageSize);
    const hasMore = visibleProducts.length < products.length;

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Page Header - Fixed */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl flex items-center gap-2">
                        <Package className="text-blue-600 h-6 w-6 lg:h-8 lg:w-8" />
                        Products
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                        {products.length} items in catalog
                    </p>
                </div>

                <Link
                    href="/admin/products/add"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all shadow-md active:scale-95"
                >
                    <Plus size={18} />
                    Add Product
                </Link>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col justify-center items-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                            <span className="text-gray-500 font-medium">Fetching catalog...</span>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="h-full flex flex-col justify-center items-center p-12 text-center text-gray-500">
                            <Package size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-lg font-medium text-gray-900">No products found</p>
                            <p className="mt-1">Add your first product to get started.</p>
                        </div>
                    ) : (
                        <div>
                            {/* Desktop Table View */}
                            <div className="hidden md:block">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Trending</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {visibleProducts.map((product) => (
                                            <ProductRow 
                                                key={product.id} 
                                                product={product} 
                                                isDeleting={isDeleting === String(product.id)} 
                                                onDelete={handleDelete}
                                                onToggle={handleToggle}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-gray-100">
                                {visibleProducts.map((product) => (
                                    <ProductCard 
                                        key={product.id} 
                                        product={product} 
                                        isDeleting={isDeleting === String(product.id)} 
                                        onDelete={handleDelete} 
                                        onToggle={handleToggle}
                                    />
                                ))}
                            </div>

                            {hasMore && (
                                <div className="p-4 flex justify-center sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-gray-100">
                                    <button 
                                        onClick={() => setPage(p => p + 1)}
                                        className="px-6 py-2 bg-blue-50 text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-100 transition-colors"
                                    >
                                        Load More ({products.length - visibleProducts.length})
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ProductRow({ product, isDeleting, onDelete, onToggle }: { 
    product: Product, 
    isDeleting: boolean, 
    onDelete: (id: string | number) => void,
    onToggle: (id: string | number, field: 'is_active' | 'is_trending', value: boolean) => void 
}) {
    return (
        <tr className={`hover:bg-gray-50 transition-colors ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 relative">
                        {product.media_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img className="h-full w-full object-cover" src={product.media_url} alt={product.name} />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                                <Package size={20} />
                            </div>
                        )}
                    </div>
                    <div className="ml-4 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{product.name}</div>
                        <div className="text-xs text-gray-500">ID: {product.id}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{product.price}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2.5 py-1 inline-flex text-[11px] leading-5 font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {product.category_name || "Uncategorized"}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                <button
                    onClick={() => onToggle(product.id, 'is_active', !product.is_active)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${product.is_active ? 'bg-blue-600' : 'bg-gray-200'}`}
                >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${product.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">
                 <button
                    onClick={() => onToggle(product.id, 'is_trending', !product.is_trending)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${product.is_trending ? 'bg-amber-500' : 'bg-gray-200'}`}
                >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${product.is_trending ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/products/${product.id}`} className="text-gray-400 hover:text-blue-600 transition-colors"><Pencil size={18} /></Link>
                    <button onClick={() => onDelete(product.id)} className="text-gray-400 hover:text-red-600 transition-colors" disabled={isDeleting}>
                        {isDeleting ? <Loader2 size={18} className="animate-spin text-red-500" /> : <Trash2 size={18} />}
                    </button>
                </div>
            </td>
        </tr>
    );
}

function ProductCard({ product, isDeleting, onDelete, onToggle }: { 
    product: Product, 
    isDeleting: boolean, 
    onDelete: (id: string | number) => void,
    onToggle: (id: string | number, field: 'is_active' | 'is_trending', value: boolean) => void
}) {
    return (
        <div className={`p-4 flex flex-col gap-4 border-b border-gray-100 transition-colors ${isDeleting ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                    {product.media_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="h-full w-full object-cover" src={product.media_url} alt={product.name} />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400"><Package size={24} /></div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{product.name}</h3>
                    <p className="text-xs text-blue-600 font-semibold mt-0.5">₹{product.price}</p>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{product.category_name || "Uncategorized"}</p>
                </div>
                <div className="flex flex-col gap-2">
                    <Link href={`/admin/products/${product.id}`} className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:text-blue-600"><Pencil size={16} /></Link>
                    <button onClick={() => onDelete(product.id)} className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:text-red-600" disabled={isDeleting}>
                        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active</span>
                        <button
                            onClick={() => onToggle(product.id, 'is_active', !product.is_active)}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${product.is_active ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${product.is_active ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trending</span>
                        <button
                            onClick={() => onToggle(product.id, 'is_trending', !product.is_trending)}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${product.is_trending ? 'bg-amber-500' : 'bg-gray-200'}`}
                        >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${product.is_trending ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
