import { api } from 'src/api/api';
import { User } from './driverService';

export interface GetUsersResponse {
  users: User[];
  total: number;
  page: number;
  page_size: number;
}

export interface GetUserResponse {
  user: User;
}

class UserService {
  async getUsers(page = 1, pageSize = 20): Promise<GetUsersResponse> {
    return api.get<GetUsersResponse>(
      `/api/v1/admin/users?page=${page}&page_size=${pageSize}`
    );
  }

  async getUser(userId: string): Promise<GetUserResponse> {
    return api.get<GetUserResponse>(`/api/v1/admin/users/${userId}`);
  }

  async deleteUser(userId: string): Promise<void> {
    //@ts-ignore
    return api.delete(`/api/v1/admin/users/${userId}`);
  }
}

export const userService = new UserService();