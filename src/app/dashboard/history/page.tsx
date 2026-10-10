'use client';

import { useEffect, useState } from 'react';
import { 
  History, 
  Download, 
  Search, 
  RefreshCw, 
  MapPin, 
  CheckCircle2, 
  XCircle,
  Thermometer,
  Droplets,
  Loader2
} from 'lucide-react';
import { SensorReading } from '@/types/database';

export default function HistoryPage() {
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [limit, setLimit] = useState(100);
  const [filterQuery, setFilterQuery] = useState('');

  const fetchHistory = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/readings?deviceId=CC001&limit=${limit}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        setReadings(json.readings || []);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [limit]);

  const exportCSV = () => {
    if (readings.length === 0) return;

    const headers = ['Timestamp', 'Device ID', 'Temperature (°C)', 'Humidity (%)', 'Latitude', 'Longitude', 'GPS Valid', 'LED State', 'Control Mode'];
    const rows = readings.map((r) => [
      new Date(r.created_at).toISOString(),
      r.device_id,
      r.temperature ?? 'NaN',
      r.humidity ?? 'NaN',
      r.latitude ?? 'N/A',
      r.longitude ?? 'N/A',
      r.gps_valid ? 'TRUE' : 'FALSE',
      r.fan_status ? 'ON' : 'OFF',
      r.control_mode,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `coldchain_telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredReadings = readings.filter((r) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      r.control_mode.toLowerCase().includes(q) ||
      (r.temperature !== null && String(r.temperature).includes(q)) ||
      (r.humidity !== null && String(r.humidity).includes(q)) ||
      new Date(r.created_at).toLocaleString().toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Telemetry Audit History
            </h1>
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-xs font-semibold">
              Logs &amp; Compliance
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical time-series audit trail of environmental and actuator states.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportCSV}
            disabled={readings.length === 0}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/40 text-slate-200 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchHistory}
            disabled={refreshing}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition-all disabled:opacity-50"
            title="Refresh History"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Limit Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search records, modes, values..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <label className="text-xs text-slate-400 font-mono">Row Limit:</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
            <option value={250}>250 rows</option>
            <option value={500}>500 rows</option>
          </select>
        </div>
      </div>

      {/* History Data Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3.5">Timestamp (UTC / Local)</th>
                <th className="p-3.5">Temp (°C)</th>
                <th className="p-3.5">Humidity (%)</th>
                <th className="p-3.5">GPS Location</th>
                <th className="p-3.5">LED Pin State</th>
                <th className="p-3.5">Control Mode</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2" />
                    <span>Loading audit records...</span>
                  </td>
                </tr>
              ) : filteredReadings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No telemetry records matched the criteria.
                  </td>
                </tr>
              ) : (
                filteredReadings.map((r) => {
                  const isViolation = r.temperature !== null && r.temperature > 8.0;
                  const isSensorErr = r.temperature === null;

                  return (
                    <tr key={r.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="p-3.5 text-slate-300">
                        {new Date(r.created_at).toLocaleString()}
                      </td>

                      <td className="p-3.5">
                        {r.temperature !== null ? (
                          <span
                            className={`font-bold ${
                              isViolation ? 'text-rose-400 font-extrabold' : 'text-cyan-300'
                            }`}
                          >
                            {Number(r.temperature).toFixed(1)} °C
                          </span>
                        ) : (
                          <span className="text-rose-400">SENSOR ERR</span>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-300">
                        {r.humidity !== null ? `${Number(r.humidity).toFixed(1)} %` : '--'}
                      </td>

                      <td className="p-3.5">
                        {r.gps_valid && r.latitude && r.longitude ? (
                          <span className="text-slate-300">
                            {Number(r.latitude).toFixed(4)}, {Number(r.longitude).toFixed(4)}
                          </span>
                        ) : (
                          <span className="text-slate-600">No Fix</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.fan_status
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                              : 'bg-slate-900 text-slate-500'
                          }`}
                        >
                          {r.fan_status ? 'ACTIVE [ON]' : 'OFF'}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-300 font-semibold">{r.control_mode}</td>

                      <td className="p-3.5">
                        {isViolation ? (
                          <span className="inline-flex items-center space-x-1 text-rose-400 text-[10px] font-bold">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>EXCEEDED</span>
                          </span>
                        ) : isSensorErr ? (
                          <span className="inline-flex items-center space-x-1 text-amber-400 text-[10px] font-bold">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>ERR</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-emerald-400 text-[10px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>VALID</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
