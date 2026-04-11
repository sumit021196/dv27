import { Loader2 } from "lucide-react";

export default function AdminLoading() {
    return (
        <div className="flex-1 flex justify-center items-center h-full min-h-[50vh]">
            <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
    );
}
