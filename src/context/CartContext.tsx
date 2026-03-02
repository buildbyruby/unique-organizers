"use client"
import { createContext, useContext, useState, useEffect } from 'react';

type CartItem = {
  id: string; // Composite ID: productId-color-tier-size
  productId: string;
  name: string;
  price: number;
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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Persistence: Load cart from LocalStorage
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

  // Persistence: Save cart to LocalStorage
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
    const activePrice = pricingTier === 'wholesale' ? product.wholesalePrice : product.retailPrice;

    setCart(prev => {
      // Composite key ensures unique variants (different colors/sizes) are distinct items
      const compositeId = `${product.id}-${color}-${pricingTier}-${size || 'none'}`;
      
      const existingIndex = prev.findIndex(item => item.id === compositeId);
      
      if (existingIndex > -1) {
        const updatedCart = [...prev];
        updatedCart[existingIndex].quantity += quantity;
        return updatedCart;
      }

      return [...prev, { 
        id: compositeId,
        productId: product.id,
        name: product.name, 
        price: activePrice, 
        quantity: quantity, 
        color: color || 'Standard', 
        size: size || 'N/A',
        image: product.images[0],
        pricingTier: pricingTier
      }];
    });
    
    // Open drawer to show success, but do not redirect
    setIsOpen(true); 
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const checkout = () => {
    if (cart.length === 0) return;

    const phone = "254797517565"; 
    let message = `*NEW ORDER FROM UNIQUE ORGANIZERS* 📦%0A`;
    message += `--------------------------------%0A%0A`;

    cart.forEach((item, index) => {
      const lineTotal = item.price * item.quantity;
      message += `*${index + 1}. ${item.name.toUpperCase()}*%0A`;
      message += `   Attributes: ${item.color}${item.size !== 'N/A' ? ` | Size: ${item.size}` : ''}%0A`;
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
      cartTotal
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