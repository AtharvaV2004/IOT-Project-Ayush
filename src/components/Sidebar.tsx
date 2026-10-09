'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Activity, 
  LayoutDashboard, 
  History, 
  Settings, 
  LogOut, 
  Cpu,
  Layers,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
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
  userEmail,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navLinks = [
    {
      label: 'Overview Dashboard',
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
    <aside className="w-64 bg-slate-950/80 border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 backdrop-blur-xl">
      <div>
        {/* Branding Header */}
        <div className="p-6 border-b border-slate-800/80">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block">ColdChain</span>
              <span className="text-[10px] text-cyan-400 font-mono font-medium tracking-wider uppercase block">
                Monitor v1.0
              </span>
            </div>
          </Link>
        </div>

        {/* Device Switcher */}
        <div className="px-4 py-4 border-b border-slate-800/60">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Unit</span>
          </label>
          {devices.length > 0 ? (
            <div className="relative">
              <select
                value={selectedDeviceId}
                onChange={(e) => onSelectDevice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
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
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/30'
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

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between mb-3">
          <div className="truncate pr-2">
            <p className="text-[11px] font-semibold text-slate-300 truncate">
              {userEmail || 'Operator'}
            </p>
            <p className="text-[10px] text-slate-500 font-mono">Authenticated Session</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800/80 hover:border-rose-500/30 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
