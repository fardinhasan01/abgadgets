import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MapPin, User, Mail, Phone, Truck, AlertCircle, CheckCircle2, CreditCard, Wallet, Shield, Plus, Minus } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext';
import { getPrice, hasValidDiscount } from '@/lib/utils';

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const termsRef = React.useRef<HTMLInputElement | null>(null);
  const [showTermsWarning, setShowTermsWarning] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    deliveryArea: '',
    paymentMethod: 'cod',
    bkashNumber: ''
  });
  const { cart, clearCart } = useCart();
  const [cartItems, setCartItems] = useState([]);
  const [deliveryLocation, setDeliveryLocation] = useState('dhaka');

  useEffect(() => {
    // Support direct checkout via buyNowItem in location.state
    if (location.state && location.state.buyNowItem) {
      setCartItems([location.state.buyNowItem]);
      toast({
        title: 'Order Initiated!',
        description: 'Please confirm your details to complete the order.',
        variant: 'default',
      });
    } else if (cart && cart.length > 0) {
      setCartItems(cart);
    } else {
      setCartItems([]);
    }
  }, [cart, location.state, toast]);

  const getDeliveryCharge = (area) => {
    const lowerArea = (area || '').toLowerCase().trim();
    if (lowerArea.includes('dhaka') || lowerArea.includes('ঢাকা')) {
      return 60;
    }
    return 120;
  };
  
  const deliveryCharge = getDeliveryCharge(formData.deliveryArea);

  useEffect(() => {
    // Auto-detect delivery location and update state if needed
    const area = formData.deliveryArea.toLowerCase();
    const insideDhakaAreas = ['dhaka', 'dhanmondi', 'gulshan', 'banani', 'uttara'];
    const isInside = insideDhakaAreas.some(keyword => area.includes(keyword));
    const newLocation = isInside ? 'dhaka' : 'outside';
    if (newLocation !== deliveryLocation) {
      setDeliveryLocation(newLocation);
    }
  }, [formData.deliveryArea, deliveryLocation]);

  const totalProductCost = cartItems.reduce((sum, item) => {
    const price = getPrice(item);
    const qty = item.quantity || 1;
    return sum + (price * qty);
  }, 0);
  const total = totalProductCost + deliveryCharge;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (value: string) => {
    setFormData(prev => ({ ...prev, paymentMethod: value }));
  };

  const increaseQty = (id) => {
    setCartItems((prev) => prev.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
  };

  const decreaseQty = (id) => {
    setCartItems((prev) => prev.map(item => item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      toast({
        title: "Terms & Conditions",
        description: "Please agree to the terms and conditions to proceed.",
        variant: "destructive"
      });
      setShowTermsWarning(true);
      // Scroll to top and focus the terms checkbox for mobile and desktop
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {}
      setTimeout(() => termsRef.current?.focus({ preventScroll: false }), 300);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data
      const orderProducts = cartItems.map(item => {
        const price = getPrice(item);
        
        return {
          id: item.id,
          name: item.name,
          price: price,
          quantity: item.quantity || 1,
          mainImageUrl: item.mainImageUrl,
        };
      });
      const orderData = {
        products: orderProducts,
        totalPrice: orderProducts.reduce((sum, item) => sum + item.price * item.quantity, 0) + deliveryCharge,
        deliveryCharge,
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          deliveryArea: formData.deliveryArea
        },
        items: cartItems,
        paymentMethod: formData.paymentMethod,
        bkashNumber: formData.paymentMethod === 'bkash' ? formData.bkashNumber : null,
        pricing: {
          subtotal: totalProductCost,
          deliveryCharge,
          total
        },
        status: 'pending',
        orderDate: new Date().toISOString(),
        orderNumber: 'AB' + Math.random().toString(36).substr(2, 9).toUpperCase()
      };

      // Submit to Firebase
      await addDoc(collection(db, 'orders'), orderData);

      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been submitted and will be processed soon.",
      });

      // Clear cart from localStorage
      localStorage.removeItem('cart');
      clearCart();
      
      // Redirect to success page
      navigate('/order-success', { 
        state: { orderData } 
      });
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: "Order Failed",
        description: error?.message || "There was an error submitting your order. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-orange-200 text-center max-w-md mx-4">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-orange-900 mb-2">Cart is empty</h2>
          <p className="text-orange-600 mb-6">Please add a product to your cart before checking out.</p>
          <Link to="/shop">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-premium-50 via-emerald-50 to-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-premium-50 via-emerald-50 to-white animate-pulse-slow"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pb-24 lg:pb-8 checkout-container">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-premium-600 via-emerald-600 to-premium-600 bg-clip-text text-transparent mb-6">
            Secure Checkout
          </h1>
          <p className="text-premium-700/80 text-xl font-medium max-w-2xl mx-auto">
            Almost there! Complete your order below.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 checkout-form">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <Card className="bg-white/90 backdrop-blur-xl border border-premium-200/50">
              <CardHeader>
                <CardTitle className="text-premium-900 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Shipping Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-premium-700">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="border-premium-200 focus:border-premium-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-premium-700">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      className="border-premium-200 focus:border-premium-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-premium-700">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="border-premium-200 focus:border-premium-400"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-premium-700">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="border-premium-200 focus:border-premium-400"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address" className="text-premium-700">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="border-premium-200 focus:border-premium-400"
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryArea" className="text-premium-700">Delivery Area</Label>
                  <Input
                    id="deliveryArea"
                    name="deliveryArea"
                    value={formData.deliveryArea}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Dhaka, Gulshan"
                    className="border-premium-200 focus:border-premium-400"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="bg-white/90 backdrop-blur-xl border border-premium-200/50">
              <CardHeader>
                <CardTitle className="text-premium-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={formData.paymentMethod} onValueChange={handlePaymentMethodChange}>
                  <div className="flex items-center space-x-2 mb-4">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="text-premium-700">Cash on Delivery</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bkash" id="bkash" />
                    <Label htmlFor="bkash" className="text-premium-700">bKash</Label>
                  </div>
                </RadioGroup>
                
                {formData.paymentMethod === 'bkash' && (
                  <div className="mt-4">
                    <Label htmlFor="bkashNumber" className="text-premium-700">bKash Number</Label>
                    <Input
                      id="bkashNumber"
                      name="bkashNumber"
                      value={formData.bkashNumber}
                      onChange={handleInputChange}
                      placeholder="01XXXXXXXXX"
                      className="border-premium-200 focus:border-premium-400"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card className="bg-white/90 backdrop-blur-xl border border-premium-200/50">
              <CardContent className="pt-4">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    ref={termsRef}
                    className="mt-0.5"
                  />
                  <Label htmlFor="terms" className="text-premium-700 text-sm">
                    I agree to the terms and conditions and privacy policy
                  </Label>
                </div>
                {showTermsWarning && (
                  <p className="text-red-500 text-sm mt-2">Please agree to the terms and conditions to proceed.</p>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Order Summary - Mobile Optimized */}
          <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur-xl border border-premium-200/50 lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle className="text-premium-900 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Your Order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => {
                    const price = getPrice(item);
                    const hasDiscount = hasValidDiscount(item);
                    const originalPrice = Number(item.price);
                    
                    return (
                      <div key={item.id} className="flex items-center space-x-3 p-3 bg-premium-50 rounded-lg">
                        <div className="w-12 h-12 bg-white rounded-lg flex-shrink-0">
                          <img
                            src={
                              item.mainImageUrl ||
                              (Array.isArray(item.image) ? item.image[0] : item.image) ||
                              "/placeholder.jpg"
                            }
                            alt={item.name}
                            className="w-full h-48 object-contain rounded-xl shadow bg-premium-50"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.jpg';
                              target.onerror = null;
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-premium-900 truncate">{item.name}</h4>
                          <div className="flex items-center gap-2">
                            {hasDiscount ? (
                              <>
                                <span className="text-xs text-gray-400 line-through">৳{new Intl.NumberFormat('en-US').format(originalPrice)}</span>
                                <span className="text-sm font-bold text-emerald-600">৳{new Intl.NumberFormat('en-US').format(price)}</span>
                              </>
                            ) : (
                              <span className="text-sm font-bold text-premium-600">৳{new Intl.NumberFormat('en-US').format(price)}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => decreaseQty(item.id)}
                            className="w-6 h-6 p-0 border-premium-300 text-premium-700"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-medium text-premium-900 w-8 text-center">{item.quantity}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => increaseQty(item.id)}
                            className="w-6 h-6 p-0 border-premium-300 text-premium-700"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Summary */}
                <div className="border-t border-premium-200 pt-4 space-y-2">
                  <div className="flex justify-between text-premium-700">
                    <span>Subtotal</span>
                    <span>৳{new Intl.NumberFormat('en-US').format(totalProductCost)}</span>
                  </div>
                  <div className="flex justify-between text-premium-700">
                    <span>Delivery Fee</span>
                    <span>৳{new Intl.NumberFormat('en-US').format(deliveryCharge)}</span>
                  </div>
                  <div className="border-t border-premium-200 pt-2">
                    <div className="flex justify-between text-premium-900 font-bold text-lg">
                      <span>Total</span>
                      <span>৳{new Intl.NumberFormat('en-US').format(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Mobile Optimized Order Button */}
                <div className="lg:hidden mt-6">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !agreedToTerms}
                    className="w-full bg-gradient-to-r from-premium-600 to-emerald-600 hover:from-premium-700 hover:to-emerald-700 text-white py-4 text-lg rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Shield className="w-5 h-5 mr-2" />
                        Place Order
                      </div>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Desktop Order Button */}
            <div className="hidden lg:block">
              <Button 
                type="submit" 
                disabled={isSubmitting || !agreedToTerms}
                className="w-full bg-premium-600 hover:bg-premium-700 text-white py-4 text-lg rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Confirm Order
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
        
        {/* Sticky Mobile Confirm Button */}
        <div className="lg:hidden sticky-mobile-button">
          <Button 
            type="submit" 
            disabled={isSubmitting || !agreedToTerms}
            className="w-full bg-premium-600 hover:bg-premium-700 text-white py-4 text-lg rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Processing...
              </div>
            ) : (
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Confirm Order
              </div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

