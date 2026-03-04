import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ==========================================
// CART STORE
// ==========================================
export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, variant = null, quantity = 1) => {
        const key = `${product.id}-${variant?.id || 'none'}`;
        const items = get().items;
        const existing = items.find(i => i.key === key);

        if (existing) {
          set({
            items: items.map(i =>
              i.key === key ? { ...i, quantity: i.quantity + quantity } : i
            ),
          });
        } else {
          const price = parseFloat(product.price) + (variant ? parseFloat(variant.price_modifier || 0) : 0);
          set({
            items: [...items, {
              key,
              product_id: product.id,
              variant_id: variant?.id || null,
              name: product.name,
              variant_name: variant?.name || null,
              price,
              quantity,
              image: product.images?.[0] || null,
            }],
          });
        }
      },

      removeItem: (key) => {
        set({ items: get().items.filter(i => i.key !== key) });
      },

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) {
          get().removeItem(key);
          return;
        }
        set({ items: get().items.map(i => i.key === key ? { ...i, quantity } : i) });
      },

      clearCart: () => set({ items: [] }),

      getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'asklepios-cart' }
  )
);

// ==========================================
// AUTH STORE
// ==========================================
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      login: (user, token) => {
        set({ user, token });
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token);
          localStorage.setItem('auth_user', JSON.stringify(user));
        }
      },

      logout: () => {
        set({ user: null, token: null });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
        }
      },

      isAdmin: () => get().user?.role === 'admin',
      isLoggedIn: () => !!get().token,
    }),
    { name: 'asklepios-auth', partialize: (state) => ({ user: state.user, token: state.token }) }
  )
);
