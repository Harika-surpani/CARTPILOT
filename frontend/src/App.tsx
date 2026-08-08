import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartSessionProvider } from './context/CartSessionContext';
import { Navbar } from './components/Navbar';

import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Checkout } from './pages/Checkout';
import { LiveAIPanel } from './pages/LiveAIPanel';
import { Dashboard } from './pages/Dashboard';
import { SessionDetails } from './pages/SessionDetails';
import { NotificationDemo } from './pages/NotificationDemo';
import { AdminAnalytics } from './pages/AdminAnalytics';

export const App: React.FC = () => {
  return (
    <CartSessionProvider>
      <Router>
        <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/live-ai" element={<LiveAIPanel />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/session-details" element={<SessionDetails />} />
              <Route path="/notification-demo" element={<NotificationDemo />} />
              <Route path="/analytics" element={<AdminAnalytics />} />
            </Routes>
          </main>

          {/* SaaS Footer */}
          <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-white">CartPilot AI Platform</span>
                <span>— Enterprise AI Cart Rescue Engine</span>
              </div>
              <div className="flex items-center space-x-6">
                <span>Phase 3 FastAPI Integration</span>
                <span>React 19 + TypeScript + Tailwind</span>
                <span className="text-emerald-400 font-mono">Status: Production MVP</span>
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </CartSessionProvider>
  );
};

export default App;
