import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { render, act } from "@testing-library/react";
import { CartProvider, useCart } from "../../components/cart/CartContext";

function TestComponent() {
  const cart = useCart();
  return (
    <div>
      <div data-testid="item-count">{cart.items.length}</div>
      <button onClick={() => cart.add({ id: 1, name: "Product A", price: 100 }, 1)}>Add Item</button>
    </div>
  );
}

let triggerAuthChange: (event: string, session: any) => void;

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
                onAuthStateChange: (callback: any) => {
                    triggerAuthChange = callback;
                    return { data: { subscription: { unsubscribe: () => {} } } };
                }
            },
            from: () => chainable
        })
    }
});

describe("Cart state transition tests", () => {
    beforeEach(() => {
        globalThis.localStorage.clear();
        document.body.innerHTML = '';
    });

    it("should clear cart when auth state changes to SIGNED_OUT", async () => {
        render(<CartProvider><TestComponent /></CartProvider>);

        await act(async () => {
            const btn = Array.from(document.querySelectorAll('button')).find(el => el.textContent === 'Add Item');
            btn?.click();
        });

        expect(document.querySelector('[data-testid="item-count"]')?.textContent).toBe("1");

        await act(async () => {
            triggerAuthChange('SIGNED_OUT', null);
        });

        expect(document.querySelector('[data-testid="item-count"]')?.textContent).toBe("0");
    });
});
