import { Package, Users, ShoppingCart, TrendingUp, IndianRupee } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    // Fetch basic stats
    // 1. Total Revenue (sum of all paid orders)
    const { data: rawRevenue } = await supabase
        .from('orders')
        .select('total_amount')
        .in('status', ['paid', 'processing', 'shipped', 'delivered']);

    const totalRevenue = rawRevenue?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

    // 2. Active Orders (paid/processing but not delivered/cancelled)
    const { count: activeOrdersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .in('status', ['paid', 'processing', 'shipped']);

    // 3. Total Products Count
    const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

    // 4. Total Customers (registered profiles)
    const { count: customersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_admin', false);
        
    // Recent Orders
    const { data: recentOrders } = await supabase
        .from('orders')
        .select('id, customer_name, total_amount, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

    // Recent Products
    const { data: recentProducts } = await supabase
        .from('products')
        .select('id, name, stock, price')
        .order('created_at', { ascending: false })
        .limit(5);


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                    Dashboard Overview
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                    Monitor your store&#39;s performance and manage activity.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Revenue"
                    value={`₹${totalRevenue.toLocaleString()}`}
                    trend="Lifetime"
                    trendUp={null}
                    icon={<IndianRupee className="h-6 w-6 text-gray-400" />}
                />
                <StatCard
                    title="Active Orders"
                    value={activeOrdersCount?.toString() || "0"}
                    trend="Needs fulfillment"
                    trendUp={null}
                    icon={<ShoppingCart className="h-6 w-6 text-gray-400" />}
                />
                <StatCard
                    title="Total Products"
                    value={productsCount?.toString() || "0"}
                    trend="Catalog size"
                    trendUp={null}
                    icon={<Package className="h-6 w-6 text-gray-400" />}
                />
                <StatCard
                    title="Registered Customers"
                    value={customersCount?.toString() || "0"}
                    trend="Store accounts"
                    trendUp={null}
                    icon={<Users className="h-6 w-6 text-gray-400" />}
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
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
                                {recentOrders?.map((order) => (
                                    <tr key={order.id}>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.customer_name}</td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{order.status}</td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">₹{order.total_amount}</td>
                                    </tr>
                                )) || (
                                    <tr><td colSpan={3} className="py-4 text-center text-sm text-gray-500">No orders yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recently Added Products</h2>
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
                                {recentProducts?.map((product) => (
                                    <tr key={product.id}>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[200px]">{product.name}</td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">₹{product.price}</td>
                                    </tr>
                                )) || (
                                    <tr><td colSpan={3} className="py-4 text-center text-sm text-gray-500">No products yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title, value, trend, trendUp, icon
}: {
    title: string; value: string; trend: string; trendUp: boolean | null; icon: React.ReactNode
}) {
    return (
        <div className="bg-white overflow-hidden rounded-xl shadow-sm border border-gray-100 p-5 transition-shadow hover:shadow-md">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
                    <div className="mt-2 flex items-baseline">
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                    </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                    {icon}
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
                {trendUp !== null && (
                    <span className={`font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                        {trend}
                    </span>
                )}
                {trendUp === null && (
                    <span className="font-medium text-gray-500">
                        {trend}
                    </span>
                )}
            </div>
        </div>
    );
}
