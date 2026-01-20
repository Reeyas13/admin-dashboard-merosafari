// services/zoneService.ts

import { api } from 'src/api/api';
import {
  ZonesResponse,
  UpdateZoneRequest,
  ZoneResponse,
  Zone,
} from '../types/zoneTypes';

class ZoneService {
  private readonly basePath = '/api/v1/admin';

  /**
   * Get all zones
   */
  async getZones(): Promise<ZonesResponse> {
    return api.get<ZonesResponse>(`${this.basePath}/zones`);
  }

  /**
   * Get a specific zone by zone number
   */
  async getZoneByNumber(zoneNumber: number): Promise<Zone> {
    return api.get<Zone>(`${this.basePath}/zones/${zoneNumber}`);
  }

  /**
   * Update a zone
   */
  async updateZone(
    zoneNumber: number,
    data: UpdateZoneRequest
  ): Promise<ZoneResponse> {
    //@ts-ignore
    return api.put<ZoneResponse>(
      `${this.basePath}/zones/${zoneNumber}`,
      data
    );
  }

  /**
   * Delete a zone
   */
  async deleteZone(zoneNumber: number): Promise<any> {
    return api.delete(`${this.basePath}/zones/${zoneNumber}`);
  }
}

export const zoneService = new ZoneService();
export default zoneService;
