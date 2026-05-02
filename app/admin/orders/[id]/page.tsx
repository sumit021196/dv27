"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Package, Truck, MapPin, Receipt, CheckCircle, Edit } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import { use } from "react";

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLogisticsLoading, setIsLogisticsLoading] = useState(false);
    const [isEditingShipping, setIsEditingShipping] = useState(false);
    const [editShippingData, setEditShippingData] = useState({ address: '', pincode: '' });
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(`/api/orders/${resolvedParams.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.order) setOrder(data.order);
                else setError("Order not found");
            })
            .catch(err => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [resolvedParams.id]);

    const handleLogisticsAction = async (action: string, payload?: any) => {
        setIsLogisticsLoading(true);
        try {
            const res = await fetch(`/api/orders/${resolvedParams.id}/delhivery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, payload })
            });
            const data = await res.json();

            if (data.success) {
                if (action === 'generate_manifest' && data.manifest_url) {
                    window.open(data.manifest_url, '_blank');
                } else if (action === 'request_pickup') {
                    alert(`Pickup scheduled! ID: ${data.pickup_id}`);
                }

                if (action === 'edit_shipping') {
                    setIsEditingShipping(false);
                }

                // Refresh order data
                const updatedRes = await fetch(`/api/orders/${resolvedParams.id}`);
                const updatedData = await updatedRes.json();
                if (updatedData.order) setOrder(updatedData.order);
            } else {
                throw new Error(data.error || "Action failed");
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsLogisticsLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/orders/${resolvedParams.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                setOrder({ ...order, status: newStatus });
                router.refresh();
            } else {
                throw new Error(data.error || "Failed to update status");
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>;
    if (error || !order) return <div className="p-12 text-center text-red-500">{error || "Not found"}</div>;

    const shipping = order.shipping_details?.[0]; // Assuming one shipping detail per order

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/orders" className="p-2 -ml-2 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
                            Order #{order.id.split('-')[0]}
                            <span className={`text-sm px-3 py-1 rounded-full font-semibold uppercase tracking-wider
                                ${order.status === 'paid' ? 'bg-blue-100 text-blue-800' : 
                                order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                                order.status === 'shipped' ? 'bg-purple-100 text-purple-800' : 
                                order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {order.status}
                            </span>
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Placed on {format(new Date(order.created_at), 'MMMM dd, yyyy - hh:mm a')}
                        </p>
                    </div>
                </div>
                
                {/* Status Actions */}
                <div className="flex gap-2">
                    {order.status === 'paid' && (
                        <button onClick={() => handleStatusUpdate('processing')} disabled={isUpdating} className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-semibold hover:bg-yellow-500 disabled:opacity-50">
                            Mark Processing
                        </button>
                    )}
                    {order.status === 'processing' && (
                        <button onClick={() => handleStatusUpdate('shipped')} disabled={isUpdating} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-500 disabled:opacity-50 flex items-center gap-2">
                            <Truck size={16} /> Mark Shipped
                        </button>
                    )}
                    {order.status === 'shipped' && (
                        <button onClick={() => handleStatusUpdate('delivered')} disabled={isUpdating} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-500 disabled:opacity-50 flex items-center gap-2">
                            <CheckCircle size={16} /> Mark Delivered
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                            <Package className="text-gray-500" size={20} />
                            <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
                        </div>
                        <ul className="divide-y divide-gray-200">
                            {order.order_items?.map((item: any) => (
                                <li key={item.id} className="p-6 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <Package className="h-full w-full p-4 text-gray-300" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900">{item.product_name}</h3>
                                            <p className="text-sm text-gray-500 mt-1">₹{item.price} x {item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-gray-900">₹{item.price * item.quantity}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right Column: Customer & Payment */}
                <div className="space-y-6">
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Receipt size={20} className="text-gray-500" />
                            Payment Summary
                        </h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-500">
                                <span>Subtotal</span>
                                <span className="text-gray-900">₹{order.subtotal}</span>
                            </div>
                            <div className="flex justify-between text-gray-500">
                                <span>Shipping</span>
                                <span className="text-gray-900">₹{order.shipping_fee}</span>
                            </div>
                            <div className="pt-3 border-t border-gray-100 flex justify-between">
                                <span className="font-semibold text-gray-900">Total Paid</span>
                                <span className="font-bold text-lg text-gray-900">₹{order.total_amount}</span>
                            </div>
                            {order.razorpay_payment_id && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-500 mb-1">Razorpay TXN</p>
                                    <p className="font-mono text-xs text-gray-900 break-all">{order.razorpay_payment_id}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {shipping && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <MapPin size={20} className="text-gray-500" />
                                    Shipping Details
                                </h2>
                                {!isEditingShipping && (
                                    <button
                                        onClick={() => {
                                            setEditShippingData({ address: shipping.address, pincode: shipping.pincode });
                                            setIsEditingShipping(true);
                                        }}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                                    >
                                        <Edit size={14} /> Edit
                                    </button>
                                )}
                            </div>

                            {isEditingShipping ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                        <textarea
                                            value={editShippingData.address}
                                            onChange={(e) => setEditShippingData({...editShippingData, address: e.target.value})}
                                            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                                        <input
                                            type="text"
                                            value={editShippingData.pincode}
                                            onChange={(e) => setEditShippingData({...editShippingData, pincode: e.target.value})}
                                            className="w-full rounded-md border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            onClick={() => setIsEditingShipping(false)}
                                            className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleLogisticsAction('edit_shipping', editShippingData)}
                                            disabled={isLogisticsLoading}
                                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {isLogisticsLoading && <Loader2 size={14} className="animate-spin" />}
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm space-y-4">
                                    <div>
                                        <p className="text-gray-500 font-medium mb-1">Customer</p>
                                        <p className="font-semibold text-gray-900">{order.customer_name}</p>
                                        <p className="text-gray-600">{order.customer_phone}</p>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100">
                                        <p className="text-gray-500 font-medium mb-1">Delivery Address</p>
                                        <p className="text-gray-900">{shipping.address}</p>
                                        <p className="text-gray-900 font-semibold mt-1">PIN: {shipping.pincode}</p>
                                    </div>
                                    {shipping.tracking_id && (
                                        <div className="pt-4 border-t border-gray-100">
                                            <p className="text-gray-500 font-medium mb-1">Tracking ID ({shipping.shipping_partner})</p>
                                            <p className="text-blue-600 font-mono text-xs">{shipping.tracking_id}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Delhivery Logistics Management */}
                    {shipping && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Truck size={20} className="text-blue-600" />
                                Delhivery Logistics
                            </h2>
                            <div className="flex flex-col gap-3">
                                {!shipping.tracking_id ? (
                                     <button
                                        onClick={() => handleLogisticsAction('generate_awb')}
                                        disabled={isLogisticsLoading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                     >
                                         {isLogisticsLoading ? <Loader2 size={16} className="animate-spin" /> : <Package size={16} />}
                                         Generate AWB
                                     </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleLogisticsAction('generate_manifest')}
                                            disabled={isLogisticsLoading}
                                            className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                        >
                                            <Receipt size={16} />
                                            Print Manifest
                                        </button>
                                        <button
                                            onClick={() => handleLogisticsAction('request_pickup')}
                                            disabled={isLogisticsLoading}
                                            className="w-full bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                        >
                                            <Truck size={16} />
                                            Schedule Pickup
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
