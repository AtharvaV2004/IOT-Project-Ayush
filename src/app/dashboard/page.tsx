'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Cpu, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  AlertOctagon, 
  Lightbulb, 
  Clock, 
  TrendingUp,
  Radio
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import StatusBadge from '@/components/StatusBadge';
import GpsMapCard from '@/components/GpsMapCard';
import ControlPanel from '@/components/ControlPanel';
import TelemetryChart from '@/components/TelemetryChart';
import { SensorReading, DeviceCommand, ControlMode } from '@/types/database';

export default function DashboardOverviewPage() {
  const [deviceId, setDeviceId] = useState<string>('CC001');
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [latestCommand, setLatestCommand] = useState<DeviceCommand | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [lastSeen, setLastSeen] = useState<string | null>(null);

  // Fetch telemetry & commands
  const fetchDashboardData = useCallback(async (isBackground = false) => {
    if (!isBackground) setRefreshing(true);

    try {
      const supabase = createClient();

      // 1. Fetch latest sensor readings (last 30 records for chart & state)
      const { data: telemetryData, error: telemetryErr } = await supabase
        .from('sensor_readings')
        .select('*')
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (telemetryData) {
        setReadings(telemetryData);
        if (telemetryData.length > 0) {
          const latest = telemetryData[0];
          setLastSeen(latest.created_at);

          // Calculate online status: if last reading < 30 seconds ago
          const diffSeconds = Math.floor(
            (new Date().getTime() - new Date(latest.created_at).getTime()) / 1000
          );
          setIsOnline(diffSeconds <= 30);
        } else {
          setIsOnline(false);
          setLastSeen(null);
        }
      }

      // 2. Fetch latest command
      const { data: cmdData } = await supabase
        .from('device_commands')
        .select('*')
        .eq('device_id', deviceId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cmdData) {
        setLatestCommand(cmdData);
      }
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [deviceId]);

  // Initial load and periodic live auto-polling (every 3 seconds)
  useEffect(() => {
    fetchDashboardData(false);
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Derive latest states
  const latestReading = readings.length > 0 ? readings[0] : null;
  const currentTemp = latestReading?.temperature ?? null;
  const currentHum = latestReading?.humidity ?? null;
  const currentMode: ControlMode = latestReading?.control_mode || (latestCommand?.mode as ControlMode) || 'AUTO';
  const actualLedState = latestReading ? Boolean(latestReading.fan_status) : false;
  const hasGpsFix = latestReading ? Boolean(latestReading.gps_valid) : false;

  // Cold Chain Health checks
  const isTempViolated = currentTemp !== null && currentTemp > 8.0;
  const hasSensorError = latestReading !== null && currentTemp === null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Cold Chain Live Telemetry
            </h1>
            <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-semibold">
              Node: {deviceId}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time environmental monitoring, GPS location, and remote actuator control.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <StatusBadge isOnline={isOnline} lastSeen={lastSeen} />
          <button
            onClick={() => fetchDashboardData(false)}
            disabled={refreshing}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition-all disabled:opacity-50"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Critical Alert Banners */}
      {isTempViolated && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 flex items-center justify-between glow-rose">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-200">
                CRITICAL COLD CHAIN VIOLATION: Temperature Exceeded Threshold!
              </h4>
              <p className="text-xs text-rose-300/80 mt-0.5">
                Current temperature of <strong>{currentTemp?.toFixed(1)}°C</strong> exceeds the safe pharmaceutical threshold (&gt;8.0°C).
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block text-xs font-mono font-bold uppercase text-rose-400 bg-rose-950/80 px-3 py-1 rounded-lg border border-rose-500/30">
            Action Required
          </span>
        </div>
      )}

      {hasSensorError && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-200">DHT22 Sensor Hardware Warning</h4>
            <p className="text-xs text-amber-300/80 mt-0.5">
              ESP32 reported an invalid reading (NaN). Safe-mode active: LED/cooling has been kept off in AUTO mode.
            </p>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Temperature Card */}
        <div className={`glass-panel p-5 rounded-2xl border transition-all ${
          isTempViolated ? 'border-rose-500/50 bg-rose-950/10' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Temperature</span>
            <Thermometer className={`w-5 h-5 ${isTempViolated ? 'text-rose-400' : 'text-cyan-400'}`} />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className={`text-3xl font-extrabold tracking-tight font-mono ${
              isTempViolated ? 'text-rose-400' : currentTemp !== null ? 'text-white' : 'text-slate-500'
            }`}>
              {currentTemp !== null ? `${currentTemp.toFixed(1)}` : '--'}
            </span>
            <span className="text-base font-semibold text-slate-400">°C</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-500">Threshold: &le; 8.0°C</span>
            <span className={isTempViolated ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
              {currentTemp !== null ? (isTempViolated ? 'WARNING' : 'NORMAL') : 'NO DATA'}
            </span>
          </div>
        </div>

        {/* Humidity Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Humidity</span>
            <Droplets className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold tracking-tight font-mono text-white">
              {currentHum !== null ? `${currentHum.toFixed(1)}` : '--'}
            </span>
            <span className="text-base font-semibold text-slate-400">% RH</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>DHT22 Precision</span>
            <span className="text-indigo-400">&plusmn;2% accuracy</span>
          </div>
        </div>

        {/* Remote LED State Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">LED / Actuator</span>
            <Lightbulb className={`w-5 h-5 ${actualLedState ? 'text-amber-400' : 'text-slate-500'}`} />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className={`text-2xl font-extrabold tracking-tight font-mono ${
              actualLedState ? 'text-amber-400' : 'text-slate-400'
            }`}>
              {actualLedState ? 'ACTIVE [ON]' : 'STANDBY [OFF]'}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Reported Pin</span>
            <span className="text-slate-300">GPIO 25</span>
          </div>
        </div>

        {/* Current Operating Mode Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Operating Mode</span>
            <Radio className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold tracking-tight font-mono text-cyan-400">
              {currentMode}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Control State</span>
            <span className="text-cyan-300">Bi-directional</span>
          </div>
        </div>
      </div>

      {/* Middle Interactive Section: GPS Card & Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ControlPanel
          deviceId={deviceId}
          currentMode={currentMode}
          actualLedState={actualLedState}
          latestCommand={latestCommand}
          isOnline={isOnline}
          onModeChangeSuccess={(newMode) => {
            fetchDashboardData(true);
          }}
        />

        <GpsMapCard
          latitude={latestReading?.latitude ?? null}
          longitude={latestReading?.longitude ?? null}
          gpsValid={hasGpsFix}
        />
      </div>

      {/* Historical Telemetry Chart Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Live Environmental Telemetry Stream</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Recent 30 Data Ingestions (5s Intervals)
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline-block">
            Auto-refreshing every 3s
          </span>
        </div>

        <TelemetryChart readings={readings} />
      </div>
    </div>
  );
}
