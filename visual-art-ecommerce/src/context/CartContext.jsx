import React, { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  // mock: total itens no carrinho
  const [cartCount, setCartCount] = useState(3);

  const value = useMemo(() => {
    return {
      cartCount,
      setCartCount,
      addOne: () => setCartCount((n) => n + 1),
      removeOne: () => setCartCount((n) => Math.max(0, n - 1)),
      clear: () => setCartCount(0),
    };
  }, [cartCount]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart deve ser usado dentro de <CartProvider>");
  return ctx;
}
