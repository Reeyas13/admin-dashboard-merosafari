import { api } from 'src/api/api';

export interface Location {
  address: string;
  area: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface Route {
  distance_km: number;
  duration_minutes: number;
  polyline: string;
}

export interface Ride {
  id: string;
  user_id: string;
  driver_id: string;
  vehicle_type: string;
  status: 'requested' | 'accepted' | 'started' | 'completed' | 'cancelled';
  pickup_location: Location;
  dropoff_location: Location;
  route: Route;
  estimated_fare: number;
  final_fare: number;
  distance_km: number;
  duration_minutes: number;
  payment_method: string;
  otp: string;
  number_of_passengers: number;
  notes: string;
  cashback: number;
  driver_earnings: number;
  requested_at: string;
  accepted_at: string;
  started_at: string;
  completed_at: string;
  cancelled_at: string;
}

export interface GetRidesResponse {
  success: boolean;
  message: string;
  rides: Ride[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface GetRideResponse {
  success: boolean;
  message: string;
  ride: Ride;
}

export interface GetRidesParams {
  page?: number;
  page_size?: number;
  status?: string;
  user_id?: string;
  driver_id?: string;
  vehicle_type?: string;
  from_date?: string;
  to_date?: string;
}

class RideService {
  private readonly basePath = '/api/v1/admin/rides';

  /**
   * Get all rides with filters
   */
  async getRides(params?: GetRidesParams): Promise<GetRidesResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append('page', String(params.page));
    if (params?.page_size) searchParams.append('page_size', String(params.page_size));
    if (params?.status) searchParams.append('status', params.status);
    if (params?.user_id) searchParams.append('user_id', params.user_id);
    if (params?.driver_id) searchParams.append('driver_id', params.driver_id);
    if (params?.vehicle_type) searchParams.append('vehicle_type', params.vehicle_type);
    if (params?.from_date) searchParams.append('from_date', params.from_date);
    if (params?.to_date) searchParams.append('to_date', params.to_date);

    const queryString = searchParams.toString();
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath;

    return api.get<GetRidesResponse>(url);
  }

  /**
   * Get a single ride by ID
   */
  async getRide(rideId: string): Promise<GetRideResponse> {
    return api.get<GetRideResponse>(`${this.basePath}/${rideId}`);
  }
}

export const rideService = new RideService();
export default rideService;