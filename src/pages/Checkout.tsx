import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MapPin, User, Mail, Phone, Truck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext';
import BottomNav from '@/components/BottomNav';

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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
  }, [cart, location.state]);

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
  

  console.log('Cart state before render:', cartItems);
  console.log('Cart in localStorage:', localStorage.getItem('cart'));
  cartItems.forEach(item => {
    console.log('Item in checkout:', item);
    console.log('mainPrice:', item.mainPrice, 'Type:', typeof item.mainPrice);
  });
  const totalProductCost = cartItems.reduce((sum, item) => {
    const price = Number(item.mainPrice || item.price);
    const qty = item.quantity || 1;
    return sum + (isNaN(price) ? 0 : price * qty);
  }, 0);
  const total = totalProductCost + deliveryCharge;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (value: string) => {
    setFormData(prev => ({ ...prev, paymentMethod: value }));
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
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data
      const orderProducts = cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: Number(item.mainPrice || item.price),
        quantity: item.quantity || 1,
        imageUrl: item.imageUrl || item.mainImage,
      }));
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
      console.log('Order data:', orderData);

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

  const increaseQty = (id) => {
    setCartItems((prev) => prev.map(item => item.id === id ? { ...item, quantity: item.quantity + 1 } : item));
  };
  const decreaseQty = (id) => {
    setCartItems((prev) => prev.map(item => item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item));
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="bg-red-500/20 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-2">Cart is empty</h2>
          <p>Please add a product to your cart before checking out.</p>
        </div>
      </div>
    );
  }

  // Debug: log cartItems if price is 0
  if (cartItems.some(item => Number(item.mainPrice || item.price) === 0)) {
    console.log('Cart with price 0:', cartItems);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-black/30 backdrop-blur-lg border-b border-blue-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              AB GADGETS
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <Truck className="w-8 h-8 text-blue-400 mr-3" />
          <h1 className="text-4xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Secure Checkout
            </span>
          </h1>
        </div>

        {/* Important Notice */}
        <Card className="bg-red-900/30 border border-red-500 p-4 text-red-200 mb-8">
          <h2 className="text-lg font-bold mb-1">⚠️ দয়া করে ১০০% নিশ্চিত হয়ে অর্ডার কনফার্ম করুন!</h2>
          <p className="text-sm">অর্ডার কনফার্ম করার আগে সকল তথ্য সঠিক কিনা যাচাই করুন। একবার অর্ডার কনফার্ম হলে সেটি পরিবর্তন করা যাবে না।</p>
        </Card>

        <div className="bg-black rounded-xl p-4 text-white mb-6">
          <h3 className="text-lg font-bold mb-2">Total Cost</h3>
          <div>
            <p>Subtotal: ৳ {totalProductCost.toFixed(2)}</p>
            <p>Delivery: ৳ {deliveryCharge.toFixed(2)}</p>
            <p className="font-bold text-lg mt-2">Total: ৳ {(totalProductCost + deliveryCharge).toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-black via-gray-900 to-black rounded-xl p-4 mb-6 mt-4 max-w-3xl mx-auto">
          {cartItems.map(item => {
            const price = Number(item.mainPrice);
            const original = Number(item.originalPrice);
            const savePercent = original && price && original > price ? Math.round(((original - price) / original) * 100) : null;
            return (
              <div key={item.id} className="flex items-start space-x-4 p-3 border-b border-gray-800 last:border-b-0 relative">
                <img src={item.imageUrl || item.mainImage} className="w-16 h-16 rounded object-cover bg-gray-800" alt={item.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">{item.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-orange-400 font-bold text-sm">৳{price} x {item.quantity}</p>
                    {savePercent && (
                      <span className="bg-green-700/80 text-green-200 text-xs font-bold px-2 py-0.5 rounded-full ml-2">Save {savePercent}%</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs">Total: ৳{(price * item.quantity).toLocaleString('en-US')}</p>
                </div>
                <div className="absolute top-2 right-2 flex items-center space-x-2">
                  <Button size="icon" variant="outline" className="rounded-full bg-gray-800 text-white border-gray-700" onClick={() => decreaseQty(item.id)}>-</Button>
                  <span className="text-white font-semibold w-6 text-center">{item.quantity}</span>
                  <Button size="icon" variant="outline" className="rounded-full bg-gray-800 text-white border-gray-700" onClick={() => increaseQty(item.id)}>+</Button>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card className="bg-gray-800/30 backdrop-blur-lg border border-blue-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <User className="w-5 h-5 mr-2 text-blue-400" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="bg-gray-700/50 border-gray-600 text-white focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="bg-gray-700/50 border-gray-600 text-white focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-700/50 border-gray-600 text-white focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-700/50 border-gray-600 text-white focus:border-blue-500"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Information */}
              <Card className="bg-gray-800/30 backdrop-blur-lg border border-blue-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <MapPin className="w-5 h-5 mr-2 text-blue-400" />
                    🏠 এলাকা নির্বাচন করুন
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address" className="text-gray-300">Full Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-700/50 border-gray-600 text-white focus:border-blue-500"
                      placeholder="House/Flat, Road, Area"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryArea" className="text-gray-300">Delivery Area</Label>
                    <Input
                      id="deliveryArea"
                      name="deliveryArea"
                      value={formData.deliveryArea}
                      onChange={handleInputChange}
                      required
                      className="bg-gray-700/50 border-gray-600 text-white focus:border-blue-500"
                      placeholder="e.g., Dhaka, Chittagong, Sylhet"
                    />
                  </div>
                  
                  {/* Delivery Charge Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-green-500/10 border border-green-500/30 p-4">
                      <div className="text-center">
                        <h3 className="text-green-400 font-semibold mb-2">ঢাকা শহরের ভিতরে</h3>
                        <p className="text-2xl font-bold text-green-300">৳60</p>
                        <p className="text-green-200 text-sm">Delivery Charge</p>
                      </div>
                    </Card>
                    <Card className="bg-blue-500/10 border border-blue-500/30 p-4">
                      <div className="text-center">
                        <h3 className="text-blue-400 font-semibold mb-2">ঢাকা শহরের বাহিরে</h3>
                        <p className="text-2xl font-bold text-blue-300">৳120</p>
                        <p className="text-blue-200 text-sm">Delivery Charge</p>
                      </div>
                    </Card>
                  </div>

                  {formData.deliveryArea && (
                    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-blue-300 font-semibold">
                        Selected Delivery Charge: ৳{deliveryCharge}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {deliveryLocation === 'dhaka' ? 'ঢাকা শহরের ভিতরে' : 'ঢাকা শহরের বাহিরে'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="bg-gray-800/30 backdrop-blur-lg border border-blue-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Phone className="w-5 h-5 mr-2 text-blue-400" />
                    💰 পেমেন্ট পদ্ধতি নির্বাচন করুন
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={formData.paymentMethod} onValueChange={handlePaymentMethodChange}>
                    <div className="flex items-center space-x-2 p-4 border border-gray-600 rounded-lg hover:border-blue-500 transition-colors">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="text-gray-300 cursor-pointer flex-1">
                        <div className="flex items-center">
                          <Truck className="w-5 h-5 mr-2 text-green-400" />
                          <span className="font-semibold">ক্যাশ অন ডেলিভারি</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">পণ্য বুঝে পেয়ে টাকা দিন</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border border-gray-600 rounded-lg hover:border-blue-500 transition-colors">
                      <RadioGroupItem value="bkash" id="bkash" />
                      <Label htmlFor="bkash" className="text-gray-300 cursor-pointer flex-1">
                        <div className="flex items-center">
                          <Phone className="w-5 h-5 mr-2 text-pink-400" />
                          <span className="font-semibold">bKash Payment</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">অগ্রিম বিকাশে পেমেন্ট করুন</p>
                      </Label>
                    </div>
                  </RadioGroup>

                  {formData.paymentMethod === 'bkash' && (
                    <div className="mt-4">
                      <Label htmlFor="bkashNumber" className="text-gray-300">bKash Number</Label>
                      <Input
                        id="bkashNumber"
                        name="bkashNumber"
                        value={formData.bkashNumber}
                        onChange={handleInputChange}
                        required={formData.paymentMethod === 'bkash'}
                        className="bg-gray-700/50 border-gray-600 text-white focus:border-blue-500"
                        placeholder="01XXXXXXXXX"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Terms & Conditions */}
              <Card className="bg-gray-800/30 backdrop-blur-lg border border-green-500/20">
                <CardContent className="p-6">
                  <div className="mt-6 flex items-start">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToTerms}
                      onChange={(e) => {
                        setAgreedToTerms(e.target.checked)
                        setShowTermsWarning(!e.target.checked)
                      }}
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-gray-700 mt-1"
                    />
                    <div className="ml-3 text-sm">
                      <label htmlFor="terms" className="font-medium text-gray-200">
                        I agree to the <a href="/terms" target="_blank" className="text-blue-400 hover:underline">Terms & Conditions</a>
                      </label>
                      {showTermsWarning && !agreedToTerms && (
                        <p className="text-red-600 font-semibold mt-2">অনুগ্রহ করে শর্তাবলীতে সম্মতি দিন</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bengali Checkout Panel */}
            <div className="p-4 border rounded-md bg-yellow-50 text-black my-4">
              <p className="text-lg font-bold text-red-600 mb-2">দয়া করে ১০০% নিশ্চিত হয়ে অর্ডার কনফার্ম করুন!</p>

              <div className="mb-3">
                <p className="font-semibold">🏠 এলাকা নির্বাচন করুন:</p>
                <ul className="list-disc pl-5">
                  <li>ঢাকা শহরের ভিতরে - ৳60</li>
                  <li>ঢাকা শহরের বাহিরে - ৳120</li>
                </ul>
                      </div>

              <div className="mb-3">
                <p className="font-semibold">💰 পেমেন্ট পদ্ধতি নির্বাচন করুন:</p>
                <ul className="list-disc pl-5">
                  <li>ক্যাশ অন ডেলিভারি</li>
                </ul>
                    </div>

              <div className="flex items-center gap-2 mb-3">
                <input 
                  type="checkbox" 
                  required 
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <label>I have read and agree to the Terms & Conditions</label>
                  </div>

                  <Button
                    type="submit"
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full"
                  >
                {isSubmitting ? 'Processing...' : 'অর্ডার কনফার্ম করুন'}
                  </Button>
            </div>
          </div>
        </form>

        <div className="bg-gray-800/40 rounded-lg p-4 mt-6">
          <div className="flex justify-between mb-2">
            <span>Product Price:</span>
            <span>৳{Number(totalProductCost).toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Delivery:</span>
            <span>৳{Number(deliveryCharge).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>৳{Number(total).toFixed(2)}</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-semibold">ডেলিভারি লোকেশন</label>
          <select
            value={deliveryLocation}
            onChange={e => setDeliveryLocation(e.target.value)}
            className="border px-3 py-2 rounded text-gray-900"
          >
            <option value="dhaka">ঢাকার ভিতরে</option>
            <option value="outside">ঢাকার বাইরে</option>
          </select>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Checkout;

