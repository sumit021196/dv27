"use client";

import React, { useState } from "react";
import { 
    Package, 
    Users, 
    ShoppingCart, 
    TrendingUp, 
    IndianRupee,
    LayoutDashboard,
    ChevronRight,
    Search
} from "lucide-react";
import { cn } from "@/utils/cn";

interface Order {
    id: string;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
}

interface Product {
    id: string;
    name: string;
    stock: number;
    price: number;
}

interface DashboardOverviewProps {
    totalRevenue: number;
    activeOrdersCount: number;
    productsCount: number;
    customersCount: number;
    recentOrders: Order[];
    recentProducts: Product[];
}

export default function DashboardOverview({
    totalRevenue,
    activeOrdersCount,
    productsCount,
    customersCount,
    recentOrders,
    recentProducts
}: DashboardOverviewProps) {
    const [step, setStep] = useState(0); // 0: Stats, 1: Orders, 2: Products

    const steps = [
        { label: "Stats", icon: LayoutDashboard },
        { label: "Orders", icon: ShoppingCart },
        { label: "Products", icon: Package }
    ];

    return (
        <div className="flex flex-col h-[calc(100dvh-100px)] lg:h-auto overflow-hidden">
            {/* Header info (Desktop only or shared) */}
            <div className="mb-4 lg:mb-6 flex-shrink-0 pl-12 lg:pl-0 pt-1 lg:pt-0">
                <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
                    Dashboard Overview
                </h1>
                <p className="mt-1 text-[10px] sm:text-sm text-gray-500">
                    Monitor your store&#39;s performance.
                </p>
            </div>

            {/* Desktop View: Grid layout */}
            <div className="hidden lg:block space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-4 gap-5">
                    <StatCard
                        title="Total Revenue"
                        value={`₹${totalRevenue.toLocaleString('en-IN')}`}
                        trend="Lifetime"
                        icon={<IndianRupee className="h-6 w-6 text-gray-400" />}
                    />
                    <StatCard
                        title="Active Orders"
                        value={activeOrdersCount.toString()}
                        trend="Needs fulfillment"
                        icon={<ShoppingCart className="h-6 w-6 text-gray-400" />}
                    />
                    <StatCard
                        title="Total Products"
                        value={productsCount.toString()}
                        trend="Catalog size"
                        icon={<Package className="h-6 w-6 text-gray-400" />}
                    />
                    <StatCard
                        title="Registered Customers"
                        value={customersCount.toString()}
                        trend="Store accounts"
                        icon={<Users className="h-6 w-6 text-gray-400" />}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <RecentOrdersList orders={recentOrders} />
                    <RecentProductsList products={recentProducts} />
                </div>
            </div>

            {/* Mobile View: Wizard-based (Tabbed) */}
            <div className="flex-1 lg:hidden flex flex-col min-h-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-2">
                {/* Step Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {step === 0 && (
                        <div className="grid grid-cols-2 gap-3 align-content-start">
                            <StatCard
                                title="Revenue"
                                value={`₹${totalRevenue.toLocaleString('en-IN')}`}
                                trend="Total"
                                icon={<IndianRupee className="h-5 w-5 text-gray-400" />}
                                compact
                            />
                            <StatCard
                                title="Active"
                                value={activeOrdersCount.toString()}
                                trend="Orders"
                                icon={<ShoppingCart className="h-5 w-5 text-gray-400" />}
                                compact
                            />
                            <StatCard
                                title="Products"
                                value={productsCount.toString()}
                                trend="Total"
                                icon={<Package className="h-5 w-5 text-gray-400" />}
                                compact
                            />
                            <StatCard
                                title="Customers"
                                value={customersCount.toString()}
                                trend="Total"
                                icon={<Users className="h-5 w-5 text-gray-400" />}
                                compact
                            />

                            {/* Optional: Navigation shortcuts within dashboard */}
                            <button 
                                onClick={() => setStep(1)}
                                className="col-span-2 mt-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between text-blue-700 font-semibold"
                            >
                                <span>Recent Orders</span>
                                <ChevronRight size={20} />
                            </button>
                            <button 
                                onClick={() => setStep(2)}
                                className="col-span-2 p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between text-gray-700 font-semibold"
                            >
                                <span>Recent Products</span>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="h-full">
                            <div className="flex items-center justify-between mb-3 sticky top-0 bg-white py-1 z-10">
                                <h2 className="text-base font-semibold text-gray-900">Recent Orders</h2>
                                <button onClick={() => setStep(0)} className="text-xs text-blue-600 font-medium">Back to Stats</button>
                            </div>
                            <div className="space-y-3 pb-4">
                                {recentOrders.length > 0 ? (
                                    recentOrders.map((order) => (
                                        <div key={order.id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{order.customer_name}</p>
                                                <p className="text-xs text-gray-500 capitalize">{order.status}</p>
                                            </div>
                                            <div className="text-right ml-3 text-xs">
                                                <p className="font-bold text-gray-900">₹{order.total_amount}</p>
                                                <p className="text-[10px] text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-sm text-gray-500 mt-10">No orders yet</p>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="h-full">
                            <div className="flex items-center justify-between mb-3 sticky top-0 bg-white py-1 z-10">
                                <h2 className="text-base font-semibold text-gray-900">Recently Added</h2>
                                <button onClick={() => setStep(0)} className="text-xs text-blue-600 font-medium">Back to Stats</button>
                            </div>
                            <div className="space-y-3 pb-4">
                                {recentProducts.length > 0 ? (
                                    recentProducts.map((product) => (
                                        <div key={product.id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                                                <div className="flex items-center mt-1">
                                                    <span className={cn(
                                                        "px-1.5 py-0.5 rounded text-[10px] font-medium",
                                                        product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                                    )}>
                                                        Stock: {product.stock}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right ml-3">
                                                <p className="text-sm font-bold text-gray-900 text-xs">₹{product.price}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-sm text-gray-500 mt-10">No products yet</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title, value, trend, icon, compact = false
}: {
    title: string; value: string; trend: string; icon: React.ReactNode; compact?: boolean
}) {
    return (
        <div className={cn(
            "bg-white overflow-hidden rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md",
            compact ? "p-3 sm:p-4" : "p-5"
        )}>
            <div className="flex items-start justify-between">
                <div className="min-w-0">
                    <p className={cn("font-medium text-gray-500 truncate", compact ? "text-[11px]" : "text-sm")}>{title}</p>
                    <div className={cn("mt-1 flex items-baseline", compact ? "" : "mt-2")}>
                        <p className={cn("font-bold text-gray-900 truncate", compact ? "text-base sm:text-lg" : "text-2xl")}>{value}</p>
                    </div>
                </div>
                <div className={cn("bg-gray-50 rounded-lg flex-shrink-0", compact ? "p-1.5" : "p-3")}>
                    {icon}
                </div>
            </div>
            <div className={cn("flex items-center text-gray-500", compact ? "mt-1 text-[10px]" : "mt-4 text-sm")}>
                <span className="font-medium">{trend}</span>
            </div>
        </div>
    );
}

function RecentOrdersList({ orders }: { orders: Order[] }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                Recent Orders
                <ChevronRight className="h-4 w-4 text-gray-400" />
            </h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {orders?.length > 0 ? orders.map((order) => (
                            <tr key={order.id}>
                                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.customer_name}</td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{order.status}</td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">₹{order.total_amount}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={3} className="py-4 text-center text-sm text-gray-500">No orders yet</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function RecentProductsList({ products }: { products: Product[] }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                Recently Added Products
                <ChevronRight className="h-4 w-4 text-gray-400" />
            </h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {products?.length > 0 ? products.map((product) => (
                            <tr key={product.id}>
                                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[200px]">{product.name}</td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                        {product.stock}
                                    </span>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">₹{product.price}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={3} className="py-4 text-center text-sm text-gray-500">No products yet</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
