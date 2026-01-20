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
  
  // Insurance fields
  insurance_charge_type: 'PERCENTAGE' | 'FIXED';
  insurance_charge_value: number;
  
  // Peak hours (optional)
  peak_hour_multiplier: number | null;
  peak_hours_start: string; // Time string like "17:00:00"
  peak_hours_end: string;   // Time string like "22:00:00"
  
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SetPricingRequest {
  location_vehicle_id: string;
  base_fare: number;
  per_km_rate: number;
  waiting_time_per_minute: number;
  eta_waiting_charge_starts_after_minutes: number;
  service_tax_percentage: number;
  outside_service_area_charge: number;
  
  // Insurance fields (required)
  insurance_charge_type: 'PERCENTAGE' | 'FIXED';
  insurance_charge_value: number;
  
  // Peak hours (optional)
  peak_hour_multiplier?: number;
  peak_hours_start?: string;
  peak_hours_end?: string;
  
  is_active: boolean;
}

export interface SetPricingResponse {
  success: boolean;
  message: string;
  pricing: PricingConfig;
}

export interface CalculateFareRequest {
  // Either provide boundary_id OR coordinates for auto-detection
  location_boundary_id?: string;
  pickup_lat?: number;
  pickup_lng?: number;
  
  // Required
  vehicle_type_id: string;
  distance_km: number;
  waiting_time_minutes: number;
  is_outside_service_area: boolean;
  is_peak_hour: boolean;
}

export interface CalculateFareResponse {
  location_boundary_id: string;
  location_boundary_name: string;
  vehicle_type_id: string;
  vehicle_type_name: string;
  
  // Fare breakdown
  base_fare: number;
  distance_fare: number;
  waiting_fare: number;
  outside_area_charge: number;
  sub_total: number;
  
  // Taxes & fees
  service_tax: number;
  insurance_charge: number;
  peak_hour_surcharge: number;
  
  // Total
  total_fare: number;
}