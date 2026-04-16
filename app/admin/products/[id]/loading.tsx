import { Loader2 } from "lucide-react";

/**
 * Route-level loading boundary for /admin/products/[id]
 * This prevents the admin-root loading.tsx from hijacking the
 * full layout with a bare spinner every time a new product edit
 * page is navigated to.
 */
export default function EditProductLoading() {
    return (
        <div className="flex flex-1 justify-center items-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-xs text-gray-400 font-medium">Loading product…</p>
            </div>
        </div>
    );
}
