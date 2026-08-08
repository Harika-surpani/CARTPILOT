import React, { useState } from 'react';
import { MOCK_PRODUCTS } from '../utils/mockProducts';
import { ProductCard } from '../components/ProductCard';
import { CartSummary } from '../components/CartSummary';
import { Product } from '../types';
import { useCartSession } from '../context/CartSessionContext';
import { Search, SlidersHorizontal, RefreshCw, ShoppingBag, Eye, X } from 'lucide-react';

export const Shop: React.FC = () => {
  const { sessionId, events, cartValue, resetSession, logEvent } = useCartSession();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const categories = ['All', 'Electronics', 'Wearables', 'Fashion', 'Home & Office', 'Gaming', 'Lifestyle'];

  const filteredProducts = MOCK_PRODUCTS.filter((prod) => {
    const matchesCat = selectedCategory === 'All' || prod.category === selectedCategory;
    const matchesSearch = prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-mono text-brand-accent bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
            Interactive Customer Session: #{sessionId}
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-2">
            E-Commerce Storefront
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Perform actions (view, add to cart, browse) to stream live clickstream events to the Phase 3 backend.
          </p>
        </div>

        <button
          onClick={resetSession}
          className="px-4 py-2.5 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center space-x-2 border border-slate-700 transition-all active:scale-95 self-start md:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-brand-accent" />
          <span>New Shopping Session</span>
        </button>
      </div>

      {/* Main Shop Grid & Cart Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Product Catalog Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search products by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <SlidersHorizontal className="w-4 h-4 text-slate-500 shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    logEvent('click', `Filtered products by category: ${cat}`, '/shop');
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                      : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>

        </div>

        {/* Right Sticky Cart & Clickstream Preview Column */}
        <div className="space-y-6 lg:sticky lg:top-24 h-fit">
          <CartSummary />

          {/* Real-time Session Metrics Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Session Telemetry</span>
              <span className="text-[10px] font-mono text-emerald-400">Live</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Logged Events</span>
                <span className="font-bold text-white text-sm">{events.length}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Cart Value</span>
                <span className="font-bold text-brand-accent text-sm">${cartValue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* QUICK VIEW MODAL */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel rounded-2xl border border-slate-700 max-w-lg w-full p-6 space-y-4 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <img
              src={quickViewProduct.image}
              alt={quickViewProduct.title}
              className="w-full h-48 object-cover rounded-xl bg-slate-800"
            />

            <div>
              <span className="text-xs text-brand-accent font-mono uppercase">{quickViewProduct.category}</span>
              <h3 className="text-xl font-bold text-white mt-1">{quickViewProduct.title}</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{quickViewProduct.description}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-2xl font-extrabold text-white font-mono">
                ${quickViewProduct.price.toFixed(2)}
              </span>
              <button
                onClick={() => {
                  setQuickViewProduct(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
