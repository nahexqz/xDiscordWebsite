import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  roleName: string;
  image?: string;
}

interface ShopState {
  cart: CartItem[];
  couponCode: string;
  couponDiscount: number | null;
  couponType: "PERCENTAGE" | "FIXED" | null;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setCoupon: (code: string, discount: number, type: "PERCENTAGE" | "FIXED") => void;
  clearCoupon: () => void;
}

export const useShopStore = create<ShopState>()(
  persist(
    (set) => ({
      cart: [],
      couponCode: "",
      couponDiscount: null,
      couponType: null,

      addToCart: (item) =>
        set((state) => {
          if (state.cart.find((i) => i.productId === item.productId)) return state;
          return { cart: [...state.cart, item] };
        }),

      removeFromCart: (productId) =>
        set((state) => ({ cart: state.cart.filter((i) => i.productId !== productId) })),

      clearCart: () => set({ cart: [] }),

      setCoupon: (code, discount, type) =>
        set({ couponCode: code, couponDiscount: discount, couponType: type }),

      clearCoupon: () => set({ couponCode: "", couponDiscount: null, couponType: null }),
    }),
    {
      name: "lc-shop-store",
      partialize: (state) => ({
        couponCode: state.couponCode,
        couponDiscount: state.couponDiscount,
        couponType: state.couponType,
      }),
    }
  )
);
