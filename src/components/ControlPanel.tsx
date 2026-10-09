'use client';

import { useState } from 'react';
import { 
  Sliders, 
  Power, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Loader2,
  Fan,
  Lightbulb
} from 'lucide-react';
import { ControlMode, DeviceCommand } from '@/types/database';

interface ControlPanelProps {
  deviceId: string;
  currentMode: ControlMode;
  actualLedState: boolean;
  latestCommand: DeviceCommand | null;
  isOnline: boolean;
  onModeChangeSuccess?: (newMode: ControlMode) => void;
}

export default function ControlPanel({
  deviceId,
  currentMode,
  actualLedState,
  latestCommand,
  isOnline,
  onModeChangeSuccess,
}: ControlPanelProps) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleSetMode = async (mode: ControlMode) => {
    setLoading(true);
    setErrorMsg(null);
    setFeedbackMsg(null);

    try {
      const res = await fetch('/api/fan-control', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId,
          mode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch command');
      }

      setFeedbackMsg(`Mode '${mode}' requested. Polling ESP32 for confirmation...`);
      if (onModeChangeSuccess) {
        onModeChangeSuccess(mode);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error executing control command');
    } finally {
      setLoading(false);
    }
  };

  const isCommandAcknowledged =
    latestCommand?.acknowledged_at ||
    (latestCommand?.mode === currentMode);

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Actuator & LED Controller</h3>
              <p className="text-[11px] text-slate-400 font-mono">Bi-Directional Command Loop</p>
            </div>
          </div>

          {/* Actual Reported Status Indicator */}
          <div
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              actualLedState
                ? 'bg-amber-950/60 border-amber-500/40 text-amber-400 glow-amber'
                : 'bg-slate-900 border-slate-700/80 text-slate-400'
            }`}
          >
            <Lightbulb className={`w-3 h-3 ${actualLedState ? 'text-amber-400' : 'text-slate-500'}`} />
            <span>LED Hardware: {actualLedState ? 'ACTIVE [ON]' : 'IDLE [OFF]'}</span>
          </div>
        </div>

        {/* Offline Warning Banner */}
        {!isOnline && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Device CC001 is currently offline. Commands will remain queued and applied as soon as the ESP32 reconnects.
            </span>
          </div>
        )}

        {/* Success Feedback Banner */}
        {feedbackMsg && (
          <div className="mb-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs flex items-center space-x-2">
            <Clock className="w-4 h-4 shrink-0 animate-spin" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Error Feedback Banner */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Mode Selector Buttons */}
        <div className="grid grid-cols-3 gap-2.5 my-4">
          <button
            onClick={() => handleSetMode('AUTO')}
            disabled={loading}
            className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center space-y-1.5 ${
              currentMode === 'AUTO'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
            } disabled:opacity-50`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AUTO Mode</span>
            <span className="text-[9px] font-normal text-slate-400 font-mono">(&gt;8°C = ON)</span>
          </button>

          <button
            onClick={() => handleSetMode('FORCE_ON')}
            disabled={loading}
            className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center space-y-1.5 ${
              currentMode === 'FORCE_ON'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
            } disabled:opacity-50`}
          >
            <Power className="w-4 h-4 text-emerald-400" />
            <span>FORCE ON</span>
            <span className="text-[9px] font-normal text-slate-400 font-mono">(Always ON)</span>
          </button>

          <button
            onClick={() => handleSetMode('FORCE_OFF')}
            disabled={loading}
            className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center space-y-1.5 ${
              currentMode === 'FORCE_OFF'
                ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-md shadow-rose-500/20'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
            } disabled:opacity-50`}
          >
            <Power className="w-4 h-4 text-rose-400" />
            <span>FORCE OFF</span>
            <span className="text-[9px] font-normal text-slate-400 font-mono">(Always OFF)</span>
          </button>
        </div>
      </div>

      {/* Acknowledgement Status Footer */}
      <div className="pt-4 border-t border-slate-800/80 space-y-1.5 font-mono text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Desired Mode:</span>
          <span className="font-bold text-slate-200">{currentMode}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Last Command Time:</span>
          <span className="text-slate-300">
            {latestCommand?.created_at
              ? new Date(latestCommand.created_at).toLocaleTimeString()
              : 'Initial Boot'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">ESP32 Confirmation:</span>
          <span
            className={`font-semibold flex items-center space-x-1 ${
              isCommandAcknowledged ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {isCommandAcknowledged ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>Acknowledged</span>
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 animate-spin" />
                <span>Pending Poll...</span>
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
