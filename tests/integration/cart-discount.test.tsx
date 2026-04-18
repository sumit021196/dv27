import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { render, act } from "@testing-library/react";
import { CartProvider, useCart } from "../../components/cart/CartContext";

function TestComponent() {
  const cart = useCart();
  return (
    <div>
      <div data-testid="item-count">{cart.items.length}</div>
      <div data-testid="discount">{cart.discount}</div>
      <div data-testid="coupon">{cart.coupon || 'none'}</div>
      <button onClick={() => cart.add({ id: 1, name: "Product A", price: 100 }, 1)}>Add Item</button>
      <button onClick={() => cart.clear()}>Clear</button>
      <button onClick={() => cart.applyCoupon("TEST50")}>Apply Test50</button>
      <button onClick={() => cart.applyCoupon("")}>Remove Coupon</button>
    </div>
  );
}

// Mock Global Fetch for applyCoupon
const originalFetch = globalThis.fetch;
beforeEach(() => {
    globalThis.fetch = mock(async (url: string, options: any) => {
        if (url === '/api/coupons/validate') {
            const body = JSON.parse(options.body);
            if (body.code === 'TEST50') {
                 return new Response(JSON.stringify({
                     success: true,
                     coupon: { code: 'TEST50', discount_value: 50 }
                 }));
            }
            return new Response(JSON.stringify({ success: false, error: 'Invalid' }));
        }
        return originalFetch(url, options);
    });
});
afterEach(() => {
    globalThis.fetch = originalFetch;
});

// Mock Supabase
mock.module("../../utils/supabase/client", () => {
    const chainable = {
        select: () => chainable,
        eq: () => chainable,
        order: () => Promise.resolve({ data: [], error: null }),
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        ilike: () => chainable
    };
    return {
        createClient: () => ({
            auth: {
                getUser: async () => ({ data: { user: null } }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
            },
            from: () => chainable
        })
    }
});

describe("Cart discount integration tests", () => {
    beforeEach(() => {
        globalThis.localStorage.clear();
        document.body.innerHTML = '';
    });

    it("should apply coupon correctly via fetch mock", async () => {
        render(<CartProvider><TestComponent /></CartProvider>);

        await act(async () => {
            const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent === 'Add Item');
            btn?.click();
        });

        await act(async () => {
             const btnApply = Array.from(document.querySelectorAll('button')).find(el => el.textContent === 'Apply Test50');
             btnApply?.click();
        });

        expect(document.querySelector('[data-testid="discount"]')?.textContent).toBe("50");
        expect(document.querySelector('[data-testid="coupon"]')?.textContent).toBe("TEST50");
    });

    it("should remove coupon when an empty string is passed", async () => {
        render(<CartProvider><TestComponent /></CartProvider>);

        await act(async () => {
             const btnApply = Array.from(document.querySelectorAll('button')).find(el => el.textContent === 'Apply Test50');
             btnApply?.click();
        });

        expect(document.querySelector('[data-testid="coupon"]')?.textContent).toBe("TEST50");

        await act(async () => {
             const btnRemove = Array.from(document.querySelectorAll('button')).find(el => el.textContent === 'Remove Coupon');
             btnRemove?.click();
        });

        expect(document.querySelector('[data-testid="coupon"]')?.textContent).toBe("none");
        expect(document.querySelector('[data-testid="discount"]')?.textContent).toBe("0");
    });
});
