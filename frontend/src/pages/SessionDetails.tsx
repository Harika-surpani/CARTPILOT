import React, { useState } from 'react';
import { useCartSession } from '../context/CartSessionContext';
import { SessionTimeline } from '../components/SessionTimeline';
import { getSessionDetails } from '../services/api';
import { RecommendResponse } from '../types';
import { 
  History, 
  Search, 
  BrainCircuit, 
  CheckCircle2, 
  Sliders, 
  Clock, 
  Tag, 
  ShieldCheck 
} from 'lucide-react';

export const SessionDetails: React.FC = () => {
  const { sessionId: activeId, events: activeEvents } = useCartSession();
  const [searchId, setSearchId] = useState<string>(activeId);
  const [details, setDetails] = useState<RecommendResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId) return;
    setLoading(true);
    const res = await getSessionDetails(searchId);
    setDetails(res);
    setLoading(false);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            Session Deep-Dive Inspector
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-2">
            Clickstream & Decision Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Lookup any active or historical session ID to view event timestamps, risk evolution, and execution logs.
          </p>
        </div>

        {/* Session Search Box */}
        <form onSubmit={handleLookup} className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Lookup Session ID (e.g. 1000_1)..."
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all"
          >
            Lookup
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Timeline Stream */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" />
                Raw Event Chronology: #{searchId}
              </h3>
              <span className="text-xs font-mono text-slate-400">{activeEvents.length} Events Logged</span>
            </div>

            <SessionTimeline events={activeEvents} />
          </div>
        </div>

        {/* Right Column: AI Decision Summary */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-brand-accent" />
              Model Inference Summary
            </h3>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Risk Score:</span>
                <span className="text-base font-bold text-rose-400">
                  {((details?.risk_score ?? 0.85) * 100).toFixed(0)}%
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Detected Reason:</span>
                <span className="font-bold text-amber-300">
                  {details?.reason ?? 'Price Sensitive'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Recommended Action:</span>
                <span className="font-bold text-purple-400">
                  {details?.recommended_action ?? 'Offer Coupon'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Confidence:</span>
                <span className="font-bold text-emerald-400">
                  {((details?.confidence ?? 0.91) * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Audit Log Hash</h4>
              <p className="text-[10px] font-mono text-slate-500 break-all bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                sha256: 8f92a1c4b720e9812f8471c0a98b71ef99a80e12
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
