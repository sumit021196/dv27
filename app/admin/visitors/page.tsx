import { Users } from "lucide-react";

export default function AdminVisitorsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl flex items-center gap-2">
                        <Users className="text-blue-600" />
                        Visitors & Analytics
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        Track user behavior and demographic data.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                    <Users size={32} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Analytics Upcoming</h2>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                    Detailed visitor analytics, bounce rates, and user demographics will be integrated here soon.
                </p>
            </div>
        </div>
    );
}
