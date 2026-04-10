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
    ShoppingBag,
    Zap,
    Calendar,
    Users,
    CheckCircle2,
    XCircle,
    Edit3
} from "lucide-react";
import { cn } from "@/utils/cn";

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        code: "",
        discount_value: "",
        discount_type: "fixed",
        min_order_value: "0",
        min_quantity: "0",
        active: true,
        is_auto_apply: false,
        expiry_date: "",
        max_uses_per_user: "1"
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                discount_value: Number(formData.discount_value),
                min_order_value: Number(formData.min_order_value),
                min_quantity: Number(formData.min_quantity || 0),
                max_uses_per_user: Number(formData.max_uses_per_user || 1),
                expiry_date: formData.expiry_date || null
            };

            if (editingId) {
                await couponService.updateCoupon(editingId, payload);
            } else {
                await couponService.createCoupon(payload);
            }

            setShowModal(false);
            setEditingId(null);
            fetchCoupons();
            resetForm();
        } catch (err: any) {
            console.error("Coupon error:", err);
            alert(`Error: ${err.message || 'Something went wrong'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({
            code: "",
            discount_value: "",
            discount_type: "fixed",
            min_order_value: "0",
            min_quantity: "0",
            active: true,
            is_auto_apply: false,
            expiry_date: "",
            max_uses_per_user: "1"
        });
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            await couponService.updateCoupon(id, { active: !currentStatus });
            fetchCoupons();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleEdit = (coupon: any) => {
        setEditingId(coupon.id);
        setFormData({
            code: coupon.code,
            discount_value: coupon.discount_value.toString(),
            discount_type: coupon.discount_type,
            min_order_value: coupon.min_order_value.toString(),
            min_quantity: (coupon.min_quantity || 0).toString(),
            active: coupon.active,
            is_auto_apply: coupon.is_auto_apply || false,
            expiry_date: coupon.expiry_date ? new Date(coupon.expiry_date).toISOString().split('T')[0] : "",
            max_uses_per_user: (coupon.max_uses_per_user || 1).toString()
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        setLoading(true);
        try {
            await couponService.deleteCoupon(id);
            fetchCoupons();
        } catch (err: any) {
            console.error("Delete error:", err);
            alert(`Delete failed: ${err.message}`);
        } finally {
            setLoading(false);
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
                    onClick={() => {
                        setEditingId(null);
                        resetForm();
                        setShowModal(true);
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 whitespace-nowrap"
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
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading...</span>
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
                                <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
                                    <button 
                                        onClick={() => handleEdit(c)}
                                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all sm:opacity-0 sm:group-hover:opacity-100"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(c.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all sm:opacity-0 sm:group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                                        <Ticket size={20} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-gray-900 tracking-tight uppercase truncate">{c.code}</h3>
                                            {c.is_auto_apply && (
                                                <span className="flex items-center gap-0.5 bg-amber-50 text-amber-600 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase border border-amber-100">
                                                    <Zap size={8} /> Auto
                                                </span>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => handleToggleActive(c.id, c.active)}
                                            className={cn(
                                                "text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border transition-all mt-1 flex items-center gap-1",
                                                c.active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'
                                            )}
                                        >
                                            {c.active ? <CheckCircle2 size={8} /> : <XCircle size={8} />}
                                            {c.active ? 'Active' : 'Disabled'}
                                        </button>
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
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Conditions</p>
                                        </div>
                                        <div className="flex flex-col">
                                            <p className="text-xs font-bold text-gray-900">₹{c.min_order_value}+</p>
                                            {c.min_quantity > 0 && <p className="text-[9px] font-bold text-gray-500">{c.min_quantity} Items+</p>}
                                        </div>
                                    </div>
                                </div>

                                {(c.expiry_date || c.max_uses_per_user > 1) && (
                                    <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-2">
                                        {c.expiry_date && (
                                            <div className="flex items-center gap-1.5 overflow-hidden">
                                                <Calendar size={12} className="text-gray-400 shrink-0" />
                                                <p className="text-[10px] font-bold text-gray-500 truncate">
                                                    {new Date(c.expiry_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        )}
                                        {c.max_uses_per_user > 0 && (
                                            <div className="flex items-center gap-1.5">
                                                <Users size={12} className="text-gray-400 shrink-0" />
                                                <p className="text-[10px] font-bold text-gray-500">Limit: {c.max_uses_per_user}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
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
                            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">
                                {editingId ? 'Edit Coupon' : 'New Coupon'}
                            </h2>
                            <button 
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingId(null);
                                }}
                                className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <form onSubmit={handleSubmit} className="space-y-5">
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

                                <div className="grid grid-cols-2 gap-4">
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
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Min Item Quantity</label>
                                        <input 
                                            type="number"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                                            placeholder="2"
                                            value={formData.min_quantity}
                                            onChange={(e) => setFormData({...formData, min_quantity: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Expiry Date</label>
                                        <input 
                                            type="date"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                                            value={formData.expiry_date}
                                            onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Max Uses Per User</label>
                                        <input 
                                            type="number"
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                                            placeholder="1"
                                            value={formData.max_uses_per_user}
                                            onChange={(e) => setFormData({...formData, max_uses_per_user: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                                    <div className="flex gap-3 items-center">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                                            <Zap size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-900 leading-none mb-1">Auto Apply</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Apply automatically if conditions met</p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, is_auto_apply: !formData.is_auto_apply})}
                                        className={cn(
                                            "w-12 h-6 rounded-full transition-all relative",
                                            formData.is_auto_apply ? 'bg-blue-600' : 'bg-gray-200'
                                        )}
                                    >
                                        <div className={cn(
                                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                                            formData.is_auto_apply ? 'right-1' : 'left-1'
                                        )} />
                                    </button>
                                </div>

                                <button 
                                    disabled={isSaving}
                                    className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg active:scale-[0.98] mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving && <Loader2 className="animate-spin" size={18} />}
                                    {isSaving ? 'Saving...' : (editingId ? 'Update Coupon' : 'Create Promo Code')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
