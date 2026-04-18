import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { render, act } from "@testing-library/react";
import { CartProvider, useCart } from "../../components/cart/CartContext";

function TestComponent() {
  const cart = useCart();
  return (
    <div>
      <div data-testid="item-count">{cart.items.length}</div>
      <button onClick={() => cart.add({ id: 1, name: "Product A", price: 100 }, 0)}>Add Zero</button>
      <button onClick={() => cart.add({ id: 2, name: "Product B", price: 200 }, -1)}>Add Negative</button>
      <button onClick={() => cart.clear()}>Clear Empty Cart</button>
      <button onClick={() => cart.remove("non-existent-id")}>Remove Non-existent</button>
    </div>
  );
}

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

describe("Cart edge cases tests", () => {
    beforeEach(() => {
        globalThis.localStorage.clear();
        document.body.innerHTML = '';
    });

    it("should handle adding zero quantities gracefully", async () => {
        render(<CartProvider><TestComponent /></CartProvider>);

        await act(async () => {
            const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent === 'Add Zero');
            btn?.click();
        });

        expect(document.querySelector('[data-testid="item-count"]')?.textContent).toBe("1");
    });

    it("should handle removing non-existent items without error", async () => {
        render(<CartProvider><TestComponent /></CartProvider>);

        await act(async () => {
            const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent === 'Remove Non-existent');
            btn?.click();
        });

        expect(document.querySelector('[data-testid="item-count"]')?.textContent).toBe("0");
    });

    it("should clear an already empty cart without error", async () => {
        render(<CartProvider><TestComponent /></CartProvider>);

        await act(async () => {
            const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent === 'Clear Empty Cart');
            btn?.click();
        });

        expect(document.querySelector('[data-testid="item-count"]')?.textContent).toBe("0");
    });
});
