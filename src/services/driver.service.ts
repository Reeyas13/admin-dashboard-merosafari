import api, { ApiResponse } from '../api/api';
import {
  PendingVerificationsResponse,
  VerificationDetail,
  DocumentReviewRequest,
  DocumentReviewResponse,
} from '../types/driver.types';

class DriverService {
  private readonly baseUrl = '/api/v1/admin';

  /**
   * Get pending driver verifications with pagination
   */
  async getPendingVerifications(
    page: number = 1,
    pageSize: number = 20
  ): Promise<PendingVerificationsResponse> {
    return api.get<PendingVerificationsResponse>(
      `${this.baseUrl}/verifications/pending`,
      {
        params: {
          page,
          page_size: pageSize,
        },
      }
    );
  }

  /**
   * Get verification details including documents
   */
  async getVerificationDetails(verificationId: string): Promise<VerificationDetail> {
    return api.get<VerificationDetail>(
      `${this.baseUrl}/verifications/${verificationId}`
    );
  }

  /**
   * Review a document (approve/reject)
   */
  async reviewDocument(
    documentId: string,
    reviewData: DocumentReviewRequest
  ): Promise<ApiResponse<DocumentReviewResponse>> {
    return api.put<DocumentReviewResponse>(
      `${this.baseUrl}/documents/${documentId}/review`,
      reviewData
    );
  }

  /**
   * Get full image URL
   */
  getImageUrl(documentUrl: string): string {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8090';
    return `${baseUrl}${documentUrl}`;
  }
}

export const driverService = new DriverService();
export default driverService;
