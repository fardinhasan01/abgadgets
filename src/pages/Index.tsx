import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, ArrowRight, User, Menu, Zap, Package, Shield, Truck, Gift, Percent, Clock, Award, Phone, Mail, MapPin, Home, Store, List, Search, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/ProductCard';
import ProductDetailModal from '@/components/ProductDetailModal';
import { getProductImageUrl } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { products as localProducts } from '@/data/products';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  stock: number;
  image: string;
  mainImageUrl?: string;
  description?: string;
  inStock: boolean;
  featured?: boolean;
  rating: number;
  mainImage: string;
  mainPrice: number;
  createdAt?: { seconds: number };
  tags?: string[];
  offerPrice?: number;
}

const Index = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [cartItems, setCartItems] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const banners = [
    {
      image: '/banner1.webp',
      alt: 'Welcome to AB Gadgets',
      link: '/shop',
    },
    {
      image: '/banner2.webp',
      alt: 'AB Gadgets Shop Now',
      link: '/shop',
    },
    {
      image: '/banner3.webp',
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
        const firebaseProducts = querySnapshot.docs.map(doc => {
          const data = doc.data();
          const mainPrice = Number(data.mainPrice);
          const product = { id: doc.id, ...data, mainPrice, price: mainPrice, offerPrice: data.offerPrice ?? null, mainImage: data.mainImageUrl };
          console.log('Fetched product:', product);
          return product;
        });
        
        // Combine Firebase products with local products, giving priority to Firebase
        const allProducts = [...localProducts, ...firebaseProducts];
        
        // Remove duplicates based on name (keep Firebase version if duplicate)
        const uniqueProducts = allProducts.filter((product, index, self) => 
          index === self.findIndex(p => p.name === product.name)
        );
        
        setProducts(uniqueProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to local products if Firebase fails
        setProducts(localProducts);
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
      mainImage: product.mainImage || product.image,
      price: product.price ?? product.mainPrice,
      offerPrice: product.offerPrice,
      quantity: 1,
    });
    toast({ title: '✅ Product added to cart successfully!' });
  };

  const handleDirectOrder = (product) => {
    navigate('/checkout', { state: { buyNowItem: {
      id: product.id,
      name: product.name,
      price: product.price,
      offerPrice: product.offerPrice,
      quantity: 1,
      imageUrl: product.mainImageUrl || product.imageUrl || product.mainImage || product.image,
    }}});
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-premium-50 via-emerald-50 to-white animate-pulse-slow"></div>
      <div className="fixed inset-0 bg-gradient-to-tr from-transparent via-premium-200/20 to-transparent animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
      
      {/* Floating Elements */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-emerald-300/20 rounded-full blur-xl animate-float"></div>
      <div className="fixed bottom-20 right-10 w-40 h-40 bg-premium-400/15 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="fixed top-1/2 left-1/4 w-24 h-24 bg-premium-500/10 rounded-full blur-lg animate-float" style={{ animationDelay: '4s' }}></div>

      {/* Hero Section with Rotating Image Banners */}
      <section className="relative min-h-[160px] flex items-center justify-center overflow-hidden mb-0 pb-0 bg-gradient-to-r from-premium-900 to-emerald-900">
        <div className="absolute inset-0 w-full h-40 sm:h-56 md:h-72 rounded-2xl overflow-hidden shadow-2xl mx-auto mt-2 mb-0 pb-0">
          <img
            src={banners[currentBanner].image}
            alt={banners[currentBanner].alt}
            className="w-full h-full object-cover object-center rounded-2xl"
            style={{ opacity: 1 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-premium-900/60 via-transparent to-transparent rounded-2xl"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center w-full">
        </div>
      </section>

      {/* Shop Now button directly under banner, centered, with mt-4 */}
      <div className="w-full flex justify-center mt-6 mb-0">
        <Button onClick={() => navigate('/shop')} className="bg-gradient-to-r from-premium-600 to-emerald-600 hover:from-premium-700 hover:to-emerald-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 animate-glow">
          <Sparkles className="w-5 h-5 mr-2" />
          Shop Now
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      {/* Horizontally scrolling categories banner */}
      <div className="overflow-x-auto whitespace-nowrap scroll-smooth py-3 px-2 animate-scroll-slow bg-gradient-to-r from-premium-900 via-emerald-900 to-premium-900 h-20 flex items-center">
        {categories.map(cat => (
          <span key={cat} className="inline-block bg-gradient-to-r from-premium-600/90 to-emerald-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-xl mr-4 shadow-lg hover:from-premium-500 hover:to-emerald-500 transition-all duration-300 border border-premium-400/30">
            {cat}
          </span>
        ))}
      </div>

      {/* Categories Section */}
      <section className="px-4 py-12 bg-gradient-to-br from-premium-900 via-emerald-900 to-premium-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4 flex items-center justify-center">
              <Sparkles className="w-8 h-8 mr-3 text-premium-300" />
              Browse Categories
            </h2>
            <p className="text-premium-200 text-lg">Discover our premium collection</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
            {categories.map(category => (
              <button
                key={category}
                className={`bg-gradient-to-r from-premium-600/80 to-emerald-600/80 backdrop-blur-sm rounded-2xl py-6 font-semibold hover:from-premium-500 hover:to-emerald-500 transition-all duration-300 cursor-pointer w-full transform hover:scale-105 border border-premium-400/30 shadow-lg ${activeCategory === category ? 'ring-2 ring-premium-400 from-premium-500 to-emerald-500' : ''}`}
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
                className="bg-gradient-to-r from-premium-600/60 to-emerald-600/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-premium-500/20 border border-premium-400/30"
              >
                <img
                  src={
                    product.mainImageUrl ||
                    (Array.isArray(product.image) ? product.image[0] : product.image) ||
                    "/placeholder.jpg"
                  }
                  alt={product.name}
                  className="w-full h-48 object-contain rounded-xl shadow bg-premium-50"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback to placeholder if any error occurs
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.jpg';
                    target.onerror = null;
                  }}
                />
                <h3 className="text-white font-semibold line-clamp-2 text-sm">{product.name}</h3>
                <div className="price-section mt-2 flex items-center gap-2">
                  {(() => {
                    const mainPrice = product.price || product.mainPrice;
                    const offerPrice = product.offerPrice || (product.originalPrice && product.price < product.originalPrice ? product.price : null);
                    const originalPrice = product.originalPrice || product.price;
                    const hasDiscount = typeof offerPrice === 'number' && offerPrice > 0 && offerPrice < originalPrice;
                    
                    return hasDiscount ? (
                      <>
                        <span className="offer-price text-lg font-bold text-emerald-300">
                          ৳{offerPrice}
                        </span>
                        <span className="main-price text-premium-200 line-through text-base">
                          ৳{originalPrice}
                        </span>
                        <span className="discount text-premium-200 text-sm font-semibold">
                          ({Math.round(((originalPrice - offerPrice) / originalPrice) * 100)}% off)
                        </span>
                      </>
                    ) : (
                      <span className="offer-price text-lg font-bold text-emerald-300">
                        ৳{mainPrice}
                      </span>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Now */}
      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-premium-500 animate-pulse" />
              <span className="text-premium-600 font-medium text-sm uppercase tracking-wider">Trending Now</span>
              <Sparkles className="w-6 h-6 text-premium-500 animate-pulse" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-premium-600 via-emerald-600 to-premium-700 bg-clip-text text-transparent mb-6 leading-tight">
              What's Hot Right Now
            </h2>
            <p className="text-premium-700/80 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              Discover the most popular products everyone is talking about
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in">
            {trendingProducts.map((product, index) => (
              <div 
                key={product.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard 
                  product={product} 
                  handleAddToCart={handleAddToCart} 
                  handleDirectOrder={handleDirectOrder}
                  onProductClick={handleProductClick}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-premium-500 animate-pulse" />
              <span className="text-premium-600 font-medium text-sm uppercase tracking-wider">New Arrivals</span>
              <Sparkles className="w-6 h-6 text-premium-500 animate-pulse" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-premium-600 via-emerald-600 to-premium-700 bg-clip-text text-transparent mb-6 leading-tight">
              Latest Products
            </h2>
            <p className="text-premium-700/80 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              Fresh arrivals just for you
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in">
            {latestProducts.map((product, index) => (
              <div 
                key={product.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard 
                  product={product} 
                  handleAddToCart={handleAddToCart} 
                  handleDirectOrder={handleDirectOrder}
                  onProductClick={handleProductClick}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-premium-500 animate-pulse" />
              <span className="text-premium-600 font-medium text-sm uppercase tracking-wider">Featured Collection</span>
              <Sparkles className="w-6 h-6 text-premium-500 animate-pulse" />
            </div>
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-premium-600 via-emerald-600 to-premium-700 bg-clip-text text-transparent mb-6 leading-tight">
              🔥 Featured Products
            </h2>
            <p className="text-premium-700/80 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
              Our best and most popular products carefully curated for you
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in">
            {featuredProducts.map((product, index) => (
              <div 
                key={product.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard 
                  product={product} 
                  handleAddToCart={handleAddToCart} 
                  handleDirectOrder={handleDirectOrder}
                  onProductClick={handleProductClick}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hot Deals Section */}
      {hotDeals.length > 0 && (
        <section className="py-20 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center gap-2 mb-4">
                <Percent className="w-6 h-6 text-premium-500 animate-pulse" />
                <span className="text-premium-600 font-medium text-sm uppercase tracking-wider">Limited Time</span>
                <Percent className="w-6 h-6 text-premium-500 animate-pulse" />
              </div>
              <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-premium-600 to-emerald-600 bg-clip-text text-transparent mb-6 leading-tight">
                HOT DEALS 🔥
              </h2>
              <p className="text-premium-700/80 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                সীমিত সময়ের জন্য বিশেষ ছাড়
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in">
              {hotDeals.map((product, index) => (
                <div 
                  key={product.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard
                    product={product}
                    handleAddToCart={handleAddToCart}
                    handleDirectOrder={handleDirectOrder}
                    onProductClick={handleProductClick}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-premium-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Why Choose AB Gadgets?
            </h2>
            <p className="text-premium-700/80 text-lg">Premium service, quality products, and exceptional value</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-white/90 backdrop-blur-xl border border-premium-200/50 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 animate-slide-up">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-premium-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Truck className="w-8 h-8 text-premium-600" />
                </div>
                <h3 className="text-xl font-bold text-premium-900 mb-3">ফ্রি ডেলিভারি</h3>
                <p className="text-premium-700">সারা বাংলাদেশে</p>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-xl border border-premium-200/50 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-premium-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-premium-600" />
                </div>
                <h3 className="text-xl font-bold text-premium-900 mb-3">১০০% অরিজিনাল</h3>
                <p className="text-premium-700">গুণগত মান নিশ্চিত</p>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-xl border border-premium-200/50 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-premium-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Gift className="w-8 h-8 text-premium-600" />
                </div>
                <h3 className="text-xl font-bold text-premium-900 mb-3">বিশেষ ছাড়</h3>
                <p className="text-premium-700">নিয়মিত অফার</p>
              </CardContent>
            </Card>
            <Card className="bg-white/90 backdrop-blur-xl border border-premium-200/50 hover:shadow-2xl transition-all duration-500 transform hover:scale-105 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-premium-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Award className="w-8 h-8 text-premium-600" />
                </div>
                <h3 className="text-xl font-bold text-premium-900 mb-3">বিশ্বস্ত সেবা</h3>
                <p className="text-premium-700">গ্রাহক সন্তুষ্টি</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-premium-500/10 to-emerald-500/10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-premium-200/50">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-premium-600 to-emerald-600 bg-clip-text text-transparent mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-premium-700 mb-8 leading-relaxed">
              আজই অর্ডার করুন এবং পেয়ে যান দ্রুত ডেলিভারি
            </p>
            <Link to="/shop">
              <Button className="bg-gradient-to-r from-premium-600 to-emerald-600 hover:from-premium-700 hover:to-emerald-700 text-white px-10 py-4 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 animate-glow">
                <Package className="w-5 h-5 mr-2" />
                Start Shopping Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-xl border-t border-premium-200/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center space-x-3 mb-4">
                <img src="/lovable-uploads/d3afd300-289e-412e-ab42-87bdeed21cda.png" alt="AB Gadgets Logo" className="w-12 h-12 rounded-xl" />
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-premium-600 to-emerald-600 bg-clip-text text-transparent">AB GADGETS</h1>
                  <p className="text-xs text-premium-600 -mt-1">Premium Gadgets</p>
                </div>
              </Link>
              <p className="text-premium-700/80">Your one-stop shop for the latest and greatest gadgets.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-premium-800 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/shop" className="text-premium-600 hover:text-premium-800">Shop</Link></li>
                <li><Link to="/categories" className="text-premium-600 hover:text-premium-800">Categories</Link></li>
                <li><Link to="/cart" className="text-premium-600 hover:text-premium-800">Cart</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-premium-800 mb-4">Contact Us</h3>
              <ul className="space-y-2 text-premium-600">
                <li className="flex items-center"><Mail className="w-4 h-4 mr-2" />saifuldipu8@gmail.com</li>
                <li className="flex items-center"><Phone className="w-4 h-4 mr-2" />01706003435</li>
                <li className="flex items-center"><MapPin className="w-4 h-4 mr-2" />Dhanmondi, Dhaka, Bangladesh</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-premium-800 mb-4">Newsletter</h3>
              <p className="text-premium-600 mb-3">Subscribe for exclusive offers.</p>
              <div className="flex">
                <Input type="email" placeholder="Your email" className="rounded-r-none" />
                <Button className="rounded-l-none bg-premium-600 hover:bg-premium-700">Subscribe</Button>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-premium-200/50 pt-8 text-center text-premium-600">
            <p>2025 AB Gadgets. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
        handleAddToCart={handleAddToCart}
        handleDirectOrder={handleDirectOrder}
      />
    </div>
  );
};

export default Index;
