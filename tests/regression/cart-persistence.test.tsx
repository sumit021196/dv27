import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { render, act } from "@testing-library/react";
import { CartProvider, useCart } from "../../components/cart/CartContext";

function TestComponent() {
  const cart = useCart();
  return (
    <div>
      <div data-testid="item-count">{cart.items.length}</div>
      <div data-testid="discount">{cart.discount}</div>
      <button onClick={() => cart.add({ id: 1, name: "Product A", price: 100 }, 1)}>Add Item</button>
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

describe("Cart regression tests", () => {
    beforeEach(() => {
        globalThis.localStorage.clear();
        document.body.innerHTML = '';
    });

    it("should initialize items from localStorage (regression)", async () => {
        // Pre-populate local storage
        globalThis.localStorage.setItem("cart", JSON.stringify([{ id: 99, name: "Persisted Item", price: 50, qty: 2 }]));

        render(<CartProvider><TestComponent /></CartProvider>);

        // Wait for next tick so effect runs
        await act(async () => {
            await new Promise(r => setTimeout(r, 10));
        });

        expect(document.querySelector('[data-testid="item-count"]')?.textContent).toBe("1");
    });
});
