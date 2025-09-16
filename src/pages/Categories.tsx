// File: pages/categories.tsx

import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import ProductDetailModal from "@/components/ProductDetailModal";
import { Input } from "@/components/ui/input";
import { Search, Filter, Sparkles, Grid, List, ArrowRight } from "lucide-react";
import { getProductImage } from "@/lib/utils";
import { products as localProducts } from "@/data/products";

// Updated Product interface to match the rest of the app
interface Product {
  id: string;
  name: string;
  price?: number;
  originalPrice?: number;
  mainPrice: number;
  offerPrice?: number;
  discount?: number;
  category: string;
  stock: number;
  image?: string;
  mainImage?: string;
  imageUrl?: string;
  mainImageUrl?: string;
  description?: string;
  inStock: boolean;
  featured?: boolean;
  rating: number;
  tags?: string[];
}

const CategoriesPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const productSnapshot = await getDocs(collection(db, 'products'));
        const firebaseProducts = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        
        // Combine Firebase products with local products, giving priority to Firebase
        const allProducts = [...localProducts, ...firebaseProducts];
        
        // Remove duplicates based on name (keep Firebase version if duplicate)
        const uniqueProducts = allProducts.filter((product, index, self) => 
          index === self.findIndex(p => p.name === product.name)
        );
        
        setProducts(uniqueProducts);

        const uniqueCategories = ['All', ...Array.from(new Set(uniqueProducts.map(p => p.category)))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching data: ", error);
        // Fallback to local products if Firebase fails
        setProducts(localProducts);
        const uniqueCategories = ['All', ...Array.from(new Set(localProducts.map(p => p.category)))];
        setCategories(uniqueCategories);
        toast({ title: 'Warning', description: 'Using local products due to connection issues.', variant: 'default' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);
  
  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      offerPrice: product.offerPrice,
      quantity: 1,
      mainImageUrl: product.mainImageUrl,
    });
    toast({ title: '✅ Product added to cart successfully!' });
  };

  const handleDirectOrder = (product: Product) => {
    navigate('/checkout', { state: { buyNowItem: {
      id: product.id,
      name: product.name,
      price: product.price,
      offerPrice: product.offerPrice,
      quantity: 1,
      mainImageUrl: product.mainImageUrl,
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

  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'All' || product.category === selectedCategory;
    const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-yellow-50 to-white animate-pulse-slow"></div>
      
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
        {/* Categories List */}
        <div className="mb-8 animate-slide-up">
          <h2 className="text-2xl font-bold text-orange-900 mb-4">Categories</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="mb-8 p-6 bg-white rounded-2xl shadow-xl border border-orange-200/50 animate-slide-up">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Input */}
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5 group-focus-within:text-orange-600 transition-colors duration-300" />
              <Input
                type="text"
                placeholder="Search products in this category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 w-full bg-orange-50 border-orange-200 text-orange-900 placeholder-orange-500/60 focus:border-orange-400 focus:ring-orange-400/20 rounded-xl h-12 text-lg transition-all duration-300 hover:bg-orange-100 focus:bg-white"
              />
            </div>
            
            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400 w-5 h-5 pointer-events-none" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-12 pr-8 py-3 bg-orange-50 border border-orange-200 rounded-xl text-orange-900 focus:border-orange-400 focus:ring-orange-400/20 h-12 text-lg font-medium appearance-none cursor-pointer transition-all duration-300 hover:bg-orange-100 focus:bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="text-orange-900">{cat}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-orange-600 text-white shadow-lg' 
                    : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-orange-600 text-white shadow-lg' 
                    : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Enhanced Shop All Button */}
            <div className="flex items-center">
              <button
                onClick={() => navigate('/shop')}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md group flex items-center"
              >
                <Sparkles className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Shop All
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-orange-700 text-lg font-medium">Loading premium products...</p>
            </div>
          </div>
        ) : (
          <div className={`animate-fade-in ${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8' 
              : 'space-y-6'
          }`}>
            {filteredProducts.map((product, index) => (
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
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold text-orange-800 mb-2">No products found</h3>
            <p className="text-orange-600 text-lg">Try adjusting your search or category filter.</p>
          </div>
        )}
      </main>

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

export default CategoriesPage;