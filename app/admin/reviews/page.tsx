"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Trash2, Loader2, Star, Clock, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/utils/cn";

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await fetch('/api/reviews');
            const data = await res.json();
            if (data.reviews) setReviews(data.reviews);
        } catch (error) {
            console.error("Failed to load reviews", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;
        try {
            const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setReviews(reviews.filter(r => r.id !== id));
            } else {
                alert('Failed to delete review');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={12} className={cn(i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200")} />
        ));
    };

    return (
        <div className="flex flex-col h-full min-h-0">
            {/* Page Header - Fixed */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 flex-shrink-0">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl flex items-center gap-2">
                        <MessageSquare className="text-blue-600 h-6 w-6 lg:h-8 lg:w-8" />
                        Reviews Moderation
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500">
                        {reviews.length} total customer reviews
                    </p>
                </div>
            </div>

            {/* Content Area - Scrollable */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col justify-center items-center p-12 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                            <span className="text-gray-500 font-medium tracking-wide text-xs uppercase">Fetching feedback...</span>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="h-full flex flex-col justify-center items-center p-12 text-center text-gray-500">
                            <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-lg font-medium text-gray-900 uppercase">No reviews found</p>
                        </div>
                    ) : (
                        <div>
                            {/* Desktop Table View */}
                            <div className="hidden md:block">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Product & User</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Review</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-32">Rating</th>
                                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider w-24">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {reviews.map((review) => (
                                            <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-gray-900 mb-1 leading-tight">
                                                        {review.products?.name || "Unknown Product"}
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        By <span className="font-semibold text-gray-700">
                                                            {review.profiles?.first_name ? `${review.profiles.first_name} ${review.profiles.last_name || ''}` : "Anonymous User"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-xs text-gray-800 line-clamp-2 italic italic-font">
                                                        &ldquo;{review.comment || "No comment provided"}&rdquo;
                                                    </div>
                                                    <div className="mt-2 text-[10px] text-gray-400 flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-0.5">
                                                        {renderStars(review.rating)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button 
                                                        onClick={() => handleDelete(review.id)} 
                                                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all"
                                                        title="Delete Review"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden divide-y divide-gray-100">
                                {reviews.map((review) => (
                                    <div key={review.id} className="p-4 flex flex-col gap-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-bold text-gray-900 truncate">{review.products?.name || "Unknown Product"}</h3>
                                                <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <User size={10} /> {review.profiles?.first_name || "Anonymous"}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-0.5 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                                                {renderStars(review.rating)}
                                            </div>
                                        </div>
                                        <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100/50 italic text-[11px] text-gray-700 leading-relaxed">
                                            &ldquo;{review.comment || "No comment provided"}&rdquo;
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <p className="text-[9px] text-gray-400 flex items-center gap-1 uppercase tracking-widest">
                                                <Clock size={10} /> {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                                            </p>
                                            <button 
                                                onClick={() => handleDelete(review.id)}
                                                className="p-2 text-red-400 hover:bg-red-50 rounded-lg active:scale-95 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
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
