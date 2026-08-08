import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  BrainCircuit, 
  LayoutDashboard, 
  Bell, 
  BarChart3, 
  RefreshCw, 
  ShieldCheck, 
  Activity,
  CreditCard,
  History
} from 'lucide-react';
import { useCartSession } from '../context/CartSessionContext';

export const Navbar: React.FC = () => {
  const { totalCartItems, sessionId, resetSession, backendStatus } = useCartSession();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Title */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-500 p-0.5 shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-all">
                <div className="w-full h-full bg-dark-900 rounded-[10px] flex items-center justify-center">
                  <BrainCircuit className="w-6 h-6 text-brand-accent group-hover:rotate-12 transition-transform" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  CartPilot <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-accent border border-brand-500/30 font-mono">AI SaaS</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Cart Rescue Engine</span>
              </div>
            </Link>

            {/* Backend Health Status Badge */}
            <div className="hidden md:flex items-center ml-4 pl-4 border-l border-slate-800">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-xs font-medium text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <Activity className="w-3.5 h-3.5" />
                <span>FastAPI {backendStatus?.version || 'Active'}</span>
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/') 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Home
            </Link>

            <Link
              to="/shop"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/shop') 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-indigo-400" />
              Shop Catalog
            </Link>

            <Link
              to="/checkout"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/checkout') 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              Checkout
            </Link>

            <Link
              to="/live-ai"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/live-ai') 
                  ? 'bg-brand-600/30 text-brand-accent border border-brand-500/40 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BrainCircuit className="w-4 h-4 text-purple-400 animate-pulse-slow" />
              Live AI Panel
            </Link>

            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/dashboard') 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-blue-400" />
              Business Dashboard
            </Link>

            <Link
              to="/session-details"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/session-details') 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <History className="w-4 h-4 text-amber-400" />
              Session Timeline
            </Link>

            <Link
              to="/notification-demo"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/notification-demo') 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Bell className="w-4 h-4 text-pink-400" />
              Rescue Preview
            </Link>

            <Link
              to="/analytics"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/analytics') 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Admin ML Analytics
            </Link>
          </nav>

          {/* Session Info & Actions */}
          <div className="flex items-center space-x-3">
            {/* Session ID Chip */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-mono text-slate-300">
              <span className="text-slate-500">Session:</span>
              <span className="text-brand-accent font-semibold">{sessionId}</span>
              <button
                onClick={resetSession}
                title="Reset Session Data"
                className="ml-1 p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Cart Link with Badge */}
            <Link
              to="/shop"
              className="relative p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 transition-all hover:scale-105"
            >
              <ShoppingBag className="w-5 h-5 text-brand-accent" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30 animate-bounce">
                  {totalCartItems}
                </span>
              )}
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
};
