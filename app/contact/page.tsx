export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white mb-12">Contact</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white mb-4">Email Us</h3>
            <p className="text-lg text-white/60 italic">support@thedv27.com</p>
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white mb-4">Location</h3>
            <p className="text-lg text-white/60 italic">New Delhi, India</p>
          </div>
        </div>
      </div>
    </main>
  );
}
