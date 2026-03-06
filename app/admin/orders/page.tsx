import { ShoppingCart } from "lucide-react";

export default function AdminOrdersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl flex items-center gap-2">
                        <ShoppingCart className="text-blue-600" />
                        Orders Management
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        View and manage customer orders.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCart size={32} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">No Orders Yet</h2>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                    When customers place orders, they will appear here. You will be able to track shipping status and payment details.
                </p>
            </div>

            {/* Placeholder for Data Table */}
            <div className="mt-8 border border-gray-200 rounded-lg overflow-hidden hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/* Rows will go here */}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
