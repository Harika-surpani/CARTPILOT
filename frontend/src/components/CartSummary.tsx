import React from 'react';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useCartSession } from '../context/CartSessionContext';
import { useNavigate } from 'react-router-dom';

export const CartSummary: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, cartValue, totalCartItems } = useCartSession();
  const navigate = useNavigate();

  const estimatedTax = cartValue * 0.08;
  const shippingCost = cartValue > 150 ? 0 : 15.00;
  const grandTotal = cartValue + estimatedTax + shippingCost;

  if (cart.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-4">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Your Shopping Cart is Empty</h3>
        <p className="text-slate-400 text-xs max-w-xs mb-6">
          Add items from our catalog to test real-time clickstream aggregations and AI cart rescue scoring.
        </p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-lg shadow-brand-500/20"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 flex flex-col justify-between space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-brand-accent" />
          Active Cart ({totalCartItems} Items)
        </h2>
        <span className="text-xs text-brand-accent bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20 font-mono">
          Session Cart
        </span>
      </div>

      {/* Cart Items List */}
      <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
        {cart.map(({ product, quantity }) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <img
                src={product.image}
                alt={product.title}
                className="w-12 h-12 rounded-lg object-cover bg-slate-800"
              />
              <div>
                <h4 className="text-xs font-bold text-white line-clamp-1">{product.title}</h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  ${product.price.toFixed(2)} × {quantity}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Quantity controls */}
              <div className="flex items-center space-x-1 bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-mono font-bold text-white px-2">
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <button
                onClick={() => removeFromCart(product.id)}
                className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary Pricing */}
      <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
        <div className="flex justify-between text-slate-400">
          <span>Subtotal</span>
          <span className="font-mono text-white">${cartValue.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Estimated Tax (8%)</span>
          <span className="font-mono text-white">${estimatedTax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Shipping</span>
          <span className="font-mono text-emerald-400 font-semibold">
            {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
          </span>
        </div>
        <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
          <span className="text-sm font-bold text-white">Grand Total</span>
          <span className="text-xl font-extrabold text-brand-accent font-mono">
            ${grandTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Proceed to Checkout Button */}
      <button
        onClick={() => navigate('/checkout')}
        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white text-sm font-bold flex items-center justify-center space-x-2 shadow-xl shadow-brand-500/25 active:scale-[0.98] transition-all"
      >
        <span>Proceed to Checkout</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Monitored by Real-Time AI Cart Rescue Engine</span>
      </div>

    </div>
  );
};
