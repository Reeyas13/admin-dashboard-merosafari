import { api } from 'src/api/api';

export interface User {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  driver_id: string;
  vehicle_type_id: string;
  vehicle_model: string;
  vehicle_color: string;
  vehicle_registration_number?: string;
  status: string;
  created_at: string;
}

export interface Verification {
  id: string;
  driver_id: string;
  vehicle_type_id: string;
  status: string;
  submitted_at: string;
  reviewed_at: string;
  approved_at: string;
  expires_at: string;
  submission_count: number;
  driver_vehicle_id: string;
}

export interface DriverDetail {
  user: User;
  verification?: Verification;
  vehicle?: Vehicle;
}

export interface GetDriversResponse {
  drivers: DriverDetail[];
  total: number;
  page: number;
  page_size: number;
}

export interface GetDriverDetailResponse {
  user: User;
  verification?: Verification;
  vehicle?: Vehicle;
}

class DriverService {
  async getDrivers(page = 1, pageSize = 20): Promise<GetDriversResponse> {
    return api.get<GetDriversResponse>(
      `/api/v1/admin/drivers?page=${page}&page_size=${pageSize}`
    );
  }

  async getDriver(driverId: string): Promise<GetDriverDetailResponse> {
    return api.get<GetDriverDetailResponse>(`/api/v1/admin/drivers/${driverId}`);
  }
}

export const driverService = new DriverService();