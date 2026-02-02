import api, { ApiResponse } from '../api/api';
import {
  PendingVerificationsResponse,
  VerificationDetail,
  DocumentReviewRequest,
  DocumentReviewResponse,
  DocumentUpdateRequest,
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
   * Update document details (admin only)
   */
  async updateDocument(
    documentId: string,
    updateData: DocumentUpdateRequest
  ): Promise<ApiResponse<any>> {
    const formData = new FormData();

    // Add optional fields only if provided
    if (updateData.document_image) {
      formData.append('document_image', updateData.document_image);
    }
    if (updateData.document_number) {
      formData.append('document_number', updateData.document_number);
    }
    if (updateData.vehicle_model) {
      formData.append('vehicle_model', updateData.vehicle_model);
    }
    if (updateData.vehicle_color) {
      formData.append('vehicle_color', updateData.vehicle_color);
    }
    if (updateData.certification_number) {
      formData.append('certification_number', updateData.certification_number);
    }
    if (updateData.manufacture_year) {
      formData.append('manufacture_year', updateData.manufacture_year);
    }
    if (updateData.expiry_date) {
      formData.append('expiry_date', updateData.expiry_date);
    }

    return api.put(
      `${this.baseUrl}/documents/${documentId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  }

  /**
   * Delete a document (admin only)
   */
  async deleteDocument(documentId: string): Promise<ApiResponse<any>> {
    return api.delete(`${this.baseUrl}/documents/${documentId}`);
  }

  /**
   * Delete a user (admin only)
   */
  async deleteUser(userId: string): Promise<ApiResponse<any>> {
    return api.delete(`${this.baseUrl}/users/${userId}`);
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