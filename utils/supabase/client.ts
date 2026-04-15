import { createBrowserClient } from "@supabase/ssr";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * No-op lock: bypasses the Web Locks API (navigator.locks) entirely.
 *
 * WHY: Safari iOS + Chrome dev both time out (10s) when multiple components
 * (Navbar, CartContext, WishlistContext) concurrently try to acquire the same
 * auth lock. Since Next.js middleware handles session refresh server-side,
 * the client-side lock provides zero benefit and only causes hangs.
 *
 * TYPE: Matches Supabase's internal LockFunc signature exactly:
 *   (name: string, acquireTimeout: number, fn: () => Promise<T>) => Promise<T>
 */
const noopLock = async <T>(
  _name: string,
  _acquireTimeout: number,
  fn: () => Promise<T>
): Promise<T> => fn();

/**
 * Safari-safe storage adapter.
 * Safari in Private Browsing mode throws on localStorage.setItem()
 * with a QuotaExceededError (storage is available but zero-quota).
 * Fallback: sessionStorage (lives for the browser tab session).
 */
const safariSafeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      try { return sessionStorage.getItem(key); } catch { return null; }
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      try { sessionStorage.setItem(key, value); } catch { /* noop */ }
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      try { sessionStorage.removeItem(key); } catch { /* noop */ }
    }
  },
};

let client: ReturnType<typeof createBrowserClient> | undefined;

export const createClient = () => {
  if (client) return client;

  client = createBrowserClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Bypass browser lock — prevents 10s timeout on Safari + dev HMR
      lock: noopLock,
      // Safari private mode safe storage
      storage: safariSafeStorage,
    },
  });

  return client;
};
