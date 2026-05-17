"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const SORT_OPTIONS = [
    { label: "Newest Arrivals", value: "newest" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
    { label: "Top Rated", value: "rating" }
];

export default function ProductToolbar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    
    const currentSort = searchParams.get('sort') || 'newest';
    const currentMinPrice = searchParams.get('min_price') || '';
    const currentMaxPrice = searchParams.get('max_price') || '';
    
    const [minPrice, setMinPrice] = useState(currentMinPrice);
    const [maxPrice, setMaxPrice] = useState(currentMaxPrice);

    const updateParams = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', '1'); // Reset to first page
        
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === '') {
                params.delete(key);
            } else {
                params.set(key, value);
            }
        });
        
        router.push(`/products?${params.toString()}`, { scroll: false });
    };

    const handleSort = (val: string) => {
        updateParams({ sort: val });
        setIsSortOpen(false);
    };

    const applyFilters = () => {
        updateParams({
            min_price: minPrice,
            max_price: maxPrice
        });
        setIsFilterOpen(false);
    };

    const clearFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        updateParams({
            min_price: null,
            max_price: null
        });
    };

    const activeSortLabel = SORT_OPTIONS.find(o => o.value === currentSort)?.label || "Sort";
    const hasActiveFilters = !!currentMinPrice || !!currentMaxPrice;

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 mb-8 relative z-30">
            {/* Filter Button */}
            <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-foreground/18 bg-background hover:bg-muted transition-colors text-[11px] font-black uppercase tracking-widest text-foreground md:w-auto w-full"
            >
                <SlidersHorizontal size={14} />
                Filters
                {hasActiveFilters && (
                    <span className="w-2 h-2 rounded-full bg-brand-accent ml-1" />
                )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative w-full md:w-auto">
                <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="flex items-center justify-between md:justify-center gap-4 px-5 py-3 rounded-xl border border-foreground/18 bg-background hover:bg-muted transition-colors text-[11px] font-black uppercase tracking-widest text-foreground w-full md:w-auto"
                >
                    <span className="flex items-center gap-2">
                        <span className="text-foreground/60 font-bold">Sort by:</span> {activeSortLabel}
                    </span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                    {isSortOpen && (
                        <>
                            {/* Backdrop for closing sort menu */}
                            <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 left-0 md:left-auto top-full mt-2 w-full md:w-56 bg-background rounded-2xl shadow-xl border border-foreground/12 overflow-hidden z-50"
                            >
                                {SORT_OPTIONS.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleSort(option.value)}
                                        className={`w-full text-left px-4 py-3.5 text-[11px] font-bold uppercase tracking-widest transition-colors ${currentSort === option.value ? 'bg-foreground/5 text-brand-accent' : 'text-foreground/70 hover:bg-foreground/5 hover:text-foreground'}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Filter Modal/Slide-over */}
            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setIsFilterOpen(false);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-background w-full max-w-md rounded-[2rem] shadow-2xl border border-foreground/18 overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-foreground/12">
                                <h3 className="text-sm font-black uppercase tracking-widest">Filter Collection</h3>
                                <button onClick={() => setIsFilterOpen(false)} className="p-2 -mr-2 text-foreground/50 hover:text-foreground bg-foreground/5 rounded-full">
                                    <X size={16} />
                                </button>
                            </div>
                            
                            <div className="p-6">
                                <h4 className="text-[11px] font-bold uppercase tracking-widest text-foreground/60 mb-4">Price Range</h4>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label className="text-[9px] font-bold text-foreground/60 uppercase tracking-widest mb-2 block">Min Price</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/60 font-bold">₹</span>
                                            <input 
                                                type="number" 
                                                value={minPrice}
                                                onChange={(e) => setMinPrice(e.target.value)}
                                                className="w-full bg-muted border border-transparent focus:border-foreground/20 rounded-2xl py-3.5 pl-10 pr-4 text-sm font-bold outline-none transition-all"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[9px] font-bold text-foreground/60 uppercase tracking-widest mb-2 block">Max Price</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/60 font-bold">₹</span>
                                            <input 
                                                type="number" 
                                                value={maxPrice}
                                                onChange={(e) => setMaxPrice(e.target.value)}
                                                className="w-full bg-muted border border-transparent focus:border-foreground/20 rounded-2xl py-3.5 pl-10 pr-4 text-sm font-bold outline-none transition-all"
                                                placeholder="Any"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-muted/30 flex items-center justify-between gap-4 border-t border-foreground/12">
                                <button 
                                    onClick={clearFilters}
                                    className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-foreground/60 hover:text-foreground transition-colors"
                                >
                                    Clear All
                                </button>
                                <button 
                                    onClick={applyFilters}
                                    className="flex-1 bg-foreground text-background px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
