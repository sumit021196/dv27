import { createClient } from "@/utils/supabase/server";
import { IndianRupee, ShoppingCart, Package, Users } from "lucide-react";
import { cn } from "@/utils/cn";

export async function DashboardStats() {
    const supabase = await createClient();

    const [
        { data: rawRevenue },
        { count: activeOrdersCount },
        { count: productsCount },
        { count: customersCount }
    ] = await Promise.all([
        supabase
            .from('orders')
            .select('total_amount')
            .in('status', ['paid', 'processing', 'shipped', 'delivered']),
        supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .in('status', ['paid', 'processing', 'shipped']),
        supabase
            .from('products')
            .select('*', { count: 'exact', head: true }),
        supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('is_admin', false),
    ]);

    const totalRevenue = rawRevenue?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

    const stats = [
        { title: "Total Revenue", value: `₹${totalRevenue.toLocaleString('en-IN')}`, trend: "Lifetime", icon: IndianRupee },
        { title: "Active Orders", value: activeOrdersCount?.toString() || "0", trend: "Needs fulfillment", icon: ShoppingCart },
        { title: "Total Products", value: productsCount?.toString() || "0", trend: "Catalog size", icon: Package },
        { title: "Customers", value: customersCount?.toString() || "0", trend: "Store accounts", icon: Users },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
            {stats.map((stat, i) => (
                <div key={i} className="bg-white p-4 lg:p-5 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <div className="flex items-start justify-between">
                        <div className="min-w-0">
                            <p className="text-[11px] lg:text-sm font-medium text-gray-500 truncate">{stat.title}</p>
                            <div className="mt-1 flex items-baseline">
                                <p className="text-base lg:text-2xl font-bold text-gray-900 truncate">{stat.value}</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-1.5 lg:p-3 rounded-lg flex-shrink-0">
                            <stat.icon className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400" />
                        </div>
                    </div>
                    <div className="mt-1 lg:mt-4 text-[10px] lg:text-sm text-gray-500 font-medium">
                        {stat.trend}
                    </div>
                </div>
            ))}
        </div>
    );
}

export function DashboardStatsSkeleton() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-4 lg:p-5 rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 animate-pulse">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-gray-100 rounded w-1/2" />
                            <div className="h-6 bg-gray-100 rounded w-3/4" />
                        </div>
                        <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gray-50 rounded-lg" />
                    </div>
                    <div className="mt-4 h-3 bg-gray-50 rounded w-1/3" />
                </div>
            ))}
        </div>
    );
}
