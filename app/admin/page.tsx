import { Package, Users, ShoppingCart, TrendingUp } from "lucide-react";

export default function AdminDashboardPage() {
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
                {/* Stat Cards - using dummy data for now */}
                <StatCard
                    title="Total Revenue"
                    value="₹45,231"
                    trend="+20.1%"
                    trendUp={true}
                    icon={<TrendingUp className="h-6 w-6 text-gray-400" />}
                />
                <StatCard
                    title="Active Orders"
                    value="12"
                    trend="+3 this week"
                    trendUp={true}
                    icon={<ShoppingCart className="h-6 w-6 text-gray-400" />}
                />
                <StatCard
                    title="Total Products"
                    value="145"
                    trend="In Stock"
                    trendUp={null}
                    icon={<Package className="h-6 w-6 text-gray-400" />}
                />
                <StatCard
                    title="Unique Visitors"
                    value="892"
                    trend="+54.2%"
                    trendUp={true}
                    icon={<Users className="h-6 w-6 text-gray-400" />}
                />
            </div>

            {/* Main Content Area - Placeholders for future charts/tables */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales</h2>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <p className="text-sm text-gray-500">Sales Chart Placeholder</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h2>
                    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <p className="text-sm text-gray-500">Products List Placeholder</p>
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
                <span className="ml-2 text-gray-500">from last month</span>
            </div>
        </div>
    );
}
