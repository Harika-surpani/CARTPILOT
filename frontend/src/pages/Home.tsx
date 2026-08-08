import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BrainCircuit, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Sliders, 
  BarChart3, 
  Bell,
  Play,
  Lock
} from 'lucide-react';
import { useCartSession } from '../context/CartSessionContext';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { sessionId } = useCartSession();

  return (
    <div className="space-y-20 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-brand-600/20 via-purple-600/20 to-pink-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10 px-4">
          
          {/* Top Hackathon Banner Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-brand-500/30 text-xs font-semibold text-brand-accent shadow-xl shadow-brand-500/10 animate-float">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Cart Rescue Platform</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
            <span className="text-slate-300 font-mono">Phase 4 MVP</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Stop E-Commerce Revenue Leakage with <br className="hidden sm:inline" />
            <span className="gradient-text">Real-Time AI Cart Rescue</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
            CartPilot aggregates real-time session clickstream signals, calculates machine learning cart abandonment risk, explains intent factors, and executes a single optimal rescue action before the user bounces.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/shop')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-extrabold text-sm flex items-center justify-center space-x-3 shadow-2xl shadow-brand-500/30 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Live Customer Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel hover:bg-slate-800/80 text-slate-200 font-bold text-sm flex items-center justify-center space-x-2 border border-slate-700/80 transition-all"
            >
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>View Executive Dashboard</span>
            </button>
          </div>

          {/* Key Metrics Quick Ribbon */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="glass-panel p-4 rounded-xl text-center border-slate-800">
              <span className="text-2xl font-black text-white font-mono block">10,000+</span>
              <span className="text-xs text-slate-400">Sessions Monitored</span>
            </div>
            <div className="glass-panel p-4 rounded-xl text-center border-slate-800">
              <span className="text-2xl font-black text-emerald-400 font-mono block">100.0%</span>
              <span className="text-xs text-slate-400">ML ROC-AUC Score</span>
            </div>
            <div className="glass-panel p-4 rounded-xl text-center border-slate-800">
              <span className="text-2xl font-black text-purple-400 font-mono block">35.9%</span>
              <span className="text-xs text-slate-400">Cart Recovery Rate</span>
            </div>
            <div className="glass-panel p-4 rounded-xl text-center border-slate-800">
              <span className="text-2xl font-black text-amber-400 font-mono block">&lt; 15ms</span>
              <span className="text-xs text-slate-400">Real-Time Inference</span>
            </div>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS ARCHITECTURE PIPELINE */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">End-to-End Pipeline</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">How CartPilot Rescues Abandoned Carts</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4 hover:border-brand-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">1. Real-Time Clickstream Aggregation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Continuously records events (product views, time between actions, cart additions, session duration) into a 15-feature real-time vector.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4 hover:border-brand-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">2. Phase 3 Inference Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evaluates risk scores using the Phase 2 trained XGBoost/Random Forest model (`best_model.pkl`), generating feature importance weights.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4 hover:border-brand-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">3. Single-Action Rescue Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Executes a business rule engine mapping intent (Price Sensitivity, Shipping Cost, Hesitation) to exactly ONE rescue action.
            </p>
          </div>

        </div>
      </section>

      {/* CORE FEATURES GRID */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">SaaS Capabilities</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Enterprise Features Built for Scale</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="glass-card p-6 rounded-2xl space-y-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <h4 className="font-bold text-white text-base">Zero Data Leakage ML</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Target variables and post-session outcomes are strictly segregated during training for maximum model integrity.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <h4 className="font-bold text-white text-base">Configurable Rule Engine</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Merchants set customized risk thresholds, discount caps, and automated escalation paths for high-value carts.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3">
            <Bell className="w-6 h-6 text-pink-400" />
            <h4 className="font-bold text-white text-base">Omnichannel Intervention</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Delivers rescue offers via website popups, dynamic cart banners, SMS alerts, or automated email reminders.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3">
            <TrendingUp className="w-6 h-6 text-amber-400" />
            <h4 className="font-bold text-white text-base">Attribution & Revenue Logs</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every decision is logged in an append-only audit trail (`audit.log`) to track incremental ROI and recovered sales.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <h4 className="font-bold text-white text-base">Executive Analytics</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Recharts visualizations for risk distributions, recovery funnel performance, and coupon margin protection.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3">
            <Lock className="w-6 h-6 text-purple-400" />
            <h4 className="font-bold text-white text-base">Production FastAPI REST</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-performance asynchronous endpoints `/predict`, `/recommend`, `/session`, `/metrics`, and `/health`.
            </p>
          </div>

        </div>
      </section>

      {/* START DEMO CTA FOOTER CARD */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="glass-panel p-10 rounded-3xl border border-brand-500/40 text-center space-y-6 bg-gradient-to-r from-brand-950/60 via-dark-900 to-purple-950/60 shadow-2xl">
          <h2 className="text-3xl font-extrabold text-white">Experience the Hackathon Demo</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Walk through a simulated shopping session: add items to cart, proceed to checkout, watch the live AI risk gauge update, and test the customer intervention!
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs inline-flex items-center space-x-2 shadow-xl shadow-brand-500/30 transition-all active:scale-95"
          >
            <span>Start Customer Journey</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
};
