// services/incentiveService.ts

import { api } from 'src/api/api';
import {
  IncentiveProgram,
  CreateIncentiveRequest,
  CreateIncentiveResponse,
  IncentiveProgramsResponse,
  UpdateIncentiveRequest,
  ProgramType,
} from '../types/incentives';

class IncentiveService {
  private readonly basePath = '/api/v1/location';

  /**
   * Create a new incentive program
   */
  async createIncentiveProgram(
    data: CreateIncentiveRequest
  ): Promise<CreateIncentiveResponse> {
    //@ts-ignore
    return api.post<CreateIncentiveResponse>(`${this.basePath}/incentives`, data);
  }

  /**
   * Get incentive programs for a location boundary
   */
  async getIncentivePrograms(
    boundaryId: string,
    onlyActive: boolean = true,
    programType?: ProgramType
  ): Promise<IncentiveProgramsResponse> {
    const params = new URLSearchParams({ only_active: String(onlyActive) });
    if (programType) {
      params.append('program_type', programType);
    }
    return api.get<IncentiveProgramsResponse>(
      `${this.basePath}/boundaries/${boundaryId}/incentives?${params}`
    );
  }

  /**
   * Get a specific incentive program
   */
  async getIncentiveProgram(programId: string): Promise<IncentiveProgram> {
    return api.get<IncentiveProgram>(`${this.basePath}/incentives/${programId}`);
  }

  /**
   * Update an incentive program
   */
  async updateIncentiveProgram(
    programId: string,
    data: UpdateIncentiveRequest
  ): Promise<CreateIncentiveResponse> {
    //@ts-ignore
    return api.put<CreateIncentiveResponse>(
      `${this.basePath}/incentives/${programId}`,
      data
    );
  }

  /**
   * Delete an incentive program
   */
  async deleteIncentiveProgram(programId: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(
      `${this.basePath}/incentives/${programId}`
    );
  }

  /**
   * Toggle incentive program active status
   */
  async toggleIncentiveProgram(
    programId: string
  ): Promise<CreateIncentiveResponse> {
    //@ts-ignore
    return api.put<CreateIncentiveResponse>(
      `${this.basePath}/incentives/${programId}/toggle`
    );
  }
}

export const incentiveService = new IncentiveService();
export default incentiveService;