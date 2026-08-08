import React, { useState } from 'react';
import { useCartSession } from '../context/CartSessionContext';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Sparkles, 
  Tag, 
  Truck, 
  RefreshCw, 
  Check, 
  ArrowRight,
  Globe
} from 'lucide-react';

export const NotificationDemo: React.FC = () => {
  const { recommendation, cartValue, sessionId } = useCartSession();
  const [activeChannel, setActiveChannel] = useState<'popup' | 'email' | 'sms' | 'whatsapp'>('popup');

  const action = recommendation?.recommended_action ?? 'Offer Coupon';
  const reason = recommendation?.reason ?? 'Price Sensitive';

  const channelIcons = {
    popup: Globe,
    email: Mail,
    sms: MessageSquare,
    whatsapp: Smartphone,
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <span className="text-xs font-mono text-pink-400 bg-pink-500/10 px-2.5 py-1 rounded-full border border-pink-500/20">
          Omnichannel Intervention Simulator
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-2">
          Customer Rescue Notification Preview
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Simulate exactly how the AI recommended single action (<span className="font-mono text-brand-accent font-bold">{action}</span>) is delivered across customer channels.
        </p>
      </div>

      {/* Channel Switcher Tabs */}
      <div className="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 w-fit">
        {(['popup', 'email', 'sms', 'whatsapp'] as const).map((channel) => {
          const Icon = channelIcons[channel];
          return (
            <button
              key={channel}
              onClick={() => setActiveChannel(channel)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all ${
                activeChannel === channel
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="capitalize">{channel === 'popup' ? 'Web Popup' : channel}</span>
            </button>
          );
        })}
      </div>

      {/* SIMULATOR PREVIEW CONTAINER */}
      <div className="max-w-3xl mx-auto glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
        
        {/* 1. WEB POPUP PREVIEW */}
        {activeChannel === 'popup' && (
          <div className="glass-panel p-8 rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-950/80 via-slate-900 to-indigo-950/80 space-y-6 shadow-2xl animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-purple-500/30">
                <Sparkles className="w-3.5 h-3.5" /> E-Commerce Exit Intent Popup
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Session: #{sessionId}</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold text-white">Wait! Don't leave your cart behind.</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our AI engine detected you have <span className="font-bold text-amber-300 font-mono">${cartValue > 0 ? cartValue.toFixed(2) : '299.99'}</span> in your cart. Claim your instant rescue discount before items sell out!
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-purple-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Use Promo Code:</span>
                <span className="text-lg font-mono font-black text-amber-300 tracking-widest">RESCUE15</span>
              </div>
              <button className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/30">
                Apply Code Now
              </button>
            </div>
          </div>
        )}

        {/* 2. EMAIL PREVIEW */}
        {activeChannel === 'email' && (
          <div className="glass-panel rounded-2xl border border-slate-700 bg-slate-900 overflow-hidden shadow-2xl animate-in fade-in duration-300">
            {/* Email Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>From: <strong className="text-white">CartPilot Rescue &lt;support@cartpilot.ai&gt;</strong></span>
                <span>Just now</span>
              </div>
              <div className="text-slate-400">To: <strong className="text-white">alex.vance@example.com</strong></div>
              <div className="text-brand-accent font-bold pt-1">Subject: We saved your cart + Special 15% Discount!</div>
            </div>

            {/* Email Body */}
            <div className="p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
              <p>Hi Alex,</p>
              <p>
                We noticed you left some items in your shopping cart. As a special customer courtesy, we have activated an exclusive 15% rescue discount for your session.
              </p>
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-center space-y-2">
                <span className="text-slate-400 text-[11px] block">Your Active Promo Code</span>
                <span className="text-xl font-mono font-black text-amber-400 tracking-widest block">RESCUE15</span>
                <button className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs inline-flex items-center space-x-2">
                  <span>Complete My Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. SMS PREVIEW */}
        {activeChannel === 'sms' && (
          <div className="max-w-sm mx-auto p-4 rounded-[40px] bg-slate-950 border-4 border-slate-800 shadow-2xl space-y-4 animate-in fade-in duration-300">
            <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto mb-2"></div>
            <div className="text-center text-[10px] text-slate-500 font-mono">SMS Notification • CartPilot AI</div>

            <div className="p-4 rounded-2xl bg-brand-600/20 border border-brand-500/30 text-white text-xs space-y-2">
              <p>
                ⚡ CartPilot Alert: Items in your cart are reserving fast! Use code <strong>RESCUE15</strong> to get 15% off + free shipping today.
              </p>
              <span className="text-[10px] text-slate-400 block text-right font-mono">12:45 PM</span>
            </div>
          </div>
        )}

        {/* 4. WHATSAPP PREVIEW */}
        {activeChannel === 'whatsapp' && (
          <div className="max-w-sm mx-auto p-4 rounded-[40px] bg-emerald-950/40 border-4 border-emerald-900/60 shadow-2xl space-y-4 animate-in fade-in duration-300">
            <div className="w-20 h-4 bg-emerald-900/60 rounded-full mx-auto mb-2"></div>
            <div className="text-center text-[10px] text-emerald-400 font-mono">WhatsApp Business • CartPilot</div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 text-white text-xs space-y-2">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <Smartphone className="w-4 h-4" />
                <span>CartPilot Verified Store</span>
              </div>
              <p className="text-slate-300">
                Hi Alex! 🛒 Your shopping session items are held for you. Reply <strong>RESCUE</strong> or tap below to claim your 15% off discount link immediately!
              </p>
              <div className="pt-2 border-t border-slate-800 flex justify-center">
                <button className="text-emerald-400 font-bold text-xs hover:underline">
                  Claim Discount Link
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
