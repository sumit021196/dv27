"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Camera, Plus, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/utils/cn";
import { productService } from "@/services/product.service";

interface ReviewFormProps {
  productId: string | number;
  productName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewForm({ productId, productName, isOpen, onClose, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 4) {
      setError("Maximum 4 images allowed");
      return;
    }
    
    setImages(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
    setError(null);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (comment.length < 10) {
      setError("Review must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("product_id", productId.toString());
    formData.append("rating", rating.toString());
    formData.append("comment", comment);
    images.forEach(img => formData.append("images", img));

    const result = await productService.submitReview(formData);
    
    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        // Reset form
        setRating(0);
        setComment("");
        setImages([]);
        setPreviews([]);
        setIsSuccess(false);
      }, 2000);
    } else {
      setError(result.error || "Something went wrong");
    }
    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 bg-background rounded-t-[32px] z-[101] max-h-[92vh] overflow-y-auto shadow-2xl safe-p-bottom"
          >
            <div className="sticky top-0 bg-background/80 backdrop-blur-md z-10 px-6 py-4 border-b border-foreground/5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.2em]">Review Studio</h2>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest truncate max-w-[200px]">{productName}</p>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <CheckCircle2 size={40} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tighter">Review Submitted!</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest mt-2">Your feedback is being reviewed by our team.</p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Rating Section */}
                  <div className="flex flex-col items-center space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Select Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="relative transition-transform active:scale-90"
                        >
                          <Star
                            size={32}
                            className={cn(
                              "transition-all duration-300",
                              (hoverRating || rating) >= star
                                ? "fill-brand-red text-brand-red"
                                : "fill-foreground/5 text-foreground/10"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment Section */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-1">Your Story</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us about the fit, quality, or how it looks in person..."
                      className="w-full bg-muted/30 border border-foreground/5 rounded-2xl p-4 text-xs font-medium placeholder:opacity-30 focus:outline-none focus:border-brand-accent/50 transition-all min-h-[120px] resize-none"
                    />
                  </div>

                  {/* Media Section */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Add Photos ({images.length}/4)</label>
                    </div>
                    
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-none w-24 h-24 rounded-2xl border-2 border-dashed border-foreground/10 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-muted/30 transition-all"
                      >
                        <Plus size={20} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Attach</span>
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageChange} 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                      />

                      {previews.map((preview, index) => (
                        <div key={index} className="flex-none w-24 h-24 rounded-2xl relative group bg-muted overflow-hidden">
                          <img src={preview} alt="preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    {error && (
                      <p className="text-[10px] text-brand-red font-black uppercase tracking-widest text-center mb-4">{error}</p>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-14 rounded-2xl bg-foreground text-background font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-brand-accent/10 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          POSTING...
                        </>
                      ) : (
                        "POST REVIEW"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
