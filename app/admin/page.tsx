import { Suspense } from "react";
import DashboardOverview from "@/components/admin/DashboardOverview";
import { DashboardStats, DashboardStatsSkeleton } from "@/components/admin/DashboardStats";
import { DashboardRecent, DashboardRecentSkeleton } from "@/components/admin/DashboardRecent";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    return (
        <DashboardOverview>
            <Suspense fallback={<DashboardStatsSkeleton />}>
                <DashboardStats />
            </Suspense>

            <Suspense fallback={<DashboardRecentSkeleton />}>
                <DashboardRecent />
            </Suspense>
        </DashboardOverview>
    );
}
