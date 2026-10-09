'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts';
import { SensorReading } from '@/types/database';

interface TelemetryChartProps {
  readings: SensorReading[];
}

export default function TelemetryChart({ readings }: TelemetryChartProps) {
  // Format readings in chronological order (oldest to newest for the chart)
  const chartData = [...readings].reverse().map((r) => {
    const time = new Date(r.created_at);
    return {
      timestamp: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      rawTime: r.created_at,
      temperature: r.temperature !== null ? Number(r.temperature) : null,
      humidity: r.humidity !== null ? Number(r.humidity) : null,
      threshold: 8.0,
    };
  });

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
        <p>No historical telemetry logged yet.</p>
        <p className="text-[10px] text-slate-600 mt-1">
          Awaiting first live sensor broadcast from ESP32.
        </p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const tempVal = payload.find((p: any) => p.dataKey === 'temperature')?.value;
      const humVal = payload.find((p: any) => p.dataKey === 'humidity')?.value;

      return (
        <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-xl shadow-xl backdrop-blur-md text-xs font-mono">
          <p className="text-slate-400 font-bold mb-1.5">{label}</p>
          {tempVal !== undefined && tempVal !== null ? (
            <p className="text-cyan-400 font-semibold">
              Temperature: {tempVal.toFixed(1)} °C
            </p>
          ) : (
            <p className="text-rose-400 font-semibold">Temperature: Sensor Err</p>
          )}
          {humVal !== undefined && humVal !== null ? (
            <p className="text-indigo-400 font-semibold">
              Humidity: {humVal.toFixed(1)} %
            </p>
          ) : (
            <p className="text-slate-500">Humidity: N/A</p>
          )}
          {tempVal !== undefined && tempVal > 8.0 && (
            <p className="text-rose-400 text-[10px] mt-1 font-bold">
              [!] Exceeds 8.0°C Limit
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.7} />
          <XAxis
            dataKey="timestamp"
            stroke="#64748b"
            fontSize={10}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#64748b"
            fontSize={10}
            tickLine={false}
            domain={['auto', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
          />

          {/* 8.0°C Cold Chain Safety Threshold */}
          <ReferenceLine
            y={8.0}
            stroke="#f43f5e"
            strokeDasharray="4 4"
            label={{
              value: '8.0°C Threshold',
              fill: '#f43f5e',
              fontSize: 10,
              position: 'insideTopRight',
            }}
          />

          <Line
            type="monotone"
            dataKey="temperature"
            name="Temperature (°C)"
            stroke="#06b6d4"
            strokeWidth={2.5}
            dot={{ r: 2, fill: '#06b6d4' }}
            activeDot={{ r: 5, fill: '#38bdf8' }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="humidity"
            name="Humidity (%)"
            stroke="#818cf8"
            strokeWidth={2}
            dot={{ r: 1.5, fill: '#818cf8' }}
            activeDot={{ r: 4, fill: '#a5b4fc' }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
