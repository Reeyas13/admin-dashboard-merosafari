export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'resubmission_required';
export type DocumentStatus = 'pending' | 'approved' | 'rejected';
export type DocumentType = 
  | 'drivers_license' 
  | 'vehicle_registration' 
  | 'vehicle_insurance' 
  | 'vehicle_photo' 
  | 'profile_photo'
  | 'background_check';

export type DocumentCategory = 
  | 'personal_identification' 
  | 'vehicle_certification' 
  | 'insurance';

export interface PendingVerification {
  verification_id: string;
  driver_id: string;
  driver_name: string;
  driver_email: string;
  driver_phone: string;
  verification_status: VerificationStatus;
  submitted_at: string;
  approved_documents?: number;
}
export interface DocumentUpdateRequest {
  document_image?: File;
  document_number?: string;
  vehicle_model?: string;
  vehicle_color?: string;
  certification_number?: string;
  manufacture_year?: string;
  expiry_date?: string;
  
}
export interface PendingVerificationsResponse {
  total: number;
  verifications: PendingVerification[];
}

export interface Document {
  id: string;
  verification_id: string;
  driver_id: string;
  document_type: DocumentType;
  document_category: DocumentCategory;
  document_url: string;
  document_number?: string;
  vehicle_model?: string;
  vehicle_color?: string;
  status: DocumentStatus;
  reviewed_by?: string;
  review_notes?: string;
  rejection_reason?: string; // Added
  uploaded_at: string;
  reviewed_at?: string;
  approved_at?: string;
  rejected_at?: string;
  driver_vehicle_id?: string;
}

export interface Driver {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Verification {
  id: string;
  driver_id: string;
  status: VerificationStatus;
  submitted_at: string;
  submission_count: number;
  driver_vehicle_id?: string;
}

export interface VerificationDetail {
  documents: Document[];
  driver: Driver;
  history: any;
  verification: Verification;
}

// Updated to include rejection_reason
export interface DocumentReviewRequest {
  status: DocumentStatus;
  review_notes: string;
  rejection_reason?: string; // Required when status is 'rejected'
}

export interface DocumentReviewResponse {
  message: string;
  document: Document;
}
