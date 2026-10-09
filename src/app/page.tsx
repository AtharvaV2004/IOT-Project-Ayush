import Link from 'next/link';
import { 
  ShieldCheck, 
  Cpu, 
  MapPin, 
  Sliders, 
  Activity, 
  Lock, 
  ArrowRight,
  Database,
  Wifi
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#080d1a] via-[#0d1527] to-[#080d1a] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[350px] bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-300">
              ColdChain Monitor
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-slate-800/50"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 px-4 py-2 rounded-lg shadow-md shadow-cyan-500/20 transition-all hover:shadow-cyan-500/35"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-20 max-w-6xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-8">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Real-Time ESP32 IoT Monitoring & Remote Control</span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl text-slate-100 leading-[1.15]">
          Precision Temperature & GPS Telemetry for{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
            Cold Chain Integrity
          </span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl font-normal leading-relaxed">
          Monitor sensitive pharmaceutical and cold storage environments with live DHT22 telemetry, GPS location coordinates, and bi-directional remote actuator controls.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-7 py-3.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:scale-[1.02]"
          >
            <span>Open Live Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-7 py-3.5 rounded-xl font-medium border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 transition-all hover:border-slate-600"
          >
            <span>Account Login</span>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 hover:border-cyan-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Live DHT22 Environmental Telemetry</h3>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Sub-second temperature &amp; humidity ingestion with automatic cold-chain threshold violation detection (&gt;8.0°C).
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 hover:border-blue-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">GPS Transit Geolocation</h3>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Real-time latitude/longitude coordinates with fix validity verification and one-click Google Maps tracking.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Bi-Directional Remote Control</h3>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Switch between AUTO, FORCE_ON, and FORCE_OFF modes with verified acknowledgement loops from the ESP32 firmware.
            </p>
          </div>
        </div>

        {/* Architecture Specs */}
        <div className="mt-14 w-full p-6 glass-panel rounded-2xl border border-slate-800 flex flex-wrap items-center justify-around gap-6 text-slate-400 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>ESP32 Hardware (GPIO 4, 16, 17, 21, 22, 25)</span>
          </div>
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Supabase PostgreSQL + RLS Security</span>
          </div>
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Authenticated Bearer & Device Token Guards</span>
          </div>
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-purple-400" />
            <span>Next.js App Router on Vercel</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        ColdChain Monitor IoT System &bull; Powered by Next.js, Supabase, and ESP32 Firmware
      </footer>
    </div>
  );
}
