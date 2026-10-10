'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Device } from '@/types/database';
import { Menu, X } from 'lucide-react';

const INITIAL_DEVICES: Device[] = [
  {
    id: 'cc001-id',
    device_id: 'CC001',
    name: 'Cold Storage Unit 01 (ESP32)',
    owner_id: 'station-operator',
    created_at: new Date().toISOString(),
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('CC001');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadDevices() {
      try {
        const res = await fetch('/api/devices');
        if (res.ok) {
          const data = await res.json();
          if (data.devices && data.devices.length > 0) {
            setDevices(data.devices);
            setSelectedDeviceId((prev) => 
              data.devices.some((d: Device) => d.device_id === prev) ? prev : data.devices[0].device_id
            );
          }
        }
      } catch (err) {
        console.error('Error loading devices from API:', err);
      }
    }

    loadDevices();
  }, []);

  return (
    <div className="min-h-screen bg-[#080d1a] flex flex-col md:flex-row text-slate-100">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold text-xs">
            CC
          </div>
          <span className="font-bold text-sm tracking-tight">ColdChain Monitor</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop & Mobile Responsive Sidebar */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block z-40`}>
        <Sidebar
          devices={devices}
          selectedDeviceId={selectedDeviceId}
          onSelectDevice={(id) => {
            setSelectedDeviceId(id);
            setMobileMenuOpen(false);
          }}
          userEmail="Live Console Operator"
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  );
}
