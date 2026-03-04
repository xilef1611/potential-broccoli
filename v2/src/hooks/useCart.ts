
"use client";
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

export function useCart() {
  const [cart, setCart] = useState<any[]>([]);

  const addToCart = useCallback((product: any, variant?: any, qty = 1) => {
    setCart(prev => {
      const key = `${product.id}-${variant?.id || "default"}`;
      const existing = prev.find(i => i.cartId === key);
      if (existing) {
        return prev.map(i => i.cartId === key ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...prev, {
        cartId: key,
        product_id: product.id,
        name: product.name,
        price: product.price + (variant?.price_modifier || 0),
        image_url: product.image_url,
        variant: variant || null,
        quantity: qty,
      }];
    });
  }, []);

  const removeFromCart = useCallback((cartId: string) => {
    setCart(prev => prev.filter(i => i.cartId !== cartId));
  }, []);

  const updateQty = useCallback((cartId: string, qty: number) => {
    setCart(prev => prev.map(i => i.cartId === cartId ? { ...i, quantity: qty } : i));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  return { cart, addToCart, removeFromCart, updateQty, clearCart };
}
