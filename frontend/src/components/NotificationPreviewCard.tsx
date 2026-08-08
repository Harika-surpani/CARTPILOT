import React from 'react';
import { RecommendResponse, RealtimeSessionPayload } from '../types';
import { MessageSquare, Mail, Phone, Bell, Zap, CheckCircle2 } from 'lucide-react';

interface NotificationPreviewCardProps {
  decision: RecommendResponse | RealtimeSessionPayload | null;
}

const getChannelIcon = (channel: string) => {
  switch (channel.toUpperCase()) {
    case 'WHATSAPP': return <MessageSquare className="w-5 h-5 text-emerald-400" />;
    case 'EMAIL': return <Mail className="w-5 h-5 text-cyan-400" />;
    case 'SMS': return <Phone className="w-5 h-5 text-purple-400" />;
    default: return <Bell className="w-5 h-5 text-slate-400" />;
  }
};

const buildMessagePreview = (action: string, cartValue: number, channel: string): string => {
  const actionMap: Record<string, string> = {
    'OFFER_COUPON': `🎁 You left items worth ₹${cartValue.toFixed(2)} in your cart! Use code RESCUE10 for a 10% discount. Complete your purchase now!`,
    'OFFER_FREE_SHIPPING': `🚚 Still thinking? Your cart (₹${cartValue.toFixed(2)}) qualifies for FREE SHIPPING! Limited offer – complete checkout now.`,
    'SEND_REMINDER': `🛒 Hey! You have ₹${cartValue.toFixed(2)} worth of items waiting in your cart. Don't miss out – complete your order!`,
    'RETRY_PAYMENT': `💳 It looks like your payment of ₹${cartValue.toFixed(2)} didn't go through. Try again with a different payment method!`,
    'DO_NOTHING': 'No intervention required at this time.',
    'Do Nothing': 'No intervention required at this time.',
  };
  return actionMap[action] || `Your cart (₹${cartValue.toFixed(2)}) is waiting. Complete your purchase!`;
};

export const NotificationPreviewCard: React.FC<NotificationPreviewCardProps> = ({ decision }) => {
  if (!decision) return null;

  const finalAction = decision.final_action || decision.recommended_action || 'DO_NOTHING';
  const channel = decision.selected_channel || 'WHATSAPP';
  const cartValue = ('cart_value' in decision) ? decision.cart_value : 0;
  const message = buildMessagePreview(finalAction, cartValue, channel);
  const isNoOp = finalAction === 'DO_NOTHING' || finalAction === 'Do Nothing';

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-400" />
          Notification Preview (Safe Demo Mode)
        </h3>
        <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
          Demo · No API keys used
        </span>
      </div>

      {isNoOp ? (
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-400 text-center">
          No external notification dispatched (DO_NOTHING decision or no eligible channel).
        </div>
      ) : (
        <div className="space-y-3">
          {/* Channel Badge */}
          <div className="flex items-center gap-2">
            {getChannelIcon(channel)}
            <span className="text-sm font-bold text-white">{channel} Notification Preview</span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> DELIVERED_DEMO
            </span>
          </div>

          {/* Message Body */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 to-slate-900 border border-brand-500/20 text-sm text-slate-200 leading-relaxed font-sans">
            {message}
          </div>

          {/* Action taken */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Zap className="w-3.5 h-3.5 text-brand-accent" />
            <span>Triggered by: <span className="text-white font-bold">{finalAction}</span></span>
          </div>
        </div>
      )}
    </div>
  );
};
