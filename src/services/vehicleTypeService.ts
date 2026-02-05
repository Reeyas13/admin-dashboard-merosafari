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
   * Create a new vehicle type with multipart form data
   */
  async createVehicleType(data: FormData | CreateVehicleTypeRequest): Promise<any> {
    const isFormData = data instanceof FormData;
    
    return api.post<CreateVehicleTypeResponse>(
      `${this.basePath}/vehicle-types`,
      data,
      isFormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      } : undefined
    );
  }

  /**
   * Get a specific vehicle type by ID
   */
  async getVehicleTypeById(id: string): Promise<VehicleType> {
    return api.get<VehicleType>(`${this.basePath}/vehicle-types/${id}`);
  }

  /**
   * Update a vehicle type with multipart form data
   */
  async updateVehicleType(
    id: string,
    data: FormData | Partial<CreateVehicleTypeRequest>
  ): Promise<any> {
    const isFormData = data instanceof FormData;
    
    return api.put<CreateVehicleTypeResponse>(
      `${this.basePath}/vehicle-types/${id}`,
      data,
      isFormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      } : undefined
    );
  }

  /**
   * Delete a vehicle type
   */
  async deleteVehicleType(id: string): Promise<any> {
    return api.delete(`${this.basePath}/vehicle-types/${id}`);
  }
}

export const vehicleTypeService = new VehicleTypeService();
export default vehicleTypeService;
