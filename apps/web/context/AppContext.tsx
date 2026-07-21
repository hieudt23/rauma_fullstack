"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "BANNED";
}

export interface AppProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  unit: string;
  image: string;
}

export interface CartItem {
  product: AppProduct;
  quantity: number;
}

const AUTH_SESSION_KEY = "auth_session";
const CART_KEY = "rauma_cart";

interface AppContextType {
  user: AppUser | null;
  hydrated: boolean;
  setUser: (user: AppUser | null) => void;
  loginAction: (userData: AppUser) => void;
  logoutAction: () => void;
  cart: CartItem[];
  addToCart: (product: AppProduct) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const AppContext = createContext<AppContextType | null>(null);

function persistCart(cart: CartItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AppUser | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem(AUTH_SESSION_KEY);
      const storedCart = localStorage.getItem(CART_KEY);
      if (storedUser) {
        try {
          setUserState(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem(AUTH_SESSION_KEY);
        }
      }
      if (storedCart) {
        try {
          setCart(JSON.parse(storedCart));
        } catch {
          localStorage.removeItem(CART_KEY);
        }
      }
      setHydrated(true);
    }
  }, []);

  const setUser = useCallback((u: AppUser | null) => {
    setUserState(u);
    if (typeof window !== "undefined") {
      if (u) localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(u));
      else localStorage.removeItem(AUTH_SESSION_KEY);
    }
  }, []);

  const loginAction = useCallback(
    (userData: AppUser) => {
      setUser(userData);
    },
    [setUser]
  );

  const logoutAction = useCallback(() => {
    // Xóa cookie phiên phía server (nguồn danh tính thật), rồi dọn state client.
    if (typeof window !== "undefined") {
      fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    }
    setUser(null);
  }, [setUser]);

  const addToCart = useCallback((product: AppProduct) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.product.id === product.id);
      const updated = exists
        ? prev.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        : [...prev, { product, quantity: 1 }];
      persistCart(updated);
      return updated;
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => {
      const updated = prev.filter((i) => i.product.id !== productId);
      persistCart(updated);
      return updated;
    });
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity < 1) {
        removeFromCart(productId);
        return;
      }
      setCart((prev) => {
        const updated = prev.map((i) =>
          i.product.id === productId ? { ...i, quantity } : i
        );
        persistCart(updated);
        return updated;
      });
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    if (typeof window !== "undefined") localStorage.removeItem(CART_KEY);
  }, []);

  const cartTotal = cart.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  if (!hydrated) {
    return (
      <AppContext.Provider
        value={{
          user: null,
          hydrated: false,
          setUser,
          loginAction,
          logoutAction,
          cart: [],
          addToCart,
          removeFromCart,
          updateQuantity,
          clearCart,
          cartTotal: 0,
          cartCount: 0,
        }}
      >
        {children}
      </AppContext.Provider>
    );
  }

  return (
    <AppContext.Provider
      value={{
        user,
        hydrated: true,
        setUser,
        loginAction,
        logoutAction,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
