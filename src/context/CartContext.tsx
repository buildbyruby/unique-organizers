"use client"

import { createContext, useContext, useState, useEffect } from 'react';

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  color?: string; // Optional color
  image: string;
}

const CartContext = createContext<any>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from local storage on start
  useEffect(() => {
    const saved = localStorage.getItem('unique-cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  // Save cart whenever it changes
  useEffect(() => {
    localStorage.setItem('unique-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any, color: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.color === color);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.color === color) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      setIsOpen(true); // Open the cart drawer automatically
      return [...prev, { 
        id: product.id, 
        name: product.name, 
        price: product.retailPrice, 
        quantity: 1, 
        color, 
        image: product.images[0] 
      }];
    });
  };

  const removeFromCart = (id: string, color: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.color === color)));
  };

  // The Magic WhatsApp Generator
  const checkout = () => {
    const phone = "254797517565"; // Your Number
    let message = `*NEW WEB ORDER* 📦%0A%0A`;
    
    cart.forEach(item => {
      message += `▫️ ${item.quantity}x *${item.name}* ${item.color ? `(${item.color})` : ''}%0A`;
    });

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    message += `%0A💰 *TOTAL: KSh ${total.toLocaleString()}*`;
    message += `%0A%0A_Please confirm availability._`;

    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, checkout, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);