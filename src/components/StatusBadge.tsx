import { Wifi, WifiOff, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface StatusBadgeProps {
  isOnline: boolean;
  lastSeen?: string | null;
}

export default function StatusBadge({ isOnline, lastSeen }: StatusBadgeProps) {
  const formatTimeAgo = (isoString?: string | null) => {
    if (!isoString) return 'Never connected';
    const seconds = Math.floor((new Date().getTime() - new Date(isoString).getTime()) / 1000);
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return new Date(isoString).toLocaleTimeString();
  };

  return (
    <div className="flex items-center space-x-2.5">
      <div
        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
          isOnline
            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
            : 'bg-rose-950/60 border-rose-500/40 text-rose-400'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
          }`}
        />
        <span>{isOnline ? 'Online (ESP32)' : 'Offline (Disconnected)'}</span>
      </div>

      <span className="text-[11px] text-slate-400 font-mono">
        Last seen: {formatTimeAgo(lastSeen)}
      </span>
    </div>
  );
}
