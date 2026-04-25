'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const PUBLIC_VAPID_KEY = 'BBm5LE5SVwhP0nhzuHbrrTLUmnmvjPBw26JeXAphKHXzzhdWVI2-ibAIx13t0nSjikSgYEsI5iOushNacGDPl3Y';

/**
 * Helper: convert a base64 string to a Uint8Array for the applicationServerKey.
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

/**
 * Hook to manage browser push notification subscription.
 *
 * @returns { subscribed, isSupported, permissionState, subscribe, unsubscribe, loading, error }
 */
export function usePushNotifications() {
  const [subscribed, setSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission | 'unsupported'>('default');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const swRef = useRef<ServiceWorkerRegistration | null>(null);

  // On mount: check support and existing subscription
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setIsSupported(false);
      setPermissionState('unsupported');
      return;
    }

    setIsSupported(true);
    setPermissionState(Notification.permission);

    // Register service worker and check for existing subscription
    const init = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        swRef.current = registration;

        const subscription = await registration.pushManager.getSubscription();
        setSubscribed(!!subscription);
      } catch (err) {
        console.error('[PushNotifications] Failed to register SW:', err);
      }
    };

    init();
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      if (!swRef.current) {
        throw new Error('Service worker not registered');
      }

      // Request permission if needed
      const permission = await Notification.requestPermission();
      setPermissionState(permission);

      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Subscribe to push
      const subscription = await swRef.current.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
      });

      // Send subscription to backend
      const token = localStorage.getItem('token');
      const subData = subscription.toJSON();

      const res = await fetch(`http://localhost:3001/api/notifications/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          endpoint: subData.endpoint,
          keys: subData.keys,
          userAgent: navigator.userAgent,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      setSubscribed(true);
      console.log('[PushNotifications] ✅ Subscribed');
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to subscribe');
      console.error('[PushNotifications] ❌ Subscribe failed:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      if (!swRef.current) {
        throw new Error('Service worker not registered');
      }

      const subscription = await swRef.current.pushManager.getSubscription();
      if (!subscription) {
        setSubscribed(false);
        setLoading(false);
        return true;
      }

      const endpoint = subscription.endpoint;

      // Unsubscribe from push manager
      const unsubscribed = await subscription.unsubscribe();
      if (!unsubscribed) {
        throw new Error('Failed to unsubscribe from push manager');
      }

      // Notify backend to remove subscription
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/api/notifications/push/subscribe`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ endpoint }),
      });

      setSubscribed(false);
      console.log('[PushNotifications] ✅ Unsubscribed');
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to unsubscribe');
      console.error('[PushNotifications] ❌ Unsubscribe failed:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    subscribed,
    isSupported,
    permissionState,
    subscribe,
    unsubscribe,
    loading,
    error,
  };
}
