"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Bell, Check, CheckSquare, Trash2, Package, AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "@/utils/cn";

interface Notification {
  id: string;
  type: "low_stock" | "out_of_stock";
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  metadata?: {
    product_id?: string;
    product_name?: string;
    variant_id?: string;
    size?: string;
    color?: string;
    stock?: number;
  };
}

export function AdminHeader() {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Map path to a premium user-friendly page title
  const getPageTitle = (path: string) => {
    if (path === "/admin") return "Overview Dashboard";
    if (path.startsWith("/admin/categories")) return "Category Directory";
    if (path.startsWith("/admin/products")) return "Product Catalog";
    if (path.startsWith("/admin/orders")) return "Order Fulfillment";
    if (path.startsWith("/admin/reviews")) return "Customer Reviews";
    if (path.startsWith("/admin/users")) return "Customer Registry";
    if (path.startsWith("/admin/banners")) return "Banner Showcase";
    if (path.startsWith("/admin/media")) return "Media Gallery";
    if (path.startsWith("/admin/coupons")) return "Promotional Coupons";
    if (path.startsWith("/admin/settings")) return "Settings Dashboard";
    return "Admin Panel";
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  // Polling for new notifications every 15 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Actions
  const markAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: true }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/notifications?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  // Format date helper
  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 600);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between transition-all duration-300">
      {/* Page Title */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 tracking-tight leading-none">
          {getPageTitle(pathname)}
        </h2>
        <p className="text-[10px] text-gray-600 mt-1 font-medium tracking-wide uppercase">
          Welcome Back Admin
        </p>
      </div>

      {/* Notifications trigger */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all relative",
            isOpen && "bg-gray-50 border-gray-200 shadow-sm"
          )}
          aria-label="Toggle notifications"
        >
          <Bell size={18} className="text-gray-600 transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse shadow-md">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 top-12 mt-2 w-80 sm:w-96 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 flex flex-col max-h-[480px]">
            {/* Dropdown Header */}
            <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-700 uppercase tracking-widest">
                Stock Alerts ({unreadCount} unread)
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors uppercase tracking-widest"
                >
                  <CheckSquare size={12} />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50/60 max-h-[350px]">
              {notifications.length > 0 ? (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "p-4 hover:bg-gray-50/30 flex items-start gap-3 transition-colors relative group/item",
                      !item.read ? "bg-blue-50/[0.12]" : "bg-transparent"
                    )}
                  >
                    {/* Icon Indicator based on type */}
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                        item.type === "out_of_stock"
                          ? "bg-red-50 text-red-500"
                          : "bg-amber-50 text-amber-500"
                      )}
                    >
                      {item.type === "out_of_stock" ? (
                        <AlertCircle size={16} />
                      ) : (
                        <AlertTriangle size={16} />
                      )}
                    </div>

                    {/* Alert Message */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "text-[10px] font-black uppercase tracking-wider",
                            item.type === "out_of_stock" ? "text-red-500" : "text-amber-500"
                          )}
                        >
                          {item.type === "out_of_stock" ? "Out of Stock" : "Low Stock"}
                        </span>
                        <span className="text-[8px] text-gray-600 font-medium">
                          {formatTimeAgo(item.created_at)}
                        </span>
                      </div>
                      
                      <h4 className="text-xs font-bold text-gray-800 mt-1 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[10px] text-gray-700 mt-0.5 leading-relaxed">
                        {item.message}
                      </p>

                      {/* Metadata / Specs & Action Link */}
                      <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                        {item.metadata?.size && (
                          <span className="bg-gray-100 text-gray-600 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                            Size: {item.metadata.size}
                          </span>
                        )}
                        {item.metadata?.color && (
                          <span className="bg-gray-100 text-gray-600 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                            Color: {item.metadata.color}
                          </span>
                        )}
                        {item.metadata?.stock !== undefined && (
                          <span className={cn(
                            "text-[8px] font-bold px-1.5 py-0.5 rounded uppercase",
                            item.metadata.stock === 0 ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
                          )}>
                            Stock: {item.metadata.stock}
                          </span>
                        )}
                        
                        {item.metadata?.product_id && (
                          <Link
                            href={`/admin/products/${item.metadata.product_id}`}
                            onClick={() => setIsOpen(false)}
                            className="text-[9px] font-black text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-0.5 ml-auto uppercase tracking-widest"
                          >
                            <Package size={10} />
                            Restock
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Quick Inline Actions */}
                    <div className="flex flex-col gap-1 items-center self-stretch justify-center opacity-0 group-hover/item:opacity-100 transition-opacity pl-1">
                      {!item.read && (
                        <button
                          onClick={(e) => markAsRead(item.id, e)}
                          title="Mark as read"
                          className="w-6 h-6 rounded-md hover:bg-emerald-50 hover:text-emerald-600 flex items-center justify-center text-gray-600 transition-all border border-transparent hover:border-emerald-100"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => deleteNotification(item.id, e)}
                        title="Delete alert"
                        className="w-6 h-6 rounded-md hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-gray-600 transition-all border border-transparent hover:border-red-100"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 px-6 text-center text-gray-600 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-3">
                    <Check size={22} className="stroke-[2.5]" />
                  </div>
                  <h4 className="text-xs font-bold text-gray-700">All caught up!</h4>
                  <p className="text-[10px] text-gray-600 mt-1 max-w-[200px]">
                    All product variants have healthy stock levels.
                  </p>
                </div>
              )}
            </div>

            {/* Dropdown Footer */}
            <div className="px-4 py-2.5 bg-gray-50/50 border-t border-gray-100 text-center">
              <Link
                href="/admin/products"
                onClick={() => setIsOpen(false)}
                className="text-[9px] font-black text-gray-600 hover:text-blue-600 hover:underline uppercase tracking-[0.15em] inline-flex items-center gap-1"
              >
                <Package size={11} />
                View Full Inventory Catalog
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
