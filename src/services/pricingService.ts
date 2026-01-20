// services/pricingService.ts
import { api } from 'src/api/api';
import {
  PricingConfig,
  SetPricingRequest,
  SetPricingResponse,
  CalculateFareRequest,
  CalculateFareResponse,
} from '../types/pricing';

class PricingService {
  private readonly basePath = '/api/v1/location';

  /**
   * Save pricing configuration
   * - Uses POST for creating new pricing
   * - Uses PUT for updating existing pricing
   */
 async savePricing(
    data: SetPricingRequest,
    pricingId?: string
  ): Promise<SetPricingResponse> {
    if (pricingId) {
      // Update existing pricing
   // @ts-ignore
      return api.put<SetPricingResponse>(
        `${this.basePath}/pricing/${pricingId}`,
        data
      );
    } else {
      // Create new pricing
   // @ts-ignore

      return api.post<SetPricingResponse>(`${this.basePath}/pricing`, data);
    }
  }

  /**
   * Get pricing configuration for a location-vehicle
   */
  async getPricing(locationVehicleId: string): Promise<{ pricing: PricingConfig }> {
    return api.get<{ pricing: PricingConfig }>(
      `${this.basePath}/pricing/${locationVehicleId}`
    );
  }

  /**
   * Delete pricing configuration
   */
  async deletePricing(locationVehicleId: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(
      `${this.basePath}/pricing/${locationVehicleId}`
    );
  }

  /**
   * Calculate fare for a ride
   */
   async calculateFare(
    data: CalculateFareRequest
  ): Promise<CalculateFareResponse> {
   // @ts-ignore
    return api.post<CalculateFareResponse>(
      `${this.basePath}/calculate-fare`,
      data
    );
  }

  /**
   * Get all pricing configurations for a boundary
   */
  async getPricingsForBoundary(
    boundaryId: string
  ): Promise<{ pricings: PricingConfig[] }> {
    return api.get<{ pricings: PricingConfig[] }>(
      `${this.basePath}/boundaries/${boundaryId}/pricings`
    );
  }
}

export const pricingService = new PricingService();
export default pricingService;