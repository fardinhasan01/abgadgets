import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Zap, Sparkles, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getProductImageUrl, getProductImage } from '@/lib/utils';

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
  const offerPrice = product.offerPrice || product.price;
  const mainPrice = product.mainPrice || product.originalPrice || product.price;
  const imageSrc = getProductImage(product);

  const hasDiscount = offerPrice && mainPrice && offerPrice < mainPrice;
  const discountPercentage = hasDiscount ? Math.round(((mainPrice - offerPrice) / mainPrice) * 100) : 0;

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
      className="group relative overflow-hidden bg-white border-l-4 border-orange-500 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Premium Badge */}
      {product.featured && (
        <div className="absolute top-4 left-4 z-10">
          <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            <Sparkles className="w-3 h-3" />
            Premium
          </div>
        </div>
      )}
      
      {/* View Details Badge */}
      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
          <Eye className="w-3 h-3" />
          View Details
        </div>
      </div>
      
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-square bg-orange-50 rounded-t-2xl">
        <img
          src={getProductImageUrl(imageSrc, 'large')}
          alt={product.name}
          className="w-full h-full object-contain object-center transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            // Fallback to placeholder if any error occurs
            target.src = '/placeholder.svg';
            target.onerror = null; // Prevent infinite loops
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-4 right-4">
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-sm px-3 py-1 rounded-full shadow-lg">
              {toBengaliNumber(discountPercentage)}% ছাড়
            </div>
          </div>
        )}
        
        {/* Rating Badge */}
        <div className="absolute bottom-3 right-3 bg-white rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
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
      
      {/* Content */}
      <CardContent className="p-6 space-y-4">
        {/* Product Name */}
        <h3 className="text-lg font-bold text-orange-900 line-clamp-2 h-14 leading-tight group-hover:text-orange-700 transition-colors duration-300">
          {product.name}
        </h3>
        
        {/* Price Section */}
        <div className="flex items-baseline gap-3">
          {hasDiscount ? (
            <>
              <span className="text-2xl font-extrabold text-orange-600">
                ৳{toBengaliNumber(offerPrice)}
              </span>
              <span className="text-lg text-gray-400 line-through">
                ৳{toBengaliNumber(mainPrice)}
              </span>
            </>
          ) : (
            <span className="text-2xl font-extrabold text-orange-600">
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
        
        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleDirectOrder(product);
            }}
            disabled={!product.inStock}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-orange-200/50 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
          >
            <Zap className="w-4 h-4 mr-2" />
            অর্ডার করুন
          </Button>
          
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(product);
            }}
            disabled={!product.inStock}
            variant="outline"
            className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            কার্টে যোগ করুন
          </Button>
        </div>
      </CardContent>
      
      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400/0 via-orange-400/5 to-yellow-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </Card>
  );
};

export default ProductCard; 