export default function TrackOrderPage() {
  return (
    <main className="min-h-screen bg-black pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white mb-12">Track Order</h1>
        <div className="max-w-md">
           <input 
            type="text" 
            placeholder="Enter Order ID or AWB" 
            className="w-full bg-transparent border-b border-white/20 py-4 text-2xl font-black uppercase outline-none focus:border-white transition-colors text-white"
           />
           <button className="mt-8 px-12 py-4 bg-white text-black font-black uppercase tracking-widest text-sm">
             Track Status
           </button>
        </div>
      </div>
    </main>
  );
}
