import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, List, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import ProductCard from '@/components/ProductCard';
import ProductDetailModal from '@/components/ProductDetailModal';
import { Skeleton } from '@/components/ui/skeleton';
import { products as localProducts } from '@/data/products';

const Shop = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "products"));
        const firebaseProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Combine Firebase products with local products, giving priority to Firebase
        const allProducts = [...localProducts, ...firebaseProducts];
        
        // Remove duplicates based on name (keep Firebase version if duplicate)
        const uniqueProducts = allProducts.filter((product, index, self) => 
          index === self.findIndex(p => p.name === product.name)
        );
        
        setProducts(uniqueProducts);
        setFilteredProducts(uniqueProducts);

        const uniqueCategories = ['All', ...new Set(uniqueProducts.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);

      } catch (error) {
        console.error("Error fetching products: ", error);
        // Fallback to local products if Firebase fails
        setProducts(localProducts);
        setFilteredProducts(localProducts);
        const uniqueCategories = ['All', ...new Set(localProducts.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
        toast({ title: "Warning", description: "Using local products due to connection issues.", variant: "default" });
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [toast]);

  useEffect(() => {
    let tempProducts = [...products];

    if (selectedCategory !== 'All') {
      tempProducts = tempProducts.filter(p => p.category === selectedCategory);
    }

    if (searchTerm) {
      tempProducts = tempProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(tempProducts);
  }, [searchTerm, selectedCategory, products]);

  const handleAddToCart = (product) => {
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleDirectOrder = (product) => {
    addToCart(product);
    navigate('/checkout');
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-orange-100 via-yellow-50 to-white animate-pulse-slow"></div>
      
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-100/50 to-yellow-100/50 pt-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-600 via-red-500 to-orange-600 bg-clip-text text-transparent mb-6">
            Shop All Products
          </h1>
          <p className="text-orange-700/80 text-xl font-medium max-w-2xl mx-auto mb-8">
            Discover our complete collection of premium gadgets and accessories
          </p>
          <Button 
            onClick={() => navigate('/categories')}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl text-lg"
          >
            <List className="w-5 h-5 mr-2" />
            Browse By Category Page
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 z-10 relative">
        {/* Search and Filter */}
        <Card className="bg-white/90 backdrop-blur-sm border-yellow-200 rounded-2xl shadow-xl mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
                {searchTerm && (
                  <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchTerm('')}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                    className={`whitespace-nowrap ${selectedCategory === category ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-orange-200 text-orange-600'}`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-56 w-full rounded-2xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                handleAddToCart={handleAddToCart}
                handleDirectOrder={handleDirectOrder}
                onProductClick={handleProductClick}
              />
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20 col-span-full">
            <h2 className="text-2xl font-bold text-orange-800">No Products Found</h2>
            <p className="text-orange-600 mt-2">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

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

export default Shop;
