"use client";
/* eslint-disable react-hooks/set-state-in-effect */
// src/components/cart/CartContext.tsx
// Global cart state provider — syncs with DB via Server Actions

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useAuth } from "@clerk/nextjs";
import {
  getCartAction,
  addToCartAction,
  removeFromCartAction,
  updateCartQuantityAction,
  clearCartAction,
} from "@/actions/cart";
import type { CartItemWithProduct } from "@/types/cart";

interface CartContextValue {
  items: CartItemWithProduct[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (productId: string, quantity?: number, size?: string) => Promise<{ success: boolean; error?: string }>;
  removeItem: (productId: string, size?: string) => Promise<void>;
  updateQty: (productId: string, quantity: number, size?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasFetched = useRef(false);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.basePrice * i.quantity, 0);

  const refreshCart = useCallback(async () => {
    if (!isSignedIn) {
      setItems([]);
      return;
    }
    try {
      const result = await getCartAction();
      if (result.success) {
        setItems(result.items);
      }
    } catch (err) {
      console.error("CartContext: failed to refresh cart", err);
    }
  }, [isSignedIn]);

  // Fetch cart when auth state changes
  useEffect(() => {
    if (isSignedIn && !hasFetched.current) {
      hasFetched.current = true;
      refreshCart();
    } else if (!isSignedIn) {
      hasFetched.current = false;
      setItems([]);
    }
  }, [isSignedIn, refreshCart]);

  const addItem = useCallback(
    async (productId: string, quantity = 1, size = "") => {
      if (!isSignedIn) return { success: false, error: "Please sign in to add items to cart." };
      setIsLoading(true);
      try {
        const result = await addToCartAction(productId, quantity, size);
        if (result.success) {
          await refreshCart();
          setIsOpen(true);
        }
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    [isSignedIn, refreshCart]
  );

  const removeItem = useCallback(
    async (productId: string, size = "") => {
      setIsLoading(true);
      try {
        await removeFromCartAction(productId, size);
        setItems((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateQty = useCallback(
    async (productId: string, quantity: number, size = "") => {
      setIsLoading(true);
      try {
        const result = await updateCartQuantityAction(productId, quantity, size);
        if (result.success) {
          if (quantity < 1) {
            setItems((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)));
          } else {
            setItems((prev) =>
              prev.map((i) => (i.productId === productId && i.size === size ? { ...i, quantity } : i))
            );
          }
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearCart = useCallback(async () => {
    setIsLoading(true);
    try {
      await clearCartAction();
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((v) => !v), []);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        isOpen,
        isLoading,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
