import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Plus, Pencil, ImageIcon, LayoutGrid } from "lucide-react";
import AdminImageWithFallback from "@/components/admin/AdminImageWithFallback";
import CategoryStatusToggle from "@/components/admin/CategoryStatusToggle";

export default async function AdminCategoriesPage() {
    const supabase = await createClient();
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Page Header - Fixed */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl flex items-center gap-2">
                        <LayoutGrid className="text-blue-600 h-6 w-6 lg:h-8 lg:w-8" />
                        Categories
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500 uppercase tracking-wider">
                        {categories?.length || 0} collections defined
                    </p>
                </div>
                <Link
                    href="/admin/categories/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all shadow-md active:scale-95"
                >
                    <Plus size={18} />
                    New Category
                </Link>
            </div>

            {/* Content Area - Scrollable Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-8">
                {categories && categories.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {categories.map((category) => (
                            <div key={category.id} className="group relative bg-white rounded-2xl md:rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                                <div className="aspect-square bg-gray-50 relative overflow-hidden">
                                    {category.image_url ? (
                                        <AdminImageWithFallback 
                                            src={category.image_url} 
                                            alt={category.name} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
                                            <ImageIcon size={32} />
                                            <span className="text-[8px] font-black uppercase mt-1">No Image</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 md:p-6 text-white pointer-events-none">
                                        <div className="pointer-events-auto flex items-center gap-2 mb-1 md:mb-2">
                                            <span className={`px-1.5 py-0.5 text-[8px] font-bold uppercase rounded-full ${category.is_active ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
                                                {category.is_active ? 'Published' : 'Hidden'}
                                            </span>
                                            <CategoryStatusToggle categoryId={category.id} initialStatus={category.is_active} />
                                        </div>
                                        <h3 className="text-sm md:text-xl font-bold uppercase truncate leading-tight">
                                            {category.name}
                                        </h3>
                                        <p className="hidden md:block text-[9px] font-medium text-white/60 truncate mt-1">/ {category.slug}</p>
                                    </div>

                                    <div className="absolute top-2 right-2 md:top-4 md:right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                        <Link 
                                            href={`/admin/categories/${category.id}`} 
                                            className="p-1.5 md:p-2.5 bg-white text-gray-900 hover:bg-blue-600 hover:text-white rounded-lg md:rounded-xl shadow-xl shadow-black/10 transition-all"
                                        >
                                            <Pencil size={16} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col justify-center items-center p-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <LayoutGrid className="text-gray-200" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 uppercase">Start organizing</h3>
                        <p className="text-xs font-medium text-gray-400 mt-2 max-w-sm mx-auto uppercase tracking-wide">Create your first category to group related products.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
