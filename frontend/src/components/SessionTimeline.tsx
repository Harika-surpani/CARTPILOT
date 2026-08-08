import React from 'react';
import { ClickstreamEvent } from '../types';
import { 
  Eye, 
  ShoppingCart, 
  MousePointer, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  LogIn, 
  LogOut 
} from 'lucide-react';

interface SessionTimelineProps {
  events: ClickstreamEvent[];
  className?: string;
}

export const SessionTimeline: React.FC<SessionTimelineProps> = ({ events, className = '' }) => {
  const getEventIcon = (type: ClickstreamEvent['event_type']) => {
    switch (type) {
      case 'page_view':
        return <Eye className="w-4 h-4 text-blue-400" />;
      case 'product_view':
        return <Eye className="w-4 h-4 text-purple-400" />;
      case 'add_to_cart':
        return <ShoppingCart className="w-4 h-4 text-emerald-400" />;
      case 'click':
        return <MousePointer className="w-4 h-4 text-amber-400" />;
      case 'checkout_started':
        return <CreditCard className="w-4 h-4 text-pink-400" />;
      case 'purchase':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'login':
        return <LogIn className="w-4 h-4 text-cyan-400" />;
      case 'logout':
        return <LogOut className="w-4 h-4 text-rose-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getEventBadgeColor = (type: ClickstreamEvent['event_type']) => {
    switch (type) {
      case 'add_to_cart':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'checkout_started':
        return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case 'purchase':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'product_view':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 text-xs font-mono">
        No clickstream events recorded yet in this session.
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
        {events.map((evt, idx) => (
          <div key={evt.id || idx} className="relative group">
            
            {/* Timeline Dot Icon */}
            <div className="absolute -left-[31px] top-0.5 w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center group-hover:border-brand-500 transition-colors">
              {getEventIcon(evt.event_type)}
            </div>

            {/* Event Content Box */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-1.5">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase font-bold border ${getEventBadgeColor(evt.event_type)}`}>
                  {evt.event_type.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <p className="text-xs text-slate-200 font-medium">
                {evt.details}
              </p>

              {evt.path && (
                <span className="text-[10px] text-slate-500 font-mono block">
                  Path: {evt.path}
                </span>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
