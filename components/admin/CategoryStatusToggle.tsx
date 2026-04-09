"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface CategoryStatusToggleProps {
    categoryId: string | number;
    initialStatus: boolean;
}

export default function CategoryStatusToggle({ categoryId, initialStatus }: CategoryStatusToggleProps) {
    const [isActive, setIsActive] = useState(initialStatus);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        setIsLoading(true);
        const newStatus = !isActive;
        
        try {
            const res = await fetch(`/api/categories/${categoryId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: newStatus }),
            });

            if (!res.ok) throw new Error("Failed to update status");
            setIsActive(newStatus);
        } catch (error) {
            console.error("Error toggling category status:", error);
            alert("Failed to update category status.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggle();
            }}
            disabled={isLoading}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? 'bg-blue-600' : 'bg-gray-200'} ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
        >
            <span className="sr-only">Toggle category visibility</span>
            <span 
                className={`pointer-events-none relative inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-4' : 'translate-x-0'}`}
            >
                {isLoading && (
                    <span className="absolute inset-0 flex items-center justify-center">
                        <Loader2 size={10} className="animate-spin text-blue-600" />
                    </span>
                )}
            </span>
        </button>
    );
}
