'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Activity, 
  LayoutDashboard, 
  History, 
  Settings, 
  Cpu,
  ChevronRight,
  Home,
  Shield,
  Radio
} from 'lucide-react';
import { Device } from '@/types/database';

interface SidebarProps {
  devices: Device[];
  selectedDeviceId: string;
  onSelectDevice: (deviceId: string) => void;
  userEmail?: string | null;
}

export default function Sidebar({
  devices,
  selectedDeviceId,
  onSelectDevice,
}: SidebarProps) {
  const pathname = usePathname();

  const navLinks = [
    {
      label: 'Live Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Telemetry History',
      href: '/dashboard/history',
      icon: History,
    },
    {
      label: 'Device Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-slate-950/85 border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 backdrop-blur-xl">
      <div>
        {/* Branding Header */}
        <div className="p-5 border-b border-slate-800/80">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block group-hover:text-cyan-400 transition-colors">
                ColdChain
              </span>
              <span className="text-[10px] text-cyan-400 font-mono font-medium tracking-wider uppercase block">
                Monitor IoT v1.0
              </span>
            </div>
          </Link>
        </div>

        {/* Device Switcher */}
        <div className="px-4 py-4 border-b border-slate-800/60 bg-slate-900/20">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Unit</span>
          </label>
          {devices.length > 0 ? (
            <div className="relative">
              <select
                value={selectedDeviceId}
                onChange={(e) => onSelectDevice(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer hover:border-slate-600 transition-colors"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.device_id}>
                    {d.device_id} ({d.name})
                  </option>
                ))}
              </select>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
            </div>
          ) : (
            <div className="text-xs text-amber-400/80 bg-amber-500/10 p-2 rounded border border-amber-500/20 font-mono">
              Device CC001 (Default)
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* System Status & Portal Home Link */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-3">
        <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center space-x-1.5">
              <Radio className="w-3 h-3 text-emerald-400" />
              <span>Telemetry Feed</span>
            </span>
            <div className="flex items-center space-x-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-medium">LIVE</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-300 font-medium">Station Console</div>
          <div className="text-[10px] text-slate-500 font-mono">Open Access &bull; ESP32 Linked</div>
        </div>

        <Link
          href="/"
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-cyan-300 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/30 transition-all"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return to Overview</span>
        </Link>
      </div>
    </aside>
  );
}
