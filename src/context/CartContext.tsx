"use client"
import { createContext, useContext, useState, useEffect } from 'react';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  color?: string;
  image: string;
  pricingTier: 'retail' | 'wholesale';
}

const CartContext = createContext<any>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('unique-cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('unique-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any, color: string, quantity: number, pricingTier: 'retail' | 'wholesale') => {
    const activePrice = pricingTier === 'wholesale' ? product.wholesalePrice : product.retailPrice;

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.color === color && item.pricingTier === pricingTier);
      
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.color === color && item.pricingTier === pricingTier) 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prev, { 
        id: product.id, 
        name: product.name, 
        price: activePrice, 
        quantity: quantity, 
        color: color, 
        image: product.images?.[0] || "/placeholder-product.jpg",
        pricingTier: pricingTier
      }];
    });
    
    // MOVE THIS HERE: Always open the sidebar when adding
    setIsOpen(true); 
  };

  const removeFromCart = (id: string, color: string, pricingTier: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.color === color && item.pricingTier === pricingTier)));
  };

  const checkout = () => {
    const phone = "254797517565"; 
    let message = `*NEW SYSTEM ORDER* 📦%0A%0A`;
    let total = 0;

    cart.forEach(item => {
      const lineTotal = item.price * item.quantity;
      total += lineTotal;
      message += `▫️ ${item.quantity}x *${item.name}*%0A`;
      message += `   Type: ${item.pricingTier.toUpperCase()}%0A`;
      if(item.color) message += `   Variant: ${item.color}%0A`;
      message += `   Subtotal: KSh ${lineTotal.toLocaleString()}%0A%0A`;
    });

    message += `💰 *GRAND TOTAL: KSh ${total.toLocaleString()}*%0A%0A`;
    message += `_Please confirm inventory availability._`;

    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, checkout, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);