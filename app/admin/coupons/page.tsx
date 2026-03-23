"use client";

import { useEffect, useState } from "react";
import { couponClientService as couponService } from "@/services/coupon.client";
import { 
    Ticket, 
    Plus, 
    Trash2, 
    ToggleLeft, 
    ToggleRight,
    Loader2,
    Search,
    Filter,
    Calendar,
    AlertCircle
} from "lucide-react";

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
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        try {
            await couponService.deleteCoupon(id);
            fetchCoupons();
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">COUPONS</h1>
                    <p className="text-gray-500 text-sm font-medium mt-1 uppercase tracking-widest">Manage your promotional codes</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-blue-200"
                >
                    <Plus size={18} />
                    New Coupon
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                    <AlertCircle size={20} />
                    <p className="font-bold text-sm uppercase tracking-wider">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.length === 0 ? (
                    <div className="col-span-full py-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[40px] flex flex-col items-center justify-center opacity-50">
                        <Ticket size={48} className="text-gray-300 mb-4" />
                        <p className="font-black text-gray-400 uppercase tracking-widest">No coupons found</p>
                    </div>
                ) : (
                    coupons.map((c) => (
                        <div key={c.id} className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm hover:shadow-xl hover:shadow-blue-50 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <button 
                                    onClick={() => handleDelete(c.id)}
                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                    <Ticket size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">{c.code}</h3>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${c.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                        {c.active ? 'ACTIVE' : 'DISABLED'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Benefit</p>
                                    <p className="text-lg font-black text-blue-600">
                                        {c.discount_type === 'fixed' ? `₹${c.discount_value}` : `${c.discount_value}%`}
                                    </p>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Min Order</p>
                                    <p className="text-lg font-black text-gray-900">₹{c.min_order_value}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl p-8 relative animate-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => setShowModal(false)}
                            className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-all"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-8">Create New Coupon</h2>

                        <form onSubmit={handleCreate} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Coupon Code</label>
                                <input 
                                    required
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all uppercase"
                                    placeholder="e.g. FLASH20"
                                    value={formData.code}
                                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Type</label>
                                    <select 
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                                        value={formData.discount_type}
                                        onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                                    >
                                        <option value="fixed">Fixed Amount (₹)</option>
                                        <option value="percent">Percentage (%)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Value</label>
                                    <input 
                                        required
                                        type="number"
                                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                                        placeholder="500"
                                        value={formData.discount_value}
                                        onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Min Order Value (₹)</label>
                                <input 
                                    type="number"
                                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold placeholder:text-gray-300 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all"
                                    placeholder="1000"
                                    value={formData.min_order_value}
                                    onChange={(e) => setFormData({...formData, min_order_value: e.target.value})}
                                />
                            </div>

                            <button className="w-full bg-gray-900 hover:bg-black text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-gray-200 mt-4">
                                Create Promo Code
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function X({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    )
}
