'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Sidebar from '@/components/Sidebar';
import { Device } from '@/types/database';
import { Loader2, Menu, X } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('CC001');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function initSessionAndDevices() {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: authErr,
        } = await supabase.auth.getUser();

        if (authErr || !user) {
          router.push('/login');
          return;
        }

        setUserEmail(user.email || 'Operator');

        // Fetch user's registered devices
        const { data: userDevices } = await supabase
          .from('devices')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: true });

        if (userDevices && userDevices.length > 0) {
          setDevices(userDevices);
          setSelectedDeviceId(userDevices[0].device_id);
        } else {
          // If no device exists yet for this user, we can auto-seed or show CC001 placeholder
          const defaultDevice: Device = {
            id: 'temp-id',
            device_id: 'CC001',
            name: 'Cold Storage Unit 01 (ESP32)',
            owner_id: user.id,
            created_at: new Date().toISOString(),
          };
          setDevices([defaultDevice]);
          setSelectedDeviceId('CC001');
        }
      } catch (err) {
        console.error('Error initializing dashboard layout:', err);
      } finally {
        setLoading(false);
      }
    }

    initSessionAndDevices();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080d1a] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
        <p className="text-xs text-slate-400 font-mono">Initializing ColdChain Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080d1a] flex flex-col md:flex-row text-slate-100">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center text-slate-950 font-bold text-xs">
            CC
          </div>
          <span className="font-bold text-sm">ColdChain Monitor</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
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
          userEmail={userEmail}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  );
}
