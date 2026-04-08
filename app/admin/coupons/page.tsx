"use client";

import { useEffect, useState } from "react";
import { couponClientService as couponService } from "@/services/coupon.client";
import { 
    Ticket, 
    Plus, 
    Trash2, 
    Loader2,
    AlertCircle,
    X,
    TrendingDown,
    ShoppingBag
} from "lucide-react";
import { cn } from "@/utils/cn";

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        discount_value: "",
        discount_type: "fixed",
        min_order_value: "0",
        active: true
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const data = await couponService.getAllCoupons();
            setCoupons(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await couponService.createCoupon({
                ...formData,
                discount_value: Number(formData.discount_value),
                min_order_value: Number(formData.min_order_value)
            });
            setShowModal(false);
            fetchCoupons();
            // Reset form
            setFormData({
                code: "",
                discount_value: "",
                discount_type: "fixed",
                min_order_value: "0",
                active: true
            });
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        try {
            await couponService.deleteCoupon(id);
            fetchCoupons();
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Page Header - Fixed */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl flex items-center gap-2">
                        <Ticket className="text-blue-600 h-6 w-6 lg:h-8 lg:w-8" />
                        Coupons Management
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                        {coupons.length} active promotional codes
                    </p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap"
                >
                    <Plus size={18} />
                    New Coupon
                </button>
            </div>

            {error && (
                <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 flex-shrink-0">
                    <AlertCircle size={18} />
                    <p className="font-bold text-[10px] uppercase tracking-wider">{error}</p>
                </div>
            )}

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-8">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center p-12">
                        <Loader2 className="animate-spin text-blue-600 h-8 w-8 mb-4" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading coupons...</span>
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="h-full bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center flex flex-col items-center justify-center">
                        <Ticket size={48} className="text-gray-200 mb-4" />
                        <p className="font-bold text-gray-400 uppercase tracking-widest text-sm">No coupons found</p>
                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">Start by creating your first promotional code</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {coupons.map((c) => (
                            <div key={c.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                <div className="absolute top-2 right-2">
                                    <button 
                                        onClick={() => handleDelete(c.id)}
                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                                        <Ticket size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-lg font-bold text-gray-900 tracking-tight uppercase truncate">{c.code}</h3>
                                        <span className={cn(
                                            "text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border",
                                            c.active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                                        )}>
                                            {c.active ? 'Active' : 'Disabled'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100/50">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <TrendingDown size={10} className="text-blue-600" />
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Benefit</p>
                                        </div>
                                        <p className="text-base font-black text-blue-600">
                                            {c.discount_type === 'fixed' ? `₹${c.discount_value}` : `${c.discount_value}%`}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100/50">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <ShoppingBag size={10} className="text-gray-400" />
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Min Order</p>
                                        </div>
                                        <p className="text-base font-black text-gray-900">₹{c.min_order_value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">New Coupon</h2>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form onSubmit={handleCreate} className="space-y-5">
                                <div>
                                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Coupon Code</label>
                                    <input 
                                        required
                                        autoFocus
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all uppercase"
                                        placeholder="E.G. FLASH20"
                                        value={formData.code}
                                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Type</label>
                                        <select 
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all appearance-none"
                                            value={formData.discount_type}
                                            onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                                        >
                                            <option value="fixed">Fixed (₹)</option>
                                            <option value="percent">Percent (%)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Value</label>
                                        <input 
                                            required
                                            type="number"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                                            placeholder="500"
                                            value={formData.discount_value}
                                            onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Min Order Value (₹)</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                                        placeholder="1000"
                                        value={formData.min_order_value}
                                        onChange={(e) => setFormData({...formData, min_order_value: e.target.value})}
                                    />
                                </div>

                                <button className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg active:scale-[0.98] mt-6">
                                    Create Promo Code
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
