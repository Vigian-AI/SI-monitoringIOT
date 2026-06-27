export interface SensorData {
  temperature: number;
  humidity: number;
  light_intensity: number;
  soil_moisture: number;
  pump_status: number | boolean;
  created_at: string;
  device_id?: string;
}

export interface DeviceStatus {
  device_id: string;
  name: string;
  online: boolean;
  last_seen_at: string | null;
  wifi_ssid: string | null;
  rssi: number | null;
  firmware_version: string | null;
  seconds_since_last_seen?: number | null;
}

export interface Plant {
  id: number;
  device_id: string;
  name: string;
  species: string;
  image_url: string;
  soil_moisture: number | null;
  temperature: number | null;
}

export interface Schedule {
  id: number;
  label: string;
  time: string;
  duration_minutes: number;
  days_of_week: string;
  enabled: boolean;
  icon: string;
}

export interface Settings {
  soil_threshold: number;
  pump_max_duration: number;
  pump_cooldown: number;
  telegram_enabled: boolean;
  auto_water_enabled: boolean;
}

export interface WeeklyStats {
  total_sessions: number;
  total_seconds: number;
  liters_estimate: number;
}
