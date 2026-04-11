"use client";

import React from "react";
import { cn } from "@/utils/cn";

export default function DashboardOverview({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-0">
            {/* Header info */}
            <div className="mb-6 lg:mb-8 pt-1 lg:pt-0">
                <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
                    Dashboard Overview
                </h1>
                <p className="mt-1 text-xs lg:text-sm text-gray-500">
                    Monitor your store&#39;s performance.
                </p>
            </div>

            {/* Content Area - Natural Scroll (handled by main layout) */}
            <div className="space-y-6 lg:space-y-8">
                {children}
            </div>
        </div>
    );
}
