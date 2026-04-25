import { apiClient } from '../lib/apiClient';

export interface NotificationSettings {
  email: string;
  displayName: string;
  emailAlerts: boolean;
}

export const notificationService = {
  /**
   * Get the current user's notification preferences.
   */
  async getSettings(): Promise<NotificationSettings> {
    return apiClient('/api/notifications/settings');
  },

  /**
   * Enable or disable email alerts.
   */
  async updateSettings(emailAlerts: boolean): Promise<{ emailAlerts: boolean }> {
    return apiClient('/api/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify({ emailAlerts }),
    });
  },
};
