import { api } from 'src/api/api';
import {
  AddLocationVehicleRequest,
  AddLocationVehicleResponse,
  LocationVehiclesResponse,
  UpdateLocationVehicleRequest,
} from '../types/locationVehicles';

class LocationVehicleService {
  private readonly basePath = '/api/v1/location/boundaries';

  /**
   * Add a vehicle type to a location boundary
   */
  async addVehicleToLocation(
    boundaryId: string,
    data: AddLocationVehicleRequest
  ): Promise<AddLocationVehicleResponse> {
  //@ts-ignore
    return api.post<AddLocationVehicleResponse>(
      `${this.basePath}/${boundaryId}/vehicles`,
      data
    );
  }

  /**
   * Get all vehicles for a location boundary
   */
  async getVehiclesForLocation(
    boundaryId: string,
    onlyEnabled: boolean = true,
    page: number = 1,
    pageSize: number = 20
  ): Promise<LocationVehiclesResponse> {
    const params = new URLSearchParams({
      only_enabled: String(onlyEnabled),
      page: String(page),
      page_size: String(pageSize),
    });

    return api.get<LocationVehiclesResponse>(
      `${this.basePath}/${boundaryId}/vehicles?${params}`
    );
  }

  /**
   * Update a location vehicle configuration
   */
  async updateLocationVehicle(
    boundaryId: string,
    vehicleId: string,
    data: UpdateLocationVehicleRequest
  ): Promise<{ success: boolean; message: string }> {
    return api.put<{ success: boolean; message: string }>(
      `${this.basePath}/${boundaryId}/vehicles/${vehicleId}`,
      data
    );
  }

  /**
   * Remove a vehicle from a location boundary
   */
  async removeVehicleFromLocation(
    boundaryId: string,
    vehicleId: string
  ): Promise<{ success: boolean; message: string }> {
    return api.delete<{ success: boolean; message: string }>(
      `${this.basePath}/${boundaryId}/vehicles/${vehicleId}`
    );
  }

  /**
   * Toggle vehicle enabled status for a location
   */
  async toggleVehicleStatus(
    boundaryId: string,
    vehicleId: string
  ): Promise<{ success: boolean; message: string; is_enabled: boolean }> {
  //@ts-ignore
    return api.put<{ success: boolean; message: string; is_enabled: boolean }>(
      `${this.basePath}/${boundaryId}/vehicles/${vehicleId}/toggle`
    );
  }
}

export const locationVehicleService = new LocationVehicleService();
export default locationVehicleService;  