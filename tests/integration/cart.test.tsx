import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { render, screen, act } from "@testing-library/react";
import { CartProvider, useCart } from "../../components/cart/CartContext";

function TestComponent() {
  const cart = useCart();
  return (
    <div>
      <div data-testid="item-count">{cart.items.length}</div>
      <div data-testid="discount">{cart.discount}</div>
      <button onClick={() => cart.add({ id: 1, name: "Product A", price: 100 }, 1)}>Add Item</button>
      <button onClick={() => cart.clear()}>Clear</button>
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

describe("Cart integration tests", () => {
    beforeEach(() => {
        globalThis.localStorage.clear();
        document.body.innerHTML = '';
    });

    it("should start with 0 items", () => {
        render(<CartProvider><TestComponent /></CartProvider>);
        expect(document.querySelector('[data-testid="item-count"]')?.textContent).toBe("0");
    });

    it("should add an item to the cart", async () => {
        render(<CartProvider><TestComponent /></CartProvider>);

        await act(async () => {
            const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent === 'Add Item');
            btn?.click();
        });

        expect(document.querySelector('[data-testid="item-count"]')?.textContent).toBe("1");
    });
});
