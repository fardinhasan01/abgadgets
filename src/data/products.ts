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
  // All test products removed - only admin-uploaded products from Firebase will be shown
];
