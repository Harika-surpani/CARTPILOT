import React, { useState } from 'react';
import { useCartSession } from '../context/CartSessionContext';
import { RiskCard } from '../components/RiskCard';
import { RecommendationCard } from '../components/RecommendationCard';
import { NotificationBanner } from '../components/NotificationBanner';
import { SessionTimeline } from '../components/SessionTimeline';
import { 
  BrainCircuit, 
  RefreshCw, 
  Sliders, 
  Code2, 
  CheckCircle2, 
  Sparkles, 
  Bell,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LiveAIPanel: React.FC = () => {
  const navigate = useNavigate();
  const { 
    prediction, 
    recommendation, 
    runAIPrediction, 
    isAnalyzing, 
    sessionId, 
    events,
    getActiveSessionPayload
  } = useCartSession();

  const [showJsonRaw, setShowJsonRaw] = useState(false);
  const [activeRescueBanner, setActiveRescueBanner] = useState(true);

  const payload = getActiveSessionPayload();

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20 flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5" /> Phase 3 Live AI Inference Engine
            </span>
            <span className="text-xs font-mono text-slate-400">Session: #{sessionId}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-2">
            Real-Time AI Prediction & Rescue Panel
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live inspection of Machine Learning abandonment probabilities, intent heuristics, and recommended intervention.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowJsonRaw(!showJsonRaw)}
            className="px-4 py-2.5 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center space-x-2 border border-slate-700 transition-all"
          >
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>{showJsonRaw ? 'Hide JSON API' : 'View JSON API'}</span>
          </button>

          <button
            onClick={() => runAIPrediction()}
            disabled={isAnalyzing}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-brand-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>Re-Evaluate Risk</span>
          </button>
        </div>
      </div>

      {/* Triggered Rescue Intervention Banner (If active) */}
      {recommendation && activeRescueBanner && (
        <NotificationBanner
          recommendation={recommendation}
          onClose={() => setActiveRescueBanner(false)}
          onApply={() => navigate('/notification-demo')}
        />
      )}

      {/* Main Grid: Risk Meter + AI Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Column 1: Risk Gauge Card */}
        <RiskCard
          prediction={prediction}
          recommendation={recommendation}
        />

        {/* Column 2: Recommendation Engine Card */}
        {recommendation ? (
          <RecommendationCard
            recommendation={recommendation}
            onSimulateChannel={() => navigate('/notification-demo')}
          />
        ) : (
          <div className="glass-panel rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-4">
            <BrainCircuit className="w-12 h-12 text-brand-accent animate-pulse" />
            <h3 className="text-lg font-bold text-white">No Evaluation Triggered Yet</h3>
            <p className="text-xs text-slate-400 max-w-xs">
              Click "Re-Evaluate Risk" or proceed through checkout to trigger the real-time AI engine.
            </p>
            <button
              onClick={() => runAIPrediction()}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold"
            >
              Run Real-Time AI Inference
            </button>
          </div>
        )}

      </div>

      {/* Session Feature Vector Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-accent" />
            15-Dimensional Session Feature Vector
          </h3>
          <span className="text-xs font-mono text-slate-400">Aggregated Payload</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">cart_value</span>
            <span className="font-bold text-white text-sm">${payload.cart_value.toFixed(2)}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">total_events</span>
            <span className="font-bold text-white text-sm">{payload.total_events}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">session_duration_sec</span>
            <span className="font-bold text-white text-sm">{payload.session_duration_sec}s</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">avg_time_between_sec</span>
            <span className="font-bold text-white text-sm">{payload.avg_time_between_events_sec}s</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">product_views</span>
            <span className="font-bold text-white text-sm">{payload.product_views}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-[10px] text-slate-500 block">add_to_cart_count</span>
            <span className="font-bold text-white text-sm">{payload.add_to_cart_count}</span>
          </div>
        </div>
      </div>

      {/* Raw JSON Debugging Viewer (Optional) */}
      {showJsonRaw && recommendation && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
          <h4 className="font-bold text-cyan-400">Raw FastAPI Recommendation JSON Response:</h4>
          <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 overflow-x-auto text-[11px] leading-relaxed">
            {JSON.stringify(recommendation, null, 2)}
          </pre>
        </div>
      )}

      {/* Recent Clickstream Events Timeline */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Session Event Stream</h3>
        <SessionTimeline events={events} />
      </div>

    </div>
  );
};
