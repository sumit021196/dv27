export const couponClientService = {
  async getAllCoupons() {
    const res = await fetch('/api/coupons');
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || 'Failed to fetch coupons');
    return payload.coupons;
  },

  async createCoupon(coupon: any) {
    const res = await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coupon),
    });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || 'Failed to create coupon');
    return payload.coupon;
  },

  async updateCoupon(id: string, updates: any) {
    const res = await fetch(`/api/coupons/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || 'Failed to update coupon');
    return payload.coupon;
  },

  async deleteCoupon(id: string) {
    const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
    const payload = await res.json();
    if (!res.ok) throw new Error(payload.error || 'Failed to delete coupon');
    return true;
  }
};
