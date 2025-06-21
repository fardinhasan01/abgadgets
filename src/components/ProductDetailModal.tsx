import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, X, Send, User, Calendar } from 'lucide-react';
import { getProductImageUrl, getProductImage } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  reviewerName: string;
  reviewText: string;
  rating: number;
  date: string;
}

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

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  handleAddToCart: (product: Product) => void;
  handleDirectOrder: (product: Product) => void;
}

// Mock reviews data with Bengali names and text
const generateMockReviews = (productId: string): Review[] => {
  const bengaliNames = [
    'মিথিলা আক্তার', 'সুমন হোসেন', 'মাহমুদ রহমান', 'তানজিলা নূর', 
    'রফিক আহমেদ', 'ফাতেমা খাতুন', 'আব্দুল্লাহ আল মামুন', 'সাবরিনা ইয়াসমিন',
    'ইমরান হোসেন', 'নাজমা আক্তার', 'শাহরিয়ার আহমেদ', 'রেহানা সুলতানা',
    'আদনান হোসেন', 'জারিনা আক্তার', 'মাহবুবুর রহমান', 'সাবরিনা আক্তার'
  ];

  const bengaliReviews = [
    'পণ্যটি খুব ভালো মানের। দামের তুলনায় অনেক ভালো।',
    'অনেক দিন ধরে ব্যবহার করছি, কোন সমস্যা নেই।',
    'ডেলিভারি খুব দ্রুত হয়েছে। পণ্যটি ঠিক সময়ে পেয়েছি।',
    'কোয়ালিটি অনেক ভালো। সত্যিই সন্তুষ্ট।',
    'পণ্যটি দেখতে অনেক সুন্দর। ব্যবহার করতেও ভালো লাগছে।',
    'অনেক দিনের ইচ্ছা ছিল এই পণ্যটি কিনব। এখন কিনে খুব খুশি।',
    'সেবা অনেক ভালো। পণ্যটিও ঠিক আছে।',
    'দামের তুলনায় অনেক ভালো পণ্য। রেকমেন্ড করব।',
    'পণ্যটি অনেক দ্রুত কাজ করে। সত্যিই ভালো লাগছে।',
    'অনেক দিন ধরে খুঁজছিলাম এমন পণ্য। এখন পেয়ে খুব খুশি।',
    'কোয়ালিটি অনেক ভালো। দামও যুক্তিসঙ্গত।',
    'পণ্যটি ব্যবহার করে অনেক সন্তুষ্ট। আবার কিনব।',
    'ডেলিভারি সেবা অনেক ভালো। পণ্যটিও ঠিক আছে।',
    'অনেক দিনের অভিজ্ঞতা। এই পণ্যটি সত্যিই ভালো।',
    'পণ্যটি দেখতে অনেক সুন্দর। ব্যবহার করতেও ভালো।',
    'সেবা অনেক ভালো। পণ্যটিও ঠিক আছে।'
  ];

  const reviewCount = Math.floor(Math.random() * 200) + 200; // Random between 200-400
  const reviews: Review[] = [];

  for (let i = 0; i < reviewCount; i++) {
    const randomName = bengaliNames[Math.floor(Math.random() * bengaliNames.length)];
    const randomReview = bengaliReviews[Math.floor(Math.random() * bengaliReviews.length)];
    const randomRating = Math.random() > 0.1 ? Math.floor(Math.random() * 2) + 4 : Math.floor(Math.random() * 2) + 3; // Mostly 4-5 stars
    const randomDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);

    reviews.push({
      id: `${productId}-review-${i}`,
      reviewerName: randomName,
      reviewText: randomReview,
      rating: randomRating,
      date: randomDate.toISOString()
    });
  }

  return reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  handleAddToCart,
  handleDirectOrder
}) => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({
    name: '',
    reviewText: '',
    rating: 5
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (product && isOpen) {
      // Generate mock reviews for the product
      const mockReviews = generateMockReviews(product.id);
      setReviews(mockReviews);
      setCurrentImageIndex(0);
    }
  }, [product, isOpen]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newReview.name.trim() || !newReview.reviewText.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmittingReview(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const review: Review = {
        id: `${product?.id}-review-${Date.now()}`,
        reviewerName: newReview.name,
        reviewText: newReview.reviewText,
        rating: newReview.rating,
        date: new Date().toISOString()
      };

      setReviews(prev => [review, ...prev]);
      setNewReview({ name: '', reviewText: '', rating: 5 });
      
      toast({
        title: 'Review Submitted',
        description: 'Thank you for your review!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const offerPrice = product?.offerPrice || product?.price;
  const mainPrice = product?.mainPrice || product?.originalPrice || product?.price;
  const hasDiscount = offerPrice && mainPrice && offerPrice < mainPrice;
  const discountPercentage = hasDiscount ? Math.round(((mainPrice - offerPrice) / mainPrice) * 100) : 0;

  // Helper for bengali numbers
  const toBengaliNumber = (num: number) => {
    const bengaliNumbers = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return String(num).split('').map(digit => bengaliNumbers[parseInt(digit, 10)]).join('');
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-xl font-bold text-orange-900">{product.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-orange-50 rounded-2xl overflow-hidden">
              <img
                src={getProductImageUrl(getProductImage(product), 'large')}
                alt={product.name}
                className="w-full h-full object-contain object-center"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                  target.onerror = null;
                }}
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-orange-900 mb-2">{product.name}</h2>
              <div className="flex items-center gap-4 mb-4">
                {renderStars(averageRating, 'lg')}
                <span className="text-orange-600 font-semibold">{averageRating.toFixed(1)}</span>
                <span className="text-gray-500">({reviews.length} reviews)</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-baseline gap-3">
                {hasDiscount ? (
                  <>
                    <span className="text-3xl font-extrabold text-orange-600">
                      ৳{toBengaliNumber(offerPrice)}
                    </span>
                    <span className="text-xl text-gray-400 line-through">
                      ৳{toBengaliNumber(mainPrice)}
                    </span>
                    <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-sm font-semibold">
                      {toBengaliNumber(discountPercentage)}% ছাড়
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-extrabold text-orange-600">
                    ৳{toBengaliNumber(mainPrice)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                  {product.category}
                </span>
                <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                  product.inStock 
                    ? 'text-green-600 bg-green-100' 
                    : 'text-red-600 bg-red-100'
                }`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              {product.description && (
                <div>
                  <h3 className="font-semibold text-orange-900 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => handleDirectOrder(product)}
                disabled={!product.inStock}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-orange-200/50 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Order Now
              </Button>
              
              <Button
                onClick={() => handleAddToCart(product)}
                disabled={!product.inStock}
                variant="outline"
                className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 border-t border-orange-200 pt-8">
          <h3 className="text-2xl font-bold text-orange-900 mb-6">Customer Reviews</h3>
          
          {/* Review Summary */}
          <div className="bg-orange-50 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {renderStars(averageRating, 'lg')}
                <div>
                  <div className="text-2xl font-bold text-orange-900">{averageRating.toFixed(1)}</div>
                  <div className="text-orange-600">out of 5</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-orange-900">{reviews.length}</div>
                <div className="text-orange-600">total reviews</div>
              </div>
            </div>
          </div>

          {/* Add Review Form */}
          <div className="bg-white border border-orange-200 rounded-xl p-6 mb-8">
            <h4 className="text-lg font-semibold text-orange-900 mb-4">Write a Review</h4>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <Label htmlFor="reviewName" className="text-orange-700">Your Name</Label>
                <Input
                  id="reviewName"
                  value={newReview.name}
                  onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="আপনার নাম লিখুন"
                  className="border-orange-200 focus:border-orange-400"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="reviewRating" className="text-orange-700">Rating</Label>
                <div className="flex items-center gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${star <= newReview.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="reviewText" className="text-orange-700">Your Review</Label>
                <Textarea
                  id="reviewText"
                  value={newReview.reviewText}
                  onChange={(e) => setNewReview(prev => ({ ...prev, reviewText: e.target.value }))}
                  placeholder="আপনার অভিজ্ঞতা শেয়ার করুন..."
                  className="border-orange-200 focus:border-orange-400 min-h-[100px]"
                  required
                />
              </div>
              
              <Button
                type="submit"
                disabled={isSubmittingReview}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isSubmittingReview ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Send className="w-4 h-4 mr-2" />
                    Submit Review
                  </div>
                )}
              </Button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="space-y-6 max-h-96 overflow-y-auto">
            {reviews.slice(0, 10).map((review) => (
              <div key={review.id} className="bg-white border border-orange-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-orange-900">{review.reviewerName}</div>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating, 'sm')}
                        <span className="text-sm text-gray-500">
                          {new Date(review.date).toLocaleDateString('bn-BD')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{review.reviewText}</p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailModal; 