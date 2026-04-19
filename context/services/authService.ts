import { apiClient } from '../lib/apiClient';
import { LoginCredentials, ChangePasswordData, UpdateProfileData } from '@/types/auth';

export const authService = {
  async getCurrentUser() {
    return apiClient('/api/auth/me');
  },

  async login(credentials: LoginCredentials) {
    return apiClient('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async logout() {
    return apiClient('/api/auth/logout', {
      method: 'POST',
    });
  },

  async changePassword(data: ChangePasswordData) {
    return apiClient('/api/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
    });
  },

  async updateProfile(data: UpdateProfileData) {
    return apiClient('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};