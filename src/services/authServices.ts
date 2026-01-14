import { api } from 'src/api/api';
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    phone: string;
    full_name: string;
    role: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
}
export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/v1/auth/login', credentials);
    //@ts-ignore
    return response ;
  }

  async register(data: RegisterData) {
    return await api.post('/api/v1/auth/register', data);
  }

  async logout() {
    return await api.post('/api/v1/auth/logout');
  }

  async refreshToken(refreshToken: string) {
    return await api.post('/api/v1/auth/refresh', { refresh_token: refreshToken });
  }

  async forgotPassword(email: string) {
    return await api.post('/api/v1/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string) {
    return await api.post('/api/v1/auth/reset-password', {
      token,
      new_password: newPassword,
    });
  }

  async verifyEmail(token: string) {
    return await api.post('/api/v1/auth/verify-email', { token });
  }

  async getCurrentUser() {
    return await api.get('/api/v1/auth/me');
  }
}

export default new AuthService();