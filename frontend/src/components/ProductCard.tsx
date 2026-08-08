import React from 'react';
import { Star, ShoppingCart, Check, Eye } from 'lucide-react';
import { Product } from '../types';
import { useCartSession } from '../context/CartSessionContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart, cart, logEvent } = useCartSession();

  const cartItem = cart.find((item) => item.product.id === product.id);
  const isInCart = Boolean(cartItem);

  const handleProductClick = () => {
    logEvent('product_view', `Viewed product details for ${product.title}`, '/shop');
    if (onQuickView) onQuickView(product);
  };

  return (
    <div className="group glass-card rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-brand-500/40 hover:shadow-2xl hover:shadow-brand-500/10">
      
      {/* Product Image & Badges */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-900/80">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-brand-600/90 text-white text-xs font-bold shadow-lg shadow-brand-600/30 backdrop-blur-md">
            {product.badge}
          </span>
        )}

        {/* Quick View Button */}
        <button
          onClick={handleProductClick}
          className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-slate-900/80 hover:bg-brand-600 text-slate-200 hover:text-white backdrop-blur-md border border-white/10 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
          title="Quick View"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Product Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-brand-accent uppercase tracking-wider">
              {product.category}
            </span>
            <div className="flex items-center space-x-1 text-amber-400 text-xs font-semibold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{product.rating}</span>
              <span className="text-slate-500">({product.reviewsCount})</span>
            </div>
          </div>

          <h3 className="font-bold text-white text-lg group-hover:text-brand-accent transition-colors line-clamp-1 mb-2">
            {product.title}
          </h3>

          <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed mb-4">
            {product.description}
          </p>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-extrabold text-white">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-slate-500 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => addToCart(product)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-md active:scale-95 ${
              isInCart
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-600/30'
                : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-brand-500/20'
            }`}
          >
            {isInCart ? (
              <>
                <Check className="w-4 h-4" />
                <span>In Cart ({cartItem?.quantity})</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
