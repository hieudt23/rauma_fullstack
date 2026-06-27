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

interface AppContextType {
  user: AppUser | null;
  setUser: (user: AppUser | null) => void;
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
    localStorage.setItem("rauma_cart", JSON.stringify(cart));
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AppUser | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("rauma_user");
      const storedCart = localStorage.getItem("rauma_cart");
      if (storedUser) {
        try {
          setUserState(JSON.parse(storedUser));
        } catch {}
      }
      if (storedCart) {
        try {
          setCart(JSON.parse(storedCart));
        } catch {}
      }
      setHydrated(true);
    }
  }, []);

  const setUser = useCallback((u: AppUser | null) => {
    setUserState(u);
    if (typeof window !== "undefined") {
      if (u) localStorage.setItem("rauma_user", JSON.stringify(u));
      else localStorage.removeItem("rauma_user");
    }
  }, []);

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
    if (typeof window !== "undefined") localStorage.removeItem("rauma_cart");
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
          setUser,
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
        setUser,
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
