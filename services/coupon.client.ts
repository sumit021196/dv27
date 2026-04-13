export const couponClientService = {
  async getAllCoupons() {
    const res = await fetch('/api/coupons');
    if (!res.ok) throw new Error("Failed to fetch coupons");
    const data = await res.json();
    return data.coupons;
  },

  async createCoupon(coupon: any) {
    const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coupon)
    });
    if (!res.ok) throw new Error("Failed to create coupon");
    const data = await res.json();
    return data.coupon;
  },

  async updateCoupon(id: string, updates: any) {
    const res = await fetch(`/api/coupons/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error("Failed to update coupon");
    const data = await res.json();
    return data.coupon;
  },

  async deleteCoupon(id: string) {
    const res = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error("Failed to delete coupon");
    return true;
  }
};
