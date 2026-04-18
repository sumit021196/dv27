import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { render, act } from "@testing-library/react";
import { CartProvider, useCart } from "../../components/cart/CartContext";

function TestComponent() {
  const cart = useCart();
  return (
    <div>
      <div data-testid="item-count">{cart.items.length}</div>
      <button id="add-btn" onClick={() => cart.add({ id: Math.random(), name: "Product A", price: 100 }, 1)}>Add Random Item</button>
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

describe("Cart stress tests", () => {
    beforeEach(() => {
        globalThis.localStorage.clear();
        document.body.innerHTML = '';
    });

    it("should handle adding 1000 items rapidly without crashing", async () => {
        render(<CartProvider><TestComponent /></CartProvider>);

        await act(async () => {
            const btn = document.getElementById('add-btn');
            for(let i = 0; i < 1000; i++) {
                btn?.click();
            }
        });

        expect(document.querySelector('[data-testid="item-count"]')?.textContent).toBe("1000");
    });
});
