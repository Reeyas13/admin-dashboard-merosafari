import { api } from 'src/api/api';
import {
  EmailConfig,
  EmailConfigListResponse,
  EmailConfigResponse,
  CreateEmailConfigRequest,
  UpdateEmailConfigRequest,
} from '../types/thirdParty';

class EmailConfigService {
  private readonly basePath = '/api/v1/admin/third-party/email';

  /**
   * Get all Email configurations
   */
  async getAllConfigs(): Promise<EmailConfigListResponse> {
    return api.get<EmailConfigListResponse>(this.basePath);
  }

  /**
   * Get a specific Email configuration by ID
   */
  async getConfigById(id: number): Promise<EmailConfig> {
    return api.get<EmailConfig>(`${this.basePath}/${id}`);
  }

  /**
   * Create a new Email configuration
   */
  async createConfig(data: CreateEmailConfigRequest): Promise<any> {
    return api.post<EmailConfigResponse>(this.basePath, data);
  }

  /**
   * Update an existing Email configuration
   */
  async updateConfig(
    id: number,
    data: UpdateEmailConfigRequest
  ): Promise<any> {
    return api.put<EmailConfigResponse>(`${this.basePath}/${id}`, data);
  }

  /**
   * Activate an Email configuration
   */
  async activateConfig(id: number): Promise<any> {
    return api.post<EmailConfigResponse>(`${this.basePath}/${id}/activate`);
  }

  /**
   * Delete an Email configuration
   */
  async deleteConfig(id: number): Promise<any> {
    return api.delete(`${this.basePath}/${id}`);
  }
}

export const emailConfigService = new EmailConfigService();
export default emailConfigService;