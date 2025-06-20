import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Star, Search, Filter, Grid, List, Zap, Percent, User, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import BottomNav from '@/components/BottomNav';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  stock: number;
  image: string;
  description?: string;
  inStock: boolean;
  featured?: boolean;
  rating: number;
  mainImage: string;
  mainPrice: number;
  mainImageUrl?: string;
  imageUrl?: string;
}

const Shop = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [cartItems, setCartItems] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Headphones', 'Selfie Sticks', 'Microphones', 'Toys', 'Accessories', 'Exclusive', 'HOT Deals'];

  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const mainPrice = Number(data.mainPrice);
          const product = { id: doc.id, ...data, mainPrice, mainImage: data.mainImageUrl };
          console.log('Fetched product:', product);
          return product;
        });
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || (product.category && product.category === selectedCategory);
    return matchesSearch && matchesCategory && product.inStock;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      mainPrice: Number(product.mainPrice),
      quantity: 1,
      imageUrl: product.mainImageUrl || product.imageUrl || product.mainImage || product.image,
    });
    toast({
      title: 'Product Added!',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleDirectOrder = (product) => {
    navigate('/checkout', { state: { buyNowItem: {
      id: product.id,
      name: product.name,
      mainPrice: Number(product.mainPrice),
      quantity: 1,
      imageUrl: product.mainImageUrl || product.imageUrl || product.mainImage || product.image,
    }}});
  };

  const formatPrice = (price: number) => `৳${new Intl.NumberFormat('en-US').format(price)}`;

  console.log('Cart state before render:', cartItems);
  console.log('Cart in localStorage:', JSON.parse(localStorage.getItem('cart') || '[]'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Navigation */}
      <nav className="bg-black/30 backdrop-blur-lg border-b border-blue-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/d3afd300-289e-412e-ab42-87bdeed21cda.png" 
                alt="AB Gadgets Logo" 
                className="w-12 h-12 mr-3 rounded-lg shadow-2xl transform hover:scale-110 transition-transform duration-300 hover:rotate-3 animate-float"
                style={{
                  filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))'
                }}
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                AB GADGETS
              </h1>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/" className="text-blue-300 hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
                <Link to="/shop" className="text-gray-300 hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors">Shop</Link>
                <Link to="/categories" className="text-gray-300 hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors">Categories</Link>
                <Link to="/cart" className="text-gray-300 hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Cart ({cartItems.length})
                </Link>
                <Link to="/admin/login" className="text-gray-300 hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  <User className="w-4 h-4 inline mr-1" />
                  Admin
                </Link>
              </div>
            </div>

            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/50 backdrop-blur-lg border-t border-blue-500/20">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" className="text-blue-300 block px-3 py-2 rounded-md text-base font-medium">Home</Link>
              <Link to="/shop" className="text-gray-300 block px-3 py-2 rounded-md text-base font-medium">Shop</Link>
              <Link to="/categories" className="text-gray-300 block px-3 py-2 rounded-md text-base font-medium">Categories</Link>
              <Link to="/cart" className="text-gray-300 block px-3 py-2 rounded-md text-base font-medium">Cart ({cartItems.length})</Link>
              <Link to="/admin/login" className="text-gray-300 block px-3 py-2 rounded-md text-base font-medium">Admin</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-4">
            Shop All Products
          </h1>
          <p className="text-gray-300 text-center text-lg">
            Discover {products.length}+ amazing gadgets and accessories
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-600 text-white focus:border-blue-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:border-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            console.log('Product:', product);
            console.log('mainPrice:', product.mainPrice, typeof product.mainPrice);
            return (
              <Card key={product.id} className="bg-gray-800/30 backdrop-blur-lg border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 transform hover:scale-105 overflow-hidden">
                <div className="relative">
                  <img
                    src={product.imageUrl || product.mainImageUrl || product.mainImage || product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  {product.featured && (
                    <Badge className="absolute top-2 left-2 bg-blue-500/90 text-white">
                      Featured
                    </Badge>
                  )}
                  {product.discount && (
                    <Badge className="absolute top-2 right-2 bg-red-500/90 text-white flex items-center">
                      <Percent className="w-3 h-3 mr-1" />
                      {product.discount}% OFF
                    </Badge>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-white text-sm">{product.rating}</span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-gray-400 text-sm mb-3">{product.category}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-800">৳ {Number(product.mainPrice).toFixed(2)}</span>
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleDirectOrder(product)}
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all duration-300"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      অর্ডার করুন
                    </Button>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      variant="outline"
                      className="w-full border-blue-500 text-blue-400 hover:bg-blue-500/10 px-4 py-2 rounded-lg transition-all duration-300"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      কার্টে যোগ করুন
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No products found matching your criteria.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Shop;
