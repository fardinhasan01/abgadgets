import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Users, 
  Upload, 
  Edit, 
  Trash2, 
  Eye,
  LogOut,
  Plus,
  CheckCircle,
  Percent,
  TrendingUp,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db, storage } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import AddProduct from './AddProduct';

interface Order {
  id: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    deliveryArea: string;
  };
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
  }>;
  paymentMethod: string;
  bkashNumber?: string;
  pricing: {
    subtotal: number;
    deliveryCharge: number;
    total: number;
  };
  status: string;
  orderDate: string;
  orderNumber: string;
}

interface Product {
  id: string;
  name: string;
  mainPrice: number;
  mainImage: string;
  originalPrice?: number;
  discount?: number;
  category: string;
  stock: number;
  image: string;
  description?: string;
  inStock: boolean;
  featured?: boolean;
  rating: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mainPrice, setMainPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    originalPrice: '',
    discount: '',
    category: 'Headphones',
    stock: '',
    description: '',
    image: null as File | null,
    additionalImages: [] as File[],
    videoUrl: '',
    featured: false,
    rating: '4.5'
  });

  const [searchTerm, setSearchTerm] = useState('');

  const tagOptions = [
    { value: 'Hot', label: 'Hot 🔥' },
    { value: 'Exclusive', label: 'Exclusive 🌟' },
    { value: 'Trending', label: 'Trending 💹' },
  ];

  useEffect(() => {
    // Check Firebase authentication
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        loadOrders();
        loadProducts();
      } else {
        setIsAuthenticated(false);
        navigate('/admin/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const loadOrders = () => {
    const unsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const ordersData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        } as Order;
      }).filter((order: any) => {
        return order.pricing && typeof order.pricing.total === 'number';
      });
      
      setOrders(ordersData.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()));
    });

    return unsubscribe;
  };

  const loadProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setAdminProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setNewProduct(prev => ({ ...prev, [name]: checked }));
    } else {
      setNewProduct(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainImageFile(e.target.files[0]);
      setMainImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setAdditionalImageFiles(filesArray);
      setAdditionalImagePreviews(filesArray.map(file => URL.createObjectURL(file)));
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
      setVideoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setTags(selected);
  };

  const validateProduct = () => {
    if (!newProduct.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive"
      });
      return false;
    }

    if (!newProduct.price || isNaN(Number(newProduct.price)) || Number(newProduct.price) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price",
        variant: "destructive"
      });
      return false;
    }

    if (!newProduct.stock || isNaN(Number(newProduct.stock)) || Number(newProduct.stock) < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid stock quantity",
        variant: "destructive"
      });
      return false;
    }

    if (newProduct.originalPrice && (isNaN(Number(newProduct.originalPrice)) || Number(newProduct.originalPrice) <= 0)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid original price",
        variant: "destructive"
      });
      return false;
    }

    if (newProduct.discount && (isNaN(Number(newProduct.discount)) || Number(newProduct.discount) < 0 || Number(newProduct.discount) > 100)) {
      toast({
        title: "Validation Error",
        description: "Discount must be between 0 and 100",
        variant: "destructive"
      });
      return false;
    }

    if (newProduct.videoUrl && !/^https?:\/\//.test(newProduct.videoUrl)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid video URL (http/https)",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    if (!name.trim() || !mainPrice.trim() || !mainImageFile) {
      toast({ title: '❌ Error', description: 'Please fill in all required fields (name, main price, main image)', variant: 'destructive' });
      return;
    }
    setIsUploading(true);
    try {
      // Upload main image
      let mainImageUrl = '';
      if (mainImageFile) {
        const imageRef = ref(storage, `products/${Date.now()}_${mainImageFile.name}`);
        const snap = await uploadBytes(imageRef, mainImageFile);
        mainImageUrl = await getDownloadURL(snap.ref);
      }
      // Upload additional images
      let additionalImageUrls: string[] = [];
      for (const file of additionalImageFiles) {
        const imgRef = ref(storage, `products/${Date.now()}_${file.name}`);
        const snap = await uploadBytes(imgRef, file);
        const url = await getDownloadURL(snap.ref);
        additionalImageUrls.push(url);
      }
      // Upload video
      let videoUrlFinal = '';
      if (videoFile) {
        const videoRef = ref(storage, `products/videos/${Date.now()}_${videoFile.name}`);
        const snap = await uploadBytes(videoRef, videoFile);
        videoUrlFinal = await getDownloadURL(snap.ref);
      }
      const product = {
        name: name.trim(),
        description: description.trim(),
        mainPrice: parseFloat(mainPrice),
        offerPrice: offerPrice ? parseFloat(offerPrice) : null,
        mainImage: mainImageUrl,
        additionalImages: additionalImageUrls,
        videoUrl: videoUrlFinal,
        tags,
        createdAt: serverTimestamp()
      };
      console.log('Submitting product:', product);
      await addDoc(collection(db, 'products'), product);
      toast({ title: '✅ Success', description: 'Product added successfully!' });
      setName(''); setDescription(''); setMainPrice(''); setOfferPrice(''); setMainImageFile(null); setMainImagePreview(null); setAdditionalImageFiles([]); setAdditionalImagePreviews([]); setVideoFile(null); setVideoPreview(null); setTags([]);
      loadProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({ title: '❌ Error', description: 'Failed to add product', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        await loadProducts();
        toast({
          title: "Product Deleted",
          description: "Product has been removed from the store.",
        });
      } catch (error) {
        console.error('Error deleting product:', error);
        toast({
          title: "Error",
          description: "Failed to delete product.",
          variant: "destructive"
        });
      }
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
      toast({
        title: "Order Updated",
        description: `Order status changed to ${status}.`,
      });
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteDoc(doc(db, 'orders', orderId));
        toast({
          title: "Order Deleted",
          description: "Order has been removed.",
        });
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const deleteAllProducts = async () => {
    if (!window.confirm('Are you sure you want to delete ALL products? This cannot be undone.')) return;
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const batchDeletes = snapshot.docs.map(docSnap => deleteDoc(doc(db, 'products', docSnap.id)));
      await Promise.all(batchDeletes);
      toast({ title: 'All products deleted', description: 'All products have been removed from Firestore.' });
      loadProducts();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete all products', variant: 'destructive' });
    }
  };

  const filteredAdminProducts = adminProducts.filter(product =>
    product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const totalRevenue = orders
    .filter(order => order.pricing && typeof order.pricing.total === 'number')
    .reduce((sum, order) => sum + order.pricing.total, 0);
    
  const totalDiscountSavings = adminProducts.reduce((sum, product) => {
    if (product.originalPrice && product.price) {
      return sum + (product.originalPrice - product.price) * product.stock;
    }
    return sum;
  }, 0);

  const stats = [
    { title: "Total Products", value: adminProducts.length, icon: Package, color: "from-blue-500 to-cyan-500" },
    { title: "Total Orders", value: orders.length, icon: ShoppingCart, color: "from-green-500 to-emerald-500" },
    { title: "Revenue", value: `৳${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "from-purple-500 to-pink-500" },
    { title: "Discount Savings", value: `৳${totalDiscountSavings.toFixed(2)}`, icon: Percent, color: "from-orange-500 to-red-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-lg border-b border-blue-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/d3afd300-289e-412e-ab42-87bdeed21cda.png" 
                alt="AB Gadgets Logo" 
                className="w-10 h-10 mr-3 rounded-lg shadow-lg transform hover:scale-110 transition-transform duration-300"
              />
              <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mr-8">
                AB GADGETS
              </Link>
              <span className="text-gray-400">Admin Dashboard</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-400 text-red-400 hover:bg-red-400/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-800/30 p-1 rounded-lg backdrop-blur-lg border border-blue-500/20">
          {['overview', 'products', 'orders', 'add-product'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md font-medium transition-all capitalize ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-gray-800/30 backdrop-blur-lg border border-blue-500/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">{stat.title}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                      </div>
                      <div className={`bg-gradient-to-r ${stat.color} w-12 h-12 rounded-full flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800/30 backdrop-blur-lg border border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Top Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {['Headphones', 'Selfie Sticks', 'Microphones', 'Toys'].map((category) => (
                    <div key={category} className="flex justify-between items-center py-2">
                      <span className="text-gray-300">{category}</span>
                      <span className="text-blue-400">{adminProducts.filter(p => p.category === category).length}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-gray-800/30 backdrop-blur-lg border border-blue-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.slice(0, 4).map((order) => (
                    <div key={order.id} className="flex justify-between items-center py-2">
                      <span className="text-gray-300">{order.orderNumber}</span>
                      <Badge className={
                        order.status === 'delivered' ? 'bg-green-500/20 text-green-300' :
                        order.status === 'shipped' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <Card className="bg-gray-800/30 backdrop-blur-lg border border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-white">Product Management ({adminProducts.length} products)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 mb-4">
                <Button
                  onClick={deleteAllProducts}
                  variant="outline"
                  className="border-red-400 text-red-400 hover:bg-red-400/10"
                >
                  Delete All Products
                </Button>
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products"
                  className="bg-gray-700/50 border-gray-600 text-white focus:border-blue-500"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Image</TableHead>
                    <TableHead className="text-gray-300">Name</TableHead>
                    <TableHead className="text-gray-300">Price</TableHead>
                    <TableHead className="text-gray-300">Stock</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdminProducts.map((product) => (
                    <TableRow key={product.id} className="border-gray-700">
                      <TableCell>
                        <img src={product.mainImage} alt={product.name} className="w-12 h-12 object-cover rounded border border-gray-700" />
                      </TableCell>
                      <TableCell className="text-white">
                        <div>
                          <div>{product.name}</div>
                          {product.featured && <Badge className="bg-blue-500/20 text-blue-300 text-xs">Featured</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-400 font-semibold">
                        ৳{product.mainPrice.toLocaleString('en-US')}
                      </TableCell>
                      <TableCell>
                        {product.inStock ? (
                          <span className="inline-flex items-center gap-1 text-green-400 font-semibold">✅ In Stock</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400 font-semibold">❌ Out of Stock</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={product.inStock ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400/10">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-red-400 text-red-400 hover:bg-red-400/10"
                            onClick={() => deleteProduct(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <Card className="bg-gray-800/30 backdrop-blur-lg border border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-white">Order Management ({orders.length} orders)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="bg-gray-700/30 border border-gray-600">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Order Info */}
                        <div>
                          <h4 className="text-lg font-semibold text-blue-400 mb-3">Order Details</h4>
                          <div className="space-y-2 text-sm">
                            <p className="text-white"><strong>Order #:</strong> {order.orderNumber}</p>
                            <p className="text-gray-300"><strong>Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
                            <p className="text-gray-300"><strong>Status:</strong> 
                              <Badge className={`ml-2 ${
                                order.status === 'delivered' ? 'bg-green-500/20 text-green-300' :
                                order.status === 'shipped' ? 'bg-blue-500/20 text-blue-300' :
                                'bg-yellow-500/20 text-yellow-300'
                              }`}>
                                {order.status}
                              </Badge>
                            </p>
                            <p className="text-gray-300"><strong>Payment:</strong> {order.paymentMethod === 'cod' ? 'Cash on Delivery' : `bKash: ${order.bkashNumber}`}</p>
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div>
                          <h4 className="text-lg font-semibold text-green-400 mb-3">Customer Details</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center text-white">
                              <Users className="w-4 h-4 mr-2 text-gray-400" />
                              {order.customer.firstName} {order.customer.lastName}
                            </div>
                            <div className="flex items-center text-gray-300">
                              <Mail className="w-4 h-4 mr-2 text-gray-400" />
                              {order.customer.email}
                            </div>
                            <div className="flex items-center text-gray-300">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              {order.customer.phone}
                            </div>
                            <div className="flex items-start text-gray-300">
                              <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                              <div>
                                <p>{order.customer.address}</p>
                                <p className="text-blue-400">{order.customer.deliveryArea}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Items & Pricing */}
                        <div>
                          <h4 className="text-lg font-semibold text-purple-400 mb-3">Items & Pricing</h4>
                          <div className="space-y-2 text-sm">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-gray-300">
                                <span>{item.name} (x{item.quantity})</span>
                                <span>৳{(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="border-t border-gray-600 pt-2 mt-2">
                              <div className="flex justify-between text-gray-300">
                                <span>Subtotal:</span>
                                <span>৳{order.pricing?.subtotal || 0}</span>
                              </div>
                              <div className="flex justify-between text-gray-300">
                                <span>Delivery:</span>
                                <span>৳{order.pricing?.deliveryCharge || 0}</span>
                              </div>
                              <div className="flex justify-between text-white font-semibold text-lg">
                                <span>Total:</span>
                                <span>৳{order.pricing?.total || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 mt-6 pt-4 border-t border-gray-600">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-green-400 text-green-400 hover:bg-green-400/10"
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          disabled={order.status === 'delivered'}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Delivered
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-blue-400 text-blue-400 hover:bg-blue-400/10"
                          onClick={() => updateOrderStatus(order.id, 'shipped')}
                          disabled={order.status === 'delivered'}
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Mark Shipped
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="border-red-400 text-red-400 hover:bg-red-400/10"
                          onClick={() => deleteOrder(order.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Order
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add Product Tab */}
        {activeTab === 'add-product' && (
          <AddProduct />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
