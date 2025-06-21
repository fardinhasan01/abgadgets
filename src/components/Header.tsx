import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Menu, X, Home, Store, List, Search } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart } = useCart();

  const cartItemCount = cart?.length || 0;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-md border-b border-orange-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img 
                src="/lovable-uploads/d3afd300-289e-412e-ab42-87bdeed21cda.png" 
                alt="AB Gadgets Logo" 
                className="w-12 h-12 rounded-xl shadow-lg transform group-hover:scale-110 transition-all duration-300 group-hover:rotate-3"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(249, 115, 22, 0.3))'
                }}
              />
              <div className="absolute inset-0 bg-orange-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent font-['Poppins']">
                AB GADGETS
              </h1>
              <p className="text-xs text-orange-600 font-medium -mt-1 font-['Inter']">Premium Gadgets</p>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              to="/" 
              className="flex items-center px-4 py-2 rounded-xl text-orange-700 hover:text-orange-600 text-sm font-medium transition-all duration-300 hover:bg-orange-50 group font-['Inter']"
            >
              <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Home
            </Link>
            <Link 
              to="/shop" 
              className="flex items-center px-4 py-2 rounded-xl text-orange-600 hover:text-orange-700 text-sm font-medium transition-all duration-300 hover:bg-orange-50 group font-['Inter']"
            >
              <Store className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Shop
            </Link>
            <Link 
              to="/categories" 
              className="flex items-center px-4 py-2 rounded-xl text-orange-600 hover:text-orange-700 text-sm font-medium transition-all duration-300 hover:bg-orange-50 group font-['Inter']"
            >
              <List className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Categories
            </Link>
            <Link 
              to="/cart" 
              className="flex items-center px-4 py-2 rounded-xl text-orange-600 hover:text-orange-700 text-sm font-medium transition-all duration-300 hover:bg-orange-50 group relative font-['Inter']"
            >
              <ShoppingCart className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Cart
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <Link 
              to="/admin/login" 
              className="flex items-center px-4 py-2 rounded-xl text-orange-600 hover:text-orange-700 text-sm font-medium transition-all duration-300 hover:bg-orange-50 group font-['Inter']"
            >
              <User className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Admin
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl transition-all duration-300"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-orange-200/50 mb-4 animate-slide-down">
            <div className="px-4 py-2 space-y-1">
              <Link 
                to="/" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-orange-700 hover:text-orange-600 text-sm font-medium transition-all duration-300 hover:bg-orange-50 font-['Inter']"
              >
                <Home className="w-4 h-4 mr-3" />
                Home
              </Link>
              <Link 
                to="/shop" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-orange-600 hover:text-orange-700 text-sm font-medium transition-all duration-300 hover:bg-orange-50 font-['Inter']"
              >
                <Store className="w-4 h-4 mr-3" />
                Shop
              </Link>
              <Link 
                to="/categories" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-orange-600 hover:text-orange-700 text-sm font-medium transition-all duration-300 hover:bg-orange-50 font-['Inter']"
              >
                <List className="w-4 h-4 mr-3" />
                Categories
              </Link>
              <Link 
                to="/cart" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-orange-600 hover:text-orange-700 text-sm font-medium transition-all duration-300 hover:bg-orange-50 relative font-['Inter']"
              >
                <ShoppingCart className="w-4 h-4 mr-3" />
                Cart
                {cartItemCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              <Link 
                to="/admin/login" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-orange-600 hover:text-orange-700 text-sm font-medium transition-all duration-300 hover:bg-orange-50 font-['Inter']"
              >
                <User className="w-4 h-4 mr-3" />
                Admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;