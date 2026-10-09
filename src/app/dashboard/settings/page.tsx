'use client';

import { useState } from 'react';
import { 
  Settings, 
  Key, 
  ShieldCheck, 
  Cpu, 
  Bell, 
  Copy, 
  Check, 
  ExternalLink,
  Sliders
} from 'lucide-react';

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);
  const deviceToken = 'coldchain_secret_device_token_2026';

  const handleCopy = () => {
    navigator.clipboard.writeText(deviceToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="pb-2 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Device &amp; System Configuration
          </h1>
          <span className="px-2.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono text-xs font-semibold">
            Parameters
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Configure cold-chain parameters, hardware tokens, and environmental thresholds.
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device Token & Security Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">ESP32 Device Ingestion Token</h3>
              <p className="text-[11px] text-slate-400 font-mono">Authentication Credential</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            This token is included by the ESP32 in the <code className="text-cyan-400 font-mono">X-Device-Token</code> header to authenticate telemetry ingestion and command polling.
          </p>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <code className="text-xs text-cyan-300 font-mono truncate mr-2">
              {deviceToken}
            </code>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shrink-0"
              title="Copy Token"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center space-x-1.5 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Never share or expose your Supabase Service Role Key in firmware.</span>
          </div>
        </div>

        {/* Cold-Chain Threshold Rules Card */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Cold Chain Thresholds</h3>
              <p className="text-[11px] text-slate-400 font-mono">Temperature &amp; Offline Rules</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Max Critical Threshold</span>
              <span className="font-mono font-bold text-rose-400">8.0 °C</span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Heartbeat Timeout</span>
              <span className="font-mono font-bold text-amber-400">30 Seconds</span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Telemetry Ingestion Rate</span>
              <span className="font-mono font-bold text-cyan-400">Every 5 Seconds</span>
            </div>
          </div>
        </div>

        {/* Hardware Pinout Reference */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 md:col-span-2 space-y-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">ESP32 Hardware Pin Assignment</h3>
              <p className="text-[11px] text-slate-400 font-mono">Wiring Reference (main.c++)</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-500 block text-[10px]">DHT22 DATA</span>
              <span className="text-cyan-400 font-bold mt-1 block">GPIO 4</span>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-500 block text-[10px]">OLED SDA</span>
              <span className="text-cyan-400 font-bold mt-1 block">GPIO 21</span>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-500 block text-[10px]">OLED SCL</span>
              <span className="text-cyan-400 font-bold mt-1 block">GPIO 22</span>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-500 block text-[10px]">GPS TX &rarr; RX2</span>
              <span className="text-indigo-400 font-bold mt-1 block">GPIO 16</span>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-500 block text-[10px]">GPS RX &larr; TX2</span>
              <span className="text-indigo-400 font-bold mt-1 block">GPIO 17</span>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
              <span className="text-slate-500 block text-[10px]">LED / ACTUATOR</span>
              <span className="text-amber-400 font-bold mt-1 block">GPIO 25</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
