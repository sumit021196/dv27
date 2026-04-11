"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Eye, Loader2, IndianRupee, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/utils/cn";

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/orders')
            .then(res => res.json())
            .then(data => {
                if (data.orders) setOrders(data.orders);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl flex items-center gap-3">
                        <ShoppingCart className="text-blue-600 h-6 w-6 lg:h-8 lg:w-8" />
                        Orders Management
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                        {orders.length} total orders found
                    </p>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div>
                    {loading ? (
                        <div className="h-full flex flex-col justify-center items-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                            <span className="text-gray-500 font-medium">Loading orders...</span>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="h-full flex flex-col justify-center items-center p-12 text-center text-gray-500">
                            <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                                <ShoppingCart size={32} />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">No Orders Yet</h2>
                            <p className="text-gray-500 mt-2 max-w-md mx-auto">
                                When customers place orders, they will appear here.
                            </p>
                        </div>
                    ) : (
                        <div>
                            {/* Desktop Table View */}
                            <div className="hidden md:block">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID & Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 truncate max-w-[150px]" title={order.id}>
                                                        #{order.id.split('-')[0]}
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 font-medium">{order.customer_name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">₹{order.total_amount}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link href={`/admin/orders/${order.id}`} className="text-blue-600 hover:text-blue-900 inline-flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                                                        <Eye size={16} /> View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-gray-100">
                                {orders.map((order) => (
                                    <Link 
                                        key={order.id}
                                        href={`/admin/orders/${order.id}`}
                                        className="p-4 flex flex-col gap-3 active:bg-gray-50 transition-colors block"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-900">Order #{order.id.split('-')[0]}</h3>
                                                <p className="text-xs text-gray-500 mt-0.5">{order.customer_name}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-1.5 text-gray-500">
                                                <Clock size={12} />
                                                {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                                            </div>
                                            <div className="text-base font-black text-gray-900">₹{order.total_amount}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
