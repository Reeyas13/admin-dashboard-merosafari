// types/locationVehicles.ts

export interface LocationVehicle {
  id: string;
  location_boundary_id: string;
  vehicle_type_id: string;
  vehicle_type_name:string;
  capacity:string | number;
  vehicle_type?: {
    id: string;
    name: string;
    description?: string;
    capacity: number;
    icon?: string;
  };
  is_enabled: boolean;
  min_drivers_required: number;
  operating_hours_start: string;
  operating_hours_end: string;
  created_at: string;
  updated_at: string;
}

export interface AddLocationVehicleRequest {
  vehicle_type_id: string;
  is_enabled: boolean;
  min_drivers_required: number;
  operating_hours_start: string;
  operating_hours_end: string;
}

export interface AddLocationVehicleResponse {
  message: string;
  vehicle: LocationVehicle;
}

export interface LocationVehiclesResponse {
  vehicles: LocationVehicle[];
  total_count: number;
  page: number;
  page_size: number;
}

export interface UpdateLocationVehicleRequest {
  is_enabled?: boolean;
  min_drivers_required?: number;
  operating_hours_start?: string;
  operating_hours_end?: string;
}