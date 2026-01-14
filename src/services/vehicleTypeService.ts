import { api } from 'src/api/api';
import {
  VehicleTypesResponse,
  CreateVehicleTypeRequest,
  CreateVehicleTypeResponse,
  VehicleType,
} from '../types/vehicleTypes';

class VehicleTypeService {
  private readonly basePath = '/api/v1';

  /**
   * Get all vehicle types
   * @param activeOnly - Filter for active vehicles only
   */
  async getVehicleTypes(activeOnly: boolean = false): Promise<VehicleTypesResponse> {
    const url = `${this.basePath}/vehicle-types${activeOnly ? '?active_only=true' : ''}`;
    return api.get<VehicleTypesResponse>(url);
  }

  /**
   * Create a new vehicle type
   */
  async createVehicleType(
    data: CreateVehicleTypeRequest
  ): Promise<any> {
    return api.post<CreateVehicleTypeResponse>(
      `${this.basePath}/vehicle-types`,
      data
    );
  }

  /**
   * Get a specific vehicle type by ID
   */
  async getVehicleTypeById(id: string): Promise<VehicleType> {
    return api.get<VehicleType>(`${this.basePath}/admin/vehicle-types/${id}`);
  }

  /**
   * Update a vehicle type
   */
  async updateVehicleType(
    id: string,
    data: Partial<CreateVehicleTypeRequest>
  ): Promise<any> {
    return api.put<CreateVehicleTypeResponse>(
      `${this.basePath}/admin/vehicle-types/${id}`,
      data
    );
  }

  /**
   * Delete a vehicle type
   */
  async deleteVehicleType(id: string): Promise<any> {
    return api.delete(`${this.basePath}/admin/vehicle-types/${id}`);
  }
}

export const vehicleTypeService = new VehicleTypeService();
export default vehicleTypeService;