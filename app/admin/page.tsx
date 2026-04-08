import { createClient } from "@/utils/supabase/server";
import DashboardOverview from "@/components/admin/DashboardOverview";

export default async function AdminDashboardPage() {
    const supabase = await createClient();

    // Fetch basic stats and lists in parallel to optimize time complexity
    const [
        { data: rawRevenue },
        { count: activeOrdersCount },
        { count: productsCount },
        { count: customersCount },
        { data: recentOrders },
        { data: recentProducts }
    ] = await Promise.all([
        // 1. Total Revenue (sum of all paid orders)
        supabase
            .from('orders')
            .select('total_amount')
            .in('status', ['paid', 'processing', 'shipped', 'delivered']),

        // 2. Active Orders (paid/processing but not delivered/cancelled)
        supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .in('status', ['paid', 'processing', 'shipped']),

        // 3. Total Products Count
        supabase
            .from('products')
            .select('*', { count: 'exact', head: true }),

        // 4. Total Customers (registered profiles)
        supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('is_admin', false),

        // Recent Orders
        supabase
            .from('orders')
            .select('id, customer_name, total_amount, status, created_at')
            .order('created_at', { ascending: false })
            .limit(5),

        // Recent Products
        supabase
            .from('products')
            .select('id, name, stock, price')
            .order('created_at', { ascending: false })
            .limit(5)
    ]);

    const totalRevenue = rawRevenue?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

    return (
        <DashboardOverview 
            totalRevenue={totalRevenue}
            activeOrdersCount={activeOrdersCount || 0}
            productsCount={productsCount || 0}
            customersCount={customersCount || 0}
            recentOrders={recentOrders || []}
            recentProducts={recentProducts || []}
        />
    );
}
