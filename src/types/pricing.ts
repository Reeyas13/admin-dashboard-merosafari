// types/pricing.ts

export interface PricingConfig {
  id: string;
  location_vehicle_id: string;
  base_fare: number;
  per_km_rate: number;
  waiting_time_per_minute: number;
  eta_waiting_charge_starts_after_minutes: number;
  service_tax_percentage: number;
  outside_service_area_charge: number;
  peak_hour_multiplier: number | null;
  peak_hours_start: string; // ISO string like "0000-01-01T10:00:00Z"
  peak_hours_end: string;   // ISO string like "0000-01-01T12:00:00Z"
  is_active: boolean;
  created_at?: { seconds: number; nanos: number };
  updated_at?: { seconds: number; nanos: number };
}

export interface SetPricingRequest {
  location_vehicle_id: string;
  base_fare: number;
  per_km_rate: number;
  waiting_time_per_minute: number;
  eta_waiting_charge_starts_after_minutes: number;
  service_tax_percentage: number;
  outside_service_area_charge: number;
  peak_hour_multiplier: number;
  peak_hours_start: string;
  peak_hours_end: string;
  is_active: boolean;
}

export interface SetPricingResponse {
  message: string;
  pricing: PricingConfig;
}
export interface CalculateFareRequest {
  location_boundary_id: string;
  vehicle_type_id: string;
  distance_km: number;
  waiting_time_minutes: number;
  is_outside_service_area: boolean;
  is_peak_hour: boolean;
}

export interface CalculateFareResponse {
  location_boundary_id: string;
  vehicle_type_id: string;
  vehicle_type_name: string;
  base_fare: number;
  distance_fare: number;
  waiting_fare: number;
  outside_area_charge: number;
  sub_total: number;
  service_tax: number;
  peak_hour_surcharge: number;
  total_fare: number;
}

export interface CalculateFareResponse {
  fare_breakdown: FareBreakdown;
  currency: string;
}