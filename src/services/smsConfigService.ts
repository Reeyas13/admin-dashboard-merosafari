// services/smsConfigService.ts

import { api } from 'src/api/api';
import {
  SMSConfig,
  SMSConfigListResponse,
  SMSConfigResponse,
  CreateSMSConfigRequest,
  UpdateSMSConfigRequest,
} from 'src/types/thirdParty';

class SMSConfigService {
  private readonly basePath = '/api/v1/admin/third-party/sms';

  /**
   * Get all SMS configurations
   */
  async getAllConfigs(): Promise<SMSConfigListResponse> {
    return api.get<SMSConfigListResponse>(this.basePath);
  }

  /**
   * Get a specific SMS configuration by ID
   */
  async getConfigById(id: number): Promise<SMSConfig> {
    return api.get<SMSConfig>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new SMS configuration
   */
  async createConfig(data: CreateSMSConfigRequest): Promise<any> {
    return api.post<SMSConfigResponse>(this.basePath, data);
  }

  /**
   * Update an existing SMS configuration
   */
  async updateConfig(
    id: number,
    data: UpdateSMSConfigRequest
  ): Promise<any> {
    return api.put<SMSConfigResponse>(`${this.basePath}/${id}`, data);
  }

  /**
   * Activate an SMS configuration
   */
  async activateConfig(id: number): Promise<any> {
    return api.post<SMSConfigResponse>(`${this.basePath}/${id}/activate`);
  }

  /**
   * Delete an SMS configuration
   */
  async deleteConfig(id: number): Promise<any> {
    return api.delete(`${this.basePath}/${id}`);
  }
}

export const smsConfigService = new SMSConfigService();
export default smsConfigService;