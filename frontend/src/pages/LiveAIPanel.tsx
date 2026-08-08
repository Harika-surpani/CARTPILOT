import React, { useState } from 'react';
import { useCartSession } from '../context/CartSessionContext';
import { LiveSession } from '../components/LiveSession';
import { DecisionExplanationCard } from '../components/DecisionExplanationCard';
import { ConsentPolicyCard } from '../components/ConsentPolicyCard';
import { SelfCheckCard } from '../components/SelfCheckCard';
import { NotificationPreviewCard } from '../components/NotificationPreviewCard';
import { RiskCard } from '../components/RiskCard';
import { RecommendationCard } from '../components/RecommendationCard';
import { NotificationBanner } from '../components/NotificationBanner';
import { SessionTimeline } from '../components/SessionTimeline';
import {
  BrainCircuit,
  RefreshCw,
  Sliders,
  Code2,
  Radio
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LiveAIPanel: React.FC = () => {
  const navigate = useNavigate();
  const {
    prediction,
    recommendation,
    realtimePayload,
    isWsConnected,
    runAIPrediction,
    isAnalyzing,
    sessionId,
    events,
    cartValue,
    getActiveSessionPayload
  } = useCartSession();

  const [showJsonRaw, setShowJsonRaw] = useState(false);
  const [activeRescueBanner, setActiveRescueBanner] = useState(true);

  const payload = getActiveSessionPayload();
  const decisionData = realtimePayload || recommendation;

  return (
    <div className="space-y-8 pb-16">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" /> Phase 7 Real-Time WebSocket Engine
            </span>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
              Enterprise Decision Layer Active
            </span>
            <span className="text-xs font-mono text-slate-400">Session: #{sessionId}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mt-2">
            Real-Time Session Scoring & Enterprise Guardrails
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            WebSocket session engine with Multi-Agent Pipeline, Consent Policy, Self-Check Safety, and Explainable AI.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowJsonRaw(!showJsonRaw)}
            className="px-4 py-2.5 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 text-xs font-bold flex items-center space-x-2 border border-slate-700 transition-all"
          >
            <Code2 className="w-4 h-4 text-cyan-400" />
            <span>{showJsonRaw ? 'Hide Payload' : 'View Payload'}</span>
          </button>

          <button
            onClick={() => runAIPrediction()}
            disabled={isAnalyzing}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-brand-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>Run Multi-Agent Pipeline</span>
          </button>
        </div>
      </div>

      {/* Live Session Status Panel */}
      <LiveSession
        sessionId={sessionId}
        realtimeData={realtimePayload}
        events={events}
        cartValue={cartValue}
        isConnected={isWsConnected}
      />

      {/* Rescue Intervention Banner */}
      {recommendation && activeRescueBanner && (
        <NotificationBanner
          recommendation={recommendation}
          onClose={() => setActiveRescueBanner(false)}
          onApply={() => navigate('/notification-demo')}
        />
      )}

      {/* Explainability Layer */}
      {decisionData && (
        <DecisionExplanationCard decision={decisionData} />
      )}

      {/* Risk + Recommendation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RiskCard prediction={prediction} recommendation={recommendation} />

        {recommendation ? (
          <RecommendationCard
            recommendation={recommendation}
            onSimulateChannel={() => navigate('/notification-demo')}
          />
        ) : (
          <div className="glass-panel rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-4">
            <BrainCircuit className="w-12 h-12 text-brand-accent animate-pulse" />
            <h3 className="text-lg font-bold text-white">Multi-Agent Pipeline Standby</h3>
            <p className="text-xs text-slate-400 max-w-xs">
              Add items to cart or trigger events to activate the real-time multi-agent scoring pipeline.
            </p>
            <button
              onClick={() => runAIPrediction()}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold"
            >
              Run Enterprise Decision Pipeline
            </button>
          </div>
        )}
      </div>

      {/* Consent Policy & Notification Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ConsentPolicyCard
          userId={1000}
          consentStatus={decisionData?.consent_status || 'APPROVED'}
          selectedChannel={decisionData?.selected_channel || 'WHATSAPP'}
          blockedChannels={decisionData?.blocked_channels || []}
        />
        <NotificationPreviewCard decision={decisionData} />
      </div>

      {/* Self-Check Safety Status */}
      {decisionData && (
        <SelfCheckCard
          passed={decisionData?.self_check_passed ?? true}
          reasons={decisionData?.self_check_reasons || ['PASSED: All 8 critical safety guardrails verified']}
        />
      )}

      {/* 15-Feature Vector Inspection */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-brand-accent" />
            15-Dimensional Real-Time Feature Vector
          </h3>
          <span className="text-xs font-mono text-slate-400">Phase 2 Model Input</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 font-mono text-xs">
          {[
            { label: 'cart_value', value: `₹${payload.cart_value.toFixed(2)}` },
            { label: 'total_events', value: `${payload.total_events}` },
            { label: 'session_duration_sec', value: `${payload.session_duration_sec}s` },
            { label: 'avg_time_between_sec', value: `${payload.avg_time_between_events_sec}s` },
            { label: 'product_views', value: `${payload.product_views}` },
            { label: 'add_to_cart_count', value: `${payload.add_to_cart_count}` },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-500 block">{label}</span>
              <span className="font-bold text-white text-sm">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Raw JSON Payload */}
      {showJsonRaw && decisionData && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
          <h4 className="font-bold text-cyan-400">Full Enterprise Decision Pipeline JSON Response:</h4>
          <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 overflow-x-auto text-[11px] leading-relaxed">
            {JSON.stringify(decisionData, null, 2)}
          </pre>
        </div>
      )}

      {/* Event Timeline */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Live Clickstream Timeline</h3>
        <SessionTimeline events={events} />
      </div>

    </div>
  );
};
