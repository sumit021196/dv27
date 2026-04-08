export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-black pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-12">Return Policy</h1>
        <div className="prose prose-invert max-w-none text-white/70 tracking-wide text-sm leading-relaxed space-y-8">
          <p className="text-white">At thedv27.in, we strive to provide you with the highest quality products. However, if you are not entirely satisfied with your purchase, we are here to help.</p>
          
          <div>
            <h2 className="text-xl font-bold text-white mb-3 uppercase tracking-widest text-brand-red">1. Return Window</h2>
            <p>Return requests must be initiated within 48 hours of delivery.</p>
            <p>Requests made after this period will not be eligible for a return or replacement.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3 uppercase tracking-widest text-brand-red">2. Conditions for Return</h2>
            <p>To be eligible for a return, your item must meet the following criteria:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>The product must be unused, unwashed, and in the same condition that you received it.</li>
              <li>It must be in the original packaging with all tags, labels, and the invoice intact.</li>
              <li>Returns are only accepted in cases of manufacturing defects, transit damage, or incorrect item delivery.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3 uppercase tracking-widest text-brand-red">3. Refund Policy</h2>
            <ul className="space-y-2">
              <li><strong className="text-white">Quality Inspection:</strong> Once we receive your returned item, it will undergo a quality check. Approval or rejection of your refund will depend on the product's condition.</li>
              <li><strong className="text-white">Refund Mode:</strong> Approved refunds will be processed to your original method of payment within 5-7 business days.</li>
              <li><strong className="text-white">Shipping Costs:</strong> Please note that original shipping charges are non-refundable. If the return is due to a "change of mind" and not a technical error on our part, the cost of return shipping will be deducted from your refund.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3 uppercase tracking-widest text-brand-red">4. Non-Returnable Items</h2>
            <p>For hygiene and business safety, the following cannot be returned:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Items purchased during a Sale or using a discount code.</li>
              <li>Personal care, innerwear, or hygiene-related products.</li>
              <li>Customized or personalized orders.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3 uppercase tracking-widest text-brand-red">5. Mandatory Unboxing Video</h2>
            <p>To protect against fraudulent claims, a clear, unedited unboxing video is mandatory for any claims regarding missing items or physical damage during transit. Without this video, we reserve the right to decline the request.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-3 uppercase tracking-widest text-brand-red">6. How to Initiate a Return</h2>
            <p>Please contact our support team at <a href="mailto:thedv27.official@gmail.com" className="text-brand-accent hover:underline">thedv27.official@gmail.com</a> with your Order ID and the unboxing video/images.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
