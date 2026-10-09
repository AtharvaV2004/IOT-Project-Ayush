export type ControlMode = 'AUTO' | 'FORCE_ON' | 'FORCE_OFF';

export interface Device {
  id: string;
  device_id: string;
  name: string;
  device_token?: string;
  owner_id: string;
  created_at: string;
}

export interface SensorReading {
  id: string;
  device_id: string;
  temperature: number | null;
  humidity: number | null;
  latitude: number | null;
  longitude: number | null;
  gps_valid: boolean;
  fan_status: boolean;
  control_mode: ControlMode;
  created_at: string;
}

export interface DeviceCommand {
  id: string;
  device_id: string;
  mode: ControlMode;
  requested_by?: string | null;
  created_at: string;
  acknowledged_at?: string | null;
}

export interface TelemetryPayload {
  device_id: string;
  temperature: number | null;
  humidity: number | null;
  latitude: number | null;
  longitude: number | null;
  gps_valid: boolean;
  fan_status: boolean;
  control_mode: ControlMode;
}

export interface DeviceStatusSummary {
  device: Device;
  latestReading: SensorReading | null;
  latestCommand: DeviceCommand | null;
  isOnline: boolean;
  isWarning: boolean;
  hasSensorError: boolean;
}
