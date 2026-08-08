import React from 'react';
import { CheckCircle2, XCircle, ShieldAlert, Check } from 'lucide-react';

interface SelfCheckCardProps {
  passed?: boolean;
  reasons?: string[];
}

export const SelfCheckCard: React.FC<SelfCheckCardProps> = ({
  passed = true,
  reasons = ["PASSED: All 8 critical safety guardrails verified"]
}) => {
  const criticalChecks = [
    "Exactly ONE action exists",
    "Action belongs to allowed list",
    "Discount is within budget cap",
    "Expected margin is valid",
    "User consent is valid",
    "Communication channel allowed",
    "Risk score exists in range [0, 1]",
    "Required session & user info exists"
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 font-mono text-xs">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-purple-400" />
          Safety Self-Check Validation Engine
        </h3>
        <span className={`px-3 py-1 rounded-full font-bold flex items-center gap-1.5 border ${
          passed 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
        }`}>
          {passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
          <span>SELF-CHECK {passed ? 'PASSED' : 'FAILED'}</span>
        </span>
      </div>

      {/* 8-Point Check Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
        {criticalChecks.map((checkText, idx) => (
          <div key={idx} className={`p-2.5 rounded-xl border flex items-center gap-2 ${
            passed 
              ? 'bg-slate-900/80 border-slate-800 text-slate-300' 
              : 'bg-rose-950/20 border-rose-500/20 text-rose-300'
          }`}>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
              passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              {passed ? <Check className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            </div>
            <span className="truncate">{checkText}</span>
          </div>
        ))}
      </div>

      {/* Logged Reasons */}
      {reasons && reasons.length > 0 && (
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] space-y-1">
          <span className="text-slate-500 block font-semibold uppercase">Self-Check Audit Log:</span>
          {reasons.map((r, i) => (
            <p key={i} className={r.startsWith('FAILED') ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
              • {r}
            </p>
          ))}
        </div>
      )}

    </div>
  );
};
