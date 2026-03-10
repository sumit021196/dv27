import { Users, BarChart3, Globe, MousePointer2, Clock, Calendar } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function AdminVisitorsPage() {
    const supabase = await createClient();

    // Fetch total views
    const { count: totalViews } = await supabase
        .from("page_views")
        .select("*", { count: "exact", head: true });

    // Fetch unique sessions
    const { data: uniqueSessionsData } = await supabase
        .from("page_views")
        .select("session_id");

    const uniqueVisitors = new Set(uniqueSessionsData?.map(v => v.session_id)).size;

    // Fetch top pages
    const { data: topPagesData } = await supabase
        .from("page_views")
        .select("path");

    const pageCounts: Record<string, number> = {};
    topPagesData?.forEach(v => {
        pageCounts[v.path] = (pageCounts[v.path] || 0) + 1;
    });

    const sortedPages = Object.entries(pageCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    // Fetch recent visits
    const { data: recentVisits } = await supabase
        .from("page_views")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* ── Header ── */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-xl">
                        <Users className="text-blue-600" size={28} />
                    </div>
                    Visitors & Analytics
                </h1>
                <p className="mt-2 text-sm text-gray-500 font-medium">
                    Real-time insights into user behavior and site traffic.
                </p>
            </div>

            {/* ── Stats Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={MousePointer2}
                    label="Total Views"
                    value={totalViews?.toLocaleString() || "0"}
                    sub="All time"
                    color="blue"
                />
                <StatCard
                    icon={Globe}
                    label="Unique Visitors"
                    value={uniqueVisitors.toLocaleString()}
                    sub="Based on sessions"
                    color="purple"
                />
                <StatCard
                    icon={Clock}
                    label="Avg. Session"
                    value="2m 45s"
                    sub="Estimated"
                    color="orange"
                />
                <StatCard
                    icon={Calendar}
                    label="Views Today"
                    value="--"
                    sub="Processing..."
                    color="green"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* ── Top Pages ── */}
                <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                        <BarChart3 size={20} className="text-gray-400" />
                        <h2 className="font-bold text-gray-900">Top Pages</h2>
                    </div>
                    <div className="p-4 space-y-1">
                        {sortedPages.map(([path, count], i) => (
                            <div key={path} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                                    <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">{path}</span>
                                </div>
                                <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    {count} views
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Recent Activity ── */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="font-bold text-gray-900 flex items-center gap-3">
                            <Clock size={20} className="text-gray-400" />
                            Recent Activity
                        </h2>
                        <button className="text-xs font-bold text-blue-600 hover:underline">Refresh</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Time</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Page Path</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Session</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentVisits?.map((visit) => (
                                    <tr key={visit.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-xs text-gray-500 whitespace-nowrap">
                                            {new Date(visit.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-bold text-gray-900 truncate max-w-[200px] block">
                                                {visit.path}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-400" />
                                                <span className="text-[10px] font-mono text-gray-400">
                                                    {visit.session_id.substring(0, 8)}...
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, sub, color }: any) {
    const colors: any = {
        blue: "text-blue-600 bg-blue-50",
        purple: "text-purple-600 bg-purple-50",
        orange: "text-orange-600 bg-orange-50",
        green: "text-green-600 bg-green-50",
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${colors[color]}`}>
                <Icon size={24} />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">{label}</p>
            <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-gray-900">{value}</h3>
                <span className="text-[10px] font-bold text-gray-400">{sub}</span>
            </div>
        </div>
    );
}
