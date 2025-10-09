import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Zap, Sparkles, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getProductImageUrl } from '@/lib/utils';

interface Product {
  id: string | number;
  name: string;
  price?: number;
  originalPrice?: number;
  mainPrice?: number;
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

interface ProductCardProps {
  product: Product;
  handleAddToCart: (product: Product) => void;
  handleDirectOrder: (product: Product) => void;
  onProductClick?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, handleAddToCart, handleDirectOrder, onProductClick }) => {
  // Handle both data structures: local products (price/originalPrice) and Firebase (mainPrice/offerPrice)
  const mainPrice = product.price || product.mainPrice || 0;
  const originalPrice = product.originalPrice || mainPrice;
  const offerPrice = product.offerPrice || (product.originalPrice && product.price && product.price < product.originalPrice ? product.price : null);
  
  // Safe price logic with proper validation
  const hasDiscount = typeof offerPrice === 'number' && offerPrice > 0 && offerPrice < originalPrice;
  const priceToShow = hasDiscount ? offerPrice : mainPrice;
  const discountPercentage = hasDiscount ? Math.round(((originalPrice - offerPrice) / originalPrice) * 100) : 0;

  // Helper for bengali numbers
  const toBengaliNumber = (num: number) => {
    const bengaliNumbers = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return String(num).split('').map(digit => bengaliNumbers[parseInt(digit, 10)]).join('');
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onProductClick?.(product);
  };

  return (
    <Card 
      className="group relative overflow-hidden bg-white border-0 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none cursor-pointer backdrop-blur-sm"
      onClick={handleCardClick}
    >
      {/* Premium Badge */}
      {product.featured && (
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
            <Sparkles className="w-3 h-3" />
            Premium
          </div>
        </div>
      )}
      
      {/* View Details Badge */}
      <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-[-2px]">
        <div className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
          <Eye className="w-3 h-3" />
          View Details
        </div>
      </div>
      
      {/* Image Container - Compact */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-yellow-50 rounded-t-3xl">
        <img
          src={
            product.mainImageUrl ||
            (Array.isArray(product.image) ? product.image[0] : product.image) ||
            "/placeholder.jpg"
          }
          alt={product.name}
          className="w-full h-32 object-contain p-1 transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            // Fallback to placeholder if any error occurs
            target.src = '/placeholder.jpg';
            target.onerror = null; // Prevent infinite loops
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 right-3">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
              {toBengaliNumber(discountPercentage)}% ছাড়
            </div>
          </div>
        )}
        
        {/* Rating Badge */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1 shadow-lg border border-orange-200/50">
          <Star className="w-4 h-4 text-amber-500 fill-current" />
          <span className="text-orange-800 font-semibold text-sm">{product.rating}</span>
        </div>
        
        {/* Stock Status */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
              Out of Stock
            </div>
          </div>
        )}
      </div>
      
      {/* Content - Compact */}
      <CardContent className="p-3 space-y-2">
        {/* Product Name */}
        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 h-8 leading-tight group-hover:text-orange-600 transition-colors duration-300">
          {product.name}
        </h3>
        
        {/* Price Section */}
        <div className="flex items-baseline gap-2">
          {hasDiscount ? (
            <>
              <span className="text-lg font-black text-orange-600">
                ৳{toBengaliNumber(priceToShow)}
              </span>
              <span className="text-xs text-gray-400 line-through">
                ৳{toBengaliNumber(originalPrice)}
              </span>
            </>
          ) : (
            <span className="text-lg font-black text-orange-600">
              ৳{toBengaliNumber(mainPrice)}
            </span>
          )}
        </div>
        
        {/* Category Tag */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
            {product.category}
          </span>
        </div>
        
        {/* Action Buttons - Properly positioned */}
        <div className="flex gap-2 pt-1">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleDirectOrder(product);
            }}
            disabled={!product.inStock}
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none text-xs py-2"
          >
            <Zap className="w-3 h-3 mr-1" />
            অর্ডার করুন
          </Button>
          
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(product);
            }}
            disabled={!product.inStock}
            variant="outline"
            className="w-10 border-2 border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none flex items-center justify-center p-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="sr-only">কার্টে যোগ করুন</span>
          </Button>
        </div>
      </CardContent>
      
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-400/0 via-orange-400/5 to-orange-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      {/* Subtle border glow on hover */}
      <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-orange-200/50 transition-all duration-500 pointer-events-none"></div>
    </Card>
  );
};

export default ProductCard;
