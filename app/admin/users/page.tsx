"use client";

import { useEffect, useState } from "react";
import { Users, Shield, Loader2, Mail, Phone, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/utils/cn";

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/users')
            .then(res => res.json())
            .then(data => {
                if (data.users) setUsers(data.users);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Page Header - Fixed */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl flex items-center gap-2">
                        <Users className="text-blue-600 h-6 w-6 lg:h-8 lg:w-8" />
                        Customers & Users
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                        {users.length} registered accounts
                    </p>
                </div>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col justify-center items-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                            <span className="text-gray-500 font-medium">Loading user directory...</span>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="h-full flex flex-col justify-center items-center p-12 text-center text-gray-500">
                            <Users size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-lg font-medium text-gray-900">No users found</p>
                        </div>
                    ) : (
                        <div>
                            {/* Desktop Table View */}
                            <div className="hidden md:block">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((u) => (
                                            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-sm shadow-sm">
                                                            {(u.full_name?.[0] || u.email?.[0] || '?').toUpperCase()}
                                                        </div>
                                                        <div className="text-sm font-semibold text-gray-900">
                                                            {u.full_name || "Unknown Name"}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 flex items-center gap-2">
                                                        <Mail size={14} className="text-gray-400" />
                                                        {u.email || "No email"}
                                                    </div>
                                                    {u.phone && (
                                                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                            <Phone size={12} className="text-gray-300" />
                                                            {u.phone}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={cn(
                                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border capitalize",
                                                        u.is_admin ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-gray-50 text-gray-700 border-gray-100'
                                                    )}>
                                                        {u.is_admin ? <Shield size={12} /> : null}
                                                        {u.is_admin ? 'Admin' : 'Customer'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 flex items-center gap-1.5 pt-7">
                                                    <Clock size={12} />
                                                    {u.created_at ? formatDistanceToNow(new Date(u.created_at), { addSuffix: true }) : 'Unknown'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-gray-100">
                                {users.map((u) => (
                                    <div key={u.id} className="p-4 flex items-center gap-4 active:bg-gray-50 transition-colors">
                                        <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-black text-lg shadow-sm">
                                            {(u.full_name?.[0] || u.email?.[0] || '?').toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h3 className="text-sm font-bold text-gray-900 truncate">{u.full_name || "Unknown Name"}</h3>
                                                {u.is_admin && (
                                                    <span className="bg-purple-50 text-purple-700 border border-purple-100 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                                        <Shield size={8} /> Admin
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate mt-0.5 flex items-center gap-1.5">
                                                <Mail size={12} className="text-gray-400" /> {u.email}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                                    <Clock size={10} /> {u.created_at ? formatDistanceToNow(new Date(u.created_at), { addSuffix: true }) : 'N/A'}
                                                </p>
                                                {u.phone && <p className="text-[10px] text-blue-600 font-bold">{u.phone}</p>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
