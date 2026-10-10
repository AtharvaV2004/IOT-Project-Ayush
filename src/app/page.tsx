import Link from 'next/link';
import { 
  Cpu, 
  MapPin, 
  Sliders, 
  Activity, 
  ArrowRight,
  Database,
  Wifi,
  Thermometer,
  Droplets,
  Radio,
  FileSpreadsheet,
  Zap,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#080d1a] via-[#0d1527] to-[#080d1a] relative overflow-hidden text-slate-100">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[350px] bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-[600px] h-[300px] bg-cyan-500/5 blur-[150px] pointer-events-none rounded-full" />

      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block group-hover:text-cyan-400 transition-colors">
                ColdChain Monitor
              </span>
              <span className="text-[10px] text-cyan-400 font-mono font-medium tracking-wider uppercase block">
                ESP32 IoT Platform
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-3 sm:space-x-6">
            <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-300">
              <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">
                Live Telemetry
              </Link>
              <Link href="/dashboard/history" className="hover:text-cyan-400 transition-colors">
                Audit History
              </Link>
              <Link href="/dashboard/settings" className="hover:text-cyan-400 transition-colors">
                Hardware Specs
              </Link>
            </nav>

            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-2 text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 px-4 py-2 rounded-xl shadow-md shadow-cyan-500/20 transition-all hover:shadow-cyan-500/35 hover:scale-[1.02]"
            >
              <span>Launch Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 pt-16 pb-20 max-w-6xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-8 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span>Open Operator Portal &bull; Real-Time ESP32 Telemetry</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl text-slate-100 leading-[1.12]">
          Precision Temperature & GPS Telemetry for{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
            Cold Chain Integrity
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl font-normal leading-relaxed">
          Monitor sensitive pharmaceutical cold storage in real-time with sub-second DHT22 sensor streams, satellite GPS geolocation, and bi-directional remote actuator controls.
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-3.5 rounded-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-xl shadow-cyan-500/25 transition-all hover:scale-[1.02]"
          >
            <span>Open Live Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard/history"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl font-semibold border border-slate-700 bg-slate-900/70 hover:bg-slate-800 text-slate-200 transition-all hover:border-slate-600"
          >
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            <span>Audit &amp; Compliance Logs</span>
          </Link>
        </div>

        {/* Live System Snapshot Preview Card */}
        <div className="mt-16 w-full max-w-4xl p-6 glass-panel rounded-3xl border border-slate-800/80 bg-slate-950/40 text-left relative overflow-hidden shadow-2xl shadow-cyan-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-800/80">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Target Node: CC001 (Cold Storage Unit 01)</h3>
                <p className="text-[11px] text-slate-400 font-mono">ESP32 Firmware Telemetry Feed</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Station Ready</span>
              </span>
              <Link
                href="/dashboard"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-semibold group"
              >
                <span>Live View</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase font-mono tracking-wider">Temperature</span>
                <Thermometer className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-white font-mono">5.2 °C</div>
              <div className="text-[10px] text-emerald-400 font-mono mt-1 font-semibold">Safe (&le; 8.0°C)</div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase font-mono tracking-wider">Humidity</span>
                <Droplets className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-white font-mono">58.4 %</div>
              <div className="text-[10px] text-indigo-400 font-mono mt-1 font-semibold">RH Optimum</div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase font-mono tracking-wider">GPS Coordinates</span>
                <MapPin className="w-4 h-4 text-blue-400" />
              </div>
              <div className="mt-2 text-sm font-bold text-white font-mono truncate">28.6139° N</div>
              <div className="text-[10px] text-blue-400 font-mono mt-1 font-semibold">3D Satellite Fix</div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase font-mono tracking-wider">Control Mode</span>
                <Sliders className="w-4 h-4 text-purple-400" />
              </div>
              <div className="mt-2 text-2xl font-black text-cyan-400 font-mono">AUTO</div>
              <div className="text-[10px] text-purple-400 font-mono mt-1 font-semibold">Closed-Loop Active</div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 hover:border-cyan-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">DHT22 Environmental Telemetry</h3>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Real-time temperature and relative humidity tracking with automatic pharmaceutical breach detection (&gt;8.0°C).
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 hover:border-blue-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">GPS Transit Geolocation</h3>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Real-time latitude and longitude coordinate telemetry with TinyGPS++ fix validity and instant map plotting.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Bi-Directional Remote Actuator</h3>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Switch seamlessly between AUTO, FORCE_ON, and FORCE_OFF modes with verified acknowledgement loops from the ESP32.
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
            <span>Supabase PostgreSQL Time-Series Storage</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Open Station Console &bull; Instant Access</span>
          </div>
          <div className="flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-purple-400" />
            <span>Next.js 14 App Router on Vercel</span>
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
