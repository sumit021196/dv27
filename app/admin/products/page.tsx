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
    const pageSize = 5;

    useEffect(() => {
        async function loadProducts() {
            try {
                const data = await productService.getProducts();
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

    const visibleProducts = products.slice(0, page * pageSize);
    const hasMore = visibleProducts.length < products.length;

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl flex items-center gap-2">
                        <Package className="text-blue-600" />
                        Products
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Manage your store catalog and inventory. Total: {products.length}
                    </p>
                </div>

                <Link
                    href="/admin/products/add"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    Add Product
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center flex flex-col justify-center items-center">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                        <span className="text-gray-500 font-medium">Fetching catalog...</span>
                    </div>
                ) : products.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium text-gray-900">No products found</p>
                        <p className="mt-1">Add your first product to get started.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {visibleProducts.map((product) => (
                                    <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${isDeleting === String(product.id) ? 'opacity-50 pointer-events-none' : ''}`}>
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
                                                <div className="ml-4 flex-1 overflow-hidden">
                                                    <div className="text-sm font-medium text-gray-900 truncate max-w-[200px] sm:max-w-xs">{product.name}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5">ID: {product.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">₹{product.price}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2.5 py-1 inline-flex text-[11px] leading-5 font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                                {product.category_name || "Uncategorized"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-3">
                                                <Link 
                                                    href={`/admin/products/add?id=${product.id}`}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="Edit Product"
                                                >
                                                    <Pencil size={18} />
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(product.id)}
                                                    disabled={isDeleting === String(product.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                                                    title="Delete Product"
                                                >
                                                    {isDeleting === String(product.id) ? (
                                                        <Loader2 size={18} className="animate-spin text-red-500" />
                                                    ) : (
                                                        <Trash2 size={18} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            {hasMore && (
                <div className="flex justify-center pt-4">
                    <button 
                        onClick={() => setPage(p => p + 1)}
                        className="px-6 py-2.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-xl transition-all shadow-sm"
                    >
                        Load More Products ({products.length - visibleProducts.length} left)
                    </button>
                </div>
            )}
        </div>
    );
}
