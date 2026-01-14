// types/thirdParty.ts

export type SMSProvider = 'test' | 'smspasal' | 'samayasms' | 'sparrow';
export type EmailProvider = 'test' | 'mailtrap' | 'smtp';

export interface SMSConfig {
  id: number;
  name: string;
  provider: SMSProvider;
  api_key: string;
  api_url?: string;
  sender_id?: string;
  is_test: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailConfig {
  id: number;
  name: string;
  provider: EmailProvider;
  from_email: string;
  from_name: string;
  api_key?: string;
  smtp_host?: string;
  smtp_port?: number;
  username?: string;
  password?: string;
  is_test: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSMSConfigRequest {
  name: string;
  provider: SMSProvider;
  api_key: string;
  api_url?: string;
  sender_id?: string;
  is_test: boolean;
}

export interface CreateEmailConfigRequest {
  name: string;
  provider: EmailProvider;
  from_email: string;
  from_name: string;
  api_key?: string;
  smtp_host?: string;
  smtp_port?: number;
  username?: string;
  password?: string;
  is_test: boolean;
}

export interface UpdateSMSConfigRequest extends Partial<CreateSMSConfigRequest> {}
export interface UpdateEmailConfigRequest extends Partial<CreateEmailConfigRequest> {}

export interface SMSConfigResponse {
  message: string;
  success: boolean;
  config: SMSConfig;
}

export interface EmailConfigResponse {
  message: string;
  success: boolean;
  config: EmailConfig;
}

export interface SMSConfigListResponse {
  configs: SMSConfig[];
  count: number;
}

export interface EmailConfigListResponse {
  configs: EmailConfig[];
  count: number;
}