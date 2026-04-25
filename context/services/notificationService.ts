import { apiClient } from '../lib/apiClient';

export interface NotificationSettings {
  email: string;
  displayName: string;
  emailAlerts: boolean;
  pushEnabled: boolean;
}

export const notificationService = {
  /**
   * Get the current user's notification preferences.
   */
  async getSettings(): Promise<NotificationSettings> {
    return apiClient('/api/notifications/settings');
  },

  /**
   * Update notification preferences.
   * @param emailAlerts - Enable/disable email alerts
   * @param pushEnabled - Enable/disable push notifications
   */
  async updateSettings(emailAlerts?: boolean, pushEnabled?: boolean): Promise<{ emailAlerts: boolean; pushEnabled: boolean }> {
    const body: Record<string, boolean> = {};
    if (emailAlerts !== undefined) body.emailAlerts = emailAlerts;
    if (pushEnabled !== undefined) body.pushEnabled = pushEnabled;

    return apiClient('/api/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  /**
   * Save a browser push subscription to the backend.
   */
  async subscribePush(endpoint: string, keys: { p256dh: string; auth: string }, userAgent?: string): Promise<{ success: boolean }> {
    return apiClient('/api/notifications/push/subscribe', {
      method: 'POST',
      body: JSON.stringify({ endpoint, keys, userAgent }),
    });
  },

  /**
   * Remove a browser push subscription from the backend.
   */
  async unsubscribePush(endpoint: string): Promise<{ success: boolean }> {
    return apiClient('/api/notifications/push/subscribe', {
      method: 'DELETE',
      body: JSON.stringify({ endpoint }),
    });
  },
};
