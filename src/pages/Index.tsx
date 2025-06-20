import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, ArrowRight, User, Menu, Zap, Package, Shield, Truck, Gift, Percent, Clock, Award, Phone, Mail, MapPin, Home, Store, List, Search } from 'lucide-react';
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
  createdAt?: { seconds: number };
  tags?: string[];
}

const Index = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [cartItems, setCartItems] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const banners = [
    {
      image: '/banner1.jpg',
      alt: 'Welcome to AB Gadgets',
      link: '/shop',
    },
    {
      image: '/banner2.jpg',
      alt: 'AB Gadgets Shop Now',
      link: '/shop',
    },
    {
      image: '/banner3.jpg',
      alt: '100% Genuine Products',
      link: '/shop',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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

  // Trending Now
  const trendingProducts = products.filter(p => p.tags && p.tags.includes('Hot'));
  // Latest Products
  const latestProducts = [...products].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 8);
  // Featured Picks
  const featuredProducts = products.filter(p => p.featured === true);
  const hotDeals = products.filter(product => product.discount && product.discount > 20).slice(0, 4);

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      mainImage: product.mainImage,
      mainPrice: Number(product.mainPrice),
      quantity: 1,
    });
    toast({ title: '✅ Product added to cart successfully!' });
  };

  const handleDirectOrder = (product) => {
    navigate('/checkout', { state: { buyNowItem: {
      id: product.id,
      name: product.name,
      mainPrice: Number(product.mainPrice || product.price),
      quantity: 1,
      imageUrl: product.mainImageUrl || product.imageUrl || product.mainImage || product.image,
      price: Number(product.price),
      originalPrice: product.originalPrice,
    }}});
  };

  // Helper for price formatting
  const formatPrice = (price: number) => `৳${new Intl.NumberFormat('en-US').format(price)}`;

  console.log('Cart state before render:', cartItems);
  console.log('Cart in localStorage:', JSON.parse(localStorage.getItem('cart') || '[]'));

  const categories = [
    "Gadgets",
    "Headphones",
    "Selfie Sticks",
    "Microphones",
    "Toys",
    "Smart Watches",
    "Phone Accessories",
    "Hidden Cameras"
  ];

  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    // Fetch products from Firestore or use your existing products loading logic
    // setAllProducts(fetchedProducts);
    // For demo, you can use a static array or your existing products state
    setAllProducts(products); // If products is already loaded from Firestore
  }, [products]);

  const filteredProducts = allProducts.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
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

      {/* Hero Section with Rotating Image Banners */}
      <section className="relative min-h-[160px] flex items-center justify-center overflow-hidden mb-0 pb-0 bg-black">
        <div className="absolute inset-0 w-full h-40 sm:h-56 md:h-72 rounded-xl overflow-hidden shadow-lg mx-auto mt-2 mb-0 pb-0">
          <img
            src={banners[currentBanner].image}
            alt={banners[currentBanner].alt}
            className="w-full h-full object-cover object-center rounded-xl"
            style={{ opacity: 1 }}
          />
          <div className="absolute inset-0 bg-black/40 rounded-xl"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center w-full">
          <h2 className="text-3xl md:text-4xl font-extrabold font-mono text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-pink-400 drop-shadow-[0_2px_16px_rgba(59,130,246,0.7)]">
            Welcome , Sir!
          </h2>
        </div>
      </section>

      {/* Shop Now button directly under banner, centered, with mt-4 */}
      <div className="w-full flex justify-center mt-4 mb-0">
        <Button onClick={() => navigate('/shop')} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-3 text-lg rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300">
          Shop Now
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      {/* Horizontally scrolling categories banner */}
      <div className="overflow-x-auto whitespace-nowrap scroll-smooth py-2 px-2 animate-scroll-slow bg-black h-16 flex items-center">
        {categories.map(cat => (
          <span key={cat} className="inline-block bg-gray-800 text-white px-4 py-2 rounded-xl mr-4 shadow">
            {cat}
          </span>
        ))}
      </div>

      {/* Categories Section */}
      <section className="px-4 py-8 bg-black text-white">
        <h2 className="text-3xl font-bold mb-6">Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
          {categories.map(category => (
            <button
              key={category}
              className={`bg-gray-800 rounded-xl py-6 font-semibold hover:bg-gray-700 transition cursor-pointer w-full ${activeCategory === category ? 'ring-2 ring-orange-400' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-10">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-gray-900 rounded-xl p-4 shadow cursor-pointer"
            >
              <img
                src={product.imageUrl || product.mainImageUrl || product.mainImage || product.image}
                alt={product.name}
                className="w-full h-32 object-contain mb-2 rounded"
              />
              <h3 className="text-white font-semibold line-clamp-2">{product.name}</h3>
              <p className="text-orange-400 font-bold">৳{product.price || product.mainPrice}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trending Now */}
      <section className="py-16 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-4 flex items-center justify-center">
              Trending Now
            </h2>
            <p className="text-gray-400 text-lg">What's hot right now</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
              <Card key={product.id} className="bg-gray-800/30 backdrop-blur-lg border border-red-500/30 hover:border-red-400/50 transition-all duration-300 transform hover:scale-105 overflow-hidden relative">
                <div className="absolute top-0 left-0 bg-red-500 text-white px-3 py-1 text-sm font-bold z-10">
                  {product.discount}% OFF
                </div>
                <div className="relative">
                  <img
                    src={product.mainImage}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-white text-sm">{product.rating}</span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{product.name}</h3>
                  <p className="bg-orange-500 text-white font-bold text-sm rounded px-2 py-0.5 inline-block mb-1">
                    ৳{product.price || product.mainPrice}
                    {product.originalPrice && product.price && product.originalPrice > product.price && (
                      <span className="text-gray-400 text-xs line-through ml-2">৳{product.originalPrice}</span>
                    )}
                  </p>
                  {product.originalPrice && product.price && product.originalPrice > product.price ? (
                    <span className="bg-green-700/80 text-green-200 text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                      Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  ) : (
                    <span className="bg-green-700/80 text-green-200 text-xs font-bold px-2 py-0.5 rounded-full ml-2">Save 25%</span>
                  )}
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-xl font-bold text-red-400">৳{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-gray-500 line-through ml-2 text-sm">৳{product.originalPrice}</span>
                      )}
                    </div>
                    <span className="text-green-400 text-sm">Save ৳{product.originalPrice - product.price}</span>
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
                      className="w-full border-red-500 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-all duration-300"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      কার্টে যোগ করুন
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="py-16 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-4 flex items-center justify-center">
              Latest Products
            </h2>
            <p className="text-gray-400 text-lg">New arrivals</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestProducts.map((product) => (
              <Card key={product.id} className="bg-gray-800/30 backdrop-blur-lg border border-red-500/30 hover:border-red-400/50 transition-all duration-300 transform hover:scale-105 overflow-hidden relative">
                <div className="absolute top-0 left-0 bg-red-500 text-white px-3 py-1 text-sm font-bold z-10">
                  {product.discount}% OFF
                </div>
                <div className="relative">
                  <img
                    src={product.mainImage}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                    <span className="text-white text-sm">{product.rating}</span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{product.name}</h3>
                  <p className="bg-orange-500 text-white font-bold text-sm rounded px-2 py-0.5 inline-block mb-1">
                    ৳{product.price || product.mainPrice}
                    {product.originalPrice && product.price && product.originalPrice > product.price && (
                      <span className="text-gray-400 text-xs line-through ml-2">৳{product.originalPrice}</span>
                    )}
                  </p>
                  {product.originalPrice && product.price && product.originalPrice > product.price ? (
                    <span className="bg-green-700/80 text-green-200 text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                      Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  ) : (
                    <span className="bg-green-700/80 text-green-200 text-xs font-bold px-2 py-0.5 rounded-full ml-2">Save 25%</span>
                  )}
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-xl font-bold text-red-400">৳{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-gray-500 line-through ml-2 text-sm">৳{product.originalPrice}</span>
                      )}
                    </div>
                    <span className="text-green-400 text-sm">Save ৳{product.originalPrice - product.price}</span>
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
                      className="w-full border-red-500 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-all duration-300"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      কার্টে যোগ করুন
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
              🔥 Featured Products
            </h2>
            <p className="text-gray-400 text-lg">Our best and most popular products</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="bg-gray-800/30 backdrop-blur-lg border border-orange-500/20 hover:border-orange-400/40 transition-all duration-300 transform hover:scale-105 overflow-hidden">
                <div className="relative">
                  <img
                    src={product.mainImage}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{product.name}</h3>
                  <p className="bg-orange-500 text-white font-bold text-sm rounded px-2 py-0.5 inline-block mb-1">৳{product.mainPrice.toLocaleString('en-US')}</p>
                  {product.originalPrice && product.price && product.originalPrice > product.price ? (
                    <span className="bg-green-700/80 text-green-200 text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                      Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-gray-800/30 backdrop-blur-lg border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6 text-center">
                <Truck className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                <h3 className="text-lg font-semibold text-white mb-2">ফ্রি ডেলিভারি</h3>
                <p className="text-gray-400">সারা বাংলাদেশে</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/30 backdrop-blur-lg border border-green-500/20 hover:border-green-400/40 transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-green-400" />
                <h3 className="text-lg font-semibold text-white mb-2">১০০% অরিজিনাল</h3>
                <p className="text-gray-400">গুণগত মান নিশ্চিত</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/30 backdrop-blur-lg border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6 text-center">
                <Gift className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                <h3 className="text-lg font-semibold text-white mb-2">বিশেষ ছাড়</h3>
                <p className="text-gray-400">নিয়মিত অফার</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800/30 backdrop-blur-lg border border-orange-500/20 hover:border-orange-400/40 transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6 text-center">
                <Award className="w-12 h-12 mx-auto mb-4 text-orange-400" />
                <h3 className="text-lg font-semibold text-white mb-2">বিশ্বস্ত সেবা</h3>
                <p className="text-gray-400">গ্রাহক সন্তুষ্টি</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Hot Deals Section */}
      {hotDeals.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-4 flex items-center justify-center">
                <Percent className="w-8 h-8 mr-3 text-red-400" />
                HOT DEALS 🔥
              </h2>
              <p className="text-gray-400 text-lg">সীমিত সময়ের জন্য বিশেষ ছাড়</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {hotDeals.map((product) => (
                <Card key={product.id} className="bg-gray-800/30 backdrop-blur-lg border border-red-500/30 hover:border-red-400/50 transition-all duration-300 transform hover:scale-105 overflow-hidden relative">
                  <div className="absolute top-0 left-0 bg-red-500 text-white px-3 py-1 text-sm font-bold z-10">
                    {product.discount}% OFF
                  </div>
                  <div className="relative">
                    <img
                      src={product.mainImage}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                      <span className="text-white text-sm">{product.rating}</span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{product.name}</h3>
                    <p className="bg-orange-500 text-white font-bold text-sm rounded px-2 py-0.5 inline-block mb-1">৳{product.price || product.mainPrice}</p>
                    {product.originalPrice && product.price && product.originalPrice > product.price ? (
                      <span className="bg-green-700/80 text-green-200 text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                        Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </span>
                    ) : null}
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="text-xl font-bold text-red-400">৳{product.price}</span>
                        {product.originalPrice && (
                          <span className="text-gray-500 line-through ml-2 text-sm">৳{product.originalPrice}</span>
                        )}
                      </div>
                      <span className="text-green-400 text-sm">Save ৳{product.originalPrice - product.price}</span>
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
                        className="w-full border-red-500 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-all duration-300"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        কার্টে যোগ করুন
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-900/50 to-purple-900/50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            আজই অর্ডার করুন এবং পেয়ে যান দ্রুত ডেলিভারি
          </p>
          <Link to="/shop">
            <Button className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-4 text-lg rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300">
              <Package className="w-5 h-5 mr-2" />
              Start Shopping Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 border-t border-blue-500/20 mt-16">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">AB GADGETS</h3>
              <p className="text-gray-400 mt-2 text-sm">Your one-stop shop for the latest and greatest in tech.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-200">Quick Links</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><a href="/shop" className="text-gray-400 hover:text-blue-300">Shop All</a></li>
                <li><a href="/#featured" className="text-gray-400 hover:text-blue-300">Featured</a></li>
                <li><a href="/#hot-deals" className="text-gray-400 hover:text-blue-300">Hot Deals</a></li>
                <li><a href="/admin/login" className="text-gray-400 hover:text-blue-300">Admin</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-200">Support</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><a href="/contact" className="text-gray-400 hover:text-blue-300">Contact Us</a></li>
                <li><a href="/faq" className="text-gray-400 hover:text-blue-300">FAQ</a></li>
                <li><a href="/shipping" className="text-gray-400 hover:text-blue-300">Shipping Info</a></li>
                <li><a href="/returns" className="text-gray-400 hover:text-blue-300">Return Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-200">Contact</h4>
              <ul className="mt-4 space-y-2 text-sm text-gray-400">
                <li className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" /> 01706003435
                </li>
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" /> saifuldipu8@gmail.com
                </li>
                <li className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" /> Dhanmondi 7, Dhaka
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm text-gray-500">
            <p> 2025 AB GADGETS. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <BottomNav />
    </div>
  );
};

export default Index;
