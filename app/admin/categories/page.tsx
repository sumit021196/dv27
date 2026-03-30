import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Plus, Pencil, Trash2, Image as ImageIcon, LayoutGrid } from "lucide-react";
import AdminImageWithFallback from "@/components/admin/AdminImageWithFallback";

export default async function AdminCategoriesPage() {
    const supabase = await createClient();
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-gray-900 uppercase flex items-center gap-3">
                        <LayoutGrid className="text-blue-600" size={32} />
                        Categories
                    </h1>
                    <p className="mt-1 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Define and style your product collections
                    </p>
                </div>
                <Link
                    href="/admin/categories/new"
                    className="inline-flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-black rounded-2xl transition-all shadow-lg hover:shadow-blue-200 active:scale-95 uppercase tracking-widest"
                >
                    <Plus size={20} />
                    New Category
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories?.map((category) => (
                    <div key={category.id} className="group relative bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
                        <div className="aspect-square bg-gray-50 relative overflow-hidden">
                            {category.image_url ? (
                                <AdminImageWithFallback 
                                    src={category.image_url} 
                                    alt={category.name} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-200 space-y-2">
                                    <ImageIcon size={40} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">No Image</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                                <span className={`w-fit px-2 py-1 mb-2 text-[8px] font-black uppercase tracking-widest rounded-full ${category.is_active ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                                    {category.is_active ? 'Active' : 'Private'}
                                </span>
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">
                                    {category.name}
                                </h3>
                                <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">/ {category.slug}</p>
                            </div>

                            <div className="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                <Link 
                                    href={`/admin/categories/${category.id}`} 
                                    className="p-2.5 bg-white text-gray-900 hover:bg-blue-600 hover:text-white rounded-xl shadow-xl transition-all hover:scale-110"
                                >
                                    <Pencil size={18} />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
                
                {categories?.length === 0 && (
                   <div className="col-span-full bg-white rounded-3xl border border-dashed border-gray-200 p-20 text-center">
                        <div className="mx-auto w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <LayoutGrid className="text-gray-200" size={48} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 uppercase">Start organizing</h3>
                        <p className="text-sm font-medium text-gray-400 mt-2 max-w-sm mx-auto uppercase tracking-wide">Create your first category to group related products.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
