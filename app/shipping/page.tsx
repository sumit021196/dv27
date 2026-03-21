export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-black pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-white mb-12">Shipping</h1>
        <div className="prose prose-invert max-w-none text-white/60 uppercase tracking-widest text-sm leading-loose">
          <p>We ship nationwide across India.</p>
          <p>Standard delivery: 3-5 business days.</p>
          <p>Express delivery: 1-2 business days (available in select cities).</p>
        </div>
      </div>
    </main>
  );
}
