import React from 'react';
import { Tag, Truck, RefreshCw, Bell, Sparkles, X, ArrowRight } from 'lucide-react';
import { RecommendResponse } from '../types';

interface NotificationBannerProps {
  recommendation: RecommendResponse;
  onClose?: () => void;
  onApply?: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  recommendation,
  onClose,
  onApply
}) => {
  const action = recommendation.recommended_action;

  const renderContent = () => {
    switch (action) {
      case 'Offer Coupon':
        return {
          icon: <Tag className="w-6 h-6 text-purple-400" />,
          title: 'Special 15% Rescue Discount Unlocked!',
          description: 'Complete your checkout right now to get an instant 15% discount applied to your active cart.',
          code: 'RESCUE15',
          btnText: 'Apply 15% Off Now',
          bg: 'from-purple-950/90 via-slate-900 to-indigo-950/90 border-purple-500/40'
        };

      case 'Free Shipping':
        return {
          icon: <Truck className="w-6 h-6 text-emerald-400" />,
          title: 'Complimentary Express Shipping Granted!',
          description: 'We have waived shipping charges for your active session. Order now for 1-day delivery.',
          code: 'FREESHIP',
          btnText: 'Claim Free Express Shipping',
          bg: 'from-emerald-950/90 via-slate-900 to-teal-950/90 border-emerald-500/40'
        };

      case 'Retry Payment':
        return {
          icon: <RefreshCw className="w-6 h-6 text-amber-400" />,
          title: 'Instant Payment Assistance',
          description: 'Having trouble completing payment? Try our alternative one-click instant payment options.',
          code: 'PAYHELP',
          btnText: 'Switch Payment Gateway',
          bg: 'from-amber-950/90 via-slate-900 to-yellow-950/90 border-amber-500/40'
        };

      case 'Send Reminder':
        return {
          icon: <Bell className="w-6 h-6 text-blue-400" />,
          title: 'Items Saved in Your Cart',
          description: 'Your high-demand items are reserved for 15 minutes. Complete your order before inventory expires.',
          code: 'RESERVED',
          btnText: 'Resume My Checkout',
          bg: 'from-blue-950/90 via-slate-900 to-cyan-950/90 border-blue-500/40'
        };

      default:
        return {
          icon: <Sparkles className="w-6 h-6 text-slate-400" />,
          title: 'Thank you for shopping with us!',
          description: 'Enjoy seamless shopping and instant checkout.',
          code: 'WELCOME',
          btnText: 'Continue Shopping',
          bg: 'from-slate-900 to-slate-950 border-slate-700'
        };
    }
  };

  const content = renderContent();

  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r ${content.bg} border backdrop-blur-xl shadow-2xl shadow-purple-900/20`}>
      
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between mb-4">
        <span className="px-3 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" /> AI Cart Rescue Triggered
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-2xl bg-white/10 border border-white/10 shrink-0">
            {content.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">{content.title}</h3>
            <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
              {content.description}
            </p>
            {content.code && (
              <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-xs font-mono font-bold text-amber-300">
                <span>Code:</span>
                <span className="tracking-widest">{content.code}</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onApply}
          className="w-full md:w-auto px-6 py-3 rounded-xl bg-white text-dark-900 hover:bg-slate-100 font-extrabold text-xs flex items-center justify-center space-x-2 transition-all shadow-xl active:scale-95 shrink-0"
        >
          <span>{content.btnText}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
