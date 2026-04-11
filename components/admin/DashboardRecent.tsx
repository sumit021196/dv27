import { createClient } from "@/utils/supabase/server";
import { ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

export async function DashboardRecent() {
    const supabase = await createClient();

    const [
        { data: recentOrders },
        { data: recentProducts }
    ] = await Promise.all([
        supabase
            .from('orders')
            .select('id, customer_name, total_amount, status, created_at')
            .order('created_at', { ascending: false })
            .limit(5),
        supabase
            .from('products')
            .select('id, name, stock, price')
            .order('created_at', { ascending: false })
            .limit(5)
    ]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                    Recent Orders
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                </h2>
                <div className="space-y-3">
                    {recentOrders?.length ? recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{order.customer_name}</p>
                                <p className="text-xs text-gray-500 capitalize">{order.status}</p>
                            </div>
                            <div className="text-right ml-3">
                                <p className="text-sm font-bold text-gray-900">₹{order.total_amount}</p>
                                <p className="text-[10px] text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    )) : <p className="text-sm text-gray-500 py-4 text-center">No recent orders</p>}
                </div>
            </div>

            {/* Recent Products */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                    Recently Added
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                </h2>
                <div className="space-y-3">
                    {recentProducts?.length ? recentProducts.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
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
                            <div className="text-right ml-4">
                                <p className="text-sm font-bold text-gray-900">₹{product.price}</p>
                            </div>
                        </div>
                    )) : <p className="text-sm text-gray-500 py-4 text-center">No recent products</p>}
                </div>
            </div>
        </div>
    );
}

export function DashboardRecentSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
                    <div className="h-6 bg-gray-100 rounded w-1/3 mb-4" />
                    <div className="space-y-3">
                        {[1, 2, 3].map((j) => (
                            <div key={j} className="h-16 bg-gray-50 rounded-lg" />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
