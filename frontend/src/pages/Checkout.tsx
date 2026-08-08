import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  CreditCard, 
  ShieldCheck, 
  BrainCircuit, 
  Lock, 
  ArrowRight, 
  Sparkles,
  ShoppingBag,
  CheckCircle
} from 'lucide-react';
import { useCartSession } from '../context/CartSessionContext';
import { CustomerCheckoutForm } from '../types';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cart, cartValue, runAIPrediction, isAnalyzing, sessionId } = useCartSession();
  const [isCalculating, setIsCalculating] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CustomerCheckoutForm>({
    defaultValues: {
      fullName: 'Alex Vance',
      email: 'alex.vance@example.com',
      phone: '+1 (555) 234-5678',
      address: '742 Evergreen Terrace',
      city: 'San Francisco',
      zipCode: '94107',
      country: 'United States',
      paymentMethod: 'credit_card'
    }
  });

  const onSubmit = async (data: CustomerCheckoutForm) => {
    setIsCalculating(true);
    // Execute real-time Phase 3 API evaluation
    const rec = await runAIPrediction();
    setIsCalculating(false);
    
    // Navigate directly to Live AI Panel to see real-time inference result
    navigate('/live-ai');
  };

  const estimatedTax = cartValue * 0.08;
  const shippingCost = cartValue > 150 ? 0 : 15.00;
  const grandTotal = cartValue + estimatedTax + shippingCost;

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 text-center glass-panel p-8 rounded-2xl border-slate-800 space-y-4">
        <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Your Cart is Empty</h2>
        <p className="text-xs text-slate-400">Add products from the Shop page to proceed through checkout.</p>
        <button
          onClick={() => navigate('/shop')}
          className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold"
        >
          Go to Shop Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          Session #{sessionId} • Real-Time AI Monitor Active
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-2">
          Express Checkout
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Submitting order details triggers real-time feature aggregation and calls FastAPI endpoints <span className="font-mono text-brand-accent">POST /predict</span> & <span className="font-mono text-brand-accent">POST /recommend</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Customer Details */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-mono">1</span>
                Customer & Shipping Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Full Name</label>
                  <input
                    {...register('fullName', { required: true })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
                  <input
                    {...register('email', { required: true })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-medium">Shipping Address</label>
                  <input
                    {...register('address', { required: true })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">City</label>
                  <input
                    {...register('city', { required: true })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Zip Code</label>
                  <input
                    {...register('zipCode', { required: true })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-mono">2</span>
                Payment Options
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                {['credit_card', 'paypal', 'apple_pay', 'cod'].map((method) => (
                  <label
                    key={method}
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer hover:border-brand-500 transition-colors"
                  >
                    <input
                      type="radio"
                      value={method}
                      {...register('paymentMethod')}
                      className="sr-only"
                    />
                    <CreditCard className="w-5 h-5 text-brand-accent mb-1" />
                    <span className="text-[11px] font-bold text-white uppercase">{method.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit & AI Evaluation Button */}
            <button
              type="submit"
              disabled={isCalculating || isAnalyzing}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-extrabold text-sm flex items-center justify-center space-x-3 shadow-2xl shadow-brand-500/30 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <BrainCircuit className="w-5 h-5 animate-pulse" />
              <span>Proceed to Checkout & Run AI Rescue Check</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white">Order Summary</h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <img src={product.image} alt={product.title} className="w-8 h-8 rounded object-cover" />
                    <span className="text-slate-300 font-medium line-clamp-1">{product.title}</span>
                  </div>
                  <span className="font-mono text-white font-bold">${(product.price * quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono text-white">${cartValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span className="font-mono text-emerald-400">{shippingCost === 0 ? 'FREE' : `$${shippingCost}`}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Tax</span>
                <span className="font-mono text-white">${estimatedTax.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span className="font-bold text-white">Grand Total</span>
                <span className="text-xl font-extrabold text-brand-accent font-mono">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ANIMATED AI INFERENCE MODAL */}
      {(isCalculating || isAnalyzing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="glass-panel rounded-3xl border border-brand-500/40 p-8 max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-brand-600/20 border border-brand-500/40 text-brand-accent flex items-center justify-center mx-auto animate-pulse">
              <BrainCircuit className="w-10 h-10 animate-spin" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white">AI Engine Evaluating Session</h3>
              <p className="text-xs text-slate-400">
                Transmitting session feature vector (15 dimensions) to Phase 3 FastAPI microservice...
              </p>
            </div>

            <div className="space-y-2 text-left text-[11px] font-mono bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Aggregated {cart.length} cart products</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Calculated session duration & idle stats</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-brand-accent animate-pulse" />
                <span>Evaluating XGBoost / Random Forest risk...</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
