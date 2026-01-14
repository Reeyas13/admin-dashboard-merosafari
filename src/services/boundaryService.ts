// services/boundaryService.ts

import { api } from 'src/api/api';
import {
  BoundariesResponse,
  BoundaryStats,
  PointInPolygonRequest,
  PointInPolygonResponse,
  ToggleBoundaryResponse,
  Boundary,
} from '../types/boundary';

class BoundaryService {
  private readonly basePath = '/api/v1/location/boundaries';

  /**
   * Get all boundaries
   */
  async getBoundaries(): Promise<BoundariesResponse> {
    return api.get<BoundariesResponse>(this.basePath);
  }

  /**
   * Get boundary statistics
   */
  async getStats(): Promise<BoundaryStats> {
    return api.get<BoundaryStats>(`${this.basePath}/stats`);
  }

  /**
   * Check if a point is within a boundary
   */
  async checkPointInPolygon(
    data: PointInPolygonRequest
  ): Promise<PointInPolygonResponse> {
    //@ts-ignore
    return api.post<PointInPolygonResponse>(
      `${this.basePath}/point-in-polygon`,
      data
    );
  }

  /**
   * Toggle boundary active status
   */
  async toggleBoundary(id: string): Promise<ToggleBoundaryResponse> {
    //@ts-ignore
    return api.put<ToggleBoundaryResponse>(`${this.basePath}/${id}/toggle`);
  }

  /**
   * Get boundary by ID
   */
  async getBoundaryById(id: string): Promise<Boundary> {
    return api.get<Boundary>(`${this.basePath}/${id}`);
  }
}

export const boundaryService = new BoundaryService();
export default boundaryService;