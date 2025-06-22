export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  mainImageUrl?: string;
  category: string;
  rating: number;
  description: string;
  stock: number;
  inStock: boolean;
  featured?: boolean;
}

export const categories = [
  'All', 
  'Smartphones', 
  'Laptops', 
  'Headphones', 
  'Smartwatches', 
  'Gaming Accessories',
  'Tablets',
  'Cameras',
  'Power Banks',
  'Speakers',
  'Smart TV',
  'Home Appliances'
];

export const products: Product[] = [
  {
    id: 1,
    name: 'T900 Ultra',
    price: 910,
    originalPrice: 1200,
    discount: 24,
    image: 'https://storola-client-space.sgp1.cdn.digitaloceanspaces.com/resources/clients/storola-clients/abshopbd.net/cache/catalog/FB_IMG_1711174765107-370x370.jpg',
    category: 'Smartphones',
    rating: 4.5,
    description: 'High-performance smartphone with advanced features and sleek design.',
    stock: 50,
    inStock: true,
    featured: true
  },
  {
    id: 2,
    name: 'A9 Mini WiFi Camera 1080P Full HD Night Vision',
    price: 490,
    originalPrice: 650,
    discount: 25,
    image: 'https://storola-client-space.sgp1.cdn.digitaloceanspaces.com/resources/clients/storola-clients/abshopbd.net/cache/catalog/images_92-370x370.jpeg',
    category: 'Cameras',
    rating: 4.3,
    description: 'Compact WiFi camera with full HD resolution and night vision capabilities.',
    stock: 30,
    inStock: true,
    featured: false
  },
  {
    id: 3,
    name: 'SX9 Mini Dual Microphone',
    price: 1670,
    originalPrice: 2000,
    discount: 17,
    image: 'https://storola-client-space.sgp1.cdn.digitaloceanspaces.com/resources/clients/storola-clients/abshopbd.net/cache/catalog/images_100-370x370.jpeg',
    category: 'Gaming Accessories',
    rating: 4.7,
    description: 'Professional dual microphone setup for streaming and content creation.',
    stock: 25,
    inStock: true,
    featured: true
  },
  {
    id: 4,
    name: 'Lenovo HE05X Sports Magnetic Wireless Neckband Earphones',
    price: 290,
    originalPrice: 400,
    discount: 28,
    image: 'https://storola-client-space.sgp1.cdn.digitaloceanspaces.com/resources/clients/storola-clients/abshopbd.net/cache/catalog/products/Lenovo1-370x370.png',
    category: 'Headphones',
    rating: 4.4,
    description: 'Wireless sports earphones with magnetic design and premium sound quality.',
    stock: 75,
    inStock: true,
    featured: false
  },
  {
    id: 5,
    name: 'Apple Watch Series 7',
    price: 45000,
    originalPrice: 55000,
    discount: 18,
    image: 'https://storola-client-space.sgp1.cdn.digitaloceanspaces.com/resources/clients/storola-clients/abshopbd.net/cache/catalog/FB_IMG_1711174765107-370x370.jpg',
    category: 'Smartwatches',
    rating: 4.8,
    description: 'Latest Apple Watch with health monitoring and fitness tracking features.',
    stock: 15,
    inStock: true,
    featured: true
  },
  {
    id: 6,
    name: 'Samsung Galaxy Tab S8',
    price: 85000,
    originalPrice: 95000,
    discount: 11,
    image: 'https://storola-client-space.sgp1.cdn.digitaloceanspaces.com/resources/clients/storola-clients/abshopbd.net/cache/catalog/images_92-370x370.jpeg',
    category: 'Tablets',
    rating: 4.6,
    description: 'Premium Android tablet with S Pen and powerful performance.',
    stock: 20,
    inStock: true,
    featured: false
  },
  {
    id: 7,
    name: 'JBL Flip 6 Portable Speaker',
    price: 12000,
    originalPrice: 15000,
    discount: 20,
    image: 'https://storola-client-space.sgp1.cdn.digitaloceanspaces.com/resources/clients/storola-clients/abshopbd.net/cache/catalog/images_100-370x370.jpeg',
    category: 'Speakers',
    rating: 4.5,
    description: 'Waterproof portable speaker with powerful bass and long battery life.',
    stock: 40,
    inStock: true,
    featured: false
  },
  {
    id: 8,
    name: 'Anker PowerCore 20000mAh Power Bank',
    price: 3500,
    originalPrice: 4500,
    discount: 22,
    image: 'https://storola-client-space.sgp1.cdn.digitaloceanspaces.com/resources/clients/storola-clients/abshopbd.net/cache/catalog/products/Lenovo1-370x370.png',
    category: 'Power Banks',
    rating: 4.4,
    description: 'High-capacity power bank with fast charging and multiple ports.',
    stock: 60,
    inStock: true,
    featured: false
  },
  {
    id: 9,
    name: 'iPhone 15 Pro Max',
    price: 180000,
    originalPrice: 200000,
    discount: 10,
    image: 'https://storola-client-space.sgp1.cdn.digitaloceanspaces.com/resources/clients/storola-clients/abshopbd.net/cache/catalog/FB_IMG_1711174765107-370x370.jpg',
    category: 'Smartphones',
    rating: 4.9,
    description: 'Latest iPhone with titanium design and advanced camera system.',
    stock: 10,
    inStock: true,
    featured: true
  },
  {
    id: 10,
    name: 'Sony WH-1000XM5 Wireless Headphones',
    price: 45000,
    originalPrice: 55000,
    discount: 18,
    image: 'https://storola-client-space.sgp1.cdn.digitaloceanspaces.com/resources/clients/storola-clients/abshopbd.net/cache/catalog/images_92-370x370.jpeg',
    category: 'Headphones',
    rating: 4.8,
    description: 'Premium noise-cancelling wireless headphones with exceptional sound quality.',
    stock: 25,
    inStock: true,
    featured: true
  }
];
