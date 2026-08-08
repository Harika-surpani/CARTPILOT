import { Product } from '../types';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    title: 'AuraSound Pro Wireless Headphones',
    description: 'Active Noise Cancelling spatial audio over-ear headphones with 40-hour battery life and ultra-soft memory foam cushions.',
    price: 299.99,
    originalPrice: 349.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    rating: 4.8,
    reviewsCount: 428,
    badge: 'Best Seller',
    inStock: true
  },
  {
    id: 'prod_2',
    title: 'PulseFit Smart Watch Series X',
    description: 'Continuous heart rate, SpO2, sleep tracking, dual-frequency GPS, and AMOLED retina display.',
    price: 199.50,
    originalPrice: 249.00,
    category: 'Wearables',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    rating: 4.7,
    reviewsCount: 312,
    badge: 'Popular',
    inStock: true
  },
  {
    id: 'prod_3',
    title: 'Minimalist Leather Backpack 25L',
    description: 'Water-resistant full-grain Italian leather with dedicated 16-inch TSA laptop compartment.',
    price: 149.00,
    originalPrice: 179.99,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewsCount: 185,
    badge: 'Premium',
    inStock: true
  },
  {
    id: 'prod_4',
    title: 'Lumina Studio Desk Lamp',
    description: 'Dimmable LED architect desk light with wireless smartphone charging pad and auto-brightness sensor.',
    price: 89.99,
    originalPrice: 119.99,
    category: 'Home & Office',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    rating: 4.6,
    reviewsCount: 94,
    inStock: true
  },
  {
    id: 'prod_5',
    title: 'Veloce Mechanical Gaming Keyboard',
    description: 'Hot-swappable tactile RGB mechanical keyboard with anodized aluminum body and PBT keycaps.',
    price: 129.99,
    originalPrice: 159.99,
    category: 'Gaming',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    rating: 4.9,
    reviewsCount: 560,
    badge: 'Trending',
    inStock: true
  },
  {
    id: 'prod_6',
    title: 'HydroCell Insulated Smart Bottle',
    description: 'Self-cleaning UV-C stainless steel water bottle with LED temperature indicator touch screen.',
    price: 59.99,
    originalPrice: 74.99,
    category: 'Lifestyle',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    rating: 4.5,
    reviewsCount: 230,
    inStock: true
  }
];
