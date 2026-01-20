// types/zoneTypes.ts

export interface Zone {
  id: string;
  zone_number: number;
  radius_km: number;
  max_drivers_to_notify: number;
  notification_timeout_seconds: number;
  is_active: boolean;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ZonesResponse {
  count: number;
  message: string;
  success: boolean;
  zones: Zone[];
}

export interface CreateZoneRequest {
  radius_km: number;
  max_drivers_to_notify: number;
  notification_timeout_seconds: number;
  is_active: boolean;
  description: string;
}

export interface UpdateZoneRequest {
  radius_km: number;
  max_drivers_to_notify: number;
  notification_timeout_seconds: number;
  is_active: boolean;
  description: string;
}

export interface ZoneResponse {
  message: string;
  success: boolean;
  zone: Zone;
}
