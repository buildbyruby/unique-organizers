"use client"
import { createContext, useContext, useState, useEffect } from 'react';

type CartItem = {
  id: string; // Composite ID: productId-color-tier-size
  productId: string;
  name: string;
  price: number;
  retailPrice: number;
  wholesalePrice?: number;
  minWholesale?: number;
  quantity: number;
  color?: string;
  size?: string;
  image: string;
  pricingTier: 'retail' | 'wholesale';
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, color: string, quantity: number, pricingTier: 'retail' | 'wholesale', size?: string) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  checkout: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | null>(null);

function resolveTierAndPrice(
  baseTier: 'retail' | 'wholesale',
  qty: number,
  retailPrice: number,
  wholesalePrice?: number,
  minWholesale?: number
): { tier: 'retail' | 'wholesale'; price: number } {
  const minQty = minWholesale && minWholesale > 0 ? minWholesale : 5;
  if ((baseTier === 'wholesale' || qty >= minQty) && wholesalePrice && wholesalePrice > 0 && qty >= minQty) {
    return { tier: 'wholesale', price: wholesalePrice };
  }
  return { tier: 'retail', price: retailPrice };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('unique-cart-v2');
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse cart storage", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('unique-cart-v2', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (
    product: any,
    color: string,
    quantity: number,
    pricingTier: 'retail' | 'wholesale',
    size?: string
  ) => {
    const safeQty = Math.max(1, Number(quantity) || 1);
    const retailPrice = Number(product.retailPrice) || 0;
    const wholesalePrice = Number(product.wholesalePrice) || 0;
    const minWholesale = Number(product.minWholesale) || 5;
    const resolvedColor = color || 'Standard';
    const resolvedSize = size || 'N/A';
    const firstImg = Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : product.image || '';

    setCart(prev => {
      const matchIndex = prev.findIndex(
        item =>
          item.productId === product.id &&
          (item.color || 'Standard') === resolvedColor &&
          (item.size || 'N/A') === resolvedSize
      );

      if (matchIndex > -1) {
        const current = prev[matchIndex];
        const nextQty = current.quantity + safeQty;
        const effectiveTier = nextQty >= minWholesale && wholesalePrice > 0 ? 'wholesale' : pricingTier;
        const { tier, price } = resolveTierAndPrice(
          effectiveTier,
          nextQty,
          current.retailPrice || retailPrice,
          current.wholesalePrice || wholesalePrice,
          current.minWholesale || minWholesale
        );
        const compositeId = `${product.id}-${resolvedColor}-${tier}-${resolvedSize}`;
        const updated = [...prev];
        updated[matchIndex] = {
          ...current,
          id: compositeId,
          quantity: nextQty,
          pricingTier: tier,
          price,
        };
        return updated;
      }

      const { tier, price } = resolveTierAndPrice(
        pricingTier,
        safeQty,
        retailPrice,
        wholesalePrice,
        minWholesale
      );
      const compositeId = `${product.id}-${resolvedColor}-${tier}-${resolvedSize}`;

      return [
        ...prev,
        {
          id: compositeId,
          productId: product.id,
          name: product.name,
          price,
          retailPrice,
          wholesalePrice,
          minWholesale,
          quantity: safeQty,
          color: resolvedColor,
          size: resolvedSize,
          image: firstImg,
          pricingTier: tier,
        },
      ];
    });

    setIsOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const newQty = Math.max(1, item.quantity + delta);
        const { tier, price } = resolveTierAndPrice(
          item.pricingTier,
          newQty,
          item.retailPrice ?? item.price,
          item.wholesalePrice,
          item.minWholesale
        );
        return {
          ...item,
          quantity: newQty,
          pricingTier: tier,
          price,
        };
      })
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  const cartTotal = cart.reduce((acc, item) => acc + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);

  const checkout = () => {
    if (cart.length === 0) return;

    const phone = "254797517565";
    let message = `*NEW ORDER FROM UNIQUE ORGANIZERS* 📦%0A`;
    message += `--------------------------------%0A%0A`;

    cart.forEach((item, index) => {
      const lineTotal = item.price * item.quantity;
      message += `*${index + 1}. ${item.name.toUpperCase()}*%0A`;
      message += `   Attributes: ${item.color}${item.size && item.size !== 'N/A' ? ` | Size: ${item.size}` : ''}%0A`;
      message += `   Pricing: ${item.pricingTier.toUpperCase()}%0A`;
      message += `   Qty: ${item.quantity} x KSh ${item.price.toLocaleString()}%0A`;
      message += `   Subtotal: *KSh ${lineTotal.toLocaleString()}*%0A%0A`;
    });

    message += `--------------------------------%0A`;
    message += `💰 *GRAND TOTAL: KSh ${cartTotal.toLocaleString()}*%0A`;
    message += `--------------------------------%0A%0A`;
    message += `_Please confirm availability for delivery._`;

    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      checkout,
      isOpen,
      setIsOpen,
      cartCount,
      cartTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
