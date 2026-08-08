import React, { useState, useEffect } from 'react';
import { UserPreferences } from '../types';
import { getUserPreferences, updateUserPreferences } from '../services/api';
import { ShieldCheck, MessageSquare, Mail, Phone, AlertTriangle, CheckCircle, Ban } from 'lucide-react';

interface ConsentPolicyCardProps {
  userId?: string | number;
  consentStatus?: string;
  selectedChannel?: string;
  blockedChannels?: string[];
  onPreferencesChanged?: () => void;
}

export const ConsentPolicyCard: React.FC<ConsentPolicyCardProps> = ({
  userId = 1000,
  consentStatus = 'APPROVED',
  selectedChannel = 'WHATSAPP',
  blockedChannels = [],
  onPreferencesChanged
}) => {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchPrefs = async () => {
    try {
      const data = await getUserPreferences(userId);
      setPrefs(data);
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
    }
  };

  useEffect(() => {
    fetchPrefs();
  }, [userId]);

  const handleToggle = async (key: keyof UserPreferences) => {
    if (!prefs) return;
    setLoading(true);
    const updatedVal = !prefs[key];
    const updatePayload = { [key]: updatedVal };
    try {
      const updated = await updateUserPreferences(userId, updatePayload);
      setPrefs(updated);
      if (onPreferencesChanged) onPreferencesChanged();
    } catch (err) {
      console.error('Failed to update consent preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const getChannelBadge = (channel: string) => {
    switch (channel.toUpperCase()) {
      case 'WHATSAPP':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-mono font-bold text-xs flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> WHATSAPP</span>;
      case 'EMAIL':
        return <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-full font-mono font-bold text-xs flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> EMAIL</span>;
      case 'SMS':
        return <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-full font-mono font-bold text-xs flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> SMS</span>;
      default:
        return <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-full font-mono font-bold text-xs flex items-center gap-1.5"><Ban className="w-3.5 h-3.5" /> NO CHANNEL</span>;
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-5">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            User Communication Consent & Policy
          </h3>
          <span className="text-xs text-slate-400">User #{userId} Consent Evaluation</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono">Channel Selected:</span>
          {getChannelBadge(selectedChannel)}
        </div>
      </div>

      {/* Consent Status & Blocked Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Consent Status:</span>
          <span className={`font-bold px-2.5 py-0.5 rounded ${
            consentStatus === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
            consentStatus === 'PARTIAL' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
            'bg-rose-500/10 text-rose-400 border border-rose-500/30'
          }`}>
            {consentStatus}
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <span className="text-slate-400">Blocked Channels:</span>
          <span className="text-amber-300 font-bold">
            {blockedChannels.length > 0 ? blockedChannels.join(', ') : 'None'}
          </span>
        </div>
      </div>

      {/* Interactive Preferences Control Switches */}
      {prefs && (
        <div className="pt-2 border-t border-slate-800/60">
          <span className="text-[11px] font-mono text-slate-400 block mb-3 font-semibold">
            Live Consent Settings (Priority: WhatsApp ➔ Email ➔ SMS):
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            
            {/* WhatsApp */}
            <button
              onClick={() => handleToggle('whatsapp_opt_in')}
              disabled={loading}
              className={`p-3 rounded-xl border flex flex-col items-start transition-all ${
                prefs.whatsapp_opt_in 
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-[11px]">WhatsApp</span>
                <CheckCircle className={`w-3.5 h-3.5 ${prefs.whatsapp_opt_in ? 'text-emerald-400' : 'text-slate-600'}`} />
              </div>
              <span className="text-[9px] mt-1">{prefs.whatsapp_opt_in ? 'Opted In' : 'Opted Out'}</span>
            </button>

            {/* Email */}
            <button
              onClick={() => handleToggle('email_opt_in')}
              disabled={loading}
              className={`p-3 rounded-xl border flex flex-col items-start transition-all ${
                prefs.email_opt_in 
                  ? 'bg-cyan-950/30 border-cyan-500/40 text-cyan-300' 
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-[11px]">Email</span>
                <CheckCircle className={`w-3.5 h-3.5 ${prefs.email_opt_in ? 'text-cyan-400' : 'text-slate-600'}`} />
              </div>
              <span className="text-[9px] mt-1">{prefs.email_opt_in ? 'Opted In' : 'Opted Out'}</span>
            </button>

            {/* SMS */}
            <button
              onClick={() => handleToggle('sms_opt_in')}
              disabled={loading}
              className={`p-3 rounded-xl border flex flex-col items-start transition-all ${
                prefs.sms_opt_in 
                  ? 'bg-purple-950/30 border-purple-500/40 text-purple-300' 
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-[11px]">SMS</span>
                <CheckCircle className={`w-3.5 h-3.5 ${prefs.sms_opt_in ? 'text-purple-400' : 'text-slate-600'}`} />
              </div>
              <span className="text-[9px] mt-1">{prefs.sms_opt_in ? 'Opted In' : 'Opted Out'}</span>
            </button>

            {/* DND Toggle */}
            <button
              onClick={() => handleToggle('dnd_enabled')}
              disabled={loading}
              className={`p-3 rounded-xl border flex flex-col items-start transition-all ${
                prefs.dnd_enabled 
                  ? 'bg-rose-950/40 border-rose-500/50 text-rose-300' 
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-[11px]">DND Status</span>
                <Ban className={`w-3.5 h-3.5 ${prefs.dnd_enabled ? 'text-rose-400' : 'text-slate-600'}`} />
              </div>
              <span className="text-[9px] mt-1">{prefs.dnd_enabled ? 'DND ACTIVE (Blocks SMS)' : 'DND Disabled'}</span>
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
