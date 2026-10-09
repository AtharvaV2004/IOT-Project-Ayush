'use client';

import { MapPin, ExternalLink, Navigation, Satellite } from 'lucide-react';

interface GpsMapCardProps {
  latitude: number | null;
  longitude: number | null;
  gpsValid: boolean;
}

export default function GpsMapCard({
  latitude,
  longitude,
  gpsValid,
}: GpsMapCardProps) {
  const hasValidCoordinates =
    gpsValid && latitude !== null && longitude !== null && !isNaN(latitude) && !isNaN(longitude);

  const googleMapsUrl = hasValidCoordinates
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : '#';

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">GPS Geolocation</h3>
              <p className="text-[11px] text-slate-400 font-mono">TinyGPS++ Transit Tracker</p>
            </div>
          </div>

          <div
            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              hasValidCoordinates
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                : 'bg-amber-950/60 border-amber-500/40 text-amber-400'
            }`}
          >
            <Satellite className="w-3 h-3 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{hasValidCoordinates ? '3D GPS Fix' : 'No Fix / Searching'}</span>
          </div>
        </div>

        {hasValidCoordinates ? (
          <div className="space-y-3 mt-4">
            <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between font-mono text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Latitude</span>
                <span className="text-slate-200 font-semibold text-sm">{latitude?.toFixed(6)}° N</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Longitude</span>
                <span className="text-slate-200 font-semibold text-sm">{longitude?.toFixed(6)}° E</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cold Chain Transit Payload Coordinates Active</span>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-dashed border-slate-800 text-center">
            <p className="text-xs text-slate-400 font-mono">
              [No GPS Satellites Locked]
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Ensure the GPS antenna has an unobstructed view of the sky.
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-slate-800/80">
        {hasValidCoordinates ? (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 text-xs font-bold transition-all hover:scale-[1.01]"
          >
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <button
            disabled
            className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xs font-medium cursor-not-allowed"
          >
            <span>Awaiting GPS Coordinates</span>
          </button>
        )}
      </div>
    </div>
  );
}
