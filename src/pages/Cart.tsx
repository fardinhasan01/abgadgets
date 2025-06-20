import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import BottomNav from '@/components/BottomNav';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart } = useCart();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Load cart items from context
    setCartItems(cart);
  }, [cart]);

  // Clear any leftover default values from localStorage
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        // Check if cart contains mock/default data and clear it
        const hasMockData = parsedCart.some(item => 
          item.name === "iPhone 15 Pro Max" || 
          item.name === "AirPods Pro 2" ||
          item.price === 1199 ||
          item.price === 249
        );
        if (hasMockData) {
          localStorage.removeItem('cart');
          // The context will handle clearing the cart
        }
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  const handleUpdateQuantity = (id, newQuantity) => {
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id) => {
    removeFromCart(id);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.mainPrice * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-black/30 backdrop-blur-lg border-b border-blue-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              AB GADGETS
            </Link>
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/" className="text-gray-300 hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
              <Link to="/shop" className="text-gray-300 hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors">Shop</Link>
              <Link to="/cart" className="text-blue-300 hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors">Cart</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <ShoppingBag className="w-8 h-8 text-blue-400 mr-3" />
          <h1 className="text-4xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Shopping Cart
            </span>
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-400 mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Add some amazing gadgets to get started!</p>
            <Link to="/shop">
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="bg-gray-800/30 backdrop-blur-lg border border-blue-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.imageUrl || item.mainImage}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                        <p className="text-blue-400 font-bold text-xl">৳{new Intl.NumberFormat('en-US').format(Number(item.mainPrice))}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="border-gray-600 text-white hover:bg-gray-700"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-white font-semibold w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="border-gray-600 text-white hover:bg-gray-700"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-800/30 backdrop-blur-lg border border-blue-500/20 sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between text-gray-300">
                      <span>Subtotal</span>
                      <span>৳{new Intl.NumberFormat('en-US').format(subtotal.toFixed(2))}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? 'Free' : `৳${new Intl.NumberFormat('en-US').format(shipping.toFixed(2))}`}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Tax</span>
                      <span>৳{new Intl.NumberFormat('en-US').format(tax.toFixed(2))}</span>
                    </div>
                    <div className="border-t border-gray-600 pt-4">
                      <div className="flex justify-between text-white font-bold text-lg">
                        <span>Total</span>
                        <span>৳{new Intl.NumberFormat('en-US').format(total.toFixed(2))}</span>
                      </div>
                    </div>
                  </div>

                  {shipping > 0 && (
                    <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-blue-300 text-sm">
                        Add ৳{new Intl.NumberFormat('en-US').format((100 - subtotal).toFixed(2))} more for free shipping!
                      </p>
                    </div>
                  )}

                  <Link to="/checkout" className="block mt-6">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center">
                      Proceed to Checkout
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>

                  <Link to="/shop" className="block mt-3">
                    <Button variant="outline" className="w-full border-blue-400 text-blue-400 hover:bg-blue-400/10 py-3 rounded-lg font-semibold transition-all duration-300">
                      Continue Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Cart;
