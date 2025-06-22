// ✅ FILE: /src/context/CartContext.jsx
import React, { useEffect, useState, createContext, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        const parsedCart = JSON.parse(stored);
        // Check if cart contains mock/default data and clear it
        const hasMockData = parsedCart.some(item => 
          item.name === "iPhone 15 Pro Max" || 
          item.name === "AirPods Pro 2" ||
          item.price === 1199 ||
          item.price === 249
        );
        if (hasMockData) {
          localStorage.removeItem('cart');
          setCart([]);
        } else {
          setCart(parsedCart);
        }
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        localStorage.removeItem('cart');
        setCart([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        // Update quantity if item already exists
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item with full info
        const item = {
          id: product.id,
          name: product.name,
          mainPrice: Number(product.mainPrice || product.price),
          offerPrice: Number(product.offerPrice || product.price),
          quantity: 1,
          mainImageUrl: product.mainImageUrl,
          imageUrl: product.mainImage || product.imageUrl || product.image,
        };
        return [...prev, item];
      }
    });
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    localStorage.removeItem('cart');
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      setCart, 
      addToCart, 
      updateQuantity,
      removeFromCart,
      clearCart 
    }}>
      {children}
    </CartContext.Provider>
  );
};
