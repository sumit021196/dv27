import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface SizingChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

export default function SizingChartModal({ isOpen, onClose, productName }: SizingChartModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl"
        >
          <div className="p-6 border-b border-foreground/5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter">Sizing Chart</h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">{productName || "Standard Fit"}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-foreground/5">
                  <th className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Size</th>
                  <th className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Chest (in)</th>
                  <th className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Length (in)</th>
                  <th className="py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Shoulder (in)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {[
                  { size: "XS", chest: "38", length: "26", shoulder: "17.5" },
                  { size: "S", chest: "40", length: "27", shoulder: "18.5" },
                  { size: "M", chest: "42", length: "28", shoulder: "19.5" },
                  { size: "L", chest: "44", length: "29", shoulder: "20.5" },
                  { size: "XL", chest: "46", length: "30", shoulder: "21.5" },
                  { size: "XXL", chest: "48", length: "31", shoulder: "22.5" },
                ].map((row) => (
                  <tr key={row.size} className="hover:bg-muted/30 transition-colors">
                    <td className="py-4 text-xs font-black">{row.size}</td>
                    <td className="py-4 text-xs font-bold text-muted-foreground">{row.chest}</td>
                    <td className="py-4 text-xs font-bold text-muted-foreground">{row.length}</td>
                    <td className="py-4 text-xs font-bold text-muted-foreground">{row.shoulder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="mt-8 p-4 bg-muted/30 rounded-2xl border border-foreground/5">
                <h4 className="text-[10px] font-black uppercase tracking-widest mb-2">How to measure:</h4>
                <p className="text-[9px] font-bold text-muted-foreground uppercase leading-relaxed tracking-wider">
                  Chest: Measure around the fullest part of your chest, keeping the tape horizontal.<br/>
                  Length: Measure from the highest point of the shoulder down to the hem.
                </p>
            </div>
          </div>
          
          <div className="p-6 bg-muted/20 border-t border-foreground/5">
            <button 
              onClick={onClose}
              className="w-full py-4 bg-foreground text-background rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-accent hover:text-white transition-all shadow-xl"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
