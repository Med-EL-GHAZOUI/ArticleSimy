import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { PanierItem } from "../types";

interface CartContextType {
  itemCount: number;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [itemCount, setItemCount] = useState<number>(0);

  const refreshCart = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (!userId || !token) {
      setItemCount(0);
      return;
    }
    try {
      const r = await api.get(`/panier/${userId}`);
      const lignes: PanierItem[] = r.data?.lignes || [];
      const count = lignes.reduce((acc, curr) => acc + curr.quantite, 0);
      setItemCount(count);
    } catch {
      setItemCount(0);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  return (
    <CartContext.Provider value={{ itemCount, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
