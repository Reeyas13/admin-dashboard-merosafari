// types/vehicleTypes.ts

export interface VehicleType {
  id: string;
  name: string;
  slug: string;
  no_of_seats: number;
  logo_url: string;
  base_fare: number;
  per_km_rate: number;
  is_active: boolean;
  created_at: string;
  capacity:number;
}

export interface VehicleTypesResponse {
  count: number;
  vehicle_types: VehicleType[];
}

export interface CreateVehicleTypeRequest {
  name: string;
  slug: string;
  no_of_seats: number;
  logo_url?: string;
  base_fare: number;
  per_km_rate: number;
  is_active: boolean;
}

export interface CreateVehicleTypeResponse {
  message: string;
  success: boolean;
  vehicle_type: VehicleType;
}